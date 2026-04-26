const form = document.querySelector<HTMLFormElement>("#settings-form");
const statusEl = document.querySelector<HTMLElement>("#status");
const useApi = document.querySelector<HTMLInputElement>("#useApi");
const apiKey = document.querySelector<HTMLInputElement>("#apiKey");
const preferredRegion = document.querySelector<HTMLSelectElement>("#preferredRegion");
const enableScraping = document.querySelector<HTMLInputElement>("#enableScraping");
const clearCache = document.querySelector<HTMLButtonElement>("#clearCache");

if (!form || !statusEl || !useApi || !apiKey || !preferredRegion || !enableScraping || !clearCache) {
  throw new Error("Options page markup is incomplete");
}

const saved = await chrome.storage.local.get({
  useApi: false,
  apiKey: "",
  preferredRegion: "us",
  enableScraping: true
});

useApi.checked = Boolean(saved.useApi);
apiKey.value = String(saved.apiKey || "");
preferredRegion.value = String(saved.preferredRegion || "us");
enableScraping.checked = Boolean(saved.enableScraping);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  await chrome.storage.local.set({
    useApi: useApi.checked,
    apiKey: apiKey.value.trim(),
    preferredRegion: preferredRegion.value,
    enableScraping: enableScraping.checked
  });

  flashStatus("Saved");
});

clearCache.addEventListener("click", async () => {
  const values = await chrome.storage.local.get(null);
  const cacheKeys = Object.keys(values).filter((key) => key.startsWith("cache_"));

  if (cacheKeys.length > 0) {
    await chrome.storage.local.remove(cacheKeys);
  }

  flashStatus("Cache cleared");
});

function flashStatus(message: string) {
  const status = statusEl!;
  status.textContent = message;
  window.setTimeout(() => {
    status.textContent = "Saved locally";
  }, 1800);
}

export {};
