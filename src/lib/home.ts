import { HistoryMethod } from "./history";

export type ActivePanel = "history" | "guide" | null;

export type ResponseSummary = {
  status: number | null;
  headers: Record<string, string>;
  body: string;
};

export function isSupportedHttpUrl(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isHeadersJsonValid(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

export function getResponseStats(body: string) {
  return {
    chars: body.length,
    lines: body ? body.split("\n").length : 0,
    bytes: new TextEncoder().encode(body).length,
  };
}

export function getProxyLink(origin: string, url: string): string {
  if (!origin || !isSupportedHttpUrl(url)) {
    return "";
  }

  return `${origin}/api/proxy?url=${encodeURIComponent(url)}`;
}

export function createStandardPayload(
  url: string,
  method: HistoryMethod,
  headers: string,
  body: string,
  sampleUrl = "https://example.com/data",
): string {
  const parsedHeaders = headers.trim() && isHeadersJsonValid(headers) ? JSON.parse(headers) : {};

  return JSON.stringify(
    {
      url: url || sampleUrl,
      method,
      headers: parsedHeaders,
      body: body || "",
    },
    null,
    2,
  );
}

export function toggleActivePanel(current: ActivePanel, next: Exclude<ActivePanel, null>): ActivePanel {
  return current === next ? null : next;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function truncate(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}...`;
}

export function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export function extractErrorMessage(payload: string) {
  try {
    const parsed = JSON.parse(payload) as { message?: string };
    return parsed.message ?? null;
  } catch {
    return null;
  }
}

export function getHomeLayoutClasses() {
  return {
    main: "min-h-screen overflow-hidden px-4 py-4 md:px-6 md:py-6",
    grid:
      "mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1560px] grid-cols-1 gap-4 lg:grid-cols-[78px_minmax(0,1.2fr)_minmax(0,1fr)] lg:items-stretch lg:gap-5",
  };
}

export function getHomePanelClassName(_panel: "console" | "response") {
  if (_panel === "response") {
    return "max-h-[calc(100vh-2.4rem)] lg:min-h-0";
  }
  return "lg:max-h-[calc(100vh-2rem)] lg:min-h-0";
}
