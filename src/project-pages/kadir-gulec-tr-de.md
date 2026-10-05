---
project: kadir-gulec-tr
docLang: de
title: Wie kadir.gulec.tr funktioniert
date: 2026-10-05
description: "Ein Rundgang durch mein türkisches digitales Notizbuch — Beiträge, Filme, Gewohnheitsketten und Ziele — und das Livewire-Backoffice dahinter."
image: /assets/images/projects/kgtr-home.png
imageAlt: "Startseite von kadir.gulec.tr: ein Papiernotizbuch mit farbigen Reitern, einem handgezeichneten Logo und dem neuesten Film und Beitrag, mit Klebeband angeheftet"
draft: false
---

## Warum eine zweite Seite

Dieser Blog ist bewusst statisch: Ein Portfolio ist Inhalt, und Inhalt braucht
keine Datenbank. kadir.gulec.tr ist der umgekehrte Fall. Es ist meine
persönliche Seite auf Türkisch, meiner Muttersprache, und Leser tun dort etwas —
sie registrieren sich, folgen einem Ziel, kommentieren einen Beitrag, werden
benachrichtigt. Dafür braucht es Konten, Berechtigungen und eine Queue, also
ist es eine Laravel-Anwendung.

Die Idee ist eher ein Notizbuch als eine Website: ein Ort für das, was ich
schreibe, schaue und mir vornehme, ehrlich geführt — verpasste Ziele bleiben
auf der Seite stehen, mit Bleistift durchgestrichen.

