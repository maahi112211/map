"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Bed, CircleDot, Coffee, Hash, Image as ImageIcon, Landmark, Layers, MapPin, Martini,
  Navigation, Search, ShoppingBag, Trees, Users, UtensilsCrossed, WifiOff
} from "lucide-react";
import Map, { type MapMarker, type MapStyle } from "@/components/Map";
import { HashtagSheet, MapStyleSheet, PlaceCard, ProfileSheet } from "@/components/sheets";
import { BottomNav } from "@/components/ui";
import { distanceKm } from "@/lib/geo";
import { chitHtml, clusterByPixels, friendHtml, placeHtml, storyHtml, tagHtml } from "@/lib/markers";
import type { Feed, Hashtag, LatLng, Place, PlaceCategory, User } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { qs, useLocation } from "@/lib/useLocation";

type FilterKey =
  | "story"
  | "chits"
  | "chats"
  | "friends"
  | PlaceCategory;

const FILTER_CHIPS: { key: FilterKey | null; label: string; Icon?: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { key: null, label: "All" },
  { key: "story", label: "Story", Icon: CircleDot },
  { key: "chits", label: "Chits", Icon: ImageIcon },
  { key: "chats", label: "Chats", Icon: Hash },
  { key: "friends", label: "Friends", Icon: Users },
  { key: "park", label: "Parks", Icon: Trees },
  { key: "coffee", label: "Coffee", Icon: Coffee },
  { key: "restaurant", label: "Restaurants", Icon: UtensilsCrossed },
  { key: "hotel", label: "Hotels", Icon: Bed },
  { key: "bar", label: "Bars", Icon: Martini },
  { key: "museum", label: "Museums", Icon: Landmark },
  { key: "shop", label: "Shops", Icon: ShoppingBag },
];

