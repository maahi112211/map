"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { CloudOff, Hash, Image as ImageIcon, List, Map as MapIcon, MapPin, SearchX, SlidersHorizontal, Users } from "lucide-react";
import Map, { type MapMarker } from "@/components/Map";
import { ChitGrid, HashtagRow, PersonRow, PlaceRow } from "@/components/ResultRows";
import { SearchBar } from "@/components/SearchBar";
import { HashtagSheet, PlaceCard, ProfileSheet } from "@/components/sheets";
import { BackButton, CATEGORY_LABEL } from "@/components/ui";
import { activeFilterCount, DEFAULT_FILTERS, filtersToParams, parseFilters } from "@/lib/filters";
import { chitHtml, friendHtml, placeHtml, tagHtml } from "@/lib/markers";
import { addRecent } from "@/lib/recent";
import type { Hashtag, LatLng, Person, Place, SearchResults, User } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { qs, useLocation } from "@/lib/useLocation";

type Tab = "all" | "places" | "people" | "chits" | "hashtags";
const TABS: { key: Tab; label: string; Icon?: typeof Hash }[] = [
  { key: "all", label: "All" },
  { key: "places", label: "Places", Icon: MapPin },
  { key: "people", label: "People", Icon: Users },
  { key: "chits", label: "Chits", Icon: ImageIcon },
  { key: "hashtags", label: "Chats", Icon: Hash },
];

