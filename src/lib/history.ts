export type HistoryMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HistorySeed = {
  url: string;
  method: HistoryMethod;
  headers: string;
  body: string;
};

export type HistoryEntry = HistorySeed & {
  id: string;
  timestamp: number;
};

const HISTORY_LIMIT = 12;

export function mergeHistoryEntry(
  history: HistoryEntry[],
  nextEntry: HistorySeed,
  timestamp: number,
): HistoryEntry[] {
  const normalizedKey = createHistoryKey(nextEntry);
  const filteredEntries = history.filter((entry) => createHistoryKey(entry) !== normalizedKey);
  const entry: HistoryEntry = {
    ...nextEntry,
    id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
  };

  return [entry, ...filteredEntries].slice(0, HISTORY_LIMIT);
}

export function createHistoryKey(entry: HistorySeed): string {
  return JSON.stringify([
    entry.url.trim(),
    entry.method,
    entry.headers.trim(),
    entry.body.trim(),
  ]);
}
