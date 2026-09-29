"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so it must only load in the browser.
const Map = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => <div className="map-loading" aria-hidden="true" />,
});

export default Map;
export type { MapMarker } from "./MapCanvas";
export { MAP_STYLES, type MapStyle } from "@/lib/mapStyles";
