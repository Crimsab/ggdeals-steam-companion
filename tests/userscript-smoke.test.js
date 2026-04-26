import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const scriptSource = readFileSync(new URL("../userscript.user.js", import.meta.url), "utf8");
const activeWindows = [];

afterEach(() => {
  while (activeWindows.length > 0) {
    activeWindows.pop().close();
  }
});

function createSteamDom({ values = {}, requestHandler }) {
  const dom = new JSDOM(
    "<!doctype html><html><head></head><body><div id=\"game_area_purchase\"></div></body></html>",
    {
      url: "https://store.steampowered.com/app/730/CounterStrike_2/",
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true
    }
  );

  activeWindows.push(dom.window);

  const store = new Map(Object.entries(values));
  dom.window.GM_getValue = (key, defaultValue) => store.has(key) ? store.get(key) : defaultValue;
  dom.window.GM_setValue = (key, value) => store.set(key, value);
  dom.window.GM_addStyle = (css) => {
    const style = dom.window.document.createElement("style");
    style.textContent = css;
    dom.window.document.head.appendChild(style);
  };
  dom.window.GM_xmlhttpRequest = requestHandler;

  dom.window.eval(scriptSource);

  return { window: dom.window, store };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("GG.deals Steam Companion userscript", () => {
  test("keeps the fallback UI visible when GG.deals scraping is blocked by Cloudflare", async () => {
    const { window, store } = createSteamDom({
      requestHandler: ({ onload }) => {
        setTimeout(() => onload({
          status: 403,
          statusText: "Forbidden",
          responseText: "<html>Cloudflare challenge</html>"
        }), 0);
      }
    });

    await wait(3500);

    const container = window.document.querySelector(".gg-deals-container");
    expect(container).toBeTruthy();
    expect(container.style.display).toBe("");
    expect(container.textContent).toContain("Blocked");
    expect(container.textContent).toContain("Use API");
    expect(window.document.querySelector(".gg-unavailable-notice")?.textContent).toContain("Cloudflare blocked");
    expect(window.document.querySelector(".gg-view-offers").href).toBe("https://gg.deals/steam/app/730/");

    const cached = JSON.parse(store.get("cache_app_730"));
    expect(cached.data.unavailableReason).toBe("cloudflare");
  });

  test("does not print the API key when API requests fail", async () => {
    const secret = "secret-key-that-should-not-leak";
    const errors = [];

    const { window } = createSteamDom({
      values: {
        useApi: true,
        apiKey: secret
      },
      requestHandler: ({ url, onload }) => {
        const response = url.includes("api.gg.deals")
          ? { status: 400, statusText: "Bad Request", responseText: "{\"success\":false}" }
          : { status: 403, statusText: "Forbidden", responseText: "<html>Cloudflare challenge</html>" };

        setTimeout(() => onload(response), 0);
      }
    });

    window.console.error = (...args) => errors.push(args);

    await wait(3500);

    const serializedErrors = JSON.stringify(errors);
    expect(serializedErrors).not.toContain(secret);
    expect(serializedErrors).toContain("key=[redacted]");
  });

  test("shows an API required prompt when scraping is disabled without an API key", async () => {
    const { window, store } = createSteamDom({
      values: {
        useApi: true,
        enableScraping: false
      },
      requestHandler: () => {
        throw new Error("No network requests should be made");
      }
    });

    await wait(700);

    const container = window.document.querySelector(".gg-deals-container");
    expect(container).toBeTruthy();
    expect(container.style.display).toBe("");
    expect(container.textContent).toContain("API");
    expect(container.textContent).toContain("Required");
    expect(window.document.querySelector(".gg-unavailable-notice")?.textContent).toContain("no GG.deals API key");

    const cached = JSON.parse(store.get("cache_app_730"));
    expect(cached.data.unavailableReason).toBe("api_required");
  });

  test("formats zero API prices as Free", async () => {
    const { window } = createSteamDom({
      values: {
        useApi: true,
        apiKey: "test-key",
        enableScraping: false
      },
      requestHandler: ({ url, onload }) => {
        expect(url).toContain("api.gg.deals");
        setTimeout(() => onload({
          status: 200,
          statusText: "OK",
          responseText: JSON.stringify({
            success: true,
            data: {
              730: {
                url: "https://gg.deals/game/example/",
                prices: {
                  currency: "$",
                  currentRetail: 0,
                  currentKeyshops: null,
                  historicalRetail: 0,
                  historicalKeyshops: null
                }
              }
            }
          })
        }), 0);
      }
    });

    await wait(900);

    const container = window.document.querySelector(".gg-deals-container");
    expect(container).toBeTruthy();
    expect(window.document.querySelector("#gg-official-price")?.textContent).toBe("Free");
    expect(window.document.querySelector(".gg-view-offers").href).toBe("https://gg.deals/game/example/");
  });
});
