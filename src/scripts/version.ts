import { readFile, writeFile } from "fs/promises";

const versionPath = "data/version.txt";
const previousVersion = (
  await readFile(versionPath, "utf-8").catch(() => "")
).trim();

// Fetch latest release tag from GitHub API
let latestRelease = "";
try {
  const res = await fetch(
    "https://api.github.com/repos/lucide-icons/lucide/releases/latest"
  );
  if (res.ok) {
    const data = await res.json();
    latestRelease = (data.tag_name || "").trim();
  }
} catch (err) {
  console.warn("Failed to fetch latest release:", err);
}

if (latestRelease) {
  await writeFile(versionPath, latestRelease);
} else if (previousVersion) {
  // Keep the last known version so the incremental crawl gate can still work.
  console.warn(
    `Failed to fetch latest release; keeping previous version "${previousVersion}"`
  );
} else {
  await writeFile(versionPath, "");
}
