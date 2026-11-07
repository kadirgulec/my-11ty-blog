---
title: Warum HTTP 200 nach einem WordPress-Update nicht reicht
urlSlug: warum-http-200-nach-einem-wordpress-update-nicht-reicht
date: 2026-11-07
docLang: de
description: "Nach einem WordPress-Update lieferte jede Seite 200, aber das Anmeldeformular war weg. So teste ich Websites heute vor und nach Updates im echten Browser."
tags:
  - post
  - WordPress
  - Puppeteer
  - Testing
  - ACF
image: /assets/images/posts/wordpress-update-browser-check.jpg
imageAlt: "Hände tippen auf einem Laptop, im Browser ist der WordPress-Beitragseditor geöffnet (Foto: StockSnap, Pixabay)"
draft: false
---

Zu meiner Arbeit gehört es, WordPress-Websites aktuell zu halten. Vor einiger Zeit habe ich eine Veranstaltungs-Website aktualisiert: WordPress selbst, rund zwanzig Plugins, Übersetzungen. Nach jedem Schritt habe ich die wichtigen Seiten von außen geprüft. Jede Seite antwortete mit HTTP 200, im HTML stand kein PHP-Fehler, und der Page Builder gab genauso viele Elemente aus wie vorher. Alles sah gut aus.

Das war es nicht. Etwa acht Stunden lang konnte sich niemand für eine Veranstaltung anmelden.

## Das Symptom: Die Seite ist da, das Formular nicht

Auf jeder Veranstaltungsseite hatte das Anmeldeformular sein `<form>`-Tag und alle `<input>`-Felder verloren. Die Beschriftungen waren noch da, das Textfeld für Anmerkungen auch. Auf den ersten Blick sah das Formular fast normal aus. Aber es gab nichts auszufüllen und keinen Knopf zum Absenden.

Meine Prüfung hat es übersehen, weil sie die falsche Frage gestellt hat. „Lädt die Seite?“ ist nicht dasselbe wie „Kann ein Besucher das tun, wofür die Seite da ist?“. Ein `curl`, das 200 zurückgibt, sieht den Unterschied nicht.

## Die Ursache: ACF escaped jetzt `the_field()`

Die Website nutzt Advanced Custom Fields (ACF), und das Update hat ACF von 6.2.4 auf die aktuelle Version gehoben. Dabei ging es über eine Sicherheitsänderung hinweg: Seit **ACF 6.2.7** schicken `the_field()` und `the_sub_field()` ihre Ausgabe durch `wp_kses_post()`. Diese Funktion behält nur HTML, das in einem Blogbeitrag unbedenklich ist. Formulare, Eingabefelder, iframes und Skripte werden entfernt.

Das Template für Veranstaltungen im Theme gab das Anmeldeformular, ein in einem ACF-Feld gespeichertes Contact-Form-7-Formular, mit `the_field()` aus. Vor dem Update ging das HTML unverändert raus. Nach dem Update hat ACF es entfernt.

ACF warnt zwar, aber nur im WordPress-Backend, und es führt ein Protokoll über jedes Feld, das es escapen musste. Mit WP-CLI lässt sich dieses Protokoll direkt lesen:

```bash
wp option get acf_escaped_html_log --format=json
```

Auf dieser Website standen dort neun Felder. Die Lösung: unescaptes HTML wieder erlauben, aber nur für genau diese Felder und nur, weil ihren Inhalt ausschließlich vertrauenswürdige Admins pflegen. Alle anderen Felder bleiben escaped:

```php
// functions.php des Child-Themes
add_filter('acf/the_field/allow_unsafe_html', function ($allowed, $selector) {
    $trusted = ['registration_form', 'registration_options' /* … */];

    return in_array($selector, $trusted, true) ? true : $allowed;
}, 10, 2);
```

Die andere Möglichkeit, die ACF vorschlägt, ist `echo get_field('registration_form');` im Template, das nicht durch das Escaping läuft.

Die Lösung hat Minuten gedauert. Zu merken, dass etwas kaputt war, hat acht Stunden gedauert. Genau das wollte ich ändern.

## Die eigentliche Lösung: vorher eine Baseline, nachher ein Vergleich

Heute prüfe ich jede Website zweimal pro Update, **einmal vorher** (die Baseline) und **einmal nachher**, und vergleiche beide Ergebnisse. Ohne Baseline lässt sich neuer Schaden nicht von Problemen unterscheiden, die schon vorher da waren.

Die Prüfung läuft in einem echten Browser, denn nur ein Browser sieht, was ein Besucher sieht: JavaScript-Fehler, Slider, die nie starten, ein Cookie-Banner, das den Absende-Knopf verdeckt. Dahinter stecken drei kleine Skripte.

### 1. Alle URLs aus den Sitemaps sammeln

WordPress hat eine eigene Sitemap unter `wp-sitemap.xml`, Yoast und Rank Math nutzen `sitemap_index.xml`. Das Skript probiert beide durch, folgt den Unter-Sitemaps und sammelt jedes `<loc>`:

```bash
fetch_locs() { curl -s -L --max-time 30 "$1" | grep -o '<loc>[^<]*' | sed 's/<loc>//; s/&amp;/\&/g'; }
```

Sitemaps enthalten nicht alles. Danke-Seiten und Buchungsschritte fehlen oft, die ergänze ich von Hand.

### 2. Jede Seite in Headless Chrome öffnen

