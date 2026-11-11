---
translationKey: ''
title: 'From Public Administration to Software Development: My Umschulung and the IHK Exam'
urlSlug: from-public-administration-to-software-development-my-umschulung-and-the-ihk-exam
date: 2025-08-20
updated: ''
docLang: en
image: /assets/images/hero-1.jpg
imageAlt: Code editor on a laptop screen in the dark, with red and blue light trails behind it
description: Seven years in public administration in Turkey, then a move to Germany and a two-year retraining. How I prepared for both IHK exams, and what the examiners asked me.
tags:
  - post
  - Career
  - Germany
  - Education
draft: true
---

For seven years I worked as a specialist at the Turkish Ministry of Interior. Files, procedures, people. In 2016 I moved from Ankara to Düren with one suitcase and a new language to learn. The next years were language courses, first jobs and evenings of teaching myself to code. In 2022 I started a retraining as a **Fachinformatiker für Anwendungsentwicklung**, an application developer, and passed both IHK exams. Today I build web applications with Laravel, Livewire and Alpine.js at [aks-Service](https://aks-service.de/) in Nideggen.

This post is for anyone thinking about the same step: what an Umschulung is, how the IHK exam works, how I prepared, and what the examiners asked me.

## What an Umschulung is

In Germany, most IT jobs start with an apprenticeship (Ausbildung) that takes three years. An Umschulung is the same qualification for adults who change careers, with the same IHK exam at the end, in about two years. It is usually funded by the Arbeitsagentur or the Jobcenter.

Mine had two halves. In the school, [EVB Training](https://evbtraining.de/), I learned the theory. And over the two years I had to spend about six months as an intern in a company. Finding that internship was the hardest part of the first year: I collected a lot of rejections, and they hurt. In the end an IT company in Nideggen, aks-Service, took me.

In the internship I learned Tailwind CSS, PHP and Laravel, and I worked on three projects: a sick-leave reporting system for the company's intranet, a product database for a client, and a website for managing an organisation. At first the hardest part was not the code but the German, and finding my place in the team. Both came with time. After the internship I stayed, and Laravel and Tailwind are still the tools I use every day.

## How the IHK exam works

The exam is defined by the training regulation for IT specialists ([FIAusbV](https://www.gesetze-im-internet.de/fiausbv/)). It has two parts.

**Part 1** comes in the middle of the training: a 90-minute written exam on setting up an IT workplace. It counts for 20 percent of the final result.

**Part 2** comes at the end and has four areas. For application developers they are:

| Area | Format |
| --- | --- |
| Planning and carrying out a software project | Company project, documentation, presentation and technical interview |
| Planning a software product | Written, 90 minutes |
| Developing and implementing algorithms | Written, 90 minutes |
| Economics and social studies (WiSo) | Written, 60 minutes |

The company project is the big one: it counts for half of the final result, more than the three written exams of Part 2 together. You write a project proposal first, and the IHK has to approve it before you start. Then you have **at most 80 hours** for the project and its documentation together. At the end you present it in **at most 15 minutes** and answer the examiners' questions in a technical interview, the Fachgespräch. Presentation and interview together take at most 30 minutes.

## Part 1: how I prepared

I took Part 1 in March 2024. It is not a hard exam, but it is well graded. With good German, careful reading, logical thinking and basic IT you pass. For 60–70 points you need to have followed the lessons. For 80–90 you need some extra work and some memorising. Above 90 you need to really know the topics.

I prepared in three phases:

- **Lots of time left.** Stay curious, even about things the exam will never ask. I spent evenings on how a CPU builds logic gates from electric circuits. Useless for the exam, but it kept me interested. This is also the time to work on your German: look up every word you don't know, not only in your own language but in a German learner's dictionary. And it is the right time to apply for internships.
- **Two months before.** I read one good summary of all exam topics from start to finish. That alone took me a month. This is also when you can ask the IHK for permission to use a dictionary in the exam.
- **The last month.** Solve one or two old IHK exams you have never seen, in 90 minutes, like the real thing. Write down the strategies that work for you. Check every mistake and understand why you made it. And don't memorise the definitions from the answer keys. There are far too many. Learn to explain each term in your own words, simply but correctly.

In the exam itself, a few things helped me:

- **Make a time plan before you start.** I gave each question 20 minutes and kept 10 for checking, and it worked out exactly.
- **Watch the small words.** The IHK likes to write numbers as words. Write the digits next to them, because you will usually need them later. Underline the keywords, and look out for small words like _jede_, _eine_ and _jeweils_.
- **Skip what blocks you.** Note the skipped question and its points, and come back later, highest points first. Sometimes a later question gives you the idea.
- **Never leave an answer empty.**
- **Use the dictionary strategically.** Only for words that really decide the question. But when you know a word in your own language and the German one just won't come, look it up. Trying to remember costs more time.

## Part 2: how I prepared

I took Part 2 in December 2024 and passed with an average grade of 2 ("gut"; in Germany 1 is the best and 6 the worst).

- **Algorithms and pseudocode:** I spent a lot of time on old exam questions and went through them with our teacher. I learned the simplest sorting and search algorithms by their shape ("two nested for loops") and also by their logic.
- **SQL:** For me, algorithms and SQL bring the most points in Part 2. I rebuilt the databases from old exam questions, with the help of AI, and wrote the queries myself. When the result was wrong, I used the wrong result to find the mistake in my logic. That way I learned how SQL works, not just the answers.
- **Object-oriented programming:** My weak spot, and where I lost most of my points. I knew the theory, but I had not programmed enough with it. I only really understood it just before the presentation, which was lucky, because the examiners asked a lot about it.
- **WiSo:** Only old exam questions. My WiSo grade shows it.

## My final project

My project was an employee portal (Mitarbeiterportal), or more precisely, the sick-leave reporting system from my internship. Before, sick notes went around on paper. The company still needs a printed form, so the portal now produces it as a PDF: nobody fills in the form by hand anymore. You download the PDF and email it to whoever needs it.

I built it with Laravel and [FilamentPHP](https://filamentphp.com/). I picked Filament to get the admin interface up quickly, and partly as an experiment. That experiment paid off later: when I started working at the company, I was the one who knew Filament, and the client projects built with it still land on my desk.

For the PDFs I first tried dompdf, but it could not handle Tailwind CSS. So I switched to [spatie/browsershot](https://github.com/spatie/browsershot), which opens the page in a real headless Chrome and prints it to PDF. The PDF looks exactly like the page I designed with Tailwind.

For the documentation I used Stefan Macke's template for IT project documentation (a paid Word and LibreOffice version; there is also a free LaTeX version). It comes with the full chapter structure and examples, and I can recommend it. In the presentation I didn't do a live demo. I used screenshots of the portal.

I got 96 points for the presentation, which is a 1 ("sehr gut"), despite the gaps you'll see below. The portal has been in use ever since and keeps getting new features.

## What the examiners asked

The Fachgespräch was in German, so here are the questions as they were asked, and where my answers had gaps.

**Project management**

- _Was ist ein Projekt?_ I said: a one-time, complex undertaking, limited in time and resources, with a fixed start and end. Missing: a project also has a clear goal.
- _Wie kann man den Zeitablauf in einem Projekt darstellen?_ Gantt chart and network diagram (Netzplan).
- _Wofür ist ein Netzplan am besten geeignet?_ I said "to see parallel phases". The examiners said that's not quite it. A Netzplan shows the dependencies between tasks, so you can calculate the critical path, the buffer times and the earliest end date. Parallel work is easier to see in a Gantt chart.
- _Haben Sie schon vom kritischen Pfad gehört?_ Yes: the path without buffer time. If a task on it is late, the whole project is late.

**PHP and programming languages**

- _Was ist eine Skriptsprache?_ The key point, which I only said at the end: script languages are not compiled in advance but run by an interpreter.
- _Was ist der Unterschied zwischen einem Interpreter und einem Compiler?_ I said an interpreter makes finding errors easier. The examiners disagreed, and they were right: a compiler catches many errors before the program even runs.
- _Warum ist Java trotzdem plattformunabhängig?_ Java compiles to bytecode, and the Java Virtual Machine runs that bytecode on every platform.

**Object-oriented programming**

- _Was ist OOP?_ Classes as blueprints for objects, and the pillars: inheritance, polymorphism, encapsulation, and for some, abstraction.
- _Sie haben bei der Kapselung etwas vergessen._ I had forgotten the access modifiers: private, protected, public.
- _Warum brauchen wir einen Setter?_ Here my time ran out. The answer: a setter keeps a change under the class's control. It can check the new value first, so the object never ends up in an invalid state.

One pattern stood out: **when an answer had a gap, the next question went straight into that gap.** After the Netzplan they asked about the critical path. After encapsulation, about the access modifiers. A weak answer is not the end. Usually you get a second chance right away.

## What I would tell myself at the start

- **Don't take the internship rejections personally.** They are part of the process. One yes is enough, and it can turn into a job.
- **German is half the exam.** Work on it from day one, with a learner's dictionary, not only a translation app.
- **Practise old exams under real conditions.** 90 minutes, no breaks, then check every mistake.
- **Program what you learn.** OOP was my weak spot because I had only read about it. The topics you have actually built are the ones you can explain in the Fachgespräch.
- **Take the hint.** If the examiners help you with an answer, pick it up and add what you know ("Ach ja, genau …"). They want you to show what you can do.

## Looking back

My years in public administration were not wasted. They taught me to document what I do, to work carefully and to stay calm with deadlines, and all of that helps me every day as a developer. The Umschulung gave me the technical side, and the internship gave me the practice and, in the end, my job.

If you are thinking about a career change into IT: it is possible, also later in life and in a second language. It is a lot of work, and it is worth it.

_I wrote about both exams in more detail in Turkish:_ _[IHK 1. Sınav](https://kadir.gulec.tr/yazilar/ihk-1-sinav)_ _and_ [_IHK 2. Sınav_](https://kadir.gulec.tr/yazilar/ihk-2-sinav-nasil-calistim-sunumda-neler-soruldu)*. For Turkish-speaking trainees preparing for Part 1, I also built a free practice site:* [_ap1.guelec.eu_](https://ap1.guelec.eu)*.*
