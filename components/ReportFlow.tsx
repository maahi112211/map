"use client";

import { useState } from "react";
import { Ban, Bookmark, ChevronRight, Flag, Frown, MessageSquareWarning, QrCode, Send, ShieldAlert, UserMinus, UserPlus, VolumeX } from "lucide-react";

const REASONS = [
  "Harassment or unwanted contact",
  "Nudity or sexual content",
  "Violence or dangerous acts",
  "Hate speech or symbols",
  "Spam or scam",
  "False information",
  "Sharing someone's location without consent",
];

/** 16 · Story actions menu */
export function ActionsMenu({ name, following, onReport, onMute, onUnfollow, onFollow, onCancel, kind = "story" }: {
  name: string; following: boolean; kind?: "story" | "chit"; onReport: () => void; onMute: () => void; onUnfollow: () => void; onFollow?: () => void; onCancel: () => void;
}) {
  const [saved, setSaved] = useState(false);

  if (kind === "chit") {
    const actionStyle = { width: "100%", minHeight: 56, gap: 16, padding: "0 20px", textAlign: "left" } as const;
    return (
      <div role="dialog" aria-modal="true" aria-label="Chit actions" style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "flex-end", background: "rgba(0,0,0,.48)" }} onClick={onCancel}>
        <section onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxHeight: "calc(100% - 18px)", overflowY: "auto", padding: "10px 12px max(22px, env(safe-area-inset-bottom))", borderRadius: "30px 30px 0 0", background: "rgba(245,245,248,.96)", color: "var(--ink)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}>
          <span className="handle" aria-hidden="true" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "0 8px 12px" }}>
            <button onClick={() => setSaved((value) => !value)} className="stack" style={{ height: 112, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 22, border: "1px solid rgba(255,255,255,.85)", background: "rgba(255,255,255,.42)", fontSize: 17, fontWeight: 650 }} aria-pressed={saved}>
              <Bookmark size={29} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}
            </button>
            <button className="stack" style={{ height: 112, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 22, border: "1px solid rgba(255,255,255,.85)", background: "rgba(255,255,255,.42)", fontSize: 17, fontWeight: 650 }}>
              <QrCode size={30} />QR code
            </button>
          </div>
          <div style={{ margin: "0 8px 12px", padding: "8px 0", borderRadius: 22, border: "1px solid rgba(255,255,255,.85)", background: "rgba(255,255,255,.42)" }}>
            <button className="row-c" style={actionStyle} onClick={async () => { try { if (navigator.share) await navigator.share({ url: location.href }); else await navigator.clipboard.writeText(location.href); } catch {} }}><Send size={23} /><span>Share</span></button>
            <button className="row-c" style={actionStyle} onClick={following ? onUnfollow : onFollow}><span style={{ width: 23, display: "inline-flex" }}>{following ? <UserMinus size={23} /> : <UserPlus size={23} />}</span><span>{following ? "Unfollow" : "Follow"}</span></button>
            <button className="row-c" style={actionStyle} onClick={onMute}><VolumeX size={23} /><span>Mute</span></button>
            <button className="row-c" style={actionStyle} onClick={onCancel}><Frown size={23} /><span>Not interested in this post</span></button>
          </div>
          <div style={{ margin: "0 8px", padding: "8px 0", borderRadius: 22, border: "1px solid rgba(255,255,255,.85)", background: "rgba(255,255,255,.42)" }}>
            <button className="row-c" style={actionStyle} onClick={onCancel}><Ban size={23} /><span>Block</span></button>
            <button className="row-c" style={{ ...actionStyle, color: "#ff2d55" }} onClick={onReport}><Flag size={23} /><span>Report</span></button>
          </div>
        </section>
      </div>
    );
  }

  const items = [
    { icon: <Flag size={18} />, title: `Report ${kind}`, sub: "Tell us about a safety concern", danger: true, onClick: onReport },
    { icon: <VolumeX size={18} />, title: `Mute ${name}`, sub: "Hide their stories and posts", onClick: onMute },
    ...(following ? [{ icon: <UserMinus size={18} />, title: "Unfollow", sub: `Stop seeing updates from ${name}`, onClick: onUnfollow }] : []),
  ];
  return (
    <div role="dialog" aria-modal="true" aria-label={`${kind === "story" ? "Story" : "Chit"} actions`} style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.35)", padding: 32 }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 320, borderRadius: 18, background: "rgba(30,30,34,.82)", backdropFilter: "blur(18px)", color: "#fff", overflow: "hidden" }}>
        {items.map((it) => (
          <button key={it.title} onClick={it.onClick} className="row-c" style={{ width: "100%", gap: 12, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.1)", textAlign: "left" }}>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: it.danger ? "rgba(229,72,77,.25)" : "rgba(255,255,255,.1)", color: it.danger ? "#ff8a8d" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{it.icon}</span>
            <span className="grow stack" style={{ gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: it.danger ? "#ff8a8d" : "#fff" }}>{it.title}</span>
              <span className="t-xs" style={{ color: "rgba(255,255,255,.6)" }}>{it.sub}</span>
            </span>
            <ChevronRight size={18} color="rgba(255,255,255,.6)" />
          </button>
        ))}
        <button onClick={onCancel} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 500 }}>Cancel</button>
      </div>
    </div>
  );
}

