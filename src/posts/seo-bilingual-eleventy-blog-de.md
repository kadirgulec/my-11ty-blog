---
title: Was Google auf einem zweisprachigen Eleventy-Blog wirklich sieht
urlSlug: was-google-auf-einem-zweisprachigen-eleventy-blog-wirklich-sieht
date: 2026-11-11
docLang: de
description: "Googlebot hat meinen Sprachumschalter nie gesehen, also stand ein deutscher Titel über englischem Inhalt. So habe ich meinen Eleventy-Blog repariert, geprüft an Googles Doku."
tags:
  - post
  - 11ty
  - SEO
  - Multilingual
draft: true
---

Diese Website gibt es auf Englisch und auf Deutsch. Ich lebe und arbeite in Düren und möchte, dass Menschen hier mich finden, wenn sie nach „Webentwickler Düren“ suchen. Die deutsche Seite ist mir also wichtig. Lange dachte ich, die Zweisprachigkeit sei sauber gelöst: ein EN/DE-Umschalter im Header, die Wahl im Browser gespeichert, und jede Seite in beiden Sprachen.

Dann habe ich die Website geprüft, und zwar nur gegen Primärquellen: Google Search Central, web.dev, schema.org, die Doku von Bing und IndexNow und die Eleventy-Doku. Keine SEO-Blogs, keine „ultimativen Checklisten“. Am Ende standen sechzehn Punkte auf der Liste. Der erste war der schlimmste: Google hatte die deutsche Version meiner Startseite nie gesehen.

## Das Problem: Googlebot hat kein Gedächtnis

Die Startseite, `/blog/` und `/certificates/` waren jeweils eine URL mit beiden Sprachen im HTML. Ein kleines Skript las die Sprachwahl aus dem `localStorage` und blendete die andere Sprache mit `display: none` aus. Ohne gespeicherte Wahl zeigte es Englisch.

Googles Rendering-Dienst behält zwischen zwei Seitenaufrufen nichts: „Local Storage and Session Storage data are cleared across page loads. HTTP Cookies are cleared across page loads.“ ([Google Search Central](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript)). Googlebot bekam also immer die Voreinstellung, Englisch.

Und Google bestimmt die Sprache einer Seite nach dem, was sichtbar ist: „We don't use any code-level language information such as `lang` attributes, or the URL.“ ([Google Search Central](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).

