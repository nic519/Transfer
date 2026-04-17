const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SAFE_RESPONSE_HEADERS = [
  "cache-control",
  "content-language",
  "content-type",
  "etag",
  "expires",
  "last-modified",
];

export type ProxyMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ProxyRequestInput = {
  method?: string;
  headers?: HeadersInit;
  body?: string;
};

export type ProxyErrorPayload = {
  error: string;
  message: string;
  status: number;
};

export function normalizeTargetUrl(value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("A valid target URL is required");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http(s) URLs are supported");
  }

  return parsed.toString();
}

export function normalizeMethod(value?: string): ProxyMethod {
  const nextMethod = (value ?? "GET").toUpperCase();

  if (!ALLOWED_METHODS.has(nextMethod)) {
    throw new Error("Unsupported HTTP method");
  }

  return nextMethod as ProxyMethod;
}

export function buildProxyRequestInit(input: ProxyRequestInput): RequestInit {
  const method = normalizeMethod(input.method);
  const headers = sanitizeRequestHeaders(input.headers);
  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (BODY_METHODS.has(method) && input.body) {
    requestInit.body = input.body;
  }

  return requestInit;
}

export function sanitizeRequestHeaders(headers?: HeadersInit): Record<string, string> {
  const nextHeaders = new Headers(headers);
  const blockedHeaders = ["host", "content-length"];

  for (const blockedHeader of blockedHeaders) {
    nextHeaders.delete(blockedHeader);
  }

  return Object.fromEntries(nextHeaders.entries());
}

export function filterResponseHeaders(headers: Headers): Record<string, string> {
  return SAFE_RESPONSE_HEADERS.reduce<Record<string, string>>((accumulator, headerName) => {
    const value = headers.get(headerName);

    if (value) {
      accumulator[headerName] = value;
    }

    return accumulator;
  }, {});
}

export function createErrorPayload(
  error: string,
  message: string,
  status: number,
): ProxyErrorPayload {
  return { error, message, status };
}
