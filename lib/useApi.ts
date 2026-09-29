"use client";

import { useCallback, useEffect, useState } from "react";

const PREFIX = "openone.cache:";

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeCache(key: string, v: unknown) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(v));
  } catch { /* quota / private mode */ }
}

/**
 * Fetch JSON with "last saved results" support (screen 19):
 * on failure, `saved` holds the previous good response for the same cache key.
 */
export function useApi<T>(url: string | null, cacheKey?: string) {
  const key = cacheKey ?? url ?? "";
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<T | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    const cached = readCache<T>(key);
    setSaved(cached);
    setData(cached);
    setLoading(true);
    setError(null);
    fetch(url, { signal: ctrl.signal })
      .then(async (r) => {
        if (r.status === 404) throw Object.assign(new Error("not found"), { notFound: true });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as T;
      })
      .then((d) => {
        setData(d);
        writeCache(key, d);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.notFound ? "not-found" : "network");
        setSaved(cached);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [url, key, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  const useSaved = useCallback(() => {
    if (saved) {
      setData(saved);
      setError(null);
    }
  }, [saved]);

  return { data, error, loading, saved, retry, useSaved };
}
