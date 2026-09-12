import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { runCrawl } from "./main.js";

// Skips the (slow) website crawl when the cached dataset was already built
// from the latest Lucide release, so container startup only crawls when
// new icons exist. Runs the full crawl otherwise, including the first run
// with no cached dataset.
const datasetDir = join("storage", "datasets", "default");
const iconsPath = join(datasetDir, "icons.json");
const categoriesPath = join(datasetDir, "categories.json");
const crawledVersionPath = join(datasetDir, "version.txt");

const latestVersion = readFileSync(join("data", "version.txt"), "utf-8").trim();
const crawledVersion = existsSync(crawledVersionPath)
  ? readFileSync(crawledVersionPath, "utf-8").trim()
  : "";
const hasDataset =
  existsSync(iconsPath) && existsSync(categoriesPath) && crawledVersion !== "";

if (hasDataset && latestVersion && crawledVersion === latestVersion) {
  console.log(
    `✅ Lucide is still at ${latestVersion}. No new icons — skipping crawl.`
  );
  process.exit(0);
}

if (hasDataset) {
  console.log(
    `🔄 Lucide changed (${crawledVersion} -> ${latestVersion || "unknown"}). Crawling for new icons...`
  );
} else {
  console.log("🔄 No cached dataset. Running initial crawl...");
}

await runCrawl();