// 03 · Discovery map — stories, chits, hashtag chats, friends and places.
function DiscoveryMapContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const targetUsername = sp.get("person") || sp.get("user");
  const targetPlaceId = sp.get("place");
  const targetTag = sp.get("tag");
  const loc = useLocation({ watch: true });
  const [area, setArea] = useState<LatLng | null>(null);
  const [filter, setFilter] = useState<FilterKey | null>(null);
  const [storyGroup, setStoryGroup] = useState<"people" | "hashtag">("people");
  const [view, setView] = useState({ zoom: 15, center: loc.center });
  const [recenter, setRecenter] = useState(0);
  const [style, setStyle] = useState<MapStyle>("voyager");
  const [showStyle, setShowStyle] = useState(false);
  const [threeD, setThreeD] = useState(false);
  const [tag, setTag] = useState<Hashtag | null>(null);
  const [person, setPerson] = useState<User | null>(null);
  const [place, setPlace] = useState<Place | null>(null);

  const chipsRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const movedRef = useRef(false);

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!chipsRef.current) return;
    isDraggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.pageX;
    startScrollRef.current = chipsRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !chipsRef.current) return;
    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 4) {
      movedRef.current = true;
      chipsRef.current.scrollLeft = startScrollRef.current - dx;
    }
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => { if (loc.ready && !area) setArea(loc.center); }, [loc.ready, loc.center, area]);
  useEffect(() => { try { const s = localStorage.getItem("openone.mapStyle") as MapStyle | null; if (s) setStyle(s); } catch {} }, []);
  useEffect(() => { try { setThreeD(localStorage.getItem("openone.map3d") === "true"); } catch {} }, []);
  const changeStyle = (s: MapStyle) => { setStyle(s); try { localStorage.setItem("openone.mapStyle", s); } catch {} };
  const toggleThreeD = () => setThreeD((value) => {
    const next = !value;
    try { localStorage.setItem("openone.map3d", String(next)); } catch {}
    return next;
  });

  const areaQuery = area ? qs(area) : null;
  const { data: feed, error, saved, retry, useSaved } = useApi<Feed>(areaQuery ? `/api/feed?${areaQuery}` : null, areaQuery ? `feed:${areaQuery}` : "feed");
  const offline = !!error && !!saved;
  useEffect(() => { if (offline) useSaved(); }, [offline]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!feed) return;
    if (targetUsername && !person) {
      const u = feed.people.find((p) => p.username === targetUsername);
      if (u) {
        setPerson(u);
        if (u.location) {
          setArea(u.location);
          setRecenter((k) => k + 1);
        }
      }
    }
    if (targetPlaceId && !place) {
      const p = feed.places.find((x) => x.id === targetPlaceId);
      if (p) {
        setPlace(p);
        if (p.location) {
          setArea(p.location);
          setRecenter((k) => k + 1);
        }
      }
    }
    if (targetTag && !tag) {
      const t = feed.hashtags.find((h) => h.tag === targetTag.replace(/^#/, ""));
      if (t) {
        setTag(t);
        if (t.location) {
          setArea(t.location);
          setRecenter((k) => k + 1);
        }
      }
    }
  }, [feed, targetUsername, targetPlaceId, targetTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const markers = useMemo<MapMarker[]>(() => {
    if (!feed) return [];
    const z = view.zoom;

    const getStories = (list: typeof feed.stories) =>
      clusterByPixels(list, z, 44).map((g) => ({
        id: `s-${g.map((x) => x.id).join("-")}`,
        position: g[0].location,
        html: storyHtml(g),
        size: [70, 70] as [number, number],
        z: 100,
        label: `Story by ${g[0].user.name}${g.length > 1 ? ` and ${g.length - 1} more` : ""}`,
        onClick: () => router.push(`/story/${g[0].id}`),
      }));

    const getChits = () =>
      clusterByPixels(feed.chits, z, 56).map((g, i) => ({
        id: `c-${g.map((x) => x.id).join("-")}`,
        position: g[0].location,
        html: chitHtml(g, i),
        size: [64, 84] as [number, number],
        z: 100,
        label: `${g.length > 1 ? `${g.length} chits` : "Chit"} by ${g[0].user.name}`,
        onClick: () => router.push(`/chit/${g[0].id}`),
      }));

    const getChats = () =>
      clusterByPixels(feed.hashtags, z, 60).map((g) => ({
        id: `h-${g.map((x) => x.tag).join("-")}`,
        position: g[0].location,
        html: tagHtml(g[0], g.length),
        size: [60, 60] as [number, number],
        z: 60,
        label: `#${g[0].name}${g.length > 1 ? ` and ${g.length - 1} more` : ""}`,
        onClick: () => setTag(g[0]),
      }));

    const getFriends = () =>
      feed.people.map((p) => ({
        id: `f-${p.id}`,
        position: p.location,
        html: friendHtml(p),
        size: [48, 48] as [number, number],
        z: 70,
        label: `${p.name} is here`,
        onClick: () => setPerson(p),
      }));

    const getPlaces = (list = feed.places) =>
      list.map((p) => ({
        id: `p-${p.id}`,
        position: p.location,
        html: placeHtml(p, place?.id === p.id),
        size: (place?.id === p.id ? [48, 48] : [42, 42]) as [number, number],
        z: place?.id === p.id ? 500 : 0,
        label: p.name,
        onClick: () => setPlace(p),
      }));

    if (targetPlaceId && place) return getPlaces([place]);

    switch (filter) {
      case "story":
        return getStories(feed.stories.filter((s) => s.group === storyGroup));
      case "chits":
        return getChits();
      case "chats":
        return getChats();
      case "friends":
        return getFriends();
      case "park":
      case "coffee":
      case "restaurant":
      case "hotel":
      case "bar":
      case "museum":
      case "shop":
        return getPlaces(feed.places.filter((p) => p.category === filter));
      default:
        return [
          ...getPlaces(),
          ...getFriends(),
          ...getChats(),
          ...getChits(),
          ...getStories(feed.stories),
        ];
    }
  }, [feed, filter, storyGroup, view.zoom, place, router, targetPlaceId]);

  const movedFar = area && distanceKm(area, view.center) > 1;

  return (
    <main className="screen" style={{ overflow: "hidden" }}>
      {loc.ready && (
        <Map center={loc.center} zoom={15} style={style} userLocation={loc.coords} markers={markers} recenterKey={recenter} threeD={threeD}
          onViewChange={setView} onMapClick={() => { if (!targetPlaceId) setPlace(null); }} />
      )}

      {!targetPlaceId && <div className="map-orientation-controls" aria-label="Map orientation controls">
        <div className="map-compass" aria-label="Compass, north is up">
          <b>N</b><span className="east">E</span><span className="south">S</span><span className="west">W</span><i />
        </div>
        <button type="button" className="map-dimension-toggle" aria-pressed={threeD} onClick={toggleThreeD}>
          {threeD ? "2D" : "3D"}
        </button>
      </div>}

      {!targetPlaceId && <div className="map-overlay stack" style={{ top: "var(--sat, 54px)", gap: 12 }}>
        <div className="row-c" style={{ gap: 10 }}>
          <Link href="/search" className="search-pill grow"><Search size={20} strokeWidth={2} color="var(--ink-2)" />Search places, people</Link>
          <button className="round" style={{ width: 52, height: 52 }} aria-label="Map style" onClick={() => setShowStyle(true)}><Layers size={22} /></button>
        </div>
        <div
          ref={chipsRef}
          className="chips"
          role="toolbar"
          aria-label="Show on map"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {FILTER_CHIPS.map(({ key, label, Icon }) => (
            <button
              key={key ?? "all"}
              className="chip"
              aria-pressed={filter === key}
              onClick={(e) => {
                if (movedRef.current) {
                  e.preventDefault();
                  return;
                }
                setFilter((prev) => (prev === key ? null : key));
                setPlace(null);
              }}
            >
              {Icon && <Icon size={18} strokeWidth={2} />}{label}
            </button>
          ))}
        </div>

        {offline && (
          <div className="banner" role="status"><WifiOff size={16} />Showing your last saved map while we reconnect.<button className="link-blue" style={{ marginLeft: "auto" }} onClick={retry}>Retry</button></div>
        )}
        {error && !saved && (
          <div className="banner" role="alert"><WifiOff size={16} />Couldn&apos;t load the map.<button className="link-blue" style={{ marginLeft: "auto" }} onClick={retry}>Try again</button></div>
        )}
        {loc.ready && loc.status !== "granted" && (
          <div className="banner" style={{ background: "var(--blue-soft)", color: "var(--ink-2)" }}>
            <Navigation size={16} color="var(--blue)" />Location is off — showing a default city.
            <button className="link-blue" style={{ marginLeft: "auto" }} onClick={async () => { const s = await loc.request(); if (s.coords) { setArea(s.coords); setRecenter((k) => k + 1); } }}>Turn on</button>
          </div>
        )}
        {movedFar && <button className="chip on" style={{ alignSelf: "center" }} onClick={() => setArea(view.center)}>Search this area</button>}
      </div>}

      {targetPlaceId && (
        <button
          type="button"
          className="round"
          aria-label="Back"
          onClick={() => (window.history.length > 1 ? router.back() : router.push(`/place/${encodeURIComponent(targetPlaceId)}`))}
          style={{ position: "absolute", left: 18, top: "var(--sat, 54px)", zIndex: 700, width: 48, height: 48 }}
        >
          <ArrowLeft size={23} />
        </button>
      )}

      {filter === "story" && !place && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, zIndex: 600, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div className="segmented" style={{ pointerEvents: "auto" }} role="group" aria-label="Whose stories">
            <button aria-pressed={storyGroup === "people"} onClick={() => setStoryGroup("people")}>Peoples</button>
            <button aria-pressed={storyGroup === "hashtag"} onClick={() => setStoryGroup("hashtag")}>Chats</button>
          </div>
        </div>
      )}

      {!place && (
        <button className={`round ${loc.status === "granted" ? "dark" : ""}`} style={{ position: "absolute", right: 16, bottom: 96, zIndex: 600, width: 52, height: 52 }}
          aria-label="Go to my live location" onClick={async () => {
            const result = loc.status === "granted" ? { coords: loc.coords } : await loc.request();
            if (result.coords) {
              setArea(result.coords);
              setRecenter((k) => k + 1);
            }
          }}>
          <Navigation size={21} fill={loc.status === "granted" ? "currentColor" : "none"} />
        </button>
      )}

      {targetPlaceId && place && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}&travelmode=driving`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn dark"
          style={{ position: "absolute", left: "50%", bottom: 190, zIndex: 690, transform: "translateX(-50%)", borderRadius: 999, paddingInline: 22, whiteSpace: "nowrap" }}
        >
          <Navigation size={18} fill="currentColor" />Get directions
        </a>
      )}

      {place && feed && <PlaceCard place={place} from={loc.center} onClose={() => targetPlaceId ? router.back() : setPlace(null)} bottom={targetPlaceId ? 24 : 96} variant={targetPlaceId ? "compact" : "hours"} />}

      {!targetPlaceId && <BottomNav />}

      {tag && <HashtagSheet tag={tag} onClose={() => setTag(null)} />}
      {person && <ProfileSheet user={person} storyId={feed?.stories.find((s) => s.user.id === person.id)?.id} onClose={() => setPerson(null)} />}
      {showStyle && <MapStyleSheet value={style} onChange={changeStyle} onClose={() => setShowStyle(false)} />}
    </main>
  );
}

export default function DiscoveryMap() {
  return (
    <Suspense>
      <DiscoveryMapContent />
    </Suspense>
  );
}
