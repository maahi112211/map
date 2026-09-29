"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, MapPin, MessageSquareText, Users } from "lucide-react";
import Map, { type MapMarker } from "@/components/Map";
import { ChitGrid } from "@/components/ResultRows";
import { Avatar, BackButton, Img, Toast, compactNum } from "@/components/ui";
import { chitHtml, storyHtml, tagHtml } from "@/lib/markers";
import type { Chit, Hashtag, Story } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { qs, useLocation } from "@/lib/useLocation";

type Res = { hashtag: Hashtag; chits: Chit[]; stories: Story[] };

// "View #topkapi museum" — the hashtag community page.
export default function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const router = useRouter();
  const loc = useLocation();
  const { data, error } = useApi<Res>(loc.ready ? `/api/hashtags/${encodeURIComponent(tag)}?${qs(loc.center)}` : null, `tag:${tag}`);
  const [tab, setTab] = useState<"chits" | "stories" | "map">("chits");
  const [joined, setJoined] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const markers = useMemo<MapMarker[]>(() => {
    if (!data) return [];
    return [
      { id: "tag", position: data.hashtag.location, html: tagHtml(data.hashtag), size: [60, 60], z: 500, label: `#${data.hashtag.name}` },
      ...data.stories.map((s) => ({ id: s.id, position: s.location, html: storyHtml([s]), size: [70, 70] as [number, number], label: `Story by ${s.user.name}`, onClick: () => router.push(`/story/${s.id}`) })),
      ...data.chits.map((c, i) => ({ id: c.id, position: c.location, html: chitHtml([c], i), size: [64, 84] as [number, number], label: `Chit by ${c.user.name}`, onClick: () => router.push(`/chit/${c.id}`) })),
    ];
  }, [data, router]);

  if (error) {
    return (
      <main className="screen pad"><BackButton />
        <div className="state"><h1 className="h2">This hashtag doesn&apos;t exist yet</h1><Link href={`/search/results?q=%23${encodeURIComponent(tag)}`} className="btn dark block">Search for it</Link></div>
      </main>
    );
  }
  if (!data) return <main className="screen"><div className="skeleton" style={{ height: 220, borderRadius: 0 }} /></main>;
  const h = data.hashtag;

  return (
    <main className="screen" style={{ background: "var(--surface)", paddingBottom: 40 }}>
      <div style={{ position: "relative", height: 200 }}>
        <Img src={h.imageUrl} color={h.color} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", left: 16, top: "max(14px, env(safe-area-inset-top))" }}><BackButton /></div>
      </div>
      <div className="stack" style={{ position: "relative", zIndex: 1, alignItems: "center", textAlign: "center", gap: 8, padding: "0 20px", marginTop: -48 }}>
        <span className="ringed" style={{ padding: 3 }}><Img src={h.imageUrl} color={h.color} style={{ width: 92, height: 92, borderRadius: "50%", border: "3px solid #fff" }} /></span>
        <h1 className="h1" style={{ fontSize: 22 }}>#{h.name}</h1>
        <p className="t-sm" style={{ margin: 0, color: "var(--ink-2)", lineHeight: 1.5 }}>{h.description}</p>
        {(h.address || h.locationName) && <span className="row-c t-sm blue" style={{ gap: 6 }}><MapPin size={15} />{h.address || h.locationName}</span>}
        <span className="row-c t-sm" style={{ gap: 8 }}>
          <Users size={15} /><b>{compactNum(h.members + (joined ? 1 : 0))} members</b>
          <span className="muted">· Created by</span>
          <Link href={`/u/${h.createdBy.username}`} className="row-c blue" style={{ gap: 6 }}><Avatar user={h.createdBy} size={20} />{h.createdBy.name.split(" ")[0]}</Link>
        </span>
        <div className="row-c" style={{ gap: 10, width: "100%", marginTop: 8 }}>
          <button className={`btn ${joined ? "outline" : "dark"}`} style={{ flex: 1 }} aria-pressed={joined} onClick={() => { setJoined(!joined); setToast(joined ? "Left the group" : `Joined #${h.name}`); setTimeout(() => setToast(null), 1500); }}>
            {joined ? <><Check size={18} />Joined</> : `Join #${h.name}`}
          </button>
          <Link href={`/tab/chats?tag=${h.tag}`} className="btn outline" aria-label="Open group chat"><MessageSquareText size={18} />Chat</Link>
        </div>
      </div>

      <div className="chips" role="tablist" style={{ padding: "18px 16px 10px", margin: 0 }}>
        {(["chits", "stories", "map"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`chip flat ${tab === t ? "on" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>
            {t}{t === "chits" ? ` · ${data.chits.length}` : t === "stories" ? ` · ${data.stories.length}` : ""}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 16px" }}>
        {tab === "chits" && (data.chits.length ? <ChitGrid chits={data.chits} from={loc.center} /> : <p className="t-sm muted" style={{ textAlign: "center", marginTop: 30 }}>No chits with #{h.name} nearby yet.</p>)}
        {tab === "stories" && (data.stories.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            {data.stories.map((s) => (
              <Link key={s.id} href={`/story/${s.id}`} className="stack" style={{ alignItems: "center", gap: 4 }}>
                <Avatar user={s.user} size={62} ring /><span className="t-xs ellipsis" style={{ maxWidth: 72 }}>{s.user.name.split(" ")[0]}</span>
              </Link>
            ))}
          </div>
        ) : <p className="t-sm muted" style={{ textAlign: "center", marginTop: 30 }}>No stories right now.</p>)}
        {tab === "map" && (
          <div style={{ position: "relative", height: 380, borderRadius: 20, overflow: "hidden" }}>
            <Map center={h.location} zoom={15} userLocation={loc.coords} markers={markers} fitTo={[h.location, ...data.chits.map((c) => c.location), ...data.stories.map((s) => s.location)]} fitPadding={{ top: 60, bottom: 60 }} />
          </div>
        )}
      </div>
      <Toast text={toast} />
    </main>
  );
}
