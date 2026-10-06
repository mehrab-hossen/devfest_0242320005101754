/**
 * Captures README screenshots of the running app UI.
 *
 * Requirements:
 *   1. The app must be served (dev or preview), e.g. `npm run dev`.
 *   2. `npm i --no-save playwright-core` (uses the locally installed Chrome;
 *      no browser download needed).
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs [baseUrl]
 *   (default baseUrl: http://localhost:5173)
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "docs", "screenshots");
const BASE_URL = process.argv[2] || "http://localhost:5173";

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

async function findChrome() {
  const { existsSync } = await import("node:fs");
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  return undefined; // let playwright-core fall back to its own registry
}

const shot = (name) => path.join(OUT_DIR, name);

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ executablePath: await findChrome() });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1.5,
  });

  page.on("dialog", async (d) => {
    console.warn(`[dialog] ${d.message()}`);
    await d.dismiss();
  });

  console.log(`Opening ${BASE_URL} ...`);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  // 1. Landing state — Step 1 with sample tender requirements loaded.
  await page.getByText("1. Load Tender Requirements").waitFor();
  await page.screenshot({ path: shot("01-load-requirements.png"), fullPage: true });
  console.log("✔ 01-load-requirements.png");

  // 2. Steps 2–4 after generating sample PDFs (files + matched requirements).
  await page.getByRole("button", { name: /Add Sample PDFs/ }).click();
  await page.waitForFunction(
    () => document.body.innerText.includes("Status: OK"),
    undefined,
    { timeout: 30000 }
  );
  await page.waitForTimeout(500); // let the summary bar settle
  await page.screenshot({ path: shot("02-upload-and-match.png"), fullPage: true });
  console.log("✔ 02-upload-and-match.png");

  // 3. Close-up of the ready-to-generate summary bar.
  const generateBtn = page.getByRole("button", { name: /Generate Package PDF/ });
  await generateBtn.waitFor({ timeout: 30000 });
  const summaryBar = generateBtn.locator("xpath=..");
  await summaryBar.screenshot({ path: shot("03-ready-to-generate.png") });
  console.log("✔ 03-ready-to-generate.png");

  // 4. Bangla (bilingual) interface.
  await page.getByRole("button", { name: /বাংলা/ }).click();
  await page.getByText("১. টেন্ডারের প্রয়োজনীয়তা সমূহ লোড করুন").waitFor();
  await page.screenshot({ path: shot("04-bangla-ui.png"), fullPage: true });
  console.log("✔ 04-bangla-ui.png");

  await browser.close();
  console.log(`\nScreenshots written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
