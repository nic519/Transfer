import { describe, expect, test } from "bun:test";
import {
  createStandardPayload,
  extractErrorMessage,
  getProxyLink,
  getResponseStats,
  isHeadersJsonValid,
  isSupportedHttpUrl,
  toggleActivePanel,
} from "./home";

describe("isSupportedHttpUrl", () => {
  test("accepts valid http and https urls", () => {
    expect(isSupportedHttpUrl("http://example.com")).toBe(true);
    expect(isSupportedHttpUrl("https://example.com/api")).toBe(true);
  });

  test("rejects empty or unsupported urls", () => {
    expect(isSupportedHttpUrl("")).toBe(false);
    expect(isSupportedHttpUrl("ftp://example.com/file")).toBe(false);
    expect(isSupportedHttpUrl("not-a-url")).toBe(false);
  });
});

describe("isHeadersJsonValid", () => {
  test("accepts empty values and json objects", () => {
    expect(isHeadersJsonValid("")).toBe(true);
    expect(isHeadersJsonValid('{"Authorization":"Bearer token"}')).toBe(true);
  });

  test("rejects invalid json and arrays", () => {
    expect(isHeadersJsonValid("{")).toBe(false);
    expect(isHeadersJsonValid('["x-test"]')).toBe(false);
  });
});

describe("getResponseStats", () => {
  test("returns chars, lines, and bytes", () => {
    expect(getResponseStats("hello\nworld")).toEqual({
      chars: 11,
      lines: 2,
      bytes: 11,
    });
  });
});

describe("getProxyLink", () => {
  test("builds a GET shortcut only for valid urls", () => {
    expect(getProxyLink("https://relay.test", "https://example.com/data")).toBe(
      "https://relay.test/api/proxy?url=https%3A%2F%2Fexample.com%2Fdata",
    );
    expect(getProxyLink("https://relay.test", "bad-url")).toBe("");
  });
});

describe("createStandardPayload", () => {
  test("uses parsed headers and request body", () => {
    expect(
      createStandardPayload("https://example.com", "POST", '{"x-test":"1"}', '{"ok":true}'),
    ).toBe(`{
  "url": "https://example.com",
  "method": "POST",
  "headers": {
    "x-test": "1"
  },
  "body": "{\\"ok\\":true}"
}`);
  });
});

describe("toggleActivePanel", () => {
  test("opens a panel and closes it when clicked again", () => {
    expect(toggleActivePanel(null, "history")).toBe("history");
    expect(toggleActivePanel("history", "history")).toBeNull();
    expect(toggleActivePanel("history", "guide")).toBe("guide");
  });
});

describe("extractErrorMessage", () => {
  test("returns the parsed message when payload is valid json", () => {
    expect(extractErrorMessage('{"message":"Request failed"}')).toBe("Request failed");
  });

  test("returns null for non json payloads", () => {
    expect(extractErrorMessage("<html>bad gateway</html>")).toBeNull();
  });
});
