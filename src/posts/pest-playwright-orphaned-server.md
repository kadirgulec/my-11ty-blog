---
title: Why Playwright Keeps Running After Pest Browser Tests
date: 2026-10-05
docLang: en
image: /assets/images/posts/pest-playwright-orphaned-server.png
imageAlt: "Terminal: Pest's tests pass, the sh wrapper is stopped, but the node playwright run-server process keeps running"
description: "After Pest browser tests on Ubuntu, playwright run-server keeps running and piped output hangs. The cause is dash, the fix is one word: exec."
tags:
  - post
  - Pest
  - Playwright
  - Laravel
  - Linux
  - Testing
draft: false
---

On the account pages of my notebook site [kadir.gulec.tr](https://kadir.gulec.tr), dark mode switched back to light mode every time I moved to another page. I fixed it, and to keep the bug from coming back I wrote my first browser test: Pest's browser plugin starts a real Chromium through Playwright, clicks through the page and checks the result.

The tests went green. But my terminal never came back.

## The symptom: the tests finish, the command does not

When I piped the output of `php artisan test` into another command like `tail`, the test summary appeared and then the command waited forever. Redirecting the output to a file made the command finish, but something stayed behind:

```bash
pgrep -a -x node | grep "playwright run-server"
```

Every run left one `playwright run-server` process behind. Even better: the list contained four more processes that were two days old. They came from another project of mine and had been running silently since the day I ran its browser tests. According to the measurements in the bug report, each of them holds about 180 MB of memory. One commenter found 65 of them, about 8 GB, on a single machine after a day of test runs.

## The diagnosis: who stops whom?

When the tests finish, Pest tries to stop the Playwright server. Putting the process it stops next to the process that survives made the picture clear:

```text
php (pest)
 └─ sh -c playwright run-server   ← Pest stops this (pid 172083)
     └─ node playwright run-server  ← the real server (pid 172084)
```

Pest does not start the server directly but through a shell (`sh`), and when the tests are done it only signals that shell. The shell exits, and the real Playwright process is orphaned and keeps running.

## The cause: one missing word

Pest starts Playwright with Symfony Process' `fromShellCommandline()`, so with a plain command string. PHP runs such a string as `sh -c "…"`. Symfony only puts `exec` in front of the command when the command is given as an array, and the [Symfony Process documentation](https://symfony.com/doc/current/components/process) recommends arrays precisely because they let signals reach the process.

`exec` tells the shell: "step aside and run this command in your place". The shell process turns into Playwright, and the stop signal goes straight to the right place.

Here is the catch: on Ubuntu, `/bin/sh` is actually `dash`. Without `exec`, the `dash` on my machine started Playwright as its own child instead of replacing itself with it. According to the analysis in the bug report, `/bin/sh` on macOS does replace itself in this case, so the bug never shows up there. A classic "works on my machine". For the same reason it also appears on Laravel Sail, Debian-based Docker images and WSL2.

The hanging terminal has the same root cause: the orphaned process still holds the write end of the output pipe, so `tail` never sees the pipe close and waits forever.

## The fix: a patch

Pest has no setting to change the command, so I patched the package. The change is a single word:

```diff
-'.'.DIRECTORY_SEPARATOR.'node_modules'.DIRECTORY_SEPARATOR.'.bin'.DIRECTORY_SEPARATOR.'playwright run-server ...',
+'exec .'.DIRECTORY_SEPARATOR.'node_modules'.DIRECTORY_SEPARATOR.'.bin'.DIRECTORY_SEPARATOR.'playwright run-server ...',
```

Instead of editing `vendor/` by hand, I apply it with [cweagans/composer-patches](https://github.com/cweagans/composer-patches), so it is applied on every `composer install`, CI included:

```json
"extra": {
    "patches": {
        "pestphp/pest-plugin-browser": {
            "Stop the Playwright server itself, not only the sh wrapper around it": "patches/pest-plugin-browser-stop-playwright.patch"
        }
    }
}
```

There is one more benefit: if Pest changes this line one day, the patch no longer applies and the install fails loudly. The fix cannot disappear silently, and I will know it is time to remove the patch.

After the patch I tried three ways of running the tests: plain `pest`, `php artisan test` and a piped `php artisan test | tail`. In all three, Playwright stopped when the tests finished and the terminal came back right away.

## Is it just me?

No. Before writing this post I checked Pest's GitHub: the exact same problem was reported on 16 July 2026 and is still open: [pestphp/pest #1754](https://github.com/pestphp/pest/issues/1754). The diagnosis matches ours: `dash`, the missing `exec` and the hanging pipe. It is filed in the main Pest repository because the plugin's own repository has issues disabled.

There is a pull request that fixes it, but it has not been merged yet: [pest-plugin-browser #254](https://github.com/pestphp/pest-plugin-browser/pull/254). It does what we did and puts `exec` in front of the command. The older [#169](https://github.com/pestphp/pest-plugin-browser/pull/169) and [#211](https://github.com/pestphp/pest-plugin-browser/pull/211) are still waiting too.

It also has a close relative: when CI cancels a run with `SIGTERM`, the server stays alive as well ([pestphp/pest #1825](https://github.com/pestphp/pest/issues/1825)). Our patch does not fix that one, because in that case Pest's shutdown code never runs at all.

## What I learned from this bug

- **Green tests do not mean everything is fine.** No test caught these processes. Nobody noticed them for two days.
- **`sh` is not the same everywhere.** A bug that is invisible on macOS can show up on every single run on Ubuntu.
- **If you start a background process, make sure you know what you stop.** Stopping the shell is not the same as stopping what runs inside it.
- **Be careful with `pkill -f`.** The pattern also appears in your own command line, so `pkill -f "playwright run-server"` can kill your own shell. Filtering by process name is safer: `pgrep -x node`.

I will remove the patch once the PR is merged. Until then, I hope this post saves someone with the same problem a few hours of searching :)
