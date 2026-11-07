// Tells IndexNow engines (Bing, Yandex, Seznam, Naver, …) which pages a deploy
// changed. Google does not take part; it relies on the sitemap and crawling.
//
//   node scripts/indexnow.mjs manifest <siteDir>          prints url -> hash JSON
//   node scripts/indexnow.mjs submit <prev.json> <next.json>
//
// The deploy publishes each manifest next to the site, so the next deploy can
// fetch the live one and submit only new, changed or deleted pages, which is
// what the IndexNow FAQ asks for. Set INDEXNOW_DRY_RUN=1 to print the request
// instead of sending it. No dependencies; needs Node 18+ for fetch.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const site = JSON.parse(readFileSync(new URL("../src/_data/site.json", import.meta.url), "utf8"));
const SKIPPED_DIRS = new Set(["/admin", "/assets", "/pagefind"]);

// One entry per indexable page: `<dir>/index.html`, minus noindex pages
// (tags, Datenschutz). The cache-buster hashes are stripped, so a CSS change
// alone does not count as a change to every page.
function manifest(dir, base = "") {
    const pages = {};
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        const rel = `${base}/${name}`;
        if (statSync(path).isDirectory()) {
            if (!SKIPPED_DIRS.has(rel)) Object.assign(pages, manifest(path, rel));
            continue;
        }
        if (name !== "index.html") continue;
        const html = readFileSync(path, "utf8");
        if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;
        const normalized = html.replace(/\?v=[0-9a-f]+/g, "");
        pages[`${site.url}${base}/`] = createHash("sha256").update(normalized).digest("hex");
    }
    return pages;
}

async function submit(prevFile, nextFile) {
    const prev = JSON.parse(readFileSync(prevFile, "utf8"));
    const next = JSON.parse(readFileSync(nextFile, "utf8"));
    const urlList = [
        ...Object.keys(next).filter(url => prev[url] !== next[url]), // new or changed
        ...Object.keys(prev).filter(url => !(url in next)),          // deleted
    ];
    if (!urlList.length) {
        console.log("IndexNow: no page changed, nothing to submit.");
        return;
    }

    const body = {
        host: new URL(site.url).host,
        key: site.indexNowKey,
        keyLocation: `${site.url}/${site.indexNowKey}.txt`,
        urlList,
    };
    if (process.env.INDEXNOW_DRY_RUN) {
        console.log("IndexNow (dry run):", JSON.stringify(body, null, 2));
        return;
    }

    const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
    });
    // 200 = accepted, 202 = accepted while the key is still being verified.
    console.log(`IndexNow: HTTP ${response.status} for ${urlList.length} URL(s)`);
    urlList.forEach(url => console.log(`  ${url}`));
    if (!response.ok) process.exitCode = 1;
}

const [command, a, b] = process.argv.slice(2);
if (command === "manifest" && a) {
    console.log(JSON.stringify(manifest(a), null, 1));
} else if (command === "submit" && a && b) {
    await submit(a, b);
} else {
    console.error("Usage: indexnow.mjs manifest <siteDir> | submit <prev.json> <next.json>");
    process.exitCode = 2;
}