<figure>
{% image "src/assets/images/projects/kgtr-home.png", "Startseite von kadir.gulec.tr: ein Papiernotizbuch mit farbigen Reitern rechts, einem handgezeichneten Logo und dem neuesten Film und Beitrag, mit Klebeband angeheftet", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Die Startseite: Jeder Bereich ist ein farbiger Reiter am Rand des Notizbuchs.</figcaption>
</figure>

## Ein Notizbuch, keine Vorlage

Jeder Bereich hat seine eigene Farbe und sein eigenes Papierobjekt. Filme sind
Polaroids, langfristige Ziele hängen als Karten an einer Korkwand, ein
erreichtes Ziel bekommt einen Stempel. Überschriften stehen in einer Serifenschrift,
Notizen in Handschrift, Zahlen in einer Monospace-Schrift. Die Schreibtischlampe
in der Ecke schaltet auf das Nachtnotizbuch um.

<figure>
{% image "src/assets/images/projects/kgtr-home-night.png", "Dieselbe Startseite im dunklen Nachtnotizbuch-Design", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Das Nachtnotizbuch, eingeschaltet mit der Schreibtischlampe.</figcaption>
</figure>

## Filme und Serien

Was ich schaue, wird mit einer Bewertung von zehn, einer optionalen Kritik und
bei Serien mit Staffel und Folge festgehalten. Kritiken können Spoiler hinter
einem Markerstrich verstecken, den ein Klick aufhebt. Die Poster kommen von
TMDB, und eine Merkliste („Sırada“) hält fest, was als Nächstes kommt.

<figure>
{% image "src/assets/images/projects/kgtr-watched.png", "Seite mit Filmen und Serien: Polaroid-Poster, rote Bewertungskreise und Fortschrittsbalken für laufende Serien", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Zuletzt gesehene Filme als Polaroids, Serien mit ihrem Fortschritt.</figcaption>
</figure>

## Ziele auf drei Etagen

Die Zielseite zoomt beim Scrollen heraus. Ganz oben stehen Gewohnheitsketten —
„don't break the chain“ — als handgezeichnete Kettenglieder. Eine Kette zählt
Tage, Wochen oder Monate: „zweimal pro Woche“ füllt ein Glied pro Woche, sobald
zwei Tage markiert sind, und ein entschuldigter Tag, krank oder unterwegs, ist
ein mit Klebeband geflicktes Glied statt eines Bruchs. Darunter folgen die Ziele
des Jahres mit Fortschrittsbalken, ganz unten die langfristigen Ziele an der
Korkwand.

<figure>
{% image "src/assets/images/projects/kgtr-goals-chains.png", "Karten mit Gewohnheitsketten und Serienzählern, eine davon in Wochen gezählt, und eine zensierte Kette mit geschwärztem Titel", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Tägliche und wöchentliche Ketten. Die geschwärzte ist zensiert.</figcaption>
</figure>

Jedes Ziel ist öffentlich, zensiert oder versteckt. Ein zensiertes Ziel behält
seine Zahlen und seine Form, aber seine Wörter verlassen nie den Server: Der
Browser erfährt nur, wie lang der Titel ist, und zeichnet den Markerstrich in
dieser Länge. Enge Freunde mit der passenden Rolle lesen den echten Text; ein
verstecktes Ziel gibt es für niemanden außer mir.

<figure>
{% image "src/assets/images/projects/kgtr-goals-board.png", "Korkwand mit langfristigen Zielen auf angepinnten Karten, eine davon mit schwarzem Marker zensiert", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Langfristige Ziele an der Korkwand, jedes mit den kleineren Zielen verknüpft, die darauf einzahlen.</figcaption>
</figure>

## Mitlesen und folgen

Leser können ein Konto anlegen und einem Film, einem Ziel oder einem Projekt
folgen. Wenn etwas passiert — eine 30-Tage-Serie, ein Meilenstein, eine neue
Kritik —, bekommen sie eine Sammel-E-Mail im Takt ihrer Wahl: sofort, täglich
oder wöchentlich. Jeder Eintrag darin hat seinen eigenen Link zum Entfolgen.

Die Seite ist außerdem eine installierbare Web-App. Angemeldete Leser können
Push-Benachrichtigungen pro Gerät einschalten; jede E-Mail kommt dann auch als
Benachrichtigung an. Wer sich auf einem Gerät abmeldet, beendet dort die
Benachrichtigungen.

<figure>
{% image "src/assets/images/projects/kgtr-home-phone.png", "Die Startseite auf dem Handy mit den Reitern als Navigationsleiste unten", "mx-auto block w-full max-w-xs", "(max-width: 768px) 100vw, 390px" %}
<figcaption>Auf dem Handy werden die Reiter zur Leiste unten; die Seite lässt sich wie eine App installieren.</figcaption>
</figure>

## Das Backoffice

Alles wird in einem Livewire-Adminbereich geschrieben und gepflegt, den ich das
Backoffice nenne. Das Dashboard öffnet mit dem heutigen Tag: Ein Tipp markiert
jede Gewohnheit als erledigt oder entschuldigt, eine Wochenkette zeigt, wie die
Woche steht, und Zahlenziele bekommen ein +1 mit Notiz.

<figure>
{% image "src/assets/images/projects/kgtr-admin-dashboard.png", "Admin-Dashboard mit den heutigen Gewohnheiten, Buttons für erledigt und entschuldigt, einem Wochenketten-Badge und Zahlenzielen mit +1-Buttons", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Das Dashboard: die heutigen Gewohnheiten und Ziele, je ein Tipp.</figcaption>
</figure>

Die Seite einer Kette enthält ihre Einstellungen und das ganze Jahr als
klickbares Raster. Bei Wochen- und Monatsketten prüft der Server jeden Morgen,
ob die restlichen Tage noch reichen: Sobald höchstens doppelt so viele Tage
übrig sind wie noch nötige Male, kommt eine Erinnerung per E-Mail und Push.

<figure>
{% image "src/assets/images/projects/kgtr-admin-chain.png", "Ketteneditor mit dreimal pro Woche und einem Jahresraster aus erledigten, entschuldigten und leeren Tagen", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Eine Wochenkette: dreimal pro Woche, das Jahr als Raster.</figcaption>
</figure>

Beiträge und Projektbeschreibungen entstehen in einem Markdown-Editor mit
Werkzeugleiste, einer kurzen Syntaxhilfe und einer Vorschau im Stylesheet der
Seite. Er kennt die Extras des Notizbuchs: Textmarker, Randnotizen,
Polaroid-Bilder und Spoiler.

<figure>
{% image "src/assets/images/projects/kgtr-admin-project.png", "Projekteditor mit einer Markdown-Fallstudie, Technologie-Tags und Upload für das Titelbild", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Die Fallstudie eines Projekts bearbeiten.</figcaption>
</figure>

Der Rest des Backoffice umfasst Mitglieder, Rollen und Berechtigungen,
Kommentarmoderation, Nachrichten aus dem Kontaktformular und Backups, die sich
herunterladen und wiederherstellen lassen.

## Zum Stack

Laravel 13 mit Livewire 4 für den Adminbereich und die interaktiven Teile der
Seite, Alpine.js für kleines Verhalten auf der Seite, Tailwind CSS 4, MariaDB.
Die Anmeldung läuft über Fortify mit Passkeys oder Zwei-Faktor-Codes, die der
Adminbereich voraussetzt. Vorschaubilder für geteilte Links werden beim ersten
Aufruf mit GD im Notizbuchstil gezeichnet. Push-Benachrichtigungen nutzen den
Web-Push-Standard mit VAPID-Schlüsseln über `minishlink/web-push`.

Die Testsuite besteht aus 376 Pest-Tests, dazu PHPStan und Pint. Jeder Push auf
`master` lässt sie in GitHub Actions laufen und deployt bei Erfolg auf einen
HestiaCP-Server. Dieser Server hat keinen Prozess-Supervisor, deshalb leert der
Scheduler die Queue jede Minute.

Die Startseiten-Screenshots im hellen Design stammen von der Live-Seite; die
übrigen zeigen Beispieldaten aus dem Entwicklungs-Seeder.
