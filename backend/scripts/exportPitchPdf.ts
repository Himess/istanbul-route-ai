/**
 * Renders the /pitch slide deck to a single multi-page PDF.
 *
 * Each of the 16 slides is loaded by navigating to `/pitch?t=<ts>#<N>`
 * (cache-busting query so the hash-reading useEffect fires every time),
 * a tiny CSS patch hides the navigation chrome + slide counter, and the
 * resulting viewport is captured as one PDF page. All 16 pages are then
 * merged into a single PDF and written to the Desktop.
 *
 * Usage:
 *   cd backend
 *   PITCH_URL=https://istanbul-route-ai.vercel.app/pitch npx tsx scripts/exportPitchPdf.ts
 *   # or for local dev: PITCH_URL=http://localhost:3000/pitch npx tsx scripts/exportPitchPdf.ts
 */

import puppeteer from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import { writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PITCH_URL = process.env.PITCH_URL || "https://istanbul-route-ai.vercel.app/pitch";
const SLIDES = Number(process.env.SLIDES || 16);
const OUT_PATH = process.env.OUT_PATH || join(homedir(), "Desktop", "istanbul-route-ai-pitch.pdf");

const CHROME_CANDIDATES = [
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

function pickChrome(): string {
  for (const p of CHROME_CANDIDATES) if (existsSync(p)) return p;
  throw new Error("No Chrome/Edge/Brave binary found.");
}

// We patch the DOM directly instead of relying on CSS because Tailwind's
// generated class names (with square brackets) are painful to select, and
// the wrapper depth shifts with Next.js layout updates. Passed as a string
// to page.evaluate because tsx's compiled output uses __name helpers that
// don't exist in the browser when you pass a function.
const STRIP_CHROME_JS = `
  (function () {
    // 1. Kill radial-gradient backgrounds (the /pitch wrapper has them inline).
    document.querySelectorAll('[style*="radial-gradient"]').forEach(function (el) {
      el.style.background = "#FAF9F6";
    });
    document.body.style.background = "#FAF9F6";
    document.documentElement.style.background = "#FAF9F6";

    // 2. Scale the slide card to fill the viewport. It's the element whose
    //    inline aspect-ratio is "16 / 9".
    var card = Array.from(document.querySelectorAll("div")).find(function (el) {
      return el.style.aspectRatio === "16 / 9";
    });
    if (card) {
      card.style.width = "100vw";
      card.style.height = "100vh";
      card.style.maxHeight = "100vh";
      card.style.aspectRatio = "unset";
      card.style.borderRadius = "0";
      card.style.border = "none";
      card.style.boxShadow = "none";
    }

    // 3. Remove the padding that centers the card inside its wrapper.
    var wrapper = document.querySelector(".absolute.inset-0.flex.items-center.justify-center");
    if (wrapper) wrapper.style.padding = "0";

    // 4. Hide navigation controls + counter + keyboard hint.
    ['.absolute.bottom-5', '.absolute.top-4.right-6', '.absolute.bottom-5.right-6'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.style.display = "none"; });
    });
  })();
`;

async function main() {
  const executablePath = pickChrome();
  console.log(`\nUsing browser: ${executablePath}`);
  console.log(`Pitch URL    : ${PITCH_URL}`);
  console.log(`Slides       : ${SLIDES}`);
  console.log(`Output       : ${OUT_PATH}\n`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  const pageBuffers: Uint8Array[] = [];

  for (let i = 1; i <= SLIDES; i++) {
    const url = `${PITCH_URL}?t=${Date.now()}#${i}`;
    await page.goto(url, { waitUntil: "load", timeout: 45_000 });
    // Let fonts + images + framer-motion spring settle before we patch the DOM.
    await new Promise((r) => setTimeout(r, 1_500));
    await page.evaluate(STRIP_CHROME_JS);
    // One more beat so our style changes are painted before we snapshot.
    await new Promise((r) => setTimeout(r, 400));

    const pdfBytes = await page.pdf({
      width: "1920px",
      height: "1080px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1",
    });

    pageBuffers.push(pdfBytes);
    process.stdout.write(`[${String(i).padStart(2, "0")}/${SLIDES}] captured\n`);
  }

  await browser.close();

  // Merge all single-page PDFs into one
  const merged = await PDFDocument.create();
  for (const buf of pageBuffers) {
    const src = await PDFDocument.load(buf);
    const copied = await merged.copyPages(src, src.getPageIndices());
    copied.forEach((p) => merged.addPage(p));
  }
  const outBytes = await merged.save();
  writeFileSync(OUT_PATH, outBytes);

  console.log(`\n✓ Saved ${SLIDES}-page PDF to:\n  ${OUT_PATH}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
