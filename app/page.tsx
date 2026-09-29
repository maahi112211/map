"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleDot, Hash, MapPin, Users } from "lucide-react";
import { useLocation } from "@/lib/useLocation";

// 01 · Location permission — explain first, then ask.
export default function Permission() {
  const router = useRouter();
  const { ready, status, request, decline } = useLocation();
  const [asking, setAsking] = useState(false);

  useEffect(() => { if (ready && status === "granted") router.replace("/map"); }, [ready, status, router]);

  const points = [
    { Icon: CircleDot, text: "Stories and chits from around you" },
    { Icon: Users, text: "See friends who share their location with you" },
    { Icon: Hash, text: "Trending #hashtags and places nearby" },
  ];

  return (
    <main className="screen" style={{ background: "#e8e9ec" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 38%, rgba(47,107,255,.35) 0, rgba(47,107,255,0) 30%), #e8e9ec" }} />
      <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "32%", transform: "translate(-50%,-50%)", width: 28, height: 28, borderRadius: "50%", background: "#fff", border: "6px solid var(--blue)", boxShadow: "0 2px 12px rgba(47,107,255,.5)" }} />
      <section aria-labelledby="perm-title" className="card-float" style={{ bottom: "max(16px, env(safe-area-inset-bottom))", padding: "26px 22px 20px", borderRadius: 28 }}>
        <span className="icon-tile" style={{ width: 52, height: 52, borderRadius: 16, background: "var(--blue-soft)", color: "var(--blue)" }}><MapPin size={26} /></span>
        <h1 id="perm-title" className="h1" style={{ marginTop: 16 }}>See what&apos;s around you</h1>
        <p className="t-sm muted" style={{ lineHeight: 1.55, margin: "8px 0 16px" }}>
          Share your location to discover stories, chits, people and places nearby. You choose who sees your location, and you can turn it off anytime in Settings.
        </p>
        <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 12 }}>
          {points.map(({ Icon, text }) => <li key={text} className="row-c t-sm" style={{ gap: 12 }}><Icon size={19} color="var(--blue)" aria-hidden="true" />{text}</li>)}
        </ul>
        <div className="stack" style={{ gap: 8, marginTop: 22 }}>
          <button className="btn dark block" disabled={asking} onClick={async () => { setAsking(true); await request(); router.push("/map"); }}>
            {asking ? "Waiting for permission…" : "Allow while using the app"}
          </button>
          <button className="btn block" style={{ fontWeight: 500 }} onClick={() => { decline(); router.push("/search"); }}>Not now</button>
        </div>
      </section>
    </main>
  );
}
