type XmlHttpRequestMessage = {
  type: "GM_XMLHTTP_REQUEST";
  request: {
    method?: string;
    url: string;
    headers?: Record<string, string>;
    data?: BodyInit | null;
    timeout?: number;
  };
};

type ExtensionMessage = XmlHttpRequestMessage;

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message?.type !== "GM_XMLHTTP_REQUEST") {
    return false;
  }

  handleRequest(message.request).then(sendResponse);
  return true;
});

async function handleRequest(request: XmlHttpRequestMessage["request"]) {
  const controller = new AbortController();
  const timeout = request.timeout
    ? setTimeout(() => controller.abort(), request.timeout)
    : null;

  try {
    const response = await fetch(request.url, {
      method: request.method || "GET",
      headers: request.headers,
      body: request.data || undefined,
      signal: controller.signal,
      credentials: "omit"
    });

    const responseText = await response.text();
    const responseHeaders = [...response.headers.entries()]
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");

    return {
      ok: true,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url,
      responseHeaders,
      responseText
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
