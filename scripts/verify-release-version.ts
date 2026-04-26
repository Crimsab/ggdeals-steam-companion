import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const manifestJson = JSON.parse(await readFile(join(root, "extension", "manifest.json"), "utf8"));
const userscript = await readFile(join(root, "userscript.user.js"), "utf8");
const changelog = await readFile(join(root, "CHANGELOG.md"), "utf8");

const version = String(packageJson.version || "");

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`package.json version must be a stable semver version, got "${version}"`);
}

if (manifestJson.version !== version) {
  fail(`extension/manifest.json version "${manifestJson.version}" does not match package.json "${version}"`);
}

const userscriptVersion = userscript.match(/^\/\/ @version\s+(.+)$/m)?.[1]?.trim();
if (userscriptVersion !== version) {
  fail(`userscript @version "${userscriptVersion}" does not match package.json "${version}"`);
}

if (!changelog.includes(`## ${version} - `)) {
  fail(`CHANGELOG.md is missing a release section for ${version}`);
}

console.log(version);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
