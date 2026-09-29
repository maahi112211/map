"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { BackButton, CATEGORY_LABEL, CategoryIcon } from "@/components/ui";
import { DEFAULT_FILTERS, filtersToParams, parseFilters } from "@/lib/filters";
import type { Filters, PlaceCategory } from "@/lib/types";
import { qs, useLocation } from "@/lib/useLocation";

const CATS: PlaceCategory[] = ["coffee", "restaurant", "park", "hotel", "bar", "museum"];
const RATINGS = [0, 3.5, 4, 4.5];

// 08 · Categories & filters
function FiltersScreen() {
  const router = useRouter();
  const sp = useSearchParams();
  const loc = useLocation();
  const q = sp.get("q") ?? "";
  const [f, setF] = useState<Filters>(() => parseFilters(new URLSearchParams(sp.toString())));
  const [count, setCount] = useState<number | null>(null);
  const set = (patch: Partial<Filters>) => setF((x) => ({ ...x, ...patch }));

  // Live result count for the button
  useEffect(() => {
    if (!loc.ready || (!q && !f.category)) { setCount(null); return; }
    const ctrl = new AbortController();
    const p = filtersToParams(f, new URLSearchParams({ q }));
    const id = setTimeout(() => {
      fetch(`/api/search?${p.toString()}&${qs(loc.center)}`, { signal: ctrl.signal }).then((r) => r.json()).then((d) => setCount(d.places?.length ?? 0)).catch(() => {});
    }, 250);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [f, q, loc.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = () => {
    const next = filtersToParams(f, new URLSearchParams(sp.toString()));
    if (!next.get("q") && f.category) next.set("q", CATEGORY_LABEL[f.category]);
    router.replace(`/search/results?${next.toString()}`);
  };
  const fill = `${((f.km - 1) / 19) * 100}%`;

  return (
    <main className="screen pad" style={{ background: "var(--surface)", paddingBottom: 110 }}>
      <header className="row-c" style={{ justifyContent: "space-between" }}>
        <BackButton />
        <h1 className="h3" style={{ fontSize: 18, fontWeight: 600 }}>Filters</h1>
        <button className="link-blue" style={{ width: 40, textAlign: "right" }} onClick={() => setF({ ...DEFAULT_FILTERS })}>Reset</button>
      </header>

      <h2 className="h2" style={{ margin: "26px 0 12px" }}>Category</h2>
      <div className="row-c" style={{ gap: 8, flexWrap: "wrap" }}>
        {CATS.map((c) => (
          <button key={c} className={`chip flat ${f.category === c ? "on" : ""}`} aria-pressed={f.category === c} onClick={() => set({ category: f.category === c ? undefined : c })}>
            <CategoryIcon category={c} size={18} />{CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="row-c" style={{ justifyContent: "space-between", margin: "28px 0 14px" }}>
        <h2 className="h2"><label htmlFor="km">Distance</label></h2>
        <span className="link-blue">{f.km >= 20 ? "20+ km" : `Within ${f.km} km`}</span>
      </div>
      <input id="km" type="range" className="range" min={1} max={20} step={1} value={f.km} style={{ ["--fill" as string]: fill }} onChange={(e) => set({ km: Number(e.target.value) })} />
      <div className="row-c t-xs muted" style={{ justifyContent: "space-between", marginTop: 10 }}><span>Nearby</span><span>20+ km</span></div>

      <h2 className="h2" style={{ margin: "28px 0 12px" }}>Minimum rating</h2>
      <div className="row-c" style={{ gap: 8 }} role="radiogroup" aria-label="Minimum rating">
        {RATINGS.map((r) => (
          <button key={r} role="radio" aria-checked={f.minRating === r} className={`chip flat ${f.minRating === r ? "on" : ""}`} onClick={() => set({ minRating: r })}>
            {r === 0 ? "Any" : `${r.toFixed(1)}+`}
          </button>
        ))}
      </div>

      <h2 className="h2" style={{ margin: "28px 0 12px" }}>Availability</h2>
      <div className="row-c" style={{ gap: 8, flexWrap: "wrap" }}>
        <button className={`chip flat ${f.openNow ? "on" : ""}`} aria-pressed={f.openNow} onClick={() => set({ openNow: !f.openNow })}>Open now</button>
        <button className={`chip flat ${f.openLate ? "on" : ""}`} aria-pressed={f.openLate} onClick={() => set({ openLate: !f.openLate })}>Open late</button>
      </div>

      <div className="row-c" style={{ gap: 14, marginTop: 24, padding: 16, borderRadius: 16, border: "1px solid var(--line)" }}>
        <ShieldCheck size={22} color="var(--green)" aria-hidden="true" />
        <span className="grow stack" style={{ gap: 2 }}>
          <span id="friends-label" style={{ fontWeight: 600 }}>Popular with friends</span>
          <span className="t-xs muted">Prioritize places your friends visited</span>
        </span>
        <button role="switch" className="switch" aria-checked={f.friends} aria-labelledby="friends-label" onClick={() => set({ friends: !f.friends })} />
      </div>

      <div className="dock">
        <button className="btn dark block" onClick={apply}>{count == null ? "Show results" : `Show ${count} result${count === 1 ? "" : "s"}`}</button>
      </div>
    </main>
  );
}

export default function FiltersPage() {
  return <Suspense><FiltersScreen /></Suspense>;
}
