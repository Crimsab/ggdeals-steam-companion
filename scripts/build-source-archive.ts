import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import JSZip from "jszip";

const root = new URL("..", import.meta.url).pathname;
const outputPath = join(root, "dist", "ggdeals-steam-companion-source.zip");

const includedPaths = [
  ".github",
  "extension",
  "images",
  "scripts",
  "tests",
  "AGENTS.md",
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "bun.lock",
  "package.json",
  "tsconfig.json",
  "userscript.user.js"
];

await mkdir(join(root, "dist"), { recursive: true });
await rm(outputPath, { force: true });

const archive = new JSZip();
const files = (await Promise.all(includedPaths.map((path) => collectPath(join(root, path))))).flat();

await Promise.all(files.map(async (file) => {
  const archivePath = relative(root, file).replaceAll("\\", "/");
  archive.file(archivePath, await readFile(file));
}));

const content = await archive.generateAsync({
  type: "uint8array",
  compression: "DEFLATE"
});

await writeFile(outputPath, content);

console.log(`Packed ${outputPath}`);

async function collectPath(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true }).catch(async () => null);

  if (!entries) {
    return [path];
  }

  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(path, entry.name);
    return entry.isDirectory() ? collectPath(entryPath) : [entryPath];
  }));

  return files.flat();
}