Zusammen ergab das einen echten Widerspruch. `<title>` und Meta-Beschreibung der Startseite waren deutsch („Webentwickler & Software Developer in Düren“), die sichtbare Überschrift aber englisch. Ein Titel in einer anderen Sprache als die Seite ist einer der Fälle, in denen Google [den Titel in den Suchergebnissen umschreibt](https://developers.google.com/search/docs/appearance/title-link). Und eine deutsche Suche nach „Webentwickler Düren“ konnte nur auf meinen Titel und auf Text treffen, den Google als versteckt sah.

Dazu kam ein zweiter, kleinerer Fehler. Deutsche Beiträge zeigten jedem Erstbesucher eine englische Navigation, weil das Skript auch auf einer Seite mit `lang="de"` auf Englisch zurückfiel. Google wünscht sich „a single language for content and navigation on each page“.

Eine Sache hatte ich falsch im Kopf: Versteckter Inhalt ist für sich keine Abstrafung. Googles Spam-Richtlinien erlauben Tabs und Akkordeons ausdrücklich. Das Problem war die Relevanz, nicht Spam.

## Die Lösung: eine URL pro Sprache

Google empfiehlt „different URLs for each language version of a page rather than using cookies or browser settings“ und führt einen URL-Parameter wie `?loc=de` als „Not recommended“. Meine Beiträge hatten schon eigene deutsche URLs. Startseite, Blog und Zertifikate haben jetzt deutsche Zwillinge: `/de/`, `/de/blog/` und `/de/certificates/`.

In Eleventy kostet das wenig. Es ist dieselbe Vorlage, paginiert über die beiden Sprachen:

{% raw %}
```yaml
pagination:
  data: locales
  size: 1
  alias: docLang
  addAllPagesToCollections: true
locales: [en, de]
permalink: "{{ '/de/' if docLang == 'de' else '/' }}"
```
{% endraw %}

Jede Seite rendert jetzt auf dem Server nur ihre eigene Sprache, es muss also nichts mehr versteckt werden. Einen Haken gab es. In Nunjucks sieht ein importiertes Makro die Variablen der Seite nicht, die es importiert. Mein Übersetzungsmakro `i18n.t()` braucht aber `docLang`, um die Sprache zu wählen, also muss es `with context` importiert werden:

{% raw %}
```njk
{% import "partials/i18n.njk" as i18n with context %}
```
{% endraw %}

Der Sprachumschalter im Header ist jetzt ein ganz normaler Link auf die andere Seite. Google folgt nur `<a href>`-Links. Ein Button, der ein CSS-Attribut umschaltet, hat Google nie verraten, dass es überhaupt eine deutsche Seite gibt.

### hreflang: Jede Version nennt alle Versionen

`hreflang` sagt Google, dass zwei URLs Übersetzungen voneinander sind und keine Duplikate, und welche davon welcher Leser sehen soll. Die Regeln sind streng: Jede Version nennt sich selbst und alle anderen Versionen, mit absoluten URLs. Zeigen zwei Seiten nicht gegenseitig aufeinander, ignoriert Google die Angaben. `x-default` nennt die Seite für alle anderen Sprachen. In meinem Layout ist das eine kurze Schleife:

{% raw %}
```njk
{% for version in versions %}
<link rel="alternate" hreflang="{{ version.data.docLang or 'en' }}" href="{{ site.url }}{{ version.url }}">
{% if (version.data.docLang or 'en') == 'en' %}
<link rel="alternate" hreflang="x-default" href="{{ site.url }}{{ version.url }}">
{% endif %}
{% endfor %}
```
{% endraw %}

`versions` liefert ein kleiner Filter, der die Übersetzungen einer Seite findet. Zwei Beiträge gehören zusammen, wenn sie im Front Matter denselben `translationKey` haben, oder sonst, wenn ihre Dateinamen ohne die Endung `-de` gleich sind: `livewire.md` und `livewire-de.md` sind ein Paar.

Die Startseite liefert jetzt genau das aus:

```html
<link rel="alternate" hreflang="en" href="https://kadir.guelec.eu/">
<link rel="alternate" hreflang="x-default" href="https://kadir.guelec.eu/">
<link rel="alternate" hreflang="de" href="https://kadir.guelec.eu/de/">
```

### Alte Links ziehen mit einem 301 um

Der alte Umschalter las auch `?lang=de` aus der URL. Auf der Website verlinkte nichts darauf, aber ein geteilter Link hätte deutschen Inhalt gezeigt, dessen kanonische URL auf die englische Seite zeigt. Jetzt leitet der Server solche Links dauerhaft weiter:

```apache
RewriteCond %{QUERY_STRING} (^|&)lang=de(&|$) [NC]
RewriteRule ^(blog/|certificates/)?$ /de/$1? [R=301,L]
```

Das `?` am Ende des Ziels wirft den alten Query-String weg, sodass `/blog/?lang=de` sauber auf `/de/blog/` landet.

## Kleinere Dinge, die still falsch waren

- **Ein Tippfehler hat einen Beitrag verschoben.** Die URLs der Beiträge entstanden aus `title | slugify`. Wer im CMS einen Titel korrigierte, gab dem Beitrag eine neue URL und hinterließ einen 404. Jeder Beitrag trägt seine URL jetzt fest als `urlSlug` im Front Matter, und das CMS warnt davor, sie zu ändern.
- **Jede Seite hat sich bei jedem Deploy „geändert“.** Das `<lastmod>` in der Sitemap war die Build-Zeit, und der Footer zeigte einen „Aktualisiert“-Zeitstempel aus dem Build. Google und Bing vertrauen `lastmod` nur, solange es stimmt. Jetzt kommt es aus dem `updated`- oder Veröffentlichungsdatum eines Beitrags, und Seiten ohne echtes Datum bekommen keins. `changefreq` und `priority` sind weg, weil beide Suchmaschinen sie ignorieren. Beiträge zeigen außerdem den Autor und ihr Veröffentlichungs- und Aktualisierungsdatum.
- **Das CMS war von der falschen Seite versteckt.** `/admin/` war in der `robots.txt` gesperrt und zusätzlich auf `noindex` gesetzt. Ein Crawler, der eine Seite nicht abrufen darf, liest aber ihr `noindex` nie, und so konnte die Sperre die nackte URL im Index halten. Jetzt erlaubt die `robots.txt` den Pfad, und der Server schickt dafür den Header `X-Robots-Tag: noindex, nofollow`.
- **Ein Feed, zwei Sprachen.** `/feed.xml` gab `<language>en</language>` an, enthielt aber jeden Beitrag doppelt, einmal pro Sprache. Jetzt ist `/feed.xml` englisch und `/de/feed.xml` deutsch.
- **Dieselbe Schrift, viermal geladen.** IBM Plex Sans und Space Grotesk sind variable Schriften, eine Datei deckt also alle Stärken ab. Mein CSS hat sie aber für jede Stärke einzeln deklariert, jeweils mit einer eigenen Kopie derselben Datei. Browser cachen nach URL, also lud die Startseite 10 Schriftdateien, davon 5 byte-gleiche Kopien, rund 156 KB umsonst. Jetzt ist jede Teilmenge einmal deklariert, mit einem Bereich für die Stärken:

  ```css
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 300 700;
    font-display: swap;
    src: url(/assets/fonts/space-grotesk-latin.woff2) format('woff2');
  }
  ```

- **Das wichtigste Bild lud zuletzt.** Auf `/blog/` ist das Aufmacherbild der Largest Contentful Paint (LCP), also der Moment, an dem Google die Ladegeschwindigkeit misst. Es hatte `loading="lazy"` und verzögerte damit genau diesen Moment. Jetzt lädt es sofort, mit `fetchpriority="high"`.
- **Die strukturierten Daten hatten Lücken.** Beiträge tragen jetzt `dateModified` und verweisen beim Autor auf die Person auf der Startseite. Gut zu wissen: Strukturierte Daten verbessern das Ranking nicht. Sie machen eine Seite nur für Rich Results geeignet.

## Suchmaschinen sagen, was sich geändert hat: IndexNow

[IndexNow](https://www.indexnow.org/) ist ein Protokoll, mit dem man Suchmaschinen geänderte URLs meldet. Bing, Yandex, Seznam, Naver und andere machen mit. Google nicht, Google verlässt sich auf die Sitemap und das eigene Crawlen. Die IndexNow-FAQ bittet darum, nur neue, geänderte oder gelöschte URLs zu melden, nicht bei jedem Deploy die ganze Website.

Eine statische Website weiß nicht, was sich geändert hat, also rechnet mein Deploy es aus. Nach dem Build schreibt ein kleines Node-Skript ein Manifest mit einem SHA-256-Hash pro indexierbarer Seite. Vorher entfernt es die Cache-Buster `?v=…` aus dem HTML, damit eine reine CSS-Änderung nicht als Änderung jeder Seite zählt:

```js
const normalized = html.replace(/\?v=[0-9a-f]+/g, "");
pages[url] = createHash("sha256").update(normalized).digest("hex");
```

Das Manifest wird mit der Website veröffentlicht. Der nächste Deploy lädt das Live-Manifest herunter, bevor `rsync` es ersetzt, vergleicht beide und meldet nur die Unterschiede. Der Schritt läuft in GitHub Actions mit `continue-on-error: true`, ein fehlgeschlagener Ping lässt also nie den Deploy scheitern.

## SEO-Tipps, an die ich nicht mehr glaube

Die Prüfung hat auch verbreitete SEO-Tipps mit der offiziellen Doku verglichen. An einige hatte ich jahrelang geglaubt:

- **Meta-Keywords helfen.** Die Google-Suche nutzt das Keywords-Meta-Tag nicht.
- **Ein Lighthouse-Wert von 100 ist ein Rankingfaktor.** Googles Core Web Vitals kommen aus Daten echter Besucher. Lighthouse ist ein Labortool.
- **Beiträge brauchen eine Mindestanzahl an Wörtern.** Google: „there's no magical word count target“.
- **Übersetzungen sind Duplicate Content.** Nur „if the main content of the page remains untranslated“.
- **hreflang verbessert das Ranking.** Es hilft Google, die richtige Sprachversion zu zeigen. Mehr nicht.
- **Neue Datumsangaben lassen eine Website frisch wirken.** Daten ändern, ohne den Inhalt zu ändern: „(No, it won't)“.
- **`Disallow` in der robots.txt nimmt eine Seite aus Google.** Sie kann trotzdem ohne Inhalt im Index landen, und ein `noindex` hinter einem `Disallow` wird nie gelesen.
- **Google die Sitemap anpingen.** Den Endpunkt `google.com/ping?sitemap=` gibt es seit 2023 nicht mehr.

## Was ich daraus gelernt habe

- **Prüfen, was der Crawler sieht, nicht was der eigene Browser zeigt.** Googlebot merkt sich nichts: kein `localStorage`, keine Cookies, keine Klicks. Was eine Seite beim ersten, frischen Besuch zeigt, ist die Seite.
- **Eine URL, eine Sprache.** Inhalt, Navigation und Titel in derselben Sprache, und echte Links zwischen den Versionen.
- **Datumsangaben ehrlich halten.** Ein `lastmod`, das sich bei jedem Build ändert, bringt Suchmaschinen bei, es zu ignorieren.
- **Die Primärquellen lesen.** Die meisten SEO-Tipps, die ich gesammelt hatte, sind verschwunden, sobald ich sie mit Googles eigener Doku verglichen habe.

Nichts davon ist ein Trick, um höher zu ranken. Es nimmt Google die Gründe, die Website falsch zu verstehen. In diesem Beitrag geht es darum, was ich geändert habe und warum, nicht um Ranking-Zahlen.
