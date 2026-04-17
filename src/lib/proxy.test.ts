import { describe, expect, test } from "bun:test";
import {
  buildProxyRequestInit,
  createErrorPayload,
  filterResponseHeaders,
  normalizeTargetUrl,
} from "./proxy";

describe("normalizeTargetUrl", () => {
  test("accepts a valid https url", () => {
    expect(normalizeTargetUrl("https://example.com/data")).toBe("https://example.com/data");
  });

  test("rejects a non-http protocol", () => {
    expect(() => normalizeTargetUrl("ftp://example.com/file")).toThrow(
      "Only http(s) URLs are supported",
    );
  });
});

describe("buildProxyRequestInit", () => {
  test("creates a POST request with headers and body", () => {
    const result = buildProxyRequestInit({
      method: "post",
      headers: { Authorization: "Bearer token" },
      body: '{"hello":"world"}',
    });

    expect(result.method).toBe("POST");
    expect(result.headers).toEqual({ authorization: "Bearer token" });
    expect(result.body).toBe('{"hello":"world"}');
  });

  test("omits body for GET requests", () => {
    const result = buildProxyRequestInit({
      method: "GET",
      headers: {},
      body: "ignored",
    });

    expect(result.method).toBe("GET");
    expect(result.body).toBeUndefined();
  });

  test("adds the default user-agent when headers are not provided at all", () => {
    const result = buildProxyRequestInit({
      method: "GET",
    });

    expect(result.headers).toEqual({
      "user-agent": "mihomo.party/v1.9.4 (clash.meta)",
    });
  });

  test("does not add the default user-agent when headers are explicitly provided", () => {
    const result = buildProxyRequestInit({
      method: "GET",
      headers: {},
    });

    expect(result.headers).toEqual({});
  });
});

describe("filterResponseHeaders", () => {
  test("keeps safe upstream headers", () => {
    const headers = new Headers({
      "content-type": "application/json",
      "cache-control": "no-cache",
      "set-cookie": "unsafe=true",
    });

    expect(filterResponseHeaders(headers)).toEqual({
      "cache-control": "no-cache",
      "content-type": "application/json",
    });
  });
});

describe("createErrorPayload", () => {
  test("returns a normalized error shape", () => {
    expect(createErrorPayload("invalid_request", "Bad input", 400)).toEqual({
      error: "invalid_request",
      message: "Bad input",
      status: 400,
    });
  });
});
