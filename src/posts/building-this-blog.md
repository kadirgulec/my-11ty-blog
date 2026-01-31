---
title: How I Built This Static Blog
image: /assets/images/hero-1.jpg
date: 2025-12-28
description: A deep dive into Eleventy, Nunjucks, and GitHub Actions.
tags:
  - 11ty
  - JavaScript
  - Projects
---

## Why Static?

I wanted a blog that was fast, secure, and cheap to host. WordPress was too heavy, and Medium doesn't give me control.

### The Stack
*   **Generator:** Eleventy (11ty)
*   **Styling:** Tailwind CSS v4
*   **Logic:** Alpine.js
*   **Hosting:** Hetzner Webhosting S

The best part is the deployment. I just push to GitHub, and a workflow builds the site and uploads it via FTP automatically. No servers to patch, no databases to manage.