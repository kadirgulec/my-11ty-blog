---
title: How I Built This Static Blog
image: /assets/images/posts/eleventy.jpeg
date: 2025-02-07
description: A deep dive into Eleventy, Nunjucks, and GitHub Actions.
tags:
  - 11ty
  - AlpineJS
  - TailwindCSS
  - Hetzner
  - GitHub
  - Projects
---
# How I Built This Static Blog: A Deep Dive into Eleventy and GitHub Actions

There is a certain irony in being a developer; we spend our days building complex, data-driven applications, yet when it comes to our own little corners of the internet, we crave simplicity.

When I decided to launch this blog, I had a few non-negotiables: it had to be **lightning-fast**, **unbeatably secure**, and **low-maintenance**. After years of wrestling with database updates and heavy plugins, I decided to go back to the basics—but with a modern twist.

---

## Why Static?

The "Old Guard" of blogging (I'm looking at you, WordPress) is great for many things, but it often feels like using a sledgehammer to crack a nut. I didn't want a database to manage, and I certainly didn't want to spend my weekends patching security vulnerabilities.

On the other hand, platforms like Medium offer ease of use but at the cost of your digital sovereignty. I wanted total control over my pixels and my data. By going **static**, I’m essentially serving pre-rendered HTML files to my readers. There’s no server-side processing, which means:
* **Speed:** It's practically instant.
* **Security:** There's no database to hack.
* **Cost:** Hosting is incredibly cheap (or even free).

---

## The Stack

I chose a "Goldilocks" stack—tools that provide enough power to be flexible without the bloat of a full-blown JavaScript framework like Next.js.

### 1. The Engine: Eleventy (11ty)
Eleventy is a rising star in the Static Site Generator (SSG) world. Unlike its competitors, it doesn’t force you to use a specific framework. It’s "zero-config" by default but incredibly extensible. I used **Nunjucks** as my templating engine because it allows for clean logic while keeping the HTML readable.

### 2. Styling: Tailwind CSS v4
I’ve upgraded to the latest **Tailwind CSS v4**. It’s faster and even more streamlined than its predecessors. It allows me to build custom designs directly in my markup without ever leaving my HTML files, which keeps the development loop incredibly tight.

### 3. Interactivity: Alpine.js
For the small bits of "sprinkle" interactivity (like mobile menus or search toggles), I went with **Alpine.js**. It’s often called "Tailwind for JavaScript." It gives you the declarative power of Vue or React but with a much smaller footprint.

### 4. The Home: Hetzner Webhosting S
I’m hosting the final build on **Hetzner**. It’s reliable, European-based, and perfect for a lightweight static site.

---

## The Magic: Automated Deployment

The real beauty of this setup is the workflow. I don’t use an FTP client to manually drag and drop files like it’s 2005. Instead, I’ve automated the entire process using **GitHub Actions**.



**The process is simple:**
1.  I write a new post in **Markdown**.
2.  I `git push` my changes to GitHub.
3.  A GitHub Action triggers, which:
    * Installs dependencies.
    * Builds the site using Eleventy.
    * Minifies the CSS.
    * **Automatically uploads** the finished files to my Hetzner server via FTP.

The result? I get to focus entirely on writing. No servers to patch, no databases to optimize—just pure, simple content.

---

> **What's next?** > I'm planning to open-source the starter template for this blog soon. If you're looking to escape the "heavy" web, stay tuned!