/** 17 · Report confirmation */
export function ReportDialog({ name, kind = "story", onSubmit, onBack }: { name: string; kind?: "story" | "chit"; onSubmit: (reason: string) => Promise<void>; onBack: () => void }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [picking, setPicking] = useState(false);
  const [sending, setSending] = useState(false);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="report-title" style={{ position: "absolute", inset: 0, zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,.45)", padding: 12 }}>
      <div style={{ width: "100%", borderRadius: 26, background: "#fff", color: "var(--ink)", padding: "24px 20px 20px", textAlign: "center", marginBottom: 70 }}>
        <span style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--red-soft)", color: "var(--red)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><ShieldAlert size={24} /></span>
        <h2 id="report-title" className="h2" style={{ margin: "14px 0 8px" }}>Report this {kind}?</h2>
        <p className="t-sm muted" style={{ margin: "0 0 16px", lineHeight: 1.5 }}>We&apos;ll review it for {reason.toLowerCase()}. {name} won&apos;t know who reported it.</p>
        {!picking ? (
          <button className="row-c" onClick={() => setPicking(true)} style={{ width: "100%", gap: 10, padding: "12px 14px", borderRadius: 12, background: "var(--soft)", textAlign: "left" }} aria-label={`Reason: ${reason}. Change`}>
            <MessageSquareWarning size={18} /><span className="t-sm grow">{reason}</span><ChevronRight size={18} color="var(--muted)" />
          </button>
        ) : (
          <div role="radiogroup" aria-label="Reason" className="stack" style={{ borderRadius: 12, background: "var(--soft)", textAlign: "left", maxHeight: 220, overflowY: "auto" }}>
            {REASONS.map((r) => (
              <button key={r} role="radio" aria-checked={r === reason} onClick={() => { setReason(r); setPicking(false); }} className="t-sm" style={{ padding: "12px 14px", textAlign: "left", fontWeight: r === reason ? 600 : 400, borderBottom: "1px solid var(--line)" }}>{r}</button>
            ))}
          </div>
        )}
        <div className="stack" style={{ gap: 10, marginTop: 18 }}>
          <button className="btn red block" disabled={sending} onClick={async () => { setSending(true); await onSubmit(reason); }}>{sending ? "Sending…" : "Submit report"}</button>
          <button type="button" className="btn outline block" onClick={onBack}>Go back</button>
        </div>
      </div>
    </div>
  );
}

export async function sendReport(type: "story" | "chit", id: string, reason: string) {
  await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id, reason }) }).catch(() => {});
}
