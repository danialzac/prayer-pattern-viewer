import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "../frontend/node_modules/playwright/index.mjs";

const rootDir = process.cwd();
const demoDir = path.join(rootDir, "demo");
const framesDir = path.join(demoDir, "frames");
const outputVideo = path.join(demoDir, "prayer-pattern-viewer-demo.mp4");
const baseUrl = "http://127.0.0.1:8080";

fs.mkdirSync(framesDir, { recursive: true });

for (const file of fs.readdirSync(framesDir)) {
  fs.rmSync(path.join(framesDir, file), { force: true });
}

function framePath(index) {
  return path.join(framesDir, `frame-${String(index).padStart(2, "0")}.png`);
}

async function saveFrame(page, index) {
  await page.screenshot({
    path: framePath(index),
    type: "png",
  });
}

const browser = await chromium.launch({
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  colorScheme: "dark",
});

const page = await context.newPage();

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForSelector("h1");
await page.waitForTimeout(1200);
await saveFrame(page, 1);

await page.getByRole("button", { name: "Register" }).click();
await page.getByLabel("Full name").fill("Portfolio Demo");

const uniqueEmail = `portfolio-demo-${Date.now()}@example.com`;
await page.getByLabel("Email").fill(uniqueEmail);
await page.getByLabel("Password").fill("secret123");
await page.getByRole("button", { name: "Create account" }).click();
await page.getByRole("button", { name: "Log out" }).waitFor({ state: "visible" });
await page.waitForTimeout(1000);
await saveFrame(page, 2);

await page.getByRole("button", { name: "Save Summary" }).click();
await page.waitForSelector(".history-card");
await page.waitForTimeout(1000);
await saveFrame(page, 3);

await page.getByRole("heading", { name: "Gentle Reflection Cards" }).scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await saveFrame(page, 4);

await page.getByRole("heading", { name: "Last Ten Nights" }).scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await saveFrame(page, 5);

await page.getByRole("heading", { name: "A Theologically Careful Reminder" }).scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await saveFrame(page, 6);

await browser.close();

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-framerate",
    "1/3",
    "-i",
    path.join(framesDir, "frame-%02d.png"),
    "-vf",
    "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    outputVideo,
  ],
  { stdio: "inherit" },
);

console.log(`Demo video created at ${outputVideo}`);
