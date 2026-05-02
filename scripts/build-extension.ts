import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import JSZip from "jszip";
import sharp from "sharp";

type Platform = "chrome" | "firefox";

type PlatformBuild = {
  platform: Platform;
  distDir: string;
  zipPath: string;
};

const root = new URL("..", import.meta.url).pathname;
const distRoot = join(root, "dist");
const legacyDistDir = join(distRoot, "chrome-extension");

const builds: PlatformBuild[] = [
  {
    platform: "chrome",
    distDir: join(distRoot, "ggdeals-extension"),
    zipPath: join(distRoot, "ggdeals-steam-companion-chrome.zip")
  },
  {
    platform: "firefox",
    distDir: join(distRoot, "ggdeals-extension-firefox"),
    zipPath: join(distRoot, "ggdeals-steam-companion-firefox.zip")
  }
];

const requestedPlatforms = new Set<Platform>(
  Bun.argv
    .slice(2)
    .filter((value): value is Platform => value === "chrome" || value === "firefox")
);

const selectedBuilds = requestedPlatforms.size > 0
  ? builds.filter((build) => requestedPlatforms.has(build.platform))
  : builds;

await rm(legacyDistDir, { recursive: true, force: true });
await mkdir(distRoot, { recursive: true });

for (const build of selectedBuilds) {
  await buildExtension(build);
}

async function buildExtension(build: PlatformBuild) {
  await rm(build.distDir, { recursive: true, force: true });
  await mkdir(build.distDir, { recursive: true });

  await buildEntry(build, "extension/src/background.ts", "background.js");
  await buildEntry(build, "extension/src/options.ts", "options.js");
  await buildContentScript(build);

  await writeManifest(build);
  await copyText(build, "extension/src/options.html", "options.html");
  await copyText(build, "extension/src/options.css", "options.css");
  await buildIcons(build);

  await rm(build.zipPath, { force: true });
  await writeZip(build.distDir, build.zipPath);

  console.log(`Built ${build.distDir}`);
  console.log(`Packed ${build.zipPath}`);
}

async function buildEntry(build: PlatformBuild, entrypoint: string, outputFile: string) {
  const result = await Bun.build({
    entrypoints: [join(root, entrypoint)],
    outdir: build.distDir,
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
    const generated = await readFile(join(build.distDir, generatedName), "utf8");
    await writeFile(join(build.distDir, outputFile), generated);
    await rm(join(build.distDir, generatedName));
  }
}

async function buildContentScript(build: PlatformBuild) {
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
    join(build.distDir, "content.js"),
    `${shim}\n\nwindow.__GG_DEALS_INSTALL_SHIM__().then(() => {\n${userscript}\n});\n`
  );
}

async function writeManifest(build: PlatformBuild) {
  const manifest = JSON.parse(await readFile(join(root, "extension", "manifest.json"), "utf8"));

  if (build.platform === "firefox") {
    manifest.background = {
      scripts: ["background.js"],
      type: "module"
    };
    manifest.browser_specific_settings = {
      gecko: {
        id: "ggdeals-steam-companion@crimsab.github.io",
        strict_min_version: "140.0",
        data_collection_permissions: {
          required: ["none"]
        }
      },
      gecko_android: {
        strict_min_version: "142.0"
      }
    };
  }

  await writeFile(join(build.distDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function copyText(build: PlatformBuild, source: string, destination: string) {
  const content = await readFile(join(root, source), "utf8");
  await writeFile(join(build.distDir, destination), content);
}

async function buildIcons(build: PlatformBuild) {
  const iconDir = join(build.distDir, "icons");
  await mkdir(iconDir, { recursive: true });

  await Promise.all([16, 32, 48, 128].map(async (size) => {
    const output = join(iconDir, `icon-${size}.png`);
    await sharp(join(root, "extension", "icons", "icon.png"))
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(output);
  }));
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
