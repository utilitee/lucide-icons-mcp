// For more information, see https://crawlee.dev/
import { launchOptions } from "camoufox-js";
import { PlaywrightCrawler } from "crawlee";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { firefox } from "playwright";

import { router } from "./routes.js";

const startUrls = ["https://lucide.dev/icons/categories"];

export async function runCrawl(): Promise<void> {
  const crawler = new PlaywrightCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
    requestHandlerTimeoutSecs: 180, // Increased timeout to 3 minutes
    // Comment this option to scrape the full website.
    browserPoolOptions: {
      // Disable the default fingerprint spoofing to avoid conflicts with Camoufox.
      useFingerprints: false
    },
    launchContext: {
      launcher: firefox,
      launchOptions: await launchOptions({
        headless: true,
        timeout: 90000
        // Pass your own Camoufox parameters here...
        // block_images: true,
        // fonts: ['Times New Roman'],
        // ...
      })
    }
  });

  await crawler.run(startUrls);

  // Record which Lucide version this dataset was crawled from, so the next
  // startup can skip the crawl when no new icons have been released.
  const datasetDir = join("storage", "datasets", "default");
  const version = readFileSync(join("data", "version.txt"), "utf-8").trim();
  mkdirSync(datasetDir, { recursive: true });
  writeFileSync(join(datasetDir, "version.txt"), version);
}

if (import.meta.main) {
  await runCrawl();
}
