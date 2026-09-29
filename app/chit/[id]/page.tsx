"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronLeft, Eye, Heart, MapPin, MessageCircle, MoreHorizontal, Music2, Repeat2, Send } from "lucide-react";
import { ActionsMenu, ReportDialog, sendReport } from "@/components/ReportFlow";
import { Avatar, Img, Toast, compactNum } from "@/components/ui";
import type { Chit } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { qs, useLocation } from "@/lib/useLocation";

// Chit (post) viewer — full screen, swipe up for the next chit nearby.
export default function ChitViewer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const loc = useLocation();
  const { data, error } = useApi<Chit & { more: Chit[] }>(loc.ready ? `/api/chits/${encodeURIComponent(id)}?${qs(loc.center)}` : null, `chit:${id}`);
  const [toast, setToast] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const commentInput = useRef<HTMLInputElement>(null);
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1600); };

  if (error) {
    return (
      <main className="screen" style={{ background: "#0d0d10", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p>This chit isn&apos;t available.</p><Link href="/map" className="btn light">Back to map</Link>
      </main>
    );
  }
  const list = data ? [data, ...data.more] : [];

  return (
    <main className="screen" style={{ background: "#0d0d10", scrollSnapType: "y mandatory", scrollbarWidth: "none" }} aria-label="Chits">
      {!data && <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0, opacity: .1 }} />}
      {list.map((c) => <ChitPage key={c.id} chit={c} onToast={flash} onComment={() => setCommentsOpen(true)} />)}
      {data && !commentsOpen && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 850, padding: "16px 12px max(22px, env(safe-area-inset-bottom))", background: "#0d0d10" }}>
          <button type="button" onClick={() => setCommentsOpen(true)} style={{ width: "100%", height: 50, padding: "0 18px", borderRadius: 25, border: "1px solid rgba(255,255,255,.35)", background: "rgba(17,19,24,.72)", color: "rgba(255,255,255,.55)", fontSize: 15, textAlign: "left" }}>
            Send a chit...
          </button>
        </div>
      )}
      <button type="button" className="round glass sm" style={{ position: "fixed", left: 16, top: 66, zIndex: 900 }} aria-label="Back" onClick={() => (window.history.length > 1 ? router.back() : router.push("/map"))}>
        <ChevronLeft size={22} />
      </button>
      {data && commentsOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="comments-title" style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "flex-end", background: "rgba(0,0,0,.55)" }} onClick={() => setCommentsOpen(false)}>
          <section style={{ width: "100%", height: "62%", minHeight: 360, display: "flex", flexDirection: "column", color: "var(--ink)", background: "#fff", borderRadius: "28px 28px 0 0", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 42, height: 5, borderRadius: 3, background: "#d7d9de", margin: "10px auto 4px" }} aria-hidden="true" />
            <header className="row-c" style={{ minHeight: 54, padding: "0 16px", borderBottom: "1px solid var(--line)" }}>
              <h2 id="comments-title" style={{ flex: 1, margin: 0, fontSize: 18, textAlign: "center" }}>Comments</h2>
            </header>
            <div className="stack" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24, color: "var(--muted)", textAlign: "center" }}>
              <MessageCircle size={36} strokeWidth={1.5} />
              <b style={{ color: "var(--ink)" }}>{data.comments} comments</b>
              <span className="t-sm">Join the conversation.</span>
            </div>
            <form className="row-c" style={{ gap: 10, padding: "12px 12px max(22px, env(safe-area-inset-bottom))", borderTop: "1px solid var(--line)", background: "#fff" }} onSubmit={(e) => { e.preventDefault(); if (commentInput.current?.value.trim()) { commentInput.current.value = ""; flash("Chit sent"); } }}>
              <label htmlFor="comment-reply" className="sr">Write a comment</label>
              <input id="comment-reply" ref={commentInput} autoFocus placeholder="Send a chit..." style={{ flex: 1, minWidth: 0, height: 48, padding: "0 17px", borderRadius: 24, border: "1px solid var(--line)", background: "var(--soft)", outline: "none" }} />
              <button type="submit" className="round dark" style={{ width: 48, height: 48 }} aria-label="Send comment"><Send size={19} /></button>
            </form>
          </section>
        </div>
      )}
      <Toast text={toast} />
    </main>
  );
}

