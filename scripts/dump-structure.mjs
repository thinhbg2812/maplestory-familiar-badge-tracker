#!/usr/bin/env node
/**
 * Scrape badge/familiar data from maplestory.fandom.com using Playwright.
 * Step 1: dump raw HTML of badge tables for structure analysis.
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating...");
  await page.goto("https://maplestory.fandom.com/wiki/Familiars", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Cloudflare wait
  console.log("Waiting for Cloudflare...");
  try {
    await page.waitForSelector("img.mw-file-element", { timeout: 30000 });
    console.log("✓ Past Cloudflare!");
  } catch {
    await page.waitForTimeout(15000);
    const t = await page.title();
    if (t.includes("moment")) {
      console.log("✗ Cloudflare blocked. Try again.");
      await browser.close();
      return;
    }
  }

  // Scroll to load lazy images
  console.log("Scrolling...");
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(3000);

  // Dump raw HTML of the badge section
  const dump = await page.evaluate(() => {
    const out = {};

    // Find all tables
    const tables = [...document.querySelectorAll("table")];
    out.tableCount = tables.length;
    out.tables = [];

    for (let ti = 0; ti < tables.length; ti++) {
      const table = tables[ti];
      const rows = [...table.querySelectorAll("tr")];
      const imgCount = table.querySelectorAll("img.mw-file-element").length;

      if (imgCount < 3) continue; // Skip non-badge tables

      const tableData = {
        index: ti,
        classes: table.className,
        rowCount: rows.length,
        imgCount,
        rows: [],
      };

      // Dump first 5 rows with full cell details
      for (let ri = 0; ri < Math.min(rows.length, 5); ri++) {
        const row = rows[ri];
        const cells = [...row.querySelectorAll("td, th")];
        const cellData = cells.map((cell, ci) => {
          const imgs = [...cell.querySelectorAll("img.mw-file-element")];
          return {
            cellIndex: ci,
            tag: cell.tagName,
            colspan: cell.getAttribute("colspan") || "1",
            text: cell.textContent.trim().substring(0, 200),
            innerHTML: cell.innerHTML.substring(0, 500),
            imgCount: imgs.length,
            imgs: imgs.map(img => ({
              alt: img.alt,
              src: (img.getAttribute("data-src") || img.getAttribute("src") || "").substring(0, 200),
              width: img.getAttribute("width"),
              height: img.getAttribute("height"),
            })),
          };
        });
        tableData.rows.push({ rowIndex: ri, cellCount: cells.length, cells: cellData });
      }

      out.tables.push(tableData);
    }

    return out;
  });

  writeFileSync(join(__dirname, "html-dump.json"), JSON.stringify(dump, null, 2));
  console.log(`\nDumped ${dump.tables.length} badge tables to html-dump.json`);
  for (const t of dump.tables) {
    console.log(`  Table ${t.index}: ${t.rowCount} rows, ${t.imgCount} images`);
    for (const r of t.rows) {
      console.log(`    Row ${r.rowIndex} (${r.cellCount} cells):`);
      for (const c of r.cells) {
        console.log(`      Cell ${c.cellIndex} [${c.tag}]: "${c.text.substring(0, 80)}" (${c.imgCount} imgs)`);
      }
    }
  }

  await browser.close();
}

main().catch(console.error);
