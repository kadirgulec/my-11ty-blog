---
project: comon
docLang: de
title: Wie CoMon funktioniert
date: 2026-09-14
description: Ein Rundgang durch Vertragsfristen, Zählerstände und Haushaltsbudget, die CoMon an einem Ort zusammenführt — und warum ich es gebaut habe.
image: /assets/images/projects/comon-dashboard.png
imageAlt: CoMon-Dashboard mit Schnellbuchung, Tankeintrag, Fixkosten und Kontoständen
draft: false
---

## Warum ich es gebaut habe

Vertragsverlängerungen übersieht man leicht. Ein Mobilfunkvertrag verlängert
sich um ein weiteres Jahr, bei einer Versicherung läuft die Kündigungsfrist ab —
und man erfährt es erst durch die Rechnung. Die Informationen, die das
verhindern würden, liegen nie an einem Ort: ein PDF in einer E-Mail, ein Datum
im Kalender, ein Saldo in der Banking-App.

CoMon bringt diese drei Dinge zusammen — was unterschrieben ist, was gemessen
wird und was es kostet — und schickt eine E-Mail, bevor eine Frist verstreicht.

## Verträge und Fristen

Jeder Vertrag trägt sein Startdatum, seine Laufzeit und seine Kündigungsfrist.
Daraus leitet CoMon ab, bis wann gehandelt werden muss — nicht, wann der Vertrag
endet. Denn das erste Datum ist das entscheidende. Alles, was näher rückt,
erscheint auf dem Dashboard und in einer Erinnerungsmail.

## Zähler und Tankfüllungen

Zählerstände werden pro Gerät oder Fahrzeug erfasst: Strom, Gas, Wasser oder
Kraftstoff. Der Verbrauch zwischen zwei Ständen wird berechnet statt eingegeben,
damit ein falscher Wert als Ausreißer sichtbar wird, statt sich still
herauszumitteln.

## Budget

Konten, Fixkosten und Ausgaben nach Kategorie ergeben zusammen den Saldo, mit
dem das Dashboard öffnet. Fixkosten werden vorausberechnet, sodass die
angezeigte Zahl dem entspricht, was nach den laufenden Verpflichtungen des
Monats tatsächlich übrig bleibt — nicht dem aktuellen Kontostand.

## Zum Stack

CoMon ist eine Laravel-Anwendung. Livewire treibt die interaktiven Teile — das
Widget-Dashboard, die Schnellbuchung, die Zählererfassung — und Alpine übernimmt
die kleinen Interaktionen, die keinen Server-Roundtrip brauchen. Tailwind für
die Gestaltung, MySQL darunter, mehrbenutzerfähig, damit ein Haushalt gemeinsam
auf dieselben Daten schaut.

Der Demo-Zugang ist offen: Anmeldung als `Demo` mit `TestDemo1!`.
