import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import JSZip from "jszip";

const root = new URL("..", import.meta.url).pathname;
const distDir = join(root, "dist", "chrome-extension");
const zipPath = join(root, "dist", "ggdeals-steam-companion-chrome.zip");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await buildEntry("extension/src/background.ts", "background.js");
await buildEntry("extension/src/options.ts", "options.js");
await buildContentScript();

await copyText("extension/manifest.json", "manifest.json");
await copyText("extension/src/options.html", "options.html");
await copyText("extension/src/options.css", "options.css");

await rm(zipPath, { force: true });
await writeZip(distDir, zipPath);

console.log(`Built ${distDir}`);
console.log(`Packed ${zipPath}`);

async function buildEntry(entrypoint: string, outputFile: string) {
  const result = await Bun.build({
    entrypoints: [join(root, entrypoint)],
    outdir: distDir,
    target: "browser",
    format: "esm",
    minify: false,
    sourcemap: "external"
  });

  if (!result.success) {
    throw new Error(result.logs.map((log) => log.message).join("\n"));
  }

  const generatedName = basename(entrypoint).replace(/\.ts$/, ".js");
  if (generatedName !== outputFile) {
    const generated = await readFile(join(distDir, generatedName), "utf8");
    await writeFile(join(distDir, outputFile), generated);
    await rm(join(distDir, generatedName));
  }
}

async function buildContentScript() {
  const result = await Bun.build({
    entrypoints: [join(root, "extension/src/content-shim.ts")],
    target: "browser",
    format: "esm",
    minify: false,
    sourcemap: "external"
  });

  if (!result.success || result.outputs.length === 0) {
    throw new Error(result.logs.map((log) => log.message).join("\n"));
  }

  const shim = await result.outputs[0].text();
  const userscript = await readFile(join(root, "userscript.user.js"), "utf8");
  await writeFile(
    join(distDir, "content.js"),
    `${shim}\n\nwindow.__GG_DEALS_INSTALL_SHIM__().then(() => {\n${userscript}\n});\n`
  );
}

async function copyText(source: string, destination: string) {
  const content = await readFile(join(root, source), "utf8");
  await writeFile(join(distDir, destination), content);
}

async function writeZip(sourceDir: string, outputPath: string) {
  const archive = new JSZip();
  const files = await collectFiles(sourceDir);

  await Promise.all(files.map(async (file) => {
    const archivePath = relative(sourceDir, file).replaceAll("\\", "/");
    archive.file(archivePath, await readFile(file));
  }));

  const content = await archive.generateAsync({
    type: "uint8array",
    compression: "DEFLATE"
  });

  await writeFile(outputPath, content);
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  }));

  return files.flat();
}
