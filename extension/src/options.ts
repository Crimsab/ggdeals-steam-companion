const form = document.querySelector<HTMLFormElement>("#settings-form");
const statusEl = document.querySelector<HTMLElement>("#status");
const useApi = document.querySelector<HTMLInputElement>("#useApi");
const compactView = document.querySelector<HTMLInputElement>("#compactView");
const apiKey = document.querySelector<HTMLInputElement>("#apiKey");
const preferredRegion = document.querySelector<HTMLSelectElement>("#preferredRegion");
const enableScraping = document.querySelector<HTMLInputElement>("#enableScraping");
const showSubDisplay = document.querySelector<HTMLInputElement>("#showSubDisplay");
const clearCache = document.querySelector<HTMLButtonElement>("#clearCache");

if (!form || !statusEl || !useApi || !compactView || !apiKey || !preferredRegion || !enableScraping || !showSubDisplay || !clearCache) {
  throw new Error("Options page markup is incomplete");
}

const formEl = form;
const status = statusEl;
const useApiInput = useApi;
const compactViewInput = compactView;
const apiKeyInput = apiKey;
const preferredRegionSelect = preferredRegion;
const enableScrapingInput = enableScraping;
const showSubDisplayInput = showSubDisplay;
const clearCacheButton = clearCache;

const saved = await chrome.storage.local.get({
  useApi: false,
  compactView: true,
  apiKey: "",
  preferredRegion: "us",
  enableScraping: true,
  showSubDisplay: false
});

useApiInput.checked = Boolean(saved.useApi);
compactViewInput.checked = Boolean(saved.compactView);
apiKeyInput.value = String(saved.apiKey || "");
preferredRegionSelect.value = String(saved.preferredRegion || "us");
enableScrapingInput.checked = Boolean(saved.enableScraping);
showSubDisplayInput.checked = Boolean(saved.showSubDisplay);

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveSettings("Saved");
});

[useApiInput, compactViewInput, preferredRegionSelect, enableScrapingInput, showSubDisplayInput].forEach((control) => {
  control.addEventListener("change", () => {
    saveSettings("Saved");
  });
});

let apiKeySaveTimer: number | undefined;
apiKeyInput.addEventListener("input", () => {
  window.clearTimeout(apiKeySaveTimer);
  apiKeySaveTimer = window.setTimeout(() => {
    saveSettings("Saved");
  }, 500);
});

async function saveSettings(message: string) {
  await chrome.storage.local.set({
    useApi: useApiInput.checked,
    compactView: compactViewInput.checked,
    apiKey: apiKeyInput.value.trim(),
    preferredRegion: preferredRegionSelect.value,
    enableScraping: enableScrapingInput.checked,
    showSubDisplay: showSubDisplayInput.checked
  });

  flashStatus(message);
}

clearCacheButton.addEventListener("click", async () => {
  const values = await chrome.storage.local.get(null);
  const cacheKeys = Object.keys(values).filter((key) => key.startsWith("cache_"));

  if (cacheKeys.length > 0) {
    await chrome.storage.local.remove(cacheKeys);
  }

  flashStatus("Cache cleared");
});

function flashStatus(message: string) {
  status.textContent = message;
  window.setTimeout(() => {
    status.textContent = "Saved locally";
  }, 1800);
}

export {};