Ein Node-Skript öffnet mit [Puppeteer](https://pptr.dev/) jede URL in Headless Chrome, vier Tabs gleichzeitig. Pro Seite speichert es einen Fingerabdruck: Status, Titel, einen Hash der h1/h2-Überschriften, JavaScript-Fehler, fehlgeschlagene Anfragen an die eigene Domain, kaputte Bilder, PHP-Fehler und nicht ausgeführte Shortcodes im sichtbaren Text, Slider (initialisiert? wie viele Slides?) und vor allem Formulare.

Bei jedem Formular zählt es die sichtbaren Felder und die Absende-Knöpfe. Dann tippt es in jedes sichtbare Textfeld und liest den Wert zurück, um zu beweisen, dass das Feld wirklich Eingaben annimmt:

```js
await h.click({ clickCount: 3 });
await h.type(probe, { delay: 5 });
const ok = (await h.evaluate(e => e.value)).includes(probe);
await h.evaluate(e => { e.value = ''; });
```

Abgeschickt wird ein Formular aber nie. Eine Testanfrage schickt eine echte E-Mail an einen echten Kunden.

Und es sucht genau nach dem Fehler von oben, nach Formularresten **ohne** Formular: dem Container eines Formular-Plugins, in dem kein `<form>` mehr steckt, oder Textfeldern, die in keinem Formular liegen:

```js
const orphanFields = [...document.querySelectorAll('textarea, input[type="text"], input[type="email"], select')]
  .filter(e => !e.closest('form') && visible(e) && !e.closest('header, nav, [role="search"]')).length;
```

Auf der kaputten Veranstaltungs-Website hätte das auf jeder einzelnen Veranstaltungsseite ein Textfeld außerhalb eines Formulars gemeldet.

### 3. Vorher und nachher vergleichen

Ein kleines Python-Skript vergleicht die beiden JSON-Dateien Seite für Seite und sortiert die Unterschiede in zwei Gruppen:

- **WORSE** (schlechter): Eine Seite fehlt, ein Formular oder ein Absende-Knopf ist verschwunden, weniger Felder lassen sich ausfüllen, ein Slider funktioniert nicht mehr, oder es gibt neue JavaScript-Fehler, fehlgeschlagene Anfragen, kaputte Bilder oder Formularreste. Dann endet das Skript mit Exit-Code 1.
- **Check by eye** (mit dem Auge prüfen): ein geänderter Titel, weniger Bilder, andere Überschriften. Oft harmlos, deshalb schaue ich mir die Screenshots dieser Seiten an, bevor ich entscheide.

Eine `WORSE`-Zeile wird behoben oder zurückgerollt, bevor irgendjemand das Wort „fertig“ hört.

## Was ich beim Bauen lernen musste

Die ersten Läufe waren voller Fehlalarme. Die meisten haben mir etwas darüber beigebracht, wie echte WordPress-Websites gebaut sind:

- **Honeypots sehen aus wie kaputte Felder.** Anti-Spam-Plugins fügen ein Feld hinzu, das Besucher nie sehen: auf einen Pixel zugeschnitten, aus dem Bild geschoben oder hinter die Seite gelegt. Mein Skript hat es zuerst als „verstecktes Feld“ gemeldet. Jetzt erkennt es Honeypots und lässt sie aus (und tippt nie hinein, denn ein ausgefüllter Honeypot weist einen als Bot aus).
- **Cookie-Banner verdecken alles.** Viele Formulare und Slider liegen hinter einem Einwilligungs-Banner, manchmal in einem Shadow DOM. Das Skript klickt erst auf „Alle akzeptieren“, bevor es sich die Seite ansieht.
- **Slider brauchen Zeit.** Mit vier Tabs gleichzeitig starteten manche Slider zu spät und galten als kaputt. Auf einer Website waren das sieben Fehlalarme parallel und null, wenn die Seiten einzeln geladen wurden. Jetzt wird jede Seite, die kaputt aussieht, noch einmal allein geladen, bevor sie gemeldet wird.
- **Lazy Loading braucht Scrollen.** Das Skript scrollt durch jede Seite, damit Bilder und Slider weiter unten auch wirklich laden.
- **Ein 403 auf `wp-login.php` ist in Ordnung.** Wenn ein Sicherheits-Plugin die Login-Seite blockiert, ist das Absicht.

## Was es nicht prüft

Das Skript sieht die Website als nicht angemeldeter Besucher. Das Backend, Page Builder, Seiten nur für Mitglieder und das echte Absenden eines Formulars bleiben Handarbeit, und ich schreibe sie in meinen Notizen als „nicht geprüft“ auf, statt sie stillschweigend wegzulassen. Ein Test hilft nur, wenn man weiß, wo er aufhört.

## Was ich aus diesem Fehler gelernt habe

- **HTTP 200 heißt, der Server hat geantwortet. Es heißt nicht, dass die Seite funktioniert.** Teste, wofür die Seite da ist: das Formular, die Buchung, den Slider.
- **Eine Prüfung ohne Baseline ist eine halbe Prüfung.** Erst der Vergleich zeigt, was das Update verändert hat.
- **Lies das Changelog der Plugins, die dein HTML ausgeben.** ACF hat diese Änderung eine Version vorher angekündigt und im Backend gewarnt. Mit dem Sprung direkt von 6.2.4 bin ich über all das hinweggesprungen.
- **Sicherheitsänderungen machen manchmal absichtlich Funktionen kaputt.** Ausgaben zu escapen ist die richtige Voreinstellung. Die Lösung ist, genau die Felder freizugeben, denen man vertraut, und nicht, das Escaping abzuschalten.

Inzwischen läuft die ganze Prüfung bei meiner monatlichen WordPress-Wartung mit, und ein Update ist erst fertig, wenn der Vergleich sauber ist.
