---
title: Warum Playwright nach Pest-Browsertests weiterläuft
date: 2026-10-05
docLang: de
image: /assets/images/posts/pest-playwright-orphaned-server-de.png
imageAlt: "Terminal: Die Pest-Tests sind grün, die sh-Hülle ist beendet, aber der node-Prozess playwright run-server läuft weiter"
description: "Nach Pest-Browsertests läuft playwright run-server unter Ubuntu weiter und Pipes hängen. Die Ursache ist dash, die Lösung ein Wort: exec."
tags:
  - post
  - Pest
  - Playwright
  - Laravel
  - Linux
  - Testing
draft: false
---

Auf den Kontoseiten meiner Notizbuch-Website [kadir.gulec.tr](https://kadir.gulec.tr) sprang der Dark Mode bei jedem Seitenwechsel zurück in den hellen Modus. Ich habe den Fehler behoben und, damit er nicht zurückkommt, meinen ersten Browsertest geschrieben: Das Browser-Plugin von Pest startet über Playwright ein echtes Chromium, klickt sich durch die Seite und prüft das Ergebnis.

Die Tests waren grün. Aber mein Terminal kam nicht zurück.

## Das Symptom: Die Tests sind fertig, der Befehl nicht

Wenn ich die Ausgabe von `php artisan test` per Pipe an einen anderen Befehl wie `tail` weitergab, erschien die Zusammenfassung der Tests, danach wartete der Befehl ewig. Leitete ich die Ausgabe in eine Datei um, endete der Befehl zwar, aber etwas blieb zurück:

```bash
pgrep -a -x node | grep "playwright run-server"
```

Jeder Testlauf hinterließ einen `playwright run-server`-Prozess. Noch schöner: In der Liste standen vier weitere Prozesse, die schon zwei Tage alt waren. Sie stammten aus einem anderen Projekt von mir und liefen seit dem Tag, an dem ich dort Browsertests ausgeführt hatte, still vor sich hin. Laut den Messungen im Bug-Report belegt jeder davon rund 180 MB Arbeitsspeicher. Ein Kommentator fand nach einem Tag voller Testläufe 65 Stück auf einer Maschine, zusammen etwa 8 GB.

## Die Diagnose: Wer beendet wen?

Wenn die Tests fertig sind, versucht Pest, den Playwright-Server zu beenden. Als ich den Prozess, den Pest beendet, neben den Prozess legte, der überlebt, war das Bild klar:

```text
php (pest)
 └─ sh -c playwright run-server   ← beendet Pest (pid 172083)
     └─ node playwright run-server  ← der echte Server (pid 172084)
```

Pest startet den Server nicht direkt, sondern über eine Shell (`sh`), und schickt das Stopp-Signal am Ende nur an diese Shell. Die Shell beendet sich, der eigentliche Playwright-Prozess bleibt verwaist zurück und läuft weiter.

## Die Ursache: Ein fehlendes Wort

Pest startet Playwright mit `fromShellCommandline()` aus Symfony Process, also mit einem einfachen Befehls-String. PHP führt so einen String als `sh -c "…"` aus. Symfony setzt `exec` nur dann vor den Befehl, wenn der Befehl als Array übergeben wird, und die [Dokumentation von Symfony Process](https://symfony.com/doc/current/components/process) empfiehlt Arrays genau deshalb, weil Signale dann beim Prozess ankommen.

`exec` sagt der Shell: „Tritt beiseite und führe an deiner Stelle diesen Befehl aus.“ Der Shell-Prozess wird zu Playwright, und das Stopp-Signal landet direkt am richtigen Ort.

Und hier liegt der Haken: Unter Ubuntu ist `/bin/sh` in Wahrheit `dash`. Ohne `exec` startete das `dash` auf meinem Rechner Playwright als eigenen Kindprozess, statt sich dadurch zu ersetzen. Laut der Analyse im Bug-Report ersetzt sich `/bin/sh` unter macOS in diesem Fall selbst, dort tritt der Fehler also nie auf. Ein klassisches „Bei mir läuft’s“. Aus demselben Grund zeigt er sich auch unter Laravel Sail, in Debian-basierten Docker-Images und unter WSL2.

Das hängende Terminal hat dieselbe Ursache: Der verwaiste Prozess hält das Schreibende der Ausgabe-Pipe weiter offen, deshalb sieht `tail` nie, dass die Pipe geschlossen wird, und wartet ewig.

## Die Lösung: Ein Patch

Pest bietet keine Einstellung, um den Befehl zu ändern, also habe ich das Paket gepatcht. Die Änderung ist ein einziges Wort:

```diff
-'.'.DIRECTORY_SEPARATOR.'node_modules'.DIRECTORY_SEPARATOR.'.bin'.DIRECTORY_SEPARATOR.'playwright run-server ...',
+'exec .'.DIRECTORY_SEPARATOR.'node_modules'.DIRECTORY_SEPARATOR.'.bin'.DIRECTORY_SEPARATOR.'playwright run-server ...',
```

Statt `vendor/` von Hand zu ändern, spiele ich den Patch mit [cweagans/composer-patches](https://github.com/cweagans/composer-patches) ein. So wird er bei jedem `composer install` angewendet, auch in der CI:

```json
"extra": {
    "patches": {
        "pestphp/pest-plugin-browser": {
            "Stop the Playwright server itself, not only the sh wrapper around it": "patches/pest-plugin-browser-stop-playwright.patch"
        }
    }
}
```

Das hat noch einen Vorteil: Ändert Pest diese Zeile eines Tages, lässt sich der Patch nicht mehr anwenden und die Installation schlägt laut fehl. Die Korrektur kann nicht still verschwinden, und ich weiß, dass es Zeit ist, den Patch zu entfernen.

Nach dem Patch habe ich die Tests auf drei Arten ausgeführt: direkt mit `pest`, mit `php artisan test` und mit einem gepipten `php artisan test | tail`. In allen drei Fällen wurde Playwright am Ende der Tests beendet, und das Terminal war sofort wieder frei.

## Bin ich der Einzige?

Nein. Bevor ich diesen Beitrag geschrieben habe, habe ich auf Pests GitHub nachgesehen: Genau dasselbe Problem wurde am 16. Juli 2026 gemeldet und ist noch offen: [pestphp/pest #1754](https://github.com/pestphp/pest/issues/1754). Die Diagnose deckt sich mit unserer: `dash`, das fehlende `exec` und die hängende Pipe. Gemeldet wurde es im Haupt-Repository von Pest, weil im Repository des Plugins die Issues deaktiviert sind.

Es gibt einen Pull Request, der den Fehler behebt, er ist aber noch nicht gemergt: [pest-plugin-browser #254](https://github.com/pestphp/pest-plugin-browser/pull/254). Er macht dasselbe wie wir und setzt `exec` vor den Befehl. Die älteren [#169](https://github.com/pestphp/pest-plugin-browser/pull/169) und [#211](https://github.com/pestphp/pest-plugin-browser/pull/211) warten ebenfalls noch.

Einen nahen Verwandten gibt es auch: Bricht die CI einen Lauf mit `SIGTERM` ab, bleibt der Server ebenfalls am Leben ([pestphp/pest #1825](https://github.com/pestphp/pest/issues/1825)). Das behebt unser Patch nicht, denn in diesem Fall läuft der Aufräumcode von Pest gar nicht erst.

## Was ich aus diesem Fehler gelernt habe

- **Grüne Tests heißen nicht, dass alles in Ordnung ist.** Kein Test hat diese Prozesse bemerkt. Zwei Tage lang ist es niemandem aufgefallen.
- **`sh` ist nicht überall gleich.** Ein Fehler, der unter macOS unsichtbar ist, kann unter Ubuntu bei jedem einzelnen Lauf auftreten.
- **Wer einen Hintergrundprozess startet, sollte wissen, was er beendet.** Die Shell zu beenden heißt nicht, das zu beenden, was in ihr läuft.
- **Vorsicht mit `pkill -f`.** Das Suchmuster steht auch in der eigenen Befehlszeile, deshalb kann `pkill -f "playwright run-server"` die eigene Shell beenden. Nach dem Prozessnamen zu filtern ist sicherer: `pgrep -x node`.

Sobald der PR gemergt ist, entferne ich den Patch. Bis dahin erspart dieser Beitrag hoffentlich jemandem mit demselben Problem ein paar Stunden Suche :)
