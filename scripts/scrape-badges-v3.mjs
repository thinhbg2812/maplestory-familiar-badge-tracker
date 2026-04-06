#!/usr/bin/env node
/**
 * Scrape badge/familiar data from maplestorywiki.net using Playwright.
 * 1) Bypass Cloudflare in headed mode
 * 2) Extract badge names, effects, familiar names & card image URLs
 * 3) Download card images to src/assets/icons/<badge>/
 * 4) Output structured JSON for badges.js generation
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const ASSETS_DIR = join(PROJECT_ROOT, "src/assets/icons");
const OUTPUT = join(__dirname, "scraped-badges-final.json");

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = require("fs").createWriteStream(destPath);
    proto
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect
          downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      })
      .on("error", reject);
  });
}

async function main() {
  console.log("Launching browser (headed for Cloudflare bypass)...");
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    console.log("Navigating to maplestorywiki.net...");
    await page.goto("https://maplestorywiki.net/w/Familiars/Badges", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Wait for Cloudflare challenge
    console.log("Waiting for Cloudflare challenge (up to 30s)...");
    try {
      await page.waitForSelector("img.mw-file-element", { timeout: 30000 });
      console.log("✓ Page loaded with images!");
    } catch {
      // Fallback: wait and check title
      const title = await page.title();
      console.log(`Page title: "${title}"`);
      if (title.includes("moment")) {
        console.log("Still on Cloudflare, waiting 15 more seconds...");
        await page.waitForTimeout(15000);
        try {
          await page.waitForSelector("img.mw-file-element", { timeout: 15000 });
          console.log("✓ Page loaded after extended wait!");
        } catch {
          console.log("✗ Could not get past Cloudflare. Try running again.");
          await browser.close();
          return;
        }
      }
    }

    // Scroll to trigger lazy loading
    console.log("Scrolling page to load lazy images...");
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await delay(150);
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2000);

    // First: dump raw HTML of the first table to understand structure
    console.log("\n=== Analyzing page structure ===");
    const debugInfo = await page.evaluate(() => {
      // Get all tables
      const tables = [...document.querySelectorAll("table")];
      const info = tables.map((t, i) => {
        const rows = t.querySelectorAll("tr");
        const firstRowHTML = rows[0] ? rows[0].innerHTML.substring(0, 300) : "";
        const secondRowHTML = rows[1] ? rows[1].innerHTML.substring(0, 500) : "";
        const imgCount = t.querySelectorAll("img.mw-file-element").length;
        return {
          index: i,
          rowCount: rows.length,
          imgCount,
          classes: t.className,
          firstRowPreview: firstRowHTML,
          secondRowPreview: secondRowHTML,
        };
      });
      return info;
    });

    console.log(`Found ${debugInfo.length} tables`);
    for (const t of debugInfo) {
      console.log(`  Table ${t.index}: ${t.rowCount} rows, ${t.imgCount} images, class="${t.classes}"`);
      if (t.imgCount > 0) {
        console.log(`    Header: ${t.firstRowPreview.substring(0, 200)}`);
        console.log(`    Row 1:  ${t.secondRowPreview.substring(0, 200)}`);
      }
    }

    // Now extract ALL badge data
    console.log("\n=== Extracting badge data ===");
    const badges = await page.evaluate(() => {
      const results = [];
      const tables = [...document.querySelectorAll("table")];

      // Find badge tables (those with card images)
      const badgeTables = tables.filter(
        (t) => t.querySelectorAll("img.mw-file-element").length > 3
      );

      // Figure out which category each table belongs to
      // Look at headings before the table
      function getCategoryForTable(table) {
        let el = table.previousElementSibling;
        while (el) {
          const text = el.textContent.toLowerCase();
          if (text.includes("require") && text.includes("booster")) {
            return "booster-required";
          }
          if (el.tagName === "H2" || el.tagName === "H3") {
            if (text.includes("not require") || text.includes("does not")) {
              return "no-booster";
            }
            if (text.includes("require") && text.includes("booster")) {
              return "booster-required";
            }
          }
          el = el.previousElementSibling;
        }
        return "no-booster";
      }

      for (const table of badgeTables) {
        const category = getCategoryForTable(table);
        const rows = [...table.querySelectorAll("tr")];

        for (let i = 0; i < rows.length; i++) {
          const cells = [...rows[i].querySelectorAll("td, th")];
          if (cells.length < 2) continue;

          // Find the cell with card images (familiars)
          let familiarCell = null;
          let badgeName = "";
          let effects = "";
          const familiars = [];

          for (const cell of cells) {
            const imgs = cell.querySelectorAll("img.mw-file-element");
            const text = cell.textContent.trim();

            // A cell with multiple Familiar images is the familiar cell
            if (imgs.length >= 2) {
              familiarCell = cell;

              for (const img of imgs) {
                const alt = img.alt || "";
                // Get the real image URL
                let src = img.getAttribute("src") || "";
                // Also check data-src for lazy loading
                if (img.dataset && img.dataset.src) {
                  src = img.dataset.src;
                }
                // Skip tiny icons or badge icons
                // Card images are typically wider
                const w = parseInt(img.getAttribute("width")) || img.naturalWidth || 0;
                const h = parseInt(img.getAttribute("height")) || img.naturalHeight || 0;

                // Extract familiar name from alt text
                // Patterns: "Use XXXX Familiar.png" or "XXXX Familiar" or just text near image
                let name = alt
                  .replace(/^Use\s+/i, "")
                  .replace(/\s*Familiar\.png$/i, "")
                  .replace(/\s*Familiar$/i, "")
                  .replace(/\.png$/i, "")
                  .trim();

                if (name && src) {
                  familiars.push({
                    name,
                    src: src.split("/revision/")[0] || src,
                    alt,
                    width: w,
                    height: h,
                  });
                }
              }
            } else if (text.includes("Badge") && !badgeName) {
              badgeName = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
            }
          }

          // If we didnt find badge name yet, check first cell
          if (!badgeName && cells.length > 0) {
            const firstText = cells[0].textContent.trim();
            if (firstText.length > 0 && firstText.length < 100) {
              badgeName = firstText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
            }
          }

          // Effects: look for cell with stat-like text
          for (const cell of cells) {
            const text = cell.textContent.trim();
            if (
              cell !== familiarCell &&
              !text.includes("Badge") &&
              (text.includes("+") || text.includes("%") || text.includes("HP") || text.includes("ATT"))
            ) {
              effects = text.replace(/\n/g, ", ").replace(/\s+/g, " ").trim();
              break;
            }
          }

          if (familiars.length > 0) {
            results.push({
              name: badgeName || `Unknown Badge ${i}`,
              category,
              effects,
              familiars,
            });
          }
        }
      }

      return results;
    });

    console.log(`\nExtracted ${badges.length} badges:`);
    for (const b of badges) {
      console.log(`  ${b.name}: ${b.familiars.length} familiars [${b.category}] — ${b.effects.substring(0, 60)}`);
    }

    // Download all card images
    console.log("\n=== Downloading card images ===");
    let downloadCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const badge of badges) {
      // Create directory for this badge
      const badgeSlug = badge.name
        .toLowerCase()
        .replace(/\s+badge$/i, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const badgeDir = join(ASSETS_DIR, badgeSlug);
      if (!existsSync(badgeDir)) {
        mkdirSync(badgeDir, { recursive: true });
      }

      for (const fam of badge.familiars) {
        if (!fam.src || fam.src.includes("data:image")) {
          skipCount++;
          continue;
        }

        const filename = fam.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") + "_Familiar.png";
        const destPath = join(badgeDir, filename);

        if (existsSync(destPath)) {
          skipCount++;
          fam.localPath = `../assets/icons/${badgeSlug}/${filename}`;
          continue;
        }

        try {
          await downloadFile(fam.src, destPath);
          fam.localPath = `../assets/icons/${badgeSlug}/${filename}`;
          downloadCount++;
          process.stdout.write(".");
        } catch (err) {
          console.log(`\n  ✗ Failed: ${fam.name} — ${err.message}`);
          failCount++;
        }
      }
    }

    console.log(`\n\nDownloads: ${downloadCount} new, ${skipCount} skipped, ${failCount} failed`);

    // Save final JSON
    writeFileSync(OUTPUT, JSON.stringify(badges, null, 2));
    console.log(`\nBadge data saved to ${OUTPUT}`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
