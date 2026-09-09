---
title: Wie ich diesen statischen Blog gebaut habe
date: 2025-02-07
docLang: de
image: /assets/images/posts/eleventy.jpeg
imageAlt: ''
description: Ein tiefer Blick auf Eleventy, Nunjucks und GitHub Actions.
tags:
  - post
  - 11ty
  - AlpineJS
  - TailwindCSS
  - Hetzner
  - GitHub
  - Projects
draft: false
---
# Wie ich diesen statischen Blog gebaut habe: Eleventy und GitHub Actions im Detail

Es liegt eine gewisse Ironie im Entwicklerdasein: Tagsüber bauen wir komplexe, datengetriebene Anwendungen — für unsere eigene kleine Ecke des Internets wünschen wir uns dann Einfachheit.

Als ich diesen Blog starten wollte, standen ein paar Dinge fest: Er musste **blitzschnell**, **unschlagbar sicher** und **wartungsarm** sein. Nach Jahren mit Datenbank-Updates und schwergewichtigen Plugins wollte ich zurück zu den Grundlagen — aber mit modernen Mitteln.

---

## Warum statisch?

Die alte Garde des Bloggens (ja, WordPress, ich meine dich) kann vieles gut, fühlt sich aber oft an wie ein Vorschlaghammer für eine Nuss. Ich wollte keine Datenbank verwalten und schon gar nicht meine Wochenenden mit Sicherheitspatches verbringen.

Plattformen wie Medium sind dagegen bequem, kosten aber digitale Selbstbestimmung. Ich wollte die volle Kontrolle über meine Pixel und meine Daten. **Statisch** heißt: Ich liefere fertig gerendertes HTML aus. Keine Verarbeitung auf dem Server — und damit:

* **Tempo:** praktisch sofort da.
* **Sicherheit:** keine Datenbank, die sich angreifen ließe.
* **Kosten:** Hosting ist extrem günstig, teils kostenlos.

---

## Der Stack

Ich habe mich für einen Stack der goldenen Mitte entschieden: mächtig genug für Flexibilität, ohne den Ballast eines ausgewachsenen JavaScript-Frameworks wie Next.js.

### 1. Die Engine: Eleventy (11ty)
Eleventy ist ein aufstrebender Stern unter den Static Site Generatoren. Anders als die Konkurrenz zwingt es einem kein bestimmtes Framework auf. Von Haus aus „zero config", aber erstaunlich erweiterbar. Als Template-Engine nutze ich **Nunjucks**, weil sich damit saubere Logik schreiben lässt, ohne dass das HTML unleserlich wird.

### 2. Styling: Tailwind CSS v4
Ich bin auf **Tailwind CSS v4** umgestiegen. Es ist schneller und schlanker als seine Vorgänger. Damit baue ich eigene Designs direkt im Markup, ohne die HTML-Datei je zu verlassen — das hält die Entwicklungsschleife angenehm kurz.

### 3. Interaktivität: Alpine.js
Für die kleinen interaktiven Sprenkel — mobiles Menü, Suche ein- und ausklappen — setze ich auf **Alpine.js**, oft „Tailwind für JavaScript" genannt. Es bietet die deklarative Kraft von Vue oder React bei einem Bruchteil der Größe.

### 4. Das Zuhause: Hetzner Webhosting S
Das fertige Build liegt bei **Hetzner**: zuverlässig, in Europa und ideal für eine leichtgewichtige statische Seite.

---

## Der Clou: automatisiertes Deployment

Das eigentlich Schöne an diesem Setup ist der Arbeitsablauf. Ich schiebe keine Dateien mehr per FTP hin und her, als wäre es 2005. Stattdessen läuft alles über **GitHub Actions**.

**Der Ablauf ist simpel:**
1.  Ich schreibe einen neuen Beitrag in **Markdown**.
2.  Ich schicke die Änderungen mit `git push` zu GitHub.
3.  Eine GitHub Action startet und:
    * installiert die Abhängigkeiten,
    * baut die Seite mit Eleventy,
    * minifiziert das CSS,
    * **lädt die fertigen Dateien automatisch** per FTP auf meinen Hetzner-Server.

Das Ergebnis? Ich kann mich ganz aufs Schreiben konzentrieren. Keine Server zu patchen, keine Datenbanken zu optimieren — nur Inhalte.

---

> **Was kommt als Nächstes?**
> Ich plane, das Starter-Template für diesen Blog demnächst als Open Source zu veröffentlichen. Wer dem „schweren" Web entkommen will, sollte dranbleiben!
