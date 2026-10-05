---
project: kadir-gulec-tr
docLang: en
title: How kadir.gulec.tr works
date: 2026-10-05
description: "A tour of my Turkish digital notebook — posts, films, habit chains and goals — and the Livewire back office behind it."
image: /assets/images/projects/kgtr-home.png
imageAlt: "kadir.gulec.tr homepage: a paper notebook with coloured tabs, a hand-drawn logo and the latest film and post pinned with tape"
draft: false
---

## Why a second site

This blog is static on purpose: a portfolio is content, and content needs no
database. kadir.gulec.tr is the opposite case. It is my personal site in
Turkish, my first language, and readers do things on it — they sign up, follow
a goal, comment on a post, get notified. That needs accounts, permissions and a
queue, so it is a Laravel application.

The idea is a notebook rather than a website: one place for what I write, what
I watch and what I am working towards, kept honestly — the goals I miss stay on
the page, crossed out in pencil.

<figure>
{% image "src/assets/images/projects/kgtr-home.png", "kadir.gulec.tr homepage: a paper notebook with coloured section tabs on the right, a hand-drawn logo and the latest film and post pinned with tape", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>The homepage: every section is a coloured tab on the side of the notebook.</figcaption>
</figure>

## A notebook, not a template

Each section has its own colour and its own paper object. Films are polaroids,
long-term goals are cards pinned to a cork board, a finished goal gets a rubber
stamp. Headlines are set in a serif, notes in handwriting, numbers in a mono
face. The desk lamp in the corner switches to the night notebook.

<figure>
{% image "src/assets/images/projects/kgtr-home-night.png", "The same homepage in the dark night-notebook theme", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>The night notebook, switched on with the desk lamp.</figcaption>
</figure>

## Films and series

What I watch is logged with a rating out of ten, an optional review and, for
series, the season and episode I am on. Reviews can hide spoilers behind a
marker stroke that a click lifts. Posters come from TMDB, and a watchlist
("Sırada") keeps what is next in order.

<figure>
{% image "src/assets/images/projects/kgtr-watched.png", "Films and series page with polaroid posters, red rating circles and progress bars for the series being watched", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Recent films as polaroids, series with their progress.</figcaption>
</figure>

## Goals on three floors

The goals page zooms out as you scroll. At the top are habit chains — "don't
break the chain" — drawn as hand-drawn links. A chain counts days, weeks or
months: "twice a week" fills one link per week once two days are marked, and an
excused day, sick or travelling, is a link patched with tape instead of a break.
Below come this year's goals with progress bars, and at the bottom the long-term
goals on a cork board.

<figure>
{% image "src/assets/images/projects/kgtr-goals-chains.png", "Habit chain cards with streak counters, one counted in weeks, and a censored chain whose title is blacked out", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Daily and weekly chains. The blacked-out one is censored.</figcaption>
</figure>

Every goal is public, censored or hidden. A censored goal keeps its numbers and
its shape, but its words never leave the server: the browser only learns how
long the title is and draws the marker stroke to that length. Close friends
with the right role read the real text; a hidden goal does not exist for anyone
but me.

<figure>
{% image "src/assets/images/projects/kgtr-goals-board.png", "Cork board with long-term goals on pinned cards, one of them censored with black marker", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Long-term goals on the cork board, each linked to the smaller goals that serve it.</figcaption>
</figure>

## Following along

Readers can create an account and follow a film, a goal or a project. When
something happens — a 30-day streak, a milestone, a new review — they get one
digest e-mail at the pace they choose: right away, daily or weekly. Each item in
it carries its own unfollow link.

The site is also an installable web app. Signed-in readers can switch on push
notifications per device, and every e-mail then arrives as a notification as
well. Signing out on a device ends its notifications.

<figure>
{% image "src/assets/images/projects/kgtr-home-phone.png", "The homepage on a phone with the section tabs as a bottom navigation bar", "mx-auto block w-full max-w-xs", "(max-width: 768px) 100vw, 390px" %}
<figcaption>On a phone the tabs become a bottom bar; the site installs like an app.</figcaption>
</figure>

## The back office

Everything is written and maintained in a Livewire admin panel I call the back
office. The dashboard opens on today: one tap marks each habit as done or
excused, a weekly chain shows how the week stands, and numeric goals take a +1
with a note.

<figure>
{% image "src/assets/images/projects/kgtr-admin-dashboard.png", "Admin dashboard with today's habits, Done and Excuse buttons, a weekly chain badge and numeric goals with +1 buttons", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>The dashboard: today's habits and goals, one tap each.</figcaption>
</figure>

A chain's page holds its settings and the whole year as a clickable grid. For
weekly and monthly chains, the server works out each morning whether the
remaining days still leave room: once the days left are at most twice the times
still needed, I get a reminder by e-mail and push.

<figure>
{% image "src/assets/images/projects/kgtr-admin-chain.png", "Chain editor set to three times a week, with a year grid of done, excused and empty days", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>A weekly chain: three times a week, the year as a grid.</figcaption>
</figure>

Posts and project write-ups use a Markdown editor with a toolbar, a short syntax
guide and a preview rendered with the site's own stylesheet. It knows the
notebook's extras: highlighter, side notes in the margin, polaroid images and
spoilers.

<figure>
{% image "src/assets/images/projects/kgtr-admin-project.png", "Project editor with a Markdown case study, technology tags and cover upload", "", "(max-width: 768px) 100vw, 768px" %}
<figcaption>Editing a project's case study.</figcaption>
</figure>

The rest of the back office covers members, roles and permissions, comment
moderation, contact messages and backups that can be downloaded and restored.

## Stack notes

Laravel 13 with Livewire 4 for the admin panel and the interactive parts of the
site, Alpine.js for small in-page behaviour, Tailwind CSS 4, MariaDB. Sign-in
uses Fortify with passkeys or two-factor codes, which the admin panel requires.
Share images are drawn with GD in the notebook style on first request. Push
notifications use the Web Push standard with VAPID keys, through
`minishlink/web-push`.

The test suite is Pest with 376 tests, alongside PHPStan and Pint. Every
push to `master` runs them in GitHub Actions and, when they pass, deploys to a
HestiaCP server. That server has no process supervisor, so the queue is drained
by the scheduler every minute.

The light-theme homepage screenshots come from the live site; the others show
sample data from the development seeder.
