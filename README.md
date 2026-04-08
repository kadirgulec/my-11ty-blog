# 🌐 Personal Portfolio & Blog

This repository contains the source code for my personal developer portfolio and blog, live at: **[https://kadirguelec.de](https://kadirguelec.de)**

## 🏗 Why 11ty (Eleventy) and not Laravel?
While my primary expertise is backend development with the **TALL Stack (Laravel / Livewire)**, I strongly believe in choosing the right tool for the job. 

A personal portfolio is essentially a collection of static content. Bootstrapping a full PHP backend and a MySQL database for this would be architectural overkill. Instead, I chose **11ty (Eleventy)**, a lightweight Static Site Generator (SSG). 

This approach offers:
* **Blazing Fast Performance:** Pre-rendered static HTML/CSS files served directly from a CDN.
* **Security:** No database or backend means no attack vectors.
* **Simplicity:** Content is written purely in Markdown.

## 🛠 Tech Stack
* **Static Site Generator:** 11ty (Eleventy)
* **Styling:** CSS / Tailwind
* **Hosting / Infrastructure:** Hetzner
* **CI/CD Pipeline:** Fully automated deployments via **GitHub Actions** (Code pushed to the `main` branch is automatically built and deployed to the Hetzner server).

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/kadirgulec/my-11ty-blog.git

# Install dependencies
npm install

# Run locally
npm start
```
