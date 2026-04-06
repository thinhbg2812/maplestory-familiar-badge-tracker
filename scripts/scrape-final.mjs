#!/usr/bin/env node
/**
 * Improved scraper that extracts familiar names from cell TEXT (not just img alt),
 * because the wiki lists names like "Corrupted Veilstone Alpha Familiar" in text
 * but all variants share the same image.
 */
import { chromium } from "playwright";
import { writeFileSync, createWriteStream, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT = join(__dirname, "..");
const ASSETS = join(PROJECT, "src/assets/icons");
const OUTPUT_JSON = join(__dirname, "badges-data.json");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const ws = createWriteStream(dest);
        res.pipe(ws);
        ws.on("finish", () => ws.close(resolve));
        ws.on("error", reject);
      })
      .on("error", reject);
  });
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+badge$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
}

async function main() {
  console.log("🚀 Launching browser...\n");
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await (
    await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 900 },
    })
  ).newPage();

  try {
    await page.goto("https://maplestory.fandom.com/wiki/Familiars", { waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("⏳ Waiting for Cloudflare...");
    try {
      await page.waitForSelector("img.mw-file-element", { timeout: 30000 });
    } catch {
      await page.waitForTimeout(15000);
      if ((await page.title()).includes("moment")) {
        console.log("✗ Cloudflare blocked."); await browser.close(); return;
      }
    }
    console.log("✅ Past Cloudflare!\n");

    // Scroll
    console.log("📜 Scrolling...");
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(3000);

    // Extract
    console.log("🔍 Extracting...\n");
    const badges = await page.evaluate(() => {
      const results = [];
      const tables = [...document.querySelectorAll("table")];
      const badgeTable = tables.find(t => t.querySelectorAll("img.mw-file-element").length > 50);
      if (!badgeTable) return results;

      const rows = [...badgeTable.querySelectorAll("tr")];

      for (let i = 1; i < rows.length; i++) {
        const cells = [...rows[i].querySelectorAll("td")];
        if (cells.length < 3) continue;

        // Cell 0: Badge name + icon
        const badgeName = cells[0].textContent.trim();
        const badgeIcon = cells[0].querySelector("img.mw-file-element");
        let badgeIconSrc = "";
        if (badgeIcon) {
          badgeIconSrc = (badgeIcon.getAttribute("data-src") || badgeIcon.getAttribute("src") || "").split("/revision/")[0];
        }

        // Cell 1: Familiars - extract names from TEXT, images separately
        const familiarCell = cells[1];

        // Parse familiar names from the cell text
        // The text is like "Snail Familiar\n Blue Snail Familiar\n ..."
        const cellText = familiarCell.textContent.trim();
        const nameLines = cellText
          .split("\n")
          .map(l => l.trim())
          .filter(l => l.includes("Familiar"))
          .map(l => l.replace(/\s*Familiar$/, "").trim())
          .filter(Boolean);

        // Get images  
        const imgs = [...familiarCell.querySelectorAll("img.mw-file-element")];
        const imgData = imgs.map(img => {
          const alt = img.alt || "";
          let src = img.getAttribute("data-src") || img.getAttribute("src") || "";
          src = src.split("/revision/")[0];
          const name = alt.replace(/^Use\s+/i, "").replace(/\s*Familiar$/i, "").replace(/\.png$/i, "").trim();
          return { name, src, alt };
        });

        // Build familiars: use text names for proper naming, images for icons
        // If text names count matches image count, pair them up
        // Otherwise, use image alt text
        const familiars = [];
        if (nameLines.length === imgs.length) {
          for (let j = 0; j < nameLines.length; j++) {
            let src = imgData[j]?.src || "";
            familiars.push({
              name: nameLines[j],
              src,
              alt: imgData[j]?.alt || "",
            });
          }
        } else {
          // Fallback: deduplicate by building from text names, assigning unique images where possible
          const usedSrcs = new Set();
          for (let j = 0; j < nameLines.length; j++) {
            // Try to find a matching image
            let matchedImg = imgData.find(
              img => img.name === nameLines[j] && !usedSrcs.has(img.src + "_" + j)
            );
            if (!matchedImg && j < imgData.length) {
              matchedImg = imgData[j];
            }
            familiars.push({
              name: nameLines[j],
              src: matchedImg?.src || "",
              alt: matchedImg?.alt || "",
            });
            if (matchedImg) usedSrcs.add(matchedImg.src + "_" + j);
          }
        }

        // Cell 2: Effects
        const effects = cells[2].textContent.trim();

        if (badgeName && familiars.length > 0) {
          results.push({ name: badgeName, badgeIconSrc, effects, familiars });
        }
      }

      return results;
    });

    console.log(`📋 Found ${badges.length} badges:\n`);
    for (const b of badges) {
      console.log(`  ${b.name}: ${b.familiars.length} familiars — ${b.effects.substring(0, 60)}`);
    }

    // Download images
    console.log("\n📥 Downloading familiar card images...\n");
    let dlOk = 0, dlSkip = 0, dlFail = 0;

    for (const badge of badges) {
      const slug = slugify(badge.name);
      const dir = join(ASSETS, slug);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      for (const fam of badge.familiars) {
        if (!fam.src || fam.src.startsWith("data:")) { dlSkip++; continue; }

        const filename = sanitizeFilename(fam.name) + "_Familiar.png";
        const dest = join(dir, filename);
        fam.localPath = join("../assets/icons", slug, filename);

        if (existsSync(dest)) { dlSkip++; continue; }
        try {
          await download(fam.src, dest);
          dlOk++; process.stdout.write(".");
        } catch (e) {
          console.log(`\n  ✗ ${fam.name}: ${e.message}`); dlFail++;
        }
      }
    }
    console.log(`\n\n✅ Downloads: ${dlOk} new, ${dlSkip} skipped, ${dlFail} failed`);

    // Download badge icons
    console.log("\n📥 Badge icons...");
    for (const badge of badges) {
      if (!badge.badgeIconSrc || badge.badgeIconSrc.startsWith("data:")) continue;
      const slug = slugify(badge.name);
      const dir = join(ASSETS, slug);
      const dest = join(dir, "_badge_icon.png");
      badge.badgeIconLocal = join("../assets/icons", slug, "_badge_icon.png");
      if (existsSync(dest)) continue;
      try { await download(badge.badgeIconSrc, dest); process.stdout.write("."); }
      catch (e) { console.log(`  ✗ ${badge.name}: ${e.message}`); }
    }

    writeFileSync(OUTPUT_JSON, JSON.stringify(badges, null, 2));
    console.log(`\n\n📄 Saved to ${OUTPUT_JSON}`);
    console.log(`🎉 Total: ${badges.length} badges, ${badges.reduce((s, b) => s + b.familiars.length, 0)} familiars`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
