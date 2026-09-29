"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Building2, ChevronRight, Clock, Hash, MapPin, Sparkles, User as UserIcon } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CATEGORY_LABEL, compactNum } from "@/components/ui";
import { addRecent, clearRecent, readRecent } from "@/lib/recent";
import type { SearchResults } from "@/lib/types";
import { qs, useLocation } from "@/lib/useLocation";

const TRENDING = ["#MorningWalk", "Coffee", "Parks", "#LiveMusic", "Museums"];

// 04 · Search entry  +  05 · Active search (top matches while typing)
export default function SearchEntry() {
  const router = useRouter();
  const loc = useLocation();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [matches, setMatches] = useState<SearchResults | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { setRecent(readRecent()); }, []);

  useEffect(() => {
    const t = q.trim();
    if (t.length < 2 || !loc.ready) { setMatches(null); return; }
    setMatches(null);
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(t)}&${qs(loc.center)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null)).then(setMatches).catch(() => {});
    }, 300);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q, loc.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    addRecent(t);
    router.push(`/search/results?q=${encodeURIComponent(t)}`);
  };

  type Match = { key: string; icon: React.ReactNode; title: string; sub: string; onClick: () => void };
  const top: Match[] = [];
  if (matches) {
    matches.categories.slice(0, 2).forEach((c) => top.push({ key: `c-${c.category}`, icon: <MapPin size={20} />, title: CATEGORY_LABEL[c.category], sub: `Category · ${c.count} nearby`, onClick: () => { addRecent(q); router.push(`/search/results?q=${encodeURIComponent(q.trim())}&cat=${c.category}`); } }));
    matches.places.slice(0, 3).forEach((p) => top.push({ key: p.id, icon: <Building2 size={20} />, title: p.name, sub: `Place${p.address ? ` · ${p.address}` : ""}`, onClick: () => { addRecent(p.name); router.push(`/place/${encodeURIComponent(p.id)}`); } }));
    matches.hashtags.slice(0, 3).forEach((h) => top.push({ key: h.tag, icon: <Hash size={20} />, title: `#${h.name}`, sub: `Chat · ${compactNum(h.chitCount)} chits`, onClick: () => { addRecent(`#${h.name}`); router.push(`/tag/${h.tag}`); } }));
    matches.people.slice(0, 3).forEach((u) => top.push({ key: u.id, icon: <UserIcon size={20} />, title: u.username, sub: `Person · ${u.name}`, onClick: () => { addRecent(u.name); router.push(`/u/${u.username}`); } }));
  }

  return (
    <main className="screen pad" style={{ background: "var(--bg)" }}>
      <SearchBar ref={input} value={q} onChange={setQ} onSubmit={() => go(q)} back="/map" autoFocus />

      {q.trim().length < 2 ? (
        <>
          <div className="section-head" style={{ marginTop: 22 }}>
            <h2 className="h2">Recent</h2>
            {recent.length > 0 && <button className="link-blue" onClick={() => { clearRecent(); setRecent([]); }}>Clear all</button>}
          </div>
          {recent.length === 0 && <p className="t-sm muted" style={{ margin: "4px 0 0" }}>Places, people and hashtags you search show up here.</p>}
          {recent.map((r) => (
            <div key={r} className="list-row" style={{ padding: "12px 0" }}>
              <Clock size={20} color="var(--ink-2)" aria-hidden="true" />
              <button className="grow ellipsis" style={{ textAlign: "left", fontSize: 16 }} onClick={() => go(r)}>{r}</button>
              <button aria-label={`Edit "${r}"`} onClick={() => { setQ(r); input.current?.focus(); }}><ArrowUpLeft size={18} color="var(--muted)" /></button>
            </div>
          ))}

          <h2 className="h2" style={{ margin: "22px 0 12px" }}>Trending nearby</h2>
          <div className="row-c" style={{ gap: 8, flexWrap: "wrap" }}>
            {TRENDING.map((t) => <button key={t} className="chip flat" onClick={() => go(t)}>{t}</button>)}
          </div>
          <div className="tip" style={{ marginTop: 22 }}><Sparkles size={20} color="var(--blue)" aria-hidden="true" />Try a place, person, hashtag or category.</div>
        </>
      ) : (
        <>
          <div className="search-match-heading"><span>Top matches for “{q.trim()}”</span>{top.length > 0 && <span>{top.length > 8 ? "8+" : top.length}</span>}</div>
          {!matches && [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 52, margin: "10px 0" }} />)}
          {matches && top.length === 0 && (
            <button className="list-row" onClick={() => go(q)}>
              <span className="icon-tile"><MapPin size={20} /></span>
              <span className="grow list-title">Search “{q.trim()}” nearby</span><ChevronRight size={20} color="var(--muted)" />
            </button>
          )}
          {top.length > 0 && (
            <div className="search-match-list">
              {top.slice(0, 8).map((m) => (
                <button key={m.key} className="list-row search-match-row" onClick={m.onClick}>
                  <span className="icon-tile">{m.icon}</span>
                  <span className="grow stack" style={{ gap: 3, minWidth: 0 }}><span className="list-title ellipsis">{m.title}</span><span className="list-sub ellipsis">{m.sub}</span></span>
                  <ChevronRight size={18} color="var(--muted)" aria-hidden="true" />
                </button>
              ))}
              <button className="search-all-results" onClick={() => go(q)}>View all results</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
