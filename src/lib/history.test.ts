import { describe, expect, test } from "bun:test";
import { mergeHistoryEntry } from "./history";

describe("mergeHistoryEntry", () => {
  test("adds a new entry to the top of history", () => {
    const history = mergeHistoryEntry(
      [],
      {
        url: "https://example.com",
        method: "GET",
        headers: "{}",
        body: "",
      },
      1000,
    );

    expect(history).toHaveLength(1);
    expect(history[0]?.url).toBe("https://example.com");
    expect(history[0]?.timestamp).toBe(1000);
  });

  test("deduplicates an existing entry and refreshes timestamp", () => {
    const history = mergeHistoryEntry(
      [
        {
          id: "older",
          url: "https://example.com",
          method: "GET",
          headers: "{}",
          body: "",
          timestamp: 1,
        },
      ],
      {
        url: "https://example.com",
        method: "GET",
        headers: "{}",
        body: "",
      },
      2000,
    );

    expect(history).toHaveLength(1);
    expect(history[0]?.timestamp).toBe(2000);
    expect(history[0]?.id).not.toBe("older");
  });

  test("caps history at 12 entries", () => {
    const current = Array.from({ length: 12 }, (_, index) => ({
      id: `entry-${index}`,
      url: `https://example.com/${index}`,
      method: "GET" as const,
      headers: "{}",
      body: "",
      timestamp: index,
    }));

    const history = mergeHistoryEntry(
      current,
      {
        url: "https://example.com/new",
        method: "POST",
        headers: '{"x":"1"}',
        body: "body",
      },
      3000,
    );

    expect(history).toHaveLength(12);
    expect(history[0]?.url).toBe("https://example.com/new");
    expect(history.at(-1)?.url).toBe("https://example.com/10");
  });
});