function Results() {
  const router = useRouter();
  const sp = useSearchParams();
  const loc = useLocation();
  const q = sp.get("q") ?? "";
  const tab = (sp.get("tab") as Tab) || "all";
  const view = sp.get("view") === "map" ? "map" : "list";
  const filters = parseFilters(new URLSearchParams(sp.toString()));
  const [draft, setDraft] = useState(q);
  const [selected, setSelected] = useState<Place | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<User | null>(null);
  const [selectedTag, setSelectedTag] = useState<Hashtag | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, moved: false, x: 0, scroll: 0 });
  useEffect(() => setDraft(q), [q]);

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [view]);

  const chipDrag = {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!chipsRef.current) return;
      dragRef.current = { active: true, moved: false, x: e.pageX, scroll: chipsRef.current.scrollLeft };
    },
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag.active || !chipsRef.current) return;
      const dx = e.pageX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      if (drag.moved) chipsRef.current.scrollLeft = drag.scroll - dx;
    },
    onMouseUp: () => { dragRef.current.active = false; },
    onMouseLeave: () => { dragRef.current.active = false; },
    onClickCapture: (e: React.MouseEvent<HTMLDivElement>) => {
      if (dragRef.current.moved) {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current.moved = false;
      }
    },
  };

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v == null ? next.delete(k) : next.set(k, v)));
    router.replace(`/search/results?${next.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const nextQuery = draft.trim();
    if (nextQuery === q) return;
    const timer = setTimeout(() => {
      if (!nextQuery) {
        router.replace("/search");
        return;
      }
      const next = new URLSearchParams(sp.toString());
      next.set("q", nextQuery);
      next.delete("cat");
      setSelected(null);
      router.replace(`/search/results?${next.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, q, router, sp]);

  const apiParams = filtersToParams(filters, new URLSearchParams({ q }));
  const locationQuery = qs(loc.center);
  const url = loc.ready ? `/api/search?${apiParams.toString()}&${locationQuery}` : null;
  const { data, error, loading, saved, retry, useSaved } = useApi<SearchResults>(url, `search:${apiParams.toString()}:${locationQuery}`);

  const empty = data && !data.places.length && !data.people.length && !data.hashtags.length && !data.chits.length;
  const resultsCenter = data?.searchCenter ?? loc.center;
  const nFilters = activeFilterCount(filters);
  const categoryOnly = !!filters.category && (!q || q.toLowerCase().startsWith(filters.category.slice(0, 3)));

  const markers = useMemo<MapMarker[]>(() => {
    if (!data) return [];
    const list: MapMarker[] = [];

    // Places
    if (tab === "all" || tab === "places") {
      data.places.forEach((p) => {
        list.push({
          id: `p-${p.id}`,
          position: p.location,
          html: placeHtml(p, selected?.id === p.id),
          size: selected?.id === p.id ? [48, 48] : [42, 42],
          z: selected?.id === p.id ? 500 : 0,
          label: `${p.name}${p.rating ? `, rated ${p.rating}` : ""}`,
          onClick: () => {
            setSelected(p);
            setSelectedPerson(null);
            setSelectedTag(null);
          },
        });
      });
    }

    // People
    if (tab === "all" || tab === "people") {
      data.people.forEach((u) => {
        if (!u.location) return;
        list.push({
          id: `u-${u.id}`,
          position: u.location,
          html: friendHtml(u as Person),
          size: [48, 48],
          z: selectedPerson?.id === u.id ? 500 : 70,
          label: `${u.name} is here`,
          onClick: () => {
            setSelectedPerson(u);
            setSelected(null);
            setSelectedTag(null);
          },
        });
      });
    }

    // Hashtags
    if (tab === "all" || tab === "hashtags") {
      data.hashtags.forEach((h) => {
        if (!h.location) return;
        list.push({
          id: `h-${h.tag}`,
          position: h.location,
          html: tagHtml(h),
          size: [60, 60],
          z: selectedTag?.tag === h.tag ? 500 : 60,
          label: `#${h.name}`,
          onClick: () => {
            setSelectedTag(h);
            setSelected(null);
            setSelectedPerson(null);
          },
        });
      });
    }

    // Chits
    if (tab === "all" || tab === "chits") {
      data.chits.forEach((c, i) => {
        if (!c.location) return;
        list.push({
          id: `c-${c.id}`,
          position: c.location,
          html: chitHtml([c], i),
          size: [64, 84],
          z: 100,
          label: `Chit by ${c.user.name}`,
          onClick: () => router.push(`/chit/${c.id}`),
        });
      });
    }

    return list;
  }, [data, tab, selected, selectedPerson, selectedTag, router]);

  const fitPoints = useMemo(() => {
    if (!data) return null;
    const pts: LatLng[] = [];
    if (tab === "all" || tab === "places") pts.push(...data.places.map((p) => p.location));
    if (tab === "all" || tab === "people") pts.push(...data.people.filter((p) => p.location).map((p) => p.location!));
    if (tab === "all" || tab === "hashtags") pts.push(...data.hashtags.filter((h) => h.location).map((h) => h.location));
    if (tab === "all" || tab === "chits") pts.push(...data.chits.filter((c) => c.location).map((c) => c.location));
    if (!pts.length) return null;
    return pts;
  }, [data, tab]);

  // Pick the nearest place by default on the map view only if viewing places (07)
  useEffect(() => {
    if (view === "map" && !selected && !selectedPerson && !selectedTag) {
      if ((tab === "all" || tab === "places") && data?.places.length) {
        setSelected(data.places[0]);
      }
    }
  }, [view, data, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => { if (!draft.trim()) return; addRecent(draft); setParams({ q: draft.trim(), cat: null }); };
  const filtersHref = `/search/filters?${sp.toString()}`;

  // ---------- 19 · Recoverable error ----------
  if (error === "network" && !data) {
    return (
      <main className="screen pad" style={{ background: "var(--bg)" }}>
        <SearchBar value={draft} onChange={setDraft} onSubmit={submit} quiet />
        {saved && <div className="banner" style={{ marginTop: 14 }}><CloudOff size={16} />Showing your last saved map while we reconnect.</div>}
        <div className="state">
          <span className="state-ic" style={{ background: "var(--red-soft)", color: "var(--red)" }}><CloudOff size={34} /></span>
          <h1 className="h2">We couldn&apos;t refresh results</h1>
          <p className="t-sm muted" style={{ margin: 0, maxWidth: 280 }}>Your filters are safe. Check your connection and try again.</p>
          <button className="btn dark block" style={{ marginTop: 18 }} onClick={retry}>Try again</button>
          {saved && <button className="btn outline block" onClick={useSaved}>Continue with saved results</button>}
        </div>
      </main>
    );
  }

  // ---------- 18 · No results ----------
  if (empty) {
    return (
      <main className="screen pad" style={{ background: "var(--bg)" }}>
        <SearchBar value={draft} onChange={setDraft} onSubmit={submit} />
        <div className="state" style={{ paddingTop: 120 }}>
          <span className="state-ic" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}><SearchX size={34} /></span>
          <h1 className="h2">No matches nearby</h1>
          <p className="t-sm muted" style={{ margin: 0, maxWidth: 280 }}>Try a broader phrase, remove a filter, or search a different area.</p>
          {nFilters > 0 && <button className="btn dark block" style={{ marginTop: 18 }} onClick={() => router.replace(`/search/results?${filtersToParams(DEFAULT_FILTERS, new URLSearchParams({ q })).toString()}`)}>Clear filters</button>}
          <Link href="/map" className={`btn ${nFilters ? "outline" : "dark"} block`} style={nFilters ? undefined : { marginTop: 18 }}>Search another area</Link>
        </div>
      </main>
    );
  }

  // ---------- 07 · Results map / 11 · Place result ----------
  if (view === "map") {
    const quick = [
      { label: "Open now", on: filters.openNow, toggle: () => setParams({ open: filters.openNow ? null : "1" }) },
      { label: categoryOnly ? "4.5+" : "Top rated", on: filters.minRating >= 4.5, toggle: () => setParams({ rating: filters.minRating >= 4.5 ? null : "4.5" }) },
      categoryOnly
        ? { label: "Friends visited", on: filters.friends, toggle: () => setParams({ friends: filters.friends ? null : "1" }) }
        : { label: "Under 2 km", on: filters.km <= 2, toggle: () => setParams({ km: filters.km <= 2 ? null : "2" }) },
    ];
    const hasOverlayOpen = !!(selected || selectedPerson || selectedTag);
    return (
      <main className="screen" style={{ overflow: "hidden" }}>
        {loc.ready && (
          <Map center={resultsCenter} zoom={14} userLocation={loc.coords} markers={markers}
            fitTo={fitPoints}
            fitPadding={{ top: 170, bottom: 300 }} onMapClick={() => { setSelected(null); setSelectedPerson(null); setSelectedTag(null); }} />
        )}
        <div className="map-overlay stack" style={{ top: "var(--sat, 54px)", gap: 12 }}>
          {categoryOnly ? (
            <div className="row-c" style={{ gap: 10, justifyContent: "space-between" }}>
              <BackButton />
              <h1 className="h3" style={{ fontSize: 17, fontWeight: 600 }}>{CATEGORY_LABEL[filters.category!]} nearby</h1>
              <Link href={filtersHref} className="link-blue" style={{ width: 40, textAlign: "right" }}>Filters</Link>
            </div>
          ) : (
            <SearchBar value={draft} onChange={setDraft} onSubmit={submit} onBack={() => setParams({ view: null })} quiet />
          )}
          <div ref={chipsRef} className="chips" {...chipDrag}>
            {tab === "places" || categoryOnly ? (
              <>
                {quick.map((c) => <button key={c.label} className="chip" aria-pressed={c.on} onClick={c.toggle}>{c.label}</button>)}
                {!categoryOnly && <Link href={filtersHref} className="chip filter-icon-only" aria-label={nFilters ? `Filters, ${nFilters} active` : "Filters"}><SlidersHorizontal size={19} /></Link>}
              </>
            ) : (
              <>
                {TABS.map(({ key, label, Icon }) => (
                  <button key={key} role="tab" aria-selected={tab === key} className={`chip flat ${tab === key ? "on" : ""}`} onClick={() => setParams({ tab: key === "all" ? null : key })}>
                    {Icon && <Icon size={17} />}{label}
                  </button>
                ))}
                <Link href={filtersHref} className="chip flat" aria-label={nFilters ? `Filters, ${nFilters} active` : "Filters"}><SlidersHorizontal size={17} />{nFilters ? nFilters : ""}</Link>
              </>
            )}
          </div>
        </div>
        {loading && !data && <div className="toast" style={{ bottom: 160 }}>Finding places…</div>}
        {selected && <PlaceCard place={selected} from={resultsCenter} onClose={() => setSelected(null)} bottom={categoryOnly ? 24 : 96} variant={categoryOnly ? "friends" : "compact"} />}
        {selectedPerson && <ProfileSheet user={selectedPerson} onClose={() => setSelectedPerson(null)} />}
        {selectedTag && <HashtagSheet tag={selectedTag} onClose={() => setSelectedTag(null)} />}
        {!categoryOnly || !hasOverlayOpen ? (
          <button className="float-pill" style={{ bottom: 28 }} onClick={() => setParams({ view: null })}><List size={18} />List</button>
        ) : null}
      </main>
    );
  }

  // ---------- 06 · Grouped results + per-type lists ----------
  const d = data;
  return (
    <main className="screen pad" style={{ background: "var(--bg)", paddingBottom: 110 }}>
      <SearchBar value={draft} onChange={setDraft} onSubmit={submit} back="/search" />
      <div ref={chipsRef} className="chips" role="tablist" aria-label="Result type" style={{ marginTop: 14 }} {...chipDrag}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} className={`chip flat ${tab === key ? "on" : ""}`} onClick={() => setParams({ tab: key === "all" ? null : key })}>
            {Icon && <Icon size={17} />}{label}
          </button>
        ))}
        <Link href={filtersHref} className="chip flat" aria-label="Filters"><SlidersHorizontal size={17} />{nFilters ? nFilters : ""}</Link>
      </div>

      {!d && [0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 60, margin: "14px 0" }} />)}

      {d && (tab === "all" || tab === "places") && d.places.length > 0 && (
        <section>
          <div className="section-head"><h2 className="h2">{d.searchLocation ? `Places in ${d.searchLocation}` : tab === "places" && filters.category ? CATEGORY_LABEL[filters.category] : "Places"}</h2></div>
          {(tab === "all" ? d.places.slice(0, 4) : d.places).map((p) => <PlaceRow key={p.id} place={p} from={resultsCenter} />)}
          {tab === "all" && d.places.length > 4 && <button className="link-blue results-see-all" onClick={() => setParams({ tab: "places" })}>See all {d.places.length} places</button>}
        </section>
      )}
      {d && (tab === "all" || tab === "people") && d.people.length > 0 && (
        <section>
          <div className="section-head"><h2 className="h2">People</h2></div>
          {(tab === "all" ? d.people.slice(0, 4) : d.people).map((u) => <PersonRow key={u.id} user={u} />)}
          {tab === "all" && d.people.length > 4 && <button className="link-blue results-see-all" onClick={() => setParams({ tab: "people" })}>See all {d.people.length} people</button>}
        </section>
      )}
      {d && (tab === "all" || tab === "hashtags") && d.hashtags.length > 0 && (
        <section>
          <div className="section-head"><h2 className="h2">Chats</h2></div>
          {(tab === "all" ? d.hashtags.slice(0, 4) : d.hashtags).map((h) => <HashtagRow key={h.tag} tag={h} />)}
          {tab === "all" && d.hashtags.length > 4 && <button className="link-blue results-see-all" onClick={() => setParams({ tab: "hashtags" })}>See all {d.hashtags.length} hashtags</button>}
        </section>
      )}
      {d && (tab === "all" || tab === "chits") && d.chits.length > 0 && (
        <section>
          <div className="section-head"><h2 className="h2">Chits</h2></div>
          <ChitGrid chits={tab === "all" ? d.chits.slice(0, 4) : d.chits} from={loc.center} />
          {tab === "all" && d.chits.length > 4 && <button className="link-blue results-see-all" onClick={() => setParams({ tab: "chits" })}>See all {d.chits.length} chits</button>}
        </section>
      )}
      {d && tab !== "all" && ((tab === "places" && !d.places.length) || (tab === "people" && !d.people.length) || (tab === "hashtags" && !d.hashtags.length) || (tab === "chits" && !d.chits.length)) && (
        <p className="t-sm muted" style={{ textAlign: "center", marginTop: 40 }}>No {tab} for “{q}”.</p>
      )}

      {d && (d.places.length > 0 || d.people.length > 0 || d.hashtags.length > 0 || d.chits.length > 0) && (
        <button className="float-pill fixed" style={{ bottom: 28, position: "fixed" }} onClick={() => setParams({ view: "map" })}><MapIcon size={18} />Map</button>
      )}
    </main>
  );
}

export default function ResultsPage() {
  return <Suspense><Results /></Suspense>;
}
