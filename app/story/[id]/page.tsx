"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, MapPin, MoreHorizontal, Send, X } from "lucide-react";
import { ActionsMenu, ReportDialog, sendReport } from "@/components/ReportFlow";
import { Avatar, Img, Toast } from "@/components/ui";
import { distanceKm, formatDistance, timeAgo } from "@/lib/geo";
import type { Story } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { qs, useLocation } from "@/lib/useLocation";

const DURATION = 6000;

// Story viewer + 16 · Story actions + 17 · Report confirmation
export default function StoryViewer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const loc = useLocation();
  const { data: story, error } = useApi<Story & { next: string[]; storyIndex?: number; storyCount?: number }>(loc.ready ? `/api/stories/${encodeURIComponent(id)}?${qs(loc.center)}` : null, `story:${id}`);
  const [progress, setProgress] = useState(0);
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [typing, setTyping] = useState(false);
  const [holding, setHolding] = useState(false);
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reply = useRef<HTMLInputElement>(null);
  const paused = menu || reporting || typing || holding;

  const next = story?.next?.[0];
  const goNext = () => router.replace(next ? `/story/${next}` : "/map");
  const flash = (t: string, then?: () => void) => { setToast(t); setTimeout(() => { setToast(null); then?.(); }, 1600); };

  useEffect(() => setProgress(0), [id]);
  useEffect(() => {
    if (!story || paused) return;
    const start = Date.now() - progress * DURATION;
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / DURATION);
      setProgress(p);
      if (p >= 1) { clearInterval(t); goNext(); }
    }, 60);
    return () => clearInterval(t);
  }, [story, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <main className="screen" style={{ background: "#0d0d10", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p>This story has expired.</p>
        <Link href="/map" className="btn light">Back to map</Link>
      </main>
    );
  }

  const activeStory = story?.storyIndex ?? 0;
  const bars = story?.storyCount ?? 1 + (story?.next?.length ?? 0);
  const first = story?.user.name.split(" ")[0] ?? "";

  return (
    <main className="screen" style={{ background: "#0d0d10", color: "#fff", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 86, borderRadius: "0 0 22px 22px", overflow: "hidden" }}
        onPointerDown={() => setHolding(true)} onPointerUp={() => setHolding(false)} onPointerLeave={() => setHolding(false)}>
        <Img src={story?.mediaUrl} color={story?.mediaColor ?? "#222"} style={{ position: "absolute", inset: 0 }} label={story ? `${story.user.name}'s story: ${story.caption}` : undefined} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,.45), transparent 22%, transparent 70%, rgba(0,0,0,.55))" }} />
        {/* tap zones */}
        <button aria-label="Next story" style={{ position: "absolute", right: 0, top: 120, bottom: 120, width: "40%" }} onClick={goNext} />
        <button aria-label="Restart story" style={{ position: "absolute", left: 0, top: 120, bottom: 120, width: "30%" }} onClick={() => setProgress(0)} />
      </div>

      <div style={{ position: "absolute", left: 10, right: 10, top: "var(--sat, 76px)", display: "flex", gap: 4 }} aria-hidden="true">
        {Array.from({ length: bars }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,.35)", overflow: "hidden" }}>
            <span style={{ display: "block", height: 3, background: "#fff", width: i < activeStory ? "100%" : i === activeStory ? `${progress * 100}%` : "0%" }} />
          </span>
        ))}
      </div>

      {story && (
        <>
          <header className="row-c" style={{ position: "absolute", left: 12, right: 8, top: "calc(var(--sat, 76px) + 12px)", gap: 10 }}>
            <Link href={`/u/${story.user.username}`}><Avatar user={story.user} size={38} ring /></Link>
            <span className="grow stack" style={{ gap: 3, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{story.user.name.split(" ")[0]} <span style={{ fontWeight: 400, opacity: .75, marginLeft: 4 }}>{timeAgo(story.createdAt).replace(/(\d+)(\w)/, "$1 $2")}</span></span>
              {story.placeId && (
                <Link href={`/place/${encodeURIComponent(story.placeId)}`} className="row-c t-xs" style={{ gap: 4, opacity: .9 }}>
                  <MapPin size={12} />{story.placeName} · {formatDistance(distanceKm(loc.center, story.location))}
                </Link>
              )}
            </span>
            <button className="round glass sm" aria-label="Story options" aria-haspopup="dialog" onClick={() => setMenu(true)}><MoreHorizontal size={20} /></button>
            <Link href="/map" className="round glass sm" aria-label="Close story"><X size={20} /></Link>
          </header>

          <div style={{ position: "absolute", left: 16, right: 16, bottom: 110 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 500, lineHeight: 1.4, textShadow: "0 1px 6px rgba(0,0,0,.4)" }}>
              {story.caption}{" "}
              {story.hashtags.map((t) => <Link key={t} href={`/tag/${t}`} style={{ fontWeight: 700, marginRight: 6 }}>#{t}</Link>)}
            </p>
          </div>

          <form className="row-c" style={{ position: "absolute", left: 12, right: 12, bottom: "max(18px, env(safe-area-inset-bottom))", gap: 10 }}
            onSubmit={(e) => { e.preventDefault(); if (reply.current?.value.trim()) { reply.current.value = ""; reply.current.blur(); flash("Chit sent"); } }}>
            <label htmlFor="reply" className="sr">Send a chit to {first}</label>
            <input id="reply" ref={reply} placeholder="Send a chit..." onFocus={() => setTyping(true)} onBlur={() => setTyping(false)}
              style={{ flex: 1, minWidth: 0, height: 50, padding: "0 18px", borderRadius: 25, border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.08)", color: "#fff", fontSize: 15, outline: "none" }} />
            <button type="button" className="round glass" style={{ width: 50, height: 50, border: "1px solid rgba(255,255,255,.35)", color: liked ? "#ff4d6d" : "#fff" }} aria-label={liked ? "Unlike" : "Like"} aria-pressed={liked} onClick={() => setLiked(!liked)}>
              <Heart size={21} fill={liked ? "currentColor" : "none"} />
            </button>
            <button type="submit" className="round glass" style={{ width: 50, height: 50, border: "1px solid rgba(255,255,255,.35)" }} aria-label="Send"><Send size={20} /></button>
          </form>

          {menu && (
            <ActionsMenu name={first} following={story.user.isFollowing} onCancel={() => setMenu(false)}
              onReport={() => { setMenu(false); setReporting(true); }}
              onMute={() => { setMenu(false); flash(`${first} muted`, goNext); }}
              onUnfollow={() => { setMenu(false); flash(`Unfollowed ${first}`); }} />
          )}
          {reporting && (
            <ReportDialog name={first} onBack={() => setReporting(false)}
              onSubmit={async (reason) => { await sendReport("story", story.id, reason); setReporting(false); flash("Thanks — we'll review this story", goNext); }} />
          )}
        </>
      )}
      <Toast text={toast} />
    </main>
  );
}
