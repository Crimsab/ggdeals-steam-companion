import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const root = new URL("..", import.meta.url).pathname;
const outputDir = join(root, "dist", "responsive-check");
const userscript = await Bun.file(join(root, "userscript.user.js")).text();

const scenarios = [
  {
    name: "desktop",
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    pageWidth: 980
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    pageWidth: 390
  },
  {
    name: "big-picture",
    viewport: { width: 598, height: 240 },
    deviceScaleFactor: 2,
    pageWidth: 598
  }
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const scenario of scenarios) {
  const page = await browser.newPage({
    viewport: scenario.viewport,
    deviceScaleFactor: scenario.deviceScaleFactor
  });
  await page.goto("https://store.steampowered.com/app/1158310/Crusader_Kings_III/");

  await page.evaluate(({ pageWidth }) => {
    document.body.innerHTML = `
      <style>
        body {
          margin: 0;
          background: #0f1720;
          color: #c7d5e0;
          font-family: Arial, sans-serif;
        }
        .steam-shell {
          width: ${pageWidth}px;
          max-width: 100vw;
          box-sizing: border-box;
          padding: 18px;
          background: #16202d;
        }
        .steam-hero {
          height: 96px;
          margin-bottom: 16px;
          border-radius: 6px;
          background: linear-gradient(135deg, #26384b, #111923);
        }
        .steam-following-box {
          position: relative;
          z-index: 50;
          height: 72px;
          margin-top: 8px;
          padding: 12px 16px;
          box-sizing: border-box;
          background: #5c7e10;
          color: #d7ff62;
          font-size: 18px;
        }
        .steam-following-box.overlap {
          margin-top: -42px;
        }
      </style>
      <main class="steam-shell">
        <div class="steam-hero"></div>
        <div id="game_area_purchase"></div>
        <div class="steam-following-box">Steam following purchase content</div>
      </main>
    `;
  }, { pageWidth: scenario.pageWidth });

  await page.evaluate(() => {
    const store = new Map<string, unknown>(Object.entries({
      compactView: true,
      showOfficial: true,
      showKeyshop: true,
      useApi: true,
      apiKey: "visual-test-key",
      enableScraping: false,
      preferredRegion: "eu"
    }));

    const testWindow = window as any;

    testWindow.GM_getValue = (key: string, defaultValue?: unknown) => store.has(key) ? store.get(key) : defaultValue;
    testWindow.GM_setValue = (key: string, value: unknown) => store.set(key, value);
    testWindow.GM_addStyle = (css: string) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    };
    testWindow.GM_xmlhttpRequest = ({ onload }: { onload?: (response: unknown) => void }) => {
      window.setTimeout(() => onload?.({
        status: 200,
        statusText: "OK",
        responseText: JSON.stringify({
          success: true,
          data: {
            1158310: {
              title: "Crusader Kings III",
              url: "https://gg.deals/game/crusader-kings-iii/",
              prices: {
                currency: "EUR",
                currentRetail: "19.99",
                currentKeyshops: "17.36",
                historicalRetail: "9.63",
                historicalKeyshops: "9.17"
              }
            }
          }
        })
      }), 0);
    };
    testWindow.unsafeWindow = window;
  });

  await page.addScriptTag({ content: userscript });
  const panel = page.locator(".gg-deals-container").first();
  await panel.waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector("#gg-compact-official-price")?.textContent?.includes("19.99"));

  const screenshotPath = join(outputDir, `${scenario.name}.png`);
  await panel.screenshot({ path: screenshotPath });

  if (scenario.name === "mobile" || scenario.name === "big-picture") {
    await page.locator(".gg-settings-icon").click();
    await page.locator(".gg-settings-content.show").waitFor({ state: "visible" });
    await page.evaluate(() => document.querySelector(".steam-following-box")?.classList.add("overlap"));
    await panel.screenshot({ path: join(outputDir, `${scenario.name}-settings.png`) });

    const colorSettingsTitle = page.locator(".gg-settings-content.show .gg-settings-section", { hasText: "Color Settings" }).locator(".gg-settings-title");
    await colorSettingsTitle.click();
  }

  const metrics = await page.evaluate(({ touchLayout }) => {
    const panel = document.querySelector(".gg-deals-container") as HTMLElement;
    const button = document.querySelector(".gg-view-offers") as HTMLElement;
    const official = document.querySelector("#gg-compact-official") as HTMLElement;
    const keyshop = document.querySelector("#gg-compact-keyshop") as HTMLElement;
    const settingsButton = document.querySelector(".gg-settings-dropdown") as HTMLElement;
    const settingsPanel = document.querySelector(".gg-settings-content") as HTMLElement;
    const colorSettingsTitle = Array.from(settingsPanel.querySelectorAll(".gg-settings-title"))
      .find((element) => element.textContent?.trim() === "Color Settings") as HTMLElement | undefined;
    const panelRect = panel.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const officialRect = official.getBoundingClientRect();
    const keyshopRect = keyshop.getBoundingClientRect();
    const settingsButtonRect = settingsButton.getBoundingClientRect();
    const settingsPanelRect = settingsPanel.getBoundingClientRect();
    const colorTitleRect = colorSettingsTitle?.getBoundingClientRect();
    const colorTitleHitTarget = colorTitleRect
      ? document.elementFromPoint(colorTitleRect.left + 16, colorTitleRect.top + colorTitleRect.height / 2)
      : null;
    const colorSettingsObstructed = settingsPanel.classList.contains("show")
      ? Boolean(colorSettingsTitle && colorTitleHitTarget && !settingsPanel.contains(colorTitleHitTarget))
      : false;

    return {
      viewportWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      documentScrollWidth: document.documentElement.scrollWidth,
      panelWidth: Math.round(panelRect.width),
      panelHeight: Math.round(panelRect.height),
      buttonWidth: Math.round(buttonRect.width),
      officialRight: Math.round(officialRect.right),
      keyshopLeft: Math.round(keyshopRect.left),
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      buttonTooWide: !touchLayout && buttonRect.width > Math.min(280, panelRect.width),
      priceOverlap: officialRect.right > keyshopRect.left && Math.abs(officialRect.top - keyshopRect.top) < 8,
      settingsPanelFloatsAboveTrigger: settingsPanel.classList.contains("show")
        ? settingsPanelRect.bottom < settingsButtonRect.top
        : false,
      settingsPanelOverflowsViewport: settingsPanel.classList.contains("show")
        ? settingsPanelRect.left < 0 || settingsPanelRect.right > window.innerWidth
        : false,
      colorSettingsObstructed,
      touchButtonTooNarrow: touchLayout
        ? buttonRect.width < panelRect.width * 0.45
        : false
    };
  }, { touchLayout: scenario.viewport.width <= 720 });

  results.push({ ...scenario, screenshotPath, metrics });
  await page.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));

const failed = results.filter((result) =>
  result.metrics.hasHorizontalOverflow ||
  result.metrics.buttonTooWide ||
  result.metrics.priceOverlap ||
  result.metrics.settingsPanelFloatsAboveTrigger ||
  result.metrics.settingsPanelOverflowsViewport ||
  result.metrics.colorSettingsObstructed ||
  result.metrics.touchButtonTooNarrow
);

if (failed.length > 0) {
  throw new Error(`Responsive visual checks failed: ${failed.map((result) => result.name).join(", ")}`);
}
