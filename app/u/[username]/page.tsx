"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CakeSlice, CalendarDays, Link2, MapPin, Send } from "lucide-react";
import { ChitGrid } from "@/components/ResultRows";
import { Avatar, BackButton, compactNum } from "@/components/ui";
import type { Chit, Story, User } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { qs, useLocation } from "@/lib/useLocation";

// "View Full Profile"
export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const loc = useLocation();
  const { data, error } = useApi<{ user: User; chits: Chit[]; stories: Story[] }>(loc.ready ? `/api/users/${encodeURIComponent(username)}?${qs(loc.center)}` : null, `user:${username}`);
  const [following, setFollowing] = useState<boolean | null>(null);

  if (error) return <main className="screen pad"><BackButton /><div className="state"><h1 className="h2">Profile not found</h1><Link href="/map" className="btn dark block">Back to map</Link></div></main>;
  if (!data) return <main className="screen pad"><BackButton /><div className="skeleton" style={{ height: 300, marginTop: 20 }} /></main>;
  const u = data.user;
  const isFollowing = following ?? u.isFollowing;

  return (
    <main className="screen pad" style={{ background: "var(--surface)" }}>
      <header className="row-c" style={{ justifyContent: "space-between" }}>
        <BackButton />
        <span className="h3">@{u.username}</span>
        <span style={{ width: 40 }} />
      </header>
      <div className="stack" style={{ alignItems: "center", textAlign: "center", gap: 6, marginTop: 18 }}>
        {data.stories[0] ? <Link href={`/story/${data.stories[0].id}`} aria-label="View story"><Avatar user={u} size={96} ring /></Link> : <Avatar user={u} size={96} />}
        <h1 className="h1" style={{ fontSize: 22, marginTop: 6 }}>{u.name}</h1>
        {u.bio && <p className="t-sm" style={{ margin: 0, color: "var(--ink-2)", lineHeight: 1.5 }}>{u.bio}</p>}
        <div className="stack t-sm" style={{ gap: 8, marginTop: 6, alignItems: "center" }}>
          {u.locationText && (
            <Link href={`/map?person=${encodeURIComponent(u.username)}`} className="row-c" style={{ gap: 6, color: "inherit", textDecoration: "none" }}>
              <MapPin size={15} color="var(--blue)" />
              <span>{u.locationText}</span>
              <span className="t-xs link-blue" style={{ marginLeft: 4 }}>• View on map</span>
            </Link>
          )}
          {u.link && <span className="row-c" style={{ gap: 6 }}><Link2 size={15} /><span className="blue">{u.link}</span></span>}
          <span className="row-c" style={{ gap: 14 }}>
            {u.born && <span className="row-c" style={{ gap: 6 }}><CakeSlice size={15} />Born {u.born}</span>}
            {u.joined && <span className="row-c" style={{ gap: 6 }}><CalendarDays size={15} />Joined {u.joined}</span>}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", width: "100%", marginTop: 12 }}>
          {[["Following", u.following], ["Followers", u.followers + (isFollowing && !u.isFollowing ? 1 : 0)], ["Posts", u.postCount], ["Chits", u.chitCount]].map(([l, n]) => (
            <span key={l} className="stack" style={{ gap: 2 }}><b style={{ fontSize: 17 }}>{compactNum(n as number)}</b><span className="t-xs muted">{l}</span></span>
          ))}
        </div>
      </div>
      <div className="row-c" style={{ gap: 10, marginTop: 18 }}>
        <button className={`btn ${isFollowing ? "light" : "dark"}`} style={{ flex: 1 }} aria-pressed={isFollowing} onClick={() => setFollowing(!isFollowing)}>
          {isFollowing ? "Following" : u.followsYou ? "Follow back" : "+Follow"}
        </button>
        <Link href={`/tab/chats?to=${u.username}`} className="btn outline-dark" style={{ flex: 1 }}><Send size={17} />Message</Link>
      </div>
      <h2 className="h2" style={{ margin: "24px 0 10px" }}>Chits</h2>
      {data.chits.length ? <ChitGrid chits={data.chits} from={loc.center} /> : <p className="t-sm muted">No chits yet.</p>}
    </main>
  );
}
