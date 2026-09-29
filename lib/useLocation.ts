"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CENTER } from "./geo";
import type { LatLng } from "./types";

type Status = "unknown" | "granted" | "denied" | "unavailable";
type Saved = { status: Status; coords?: LatLng; at?: number };

const KEY = "openone.location";

function read(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : { status: "unknown" };
  } catch {
    return { status: "unknown" };
  }
}

function write(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode — ignore */
  }
}

/**
 * The viewer's location. `center` is always usable (falls back to a default
 * city) so screens can render even without permission.
 */
export function useLocation({ watch = false }: { watch?: boolean } = {}) {
  const [saved, setSaved] = useState<Saved>({ status: "unknown" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(read());
    setReady(true);
  }, []);

  const update = useCallback((s: Saved) => {
    setSaved(s);
    write(s);
  }, []);

  const request = useCallback(
    () =>
      new Promise<Saved>((resolve) => {
        if (!("geolocation" in navigator)) {
          const s: Saved = { status: "unavailable" };
          update(s);
          return resolve(s);
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const s: Saved = {
              status: "granted",
              coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              at: Date.now(),
            };
            update(s);
            resolve(s);
          },
          (err) => {
            const s: Saved = { status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" };
            update(s);
            resolve(s);
          },
          { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
        );
      }),
    [update],
  );

  const decline = useCallback(() => update({ status: "denied" }), [update]);

  // Keep the blue dot fresh on the map screen.
  useEffect(() => {
    if (!watch || saved.status !== "granted" || !("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        update({ status: "granted", coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }, at: Date.now() }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [watch, saved.status, update]);

  return {
    ready,
    status: saved.status,
    coords: saved.coords ?? null,
    center: saved.coords ?? DEFAULT_CENTER,
    request,
    decline,
  };
}

export function qs(center: LatLng) {
  return `lat=${center.lat.toFixed(5)}&lng=${center.lng.toFixed(5)}`;
}
