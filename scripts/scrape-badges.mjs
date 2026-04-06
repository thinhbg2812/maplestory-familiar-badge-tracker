#!/usr/bin/env node
/**
 * Scrape badge/familiar data from MapleStory wiki using Playwright
 * to bypass Cloudflare protection.
 *
 * Usage: node scripts/scrape-badges.mjs
 * Output: scripts/scraped-badges.json
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "scraped-badges.json");

const URLS = [
  "https://maplestorywiki.net/w/Familiars/Badges",
  "https://maplestory.fandom.com/wiki/Familiars",
];

async function tryUrl(url, browser) {
  console.log(`\n→ Trying ${url} ...`);
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for Cloudflare challenge to resolve (up to 20s)
    console.log("  Waiting for Cloudflare challenge...");
    await page.waitForTimeout(5000);

    // Check if we got past Cloudflare
    const title = await page.title();
    console.log(`  Page title: "${title}"`);
    if (title.includes("moment") || title.includes("challenge")) {
      // Wait longer for Cloudflare
      console.log("  Still on challenge page, waiting more...");
      await page.waitForTimeout(10000);
      const title2 = await page.title();
      console.log(`  Page title after wait: "${title2}"`);
      if (title2.includes("moment") || title2.includes("challenge")) {
        console.log("  ✗ Could not bypass Cloudflare for this URL");
        await context.close();
        return null;
      }
    }

    console.log("  ✓ Got past Cloudflare! Extracting data...");

    // Extract badge data from the page
    const data = await page.evaluate(() => {
      const badges = [];

      // ---- Strategy 1: maplestorywiki.net structure ----
      // Look for h3 headers that contain badge names, followed by tables
      const headings = document.querySelectorAll(
        "h2 .mw-headline, h3 .mw-headline"
      );

      // Find all tables on the page
      const tables = document.querySelectorAll("table.wikitable, table.article-table, table");

      // Try to find badge sections by looking at the page structure
      // Each badge is typically in a section with a heading + table of familiars

      // First, let's get ALL card images and their context
      const allImages = document.querySelectorAll("img.mw-file-element");
      const imageData = [];
      for (const img of allImages) {
        const src = img.src || img.dataset?.src || "";
        const alt = img.alt || "";
        // Look at the closest table row for context
        const row = img.closest("tr");
        let rowText = "";
        if (row) {
          const cells = row.querySelectorAll("td, th");
          rowText = Array.from(cells)
            .map((c) => c.textContent.trim())
            .join(" | ");
        }
        // Look at nearest heading
        let heading = "";
        let el = img.closest("table") || img.parentElement;
        while (el && el.previousElementSibling) {
          el = el.previousElementSibling;
          if (
            el.tagName === "H2" ||
            el.tagName === "H3" ||
            el.tagName === "H4"
          ) {
            heading = el.textContent.trim().replace("[edit]", "").trim();
            break;
          }
        }

        imageData.push({
          src: src.split("/revision/")[0] || src,
          alt,
          rowText,
          heading,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });
      }

      // Extract the full DOM structure for analysis
      const headingList = [];
      for (const h of headings) {
        headingList.push({
          text: h.textContent.trim(),
          tag: h.parentElement.tagName,
          id: h.id,
        });
      }

      return {
        pageTitle: document.title,
        url: window.location.href,
        headingCount: headingList.length,
        headings: headingList.slice(0, 80),
        imageCount: imageData.length,
        images: imageData.slice(0, 500),
        tableCount: tables.length,
        // Get raw HTML of first few sections for analysis
        bodyText: document.body.innerText.substring(0, 5000),
      };
    });

    await context.close();
    return data;
  } catch (err) {
    console.log(`  ✗ Error: ${err.message}`);
    await context.close();
    return null;
  }
}

async function main() {
  console.log("Launching browser (headed mode for Cloudflare bypass)...");
  const browser = await chromium.launch({
    headless: false, // Headed to pass Cloudflare
    slowMo: 100,
  });

  let result = null;
  for (const url of URLS) {
    result = await tryUrl(url, browser);
    if (result && result.imageCount > 0) {
      console.log(
        `\n✓ Successfully scraped ${result.imageCount} images from ${url}`
      );
      break;
    }
  }

  await browser.close();

  if (result) {
    writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
    console.log(`\nData written to ${OUTPUT}`);
    console.log(`  Headings: ${result.headingCount}`);
    console.log(`  Images: ${result.imageCount}`);
    console.log(`  Tables: ${result.tableCount}`);
  } else {
    console.log("\n✗ Failed to scrape from any URL");
  }
}

main().catch(console.error);
