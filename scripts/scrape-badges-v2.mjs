#!/usr/bin/env node
/**
 * Scrape badge/familiar data from MapleStory Fandom wiki using Playwright.
 * Extracts badge names, effects, categories, and familiar card images.
 *
 * Usage: node scripts/scrape-badges-v2.mjs
 * Output: scripts/scraped-badges-v2.json
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "scraped-badges-v2.json");

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    console.log("Navigating to Fandom wiki...");
    await page.goto("https://maplestory.fandom.com/wiki/Familiars", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for Cloudflare
    console.log("Waiting for Cloudflare...");
    await page.waitForTimeout(5000);

    let title = await page.title();
    console.log(`Page title: "${title}"`);
    if (title.includes("moment")) {
      console.log("Waiting more for Cloudflare...");
      await page.waitForTimeout(10000);
      title = await page.title();
      console.log(`Page title: "${title}"`);
    }

    if (title.includes("moment")) {
      console.log("✗ Cloudflare not bypassed");
      await browser.close();
      return;
    }

    console.log("✓ Past Cloudflare! Scrolling to load lazy images...");

    // Scroll down the entire page to trigger lazy loading
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      const height = document.body.scrollHeight;
      for (let y = 0; y < height; y += 500) {
        window.scrollTo(0, y);
        await delay(100);
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(3000);
    console.log("Extracting badge data from tables...");

    // Extract structured badge data from the wiki tables
    const badges = await page.evaluate(() => {
      const results = [];

      // Find the "Familiar Badges" section
      // The tables contain: Badge Icon | Badge Name | Familiars | Effects
      const tables = document.querySelectorAll("table.wikitable, table.article-table, table.sortable");

      // If no wikitable found, try all tables
      const allTables = tables.length > 0 ? tables : document.querySelectorAll("table");

      for (const table of allTables) {
        const rows = table.querySelectorAll("tr");
        if (rows.length < 2) continue;

        // Check header to see if this is a badge table
        const headerRow = rows[0];
        const headerText = headerRow.textContent.toLowerCase();
        if (
          !headerText.includes("badge") &&
          !headerText.includes("familiar")
        )
          continue;

        console.log(`Found badge table with ${rows.length} rows, header: ${headerText.trim().substring(0, 80)}`);

        // Determine if this is a booster-required table
        // Look at previous sibling text
        let category = "no-booster";
        let prevEl = table.previousElementSibling;
        while (prevEl) {
          const txt = prevEl.textContent.toLowerCase();
          if (txt.includes("booster pack")) {
            category = "booster-required";
            break;
          }
          if (txt.includes("does not require") || txt.includes("without")) {
            category = "no-booster";
            break;
          }
          prevEl = prevEl.previousElementSibling;
        }

        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll("td");
          if (cells.length < 3) continue;

          // Parse badge name from the cell
          let badgeName = "";
          let effects = "";
          const familiars = [];

          // The structure is typically:
          // Cell 0: Badge icon image
          // Cell 1: Badge name text
          // Cell 2: Familiar icons and names
          // Cell 3: Effects text

          // Try to get badge name
          for (let c = 0; c < cells.length; c++) {
            const cellText = cells[c].textContent.trim();
            if (cellText.includes("Badge") && !badgeName) {
              badgeName = cellText.trim();
            }
          }

          // If no badge name found in text, try the first/second cell
          if (!badgeName) {
            badgeName = cells[0].textContent.trim() || cells[1]?.textContent.trim() || "";
          }

          // Get familiars from the cell that contains familiar images
          for (let c = 0; c < cells.length; c++) {
            const imgs = cells[c].querySelectorAll("img.mw-file-element");
            if (imgs.length === 0) continue;

            // Check if these are familiar card images (not badge icons)
            // Familiar images alt text contains "Familiar"
            for (const img of imgs) {
              const alt = img.alt || "";
              if (!alt.includes("Familiar")) continue;

              // Get the actual image src (handle lazy loading)
              let src = img.src || "";
              if (img.dataset?.src) src = img.dataset.src;
              // Clean revision params
              src = src.split("/revision/")[0] || src;
              // Skip placeholder gifs
              if (src.includes("data:image/gif")) {
                src = img.dataset?.src || "";
                src = src.split("/revision/")[0] || src;
              }

              // Extract familiar name from alt text
              // Pattern: "Use XXXX Familiar" -> "XXXX"
              let name = alt
                .replace(/^Use\s+/, "")
                .replace(/\s+Familiar$/, "")
                .trim();

              if (name) {
                familiars.push({ name, src, alt });
              }
            }
          }

          // Get effects from the last cell typically
          if (cells.length >= 3) {
            const lastCell = cells[cells.length - 1];
            effects = lastCell.textContent.trim();
            // If the last cell contains familiar images, try the one before
            if (lastCell.querySelectorAll("img").length > 2 && cells.length >= 4) {
              effects = cells[cells.length - 1].textContent.trim();
            }
          }

          // Clean up badge name
          badgeName = badgeName.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

          if (badgeName && familiars.length > 0) {
            results.push({
              name: badgeName,
              category,
              effects: effects.replace(/\n/g, ", ").replace(/\s+/g, " ").trim(),
              familiars,
            });
          }
        }
      }

      return results;
    });

    console.log(`\nExtracted ${badges.length} badges`);
    badges.forEach((b) => {
      console.log(`  ${b.name}: ${b.familiars.length} familiars [${b.category}]`);
    });

    writeFileSync(OUTPUT, JSON.stringify(badges, null, 2));
    console.log(`\nData written to ${OUTPUT}`);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
