"use client";

// Leaflet map with free tiles (no API key). Loaded client-side only (components/Map.tsx).

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { meHtml } from "@/lib/markers";
import type { LatLng } from "@/lib/types";
import { MAP_STYLES, type MapStyle } from "@/lib/mapStyles";

export type MapMarker = {
  id: string;
  position: LatLng;
  html: string;
  size: [number, number];
  anchor?: [number, number];
  label: string;
  onClick?: () => void;
  z?: number;
};

type Props = {
  center: LatLng;
  zoom?: number;
  style?: MapStyle;
  userLocation?: LatLng | null;
  markers?: MapMarker[];
  route?: [number, number][] | null;
  fitTo?: LatLng[] | null;
  fitPadding?: { top: number; bottom: number };
  recenterKey?: number;
  onViewChange?: (v: { zoom: number; center: LatLng }) => void;
  onMapClick?: () => void;
  interactive?: boolean;
  threeD?: boolean;
};

function Events({ onViewChange, onMapClick }: Pick<Props, "onViewChange" | "onMapClick">) {
  const map = useMapEvents({
    moveend: () => emit(),
    zoomend: () => emit(),
    click: () => onMapClick?.(),
  });
  function emit() {
    const c = map.getCenter();
    onViewChange?.({ zoom: map.getZoom(), center: { lat: c.lat, lng: c.lng } });
  }
  useEffect(() => { emit(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Controller({ center, zoom, fitTo, fitPadding, recenterKey }: Pick<Props, "center" | "zoom" | "fitTo" | "fitPadding" | "recenterKey">) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 17), {
      animate: true,
      duration: 1.25,
      easeLinearity: 0.2,
    });
  }, [recenterKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const key = fitTo?.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");
  useEffect(() => {
    if (fitTo && fitTo.length > 1) {
      const h = map.getSize().y;
      map.fitBounds(L.latLngBounds(fitTo.map((p) => [p.lat, p.lng])), {
        paddingTopLeft: [36, fitPadding?.top ?? 170],
        paddingBottomRight: [36, fitPadding?.bottom ?? Math.round(h * 0.35)],
        maxZoom: 17,
      });
    } else if (fitTo && fitTo.length === 1) {
      map.flyTo([fitTo[0].lat, fitTo[0].lng], Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapCanvas({
  center, zoom = 15, style = "voyager", userLocation, markers = [], route, fitTo, fitPadding, recenterKey, onViewChange, onMapClick, interactive = true, threeD = false,
}: Props) {
  const meIcon = useMemo(() => L.divIcon({ className: "mk", html: meHtml(!!recenterKey), iconSize: [150, 150], iconAnchor: [75, 75] }), [recenterKey]);
  const tiles = MAP_STYLES[style];
  return (
    <MapContainer
      className={threeD ? "map-canvas-3d" : "map-canvas-2d"}
      center={[center.lat, center.lng]}
      zoom={zoom}
      zoomControl={false}
      attributionControl={false}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      keyboard={interactive}
      style={{ position: "absolute", inset: 0 }}
    >
      <TileLayer key={style} url={tiles.url} attribution={tiles.attribution} maxZoom={19} detectRetina />
      <Events onViewChange={onViewChange} onMapClick={onMapClick} />
      <Controller center={center} zoom={zoom} fitTo={fitTo} fitPadding={fitPadding} recenterKey={recenterKey} />
      {route && route.length > 1 && (
        <>
          <Polyline positions={route} pathOptions={{ color: "#ffffff", weight: 11 }} />
          <Polyline positions={route} pathOptions={{ color: "#2F6BFF", weight: 6 }} />
        </>
      )}
      {userLocation && <Marker key={`me-${recenterKey ?? 0}`} position={[userLocation.lat, userLocation.lng]} icon={meIcon} interactive={false} keyboard={false} zIndexOffset={-1000} />}
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.position.lat, m.position.lng]}
          title={m.label}
          alt={m.label}
          zIndexOffset={m.z ?? 0}
          icon={L.divIcon({ className: "mk", html: m.html, iconSize: m.size, iconAnchor: m.anchor ?? [m.size[0] / 2, m.size[1] / 2] })}
          eventHandlers={m.onClick ? {
            click: (e) => { L.DomEvent.stopPropagation(e); m.onClick?.(); },
            keypress: (e) => { if ((e.originalEvent as KeyboardEvent).key === "Enter") m.onClick?.(); },
          } : undefined}
        />
      ))}
    </MapContainer>
  );
}
