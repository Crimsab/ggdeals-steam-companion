import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const version = Bun.argv[2];
const root = new URL("..", import.meta.url).pathname;

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error("Usage: bun scripts/release-version.ts <major.minor.patch>");
}

const today = new Date().toISOString().slice(0, 10);

await updatePackageJson(version);
await updateManifest(version);
await updateUserscript(version);
await updateChangelog(version, today);

console.log(`Prepared release ${version}`);

async function updatePackageJson(nextVersion: string) {
  const path = join(root, "package.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.version = nextVersion;
  await writeFile(path, `${JSON.stringify(json, null, 2)}\n`);
}

async function updateManifest(nextVersion: string) {
  const path = join(root, "extension", "manifest.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.version = nextVersion;
  await writeFile(path, `${JSON.stringify(json, null, 2)}\n`);
}

async function updateUserscript(nextVersion: string) {
  const path = join(root, "userscript.user.js");
  const content = await readFile(path, "utf8");
  const updated = content.replace(
    /^\/\/ @version\s+.+$/m,
    `// @version      ${nextVersion}`
  );

  if (updated === content) {
    throw new Error("Unable to find userscript @version header");
  }

  await writeFile(path, updated);
}

async function updateChangelog(nextVersion: string, releaseDate: string) {
  const path = join(root, "CHANGELOG.md");
  const content = await readFile(path, "utf8");
  const heading = `## ${nextVersion} - ${releaseDate}`;

  if (content.includes(`## ${nextVersion}`)) {
    throw new Error(`CHANGELOG.md already contains ${nextVersion}`);
  }

  const updated = content.replace("## Unreleased", `## Unreleased\n\n## ${nextVersion} - ${releaseDate}`);

  if (updated === content) {
    throw new Error("Unable to find Unreleased changelog section");
  }

  await writeFile(path, updated);
}