function ChitPage({ chit, onToast, onComment }: { chit: Chit; onToast: (t: string) => void; onComment: () => void }) {
  const [liked, setLiked] = useState(chit.liked);
  const [reposted, setReposted] = useState(false);
  const [following, setFollowing] = useState(chit.user.isFollowing);
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const first = chit.user.name.split(" ")[0];
  const rail = [
    { label: liked ? "Unlike" : "Like", icon: <Heart size={24} fill={liked ? "#ff3b5c" : "none"} color={liked ? "#ff3b5c" : "#fff"} />, count: chit.likes + (liked && !chit.liked ? 1 : !liked && chit.liked ? -1 : 0), onClick: () => setLiked(!liked), pressed: liked },
    { label: "Comments", icon: <MessageCircle size={24} />, count: chit.comments, onClick: onComment },
    { label: "Views", icon: <Eye size={24} />, count: chit.views },
    { label: reposted ? "Undo repost" : "Repost", icon: <Repeat2 size={24} color={reposted ? "#4ade80" : "#fff"} />, count: chit.reposts + (reposted ? 1 : 0), onClick: () => { setReposted(!reposted); onToast(reposted ? "Repost removed" : "Reposted"); }, pressed: reposted },
    { label: "Share", icon: <Send size={23} />, count: chit.shares, onClick: async () => { const url = `${location.origin}/chit/${chit.id}`; try { if (navigator.share) await navigator.share({ url }); else { await navigator.clipboard.writeText(url); onToast("Link copied"); } } catch {} } },
    { label: "More options", icon: <MoreHorizontal size={24} />, onClick: () => setMenu(true) },
  ];

  return (
    <section style={{ position: "relative", height: "100%", scrollSnapAlign: "start", color: "#fff", overflow: "hidden" }} aria-label={`Chit by ${chit.user.name}`}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 84 }}>
        <Img src={chit.mediaUrl} color={chit.mediaColor} style={{ position: "absolute", inset: 0 }} label={chit.caption} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 55%, rgba(0,0,0,.7))" }} />
      </div>

      <div className="stack" style={{ position: "absolute", right: 10, bottom: 110, gap: 14, alignItems: "center" }}>
        {rail.map((r) => {
          const content = <>
            <span style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(17,19,24,.62)", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 2px 10px rgba(0,0,0,.18)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>{r.icon}</span>
            {r.count != null && <span style={{ fontSize: 12, fontWeight: 600 }}>{compactNum(r.count)}</span>}
          </>;
          const label = r.count != null ? `${r.label}, ${r.count}` : r.label;
          const style = { alignItems: "center", gap: 3, minWidth: 44 } as const;

          return r.onClick ? (
            <button key={r.label} className="stack" style={style} aria-label={label} aria-pressed={r.pressed} onClick={r.onClick}>{content}</button>
          ) : (
            <div key={r.label} className="stack" style={style} aria-label={label}>{content}</div>
          );
        })}
        <span className="ringed" style={{ animation: "spin 6s linear infinite" }} aria-hidden="true"><Avatar user={chit.user} size={34} /></span>
      </div>

      <div className="stack" style={{ position: "absolute", left: 14, right: 74, bottom: 102, gap: 8 }}>
        <div className="row-c" style={{ gap: 10 }}>
          <Link href={`/u/${chit.user.username}`} className="row-c" style={{ gap: 10 }}><Avatar user={chit.user} size={34} ring /><b style={{ fontSize: 15 }}>{chit.user.username}</b></Link>
          {!following && <button className="t-xs" style={{ height: 26, padding: "0 10px", borderRadius: 13, border: "1px solid rgba(255,255,255,.7)", fontWeight: 600 }} onClick={() => { setFollowing(true); onToast(`Following ${first}`); }}>+Follow</button>}
        </div>
        <p className="t-sm" style={{ margin: 0, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {chit.caption} {chit.hashtags.map((t) => <Link key={t} href={`/tag/${t}`} style={{ fontWeight: 700 }}>#{t} </Link>)}
        </p>
        <div className="row-c t-xs" style={{ gap: 12, opacity: .9 }}>
          {chit.sound && <span className="row-c ellipsis" style={{ gap: 5 }}><Music2 size={13} />{chit.sound}</span>}
          {chit.placeId && <Link href={`/place/${encodeURIComponent(chit.placeId)}`} className="row-c ellipsis" style={{ gap: 4 }}><MapPin size={13} />{chit.placeName}</Link>}
        </div>
      </div>

      {menu && (
        <ActionsMenu kind="chit" name={first} following={following} onCancel={() => setMenu(false)}
          onReport={() => { setMenu(false); setReporting(true); }}
          onMute={() => { setMenu(false); onToast(`${first} muted`); }}
          onFollow={() => { setMenu(false); setFollowing(true); onToast(`Following ${first}`); }}
          onUnfollow={() => { setMenu(false); setFollowing(false); onToast(`Unfollowed ${first}`); }} />
      )}
      {reporting && <ReportDialog name={first} kind="chit" onBack={() => setReporting(false)} onSubmit={async (r) => { await sendReport("chit", chit.id, r); setReporting(false); onToast("Thanks — we'll review this chit"); }} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
