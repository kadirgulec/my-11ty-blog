---
project: comon
docLang: en
title: How CoMon works
date: 2026-09-14
description: A walkthrough of the contract deadlines, meter readings and household budget that CoMon keeps in one place — and why I built it.
image: /assets/images/projects/comon-dashboard.png
imageAlt: CoMon dashboard showing quick booking, fuel entry, fixed costs and account balances
draft: false
---

## Why I built it

Contract renewals are easy to miss. A mobile plan rolls over for another year,
an insurance policy passes its notice period, and the first you hear of it is the
invoice. The information needed to prevent that is never in one place: a PDF in
an email, a date in a calendar, a balance in a banking app.

CoMon puts the three together — what you have signed, what you are metering, and
what it costs — and sends an email before a deadline passes.

## Contracts and deadlines

Every contract carries its start date, its term, and its notice period. From
those three, CoMon derives the date by which you have to act, rather than the
date the contract ends — which is the one that actually matters. Anything
approaching that date surfaces on the dashboard and in a reminder mail.

## Meters and fill-ups

Readings are recorded per device or vehicle: electricity, gas, water, or fuel.
Consumption between two readings is derived rather than entered, so a wrong
number is visible as a spike instead of quietly averaging away.

## Budget

Accounts, fixed costs and spending by category roll up into the balance the
dashboard opens on. Fixed costs are projected forward, so the figure shown is
what is actually left after the month's standing commitments, not the current
bank balance.

## Stack notes

CoMon is a Laravel application with Livewire driving the interactive pieces —
the widget dashboard, the quick-booking form, the meter entry flow — and Alpine
for the small in-page interactions that never need a round trip. Tailwind for
styling, MySQL underneath, multi-user so a household shares one set of data.

The demo account is open: sign in as `Demo` with `TestDemo1!` to look around.
