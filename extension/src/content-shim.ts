type StoredValue = string | number | boolean | null | undefined;

type GmRequestDetails = {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  data?: BodyInit | null;
  timeout?: number;
  onload?: (response: GmResponse) => void;
  onerror?: (error: GmError) => void;
  ontimeout?: (error: GmError) => void;
};

type GmResponse = {
  status: number;
  statusText: string;
  finalUrl: string;
  responseHeaders: string;
  responseText: string;
};

type GmError = {
  error: string;
  message: string;
};

declare global {
  interface Window {
    GM_getValue: <T>(key: string, defaultValue?: T) => T | undefined;
    GM_setValue: (key: string, value: StoredValue) => void;
    GM_addStyle: (css: string) => HTMLStyleElement;
    GM_xmlhttpRequest: (details: GmRequestDetails) => void;
    unsafeWindow: Window;
    __GG_DEALS_INSTALL_SHIM__: () => Promise<void>;
  }
}

window.__GG_DEALS_INSTALL_SHIM__ = async () => {
  const extensionApi = (globalThis as typeof globalThis & { browser?: typeof chrome }).browser ?? chrome;
  const storedValues = await extensionApi.storage.local.get(null);
  const storageCache: Record<string, unknown> = { ...storedValues };

  window.GM_getValue = (key, defaultValue) => {
    return Object.prototype.hasOwnProperty.call(storageCache, key)
      ? storageCache[key] as typeof defaultValue
      : defaultValue;
  };

  window.GM_setValue = (key, value) => {
    storageCache[key] = value;
    extensionApi.storage.local.set({ [key]: value });
  };

  window.GM_addStyle = (css) => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  };

  window.GM_xmlhttpRequest = (details) => {
    const timeout = details.timeout
      ? window.setTimeout(() => {
          details.ontimeout?.({ error: "timeout", message: `Timed out after ${details.timeout}ms` });
        }, details.timeout + 100)
      : null;

    extensionApi.runtime.sendMessage({
      type: "GM_XMLHTTP_REQUEST",
      request: {
        method: details.method,
        url: details.url,
        headers: details.headers,
        data: details.data,
        timeout: details.timeout
      }
    }).then((response) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      if (response?.ok) {
        details.onload?.({
          status: response.status,
          statusText: response.statusText,
          finalUrl: response.finalUrl,
          responseHeaders: response.responseHeaders,
          responseText: response.responseText
        });
        return;
      }

      const message = response?.error || "Extension request failed";
      details.onerror?.({ error: message, message });
    }).catch((error) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      const message = error instanceof Error ? error.message : String(error);
      details.onerror?.({ error: message, message });
    });
  };

  window.unsafeWindow = window;
};

export {};
