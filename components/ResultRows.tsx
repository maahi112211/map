"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCheck, ChevronRight, Play, Users } from "lucide-react";
import { distanceKm, formatDistance } from "@/lib/geo";
import type { Chit, Hashtag, LatLng, Place, User } from "@/lib/types";
import { Avatar, Img, PlaceLine, Rating, compactNum } from "./ui";

export function PlaceRow({ place, from, chevron = true }: { place: Place; from: LatLng; chevron?: boolean }) {
  return (
    <Link href={`/place/${encodeURIComponent(place.id)}`} className="list-row">
      <Img src={place.photos[0]} color={place.photoColor} style={{ width: 56, height: 56, borderRadius: 12 }} />
      <span className="grow stack" style={{ gap: 3 }}>
        <span className="list-title ellipsis">{place.name}</span>
        <PlaceLine address={place.address} distance={formatDistance(distanceKm(from, place.location))} />
        <Rating rating={place.rating} reviews={place.reviews} />
      </span>
      {chevron && <ChevronRight size={20} color="var(--muted)" aria-hidden="true" />}
    </Link>
  );
}

export function PersonRow({ user }: { user: User }) {
  const [following, setFollowing] = useState(user.isFollowing);
  const label = following ? "Message" : user.followsYou ? "Follow back" : "+ Follow";
  return (
    <div className="list-row">
      <Link href={`/u/${user.username}`} className="row-c grow" style={{ gap: 14 }}>
        <Avatar user={user} size={48} ring={user.isFollowing} />
        <span className="grow stack" style={{ gap: 2 }}>
          <span className="list-title ellipsis">{user.username}</span>
          <span className="list-sub ellipsis">{user.name}{user.verified ? " ✦" : ""}</span>
        </span>
      </Link>
      {following ? (
        <Link href={`/tab/chats?to=${user.username}`} className="btn outline sm">Message</Link>
      ) : (
        <button className="btn dark sm" onClick={() => setFollowing(true)}>{label}</button>
      )}
    </div>
  );
}

export function HashtagRow({ tag }: { tag: Hashtag }) {
  return (
    <Link href={`/tag/${tag.tag}`} className="list-row">
      <span style={{ position: "relative", flexShrink: 0 }}>
        <Img src={tag.imageUrl} color={tag.color} style={{ width: 48, height: 48, borderRadius: "50%" }} />
        <span style={{ position: "absolute", right: 0, bottom: 0, width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff", background: tag.active ? "var(--green)" : "#b9bcc3" }} aria-label={tag.active ? "Active now" : undefined} />
      </span>
      <span className="grow stack" style={{ gap: 3 }}>
        <span className="row-c" style={{ gap: 6 }}>
          <span className="list-title ellipsis">#{tag.name}</span>
          <span className="pill-tag"><Users size={11} />{tag.visibility}</span>
        </span>
        <PlaceLine address={tag.locationName} />
        {tag.lastMessage && <span className="list-sub ellipsis"><CheckCheck size={13} />{tag.lastMessage}</span>}
      </span>
    </Link>
  );
}

export function HashtagCard({ tag, highlight }: { tag: Hashtag; highlight?: boolean }) {
  return (
    <Link href={`/tag/${tag.tag}`} className="stack" style={{ gap: 4, padding: "12px 12px", borderRadius: 12, minWidth: 116, flex: 1, border: `1px solid ${highlight ? "transparent" : "var(--line)"}`, background: highlight ? "var(--blue-soft)" : "var(--surface)" }}>
      <span className="t-sm ellipsis" style={{ fontWeight: 700 }}>#{tag.name}</span>
      <span className="t-xs muted">{compactNum(tag.chitCount)} chits</span>
    </Link>
  );
}

export function ChitGrid({ chits, from }: { chits: Chit[]; from: LatLng }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 3, margin: "0 -16px" }}>
      {chits.map((c) => (
        <Link key={c.id} href={`/chit/${c.id}`} aria-label={`${c.caption} by ${c.user.name}`} style={{ position: "relative", aspectRatio: "3 / 4", display: "block" }}>
          <Img src={c.mediaUrl} color={c.mediaColor} style={{ position: "absolute", inset: 0 }} />
          {c.isVideo && <Play size={16} fill="#fff" color="#fff" style={{ position: "absolute", right: 8, top: 8 }} aria-hidden="true" />}
          <span className="t-xs" style={{ position: "absolute", left: 6, bottom: 6, color: "#fff", background: "rgba(0,0,0,.5)", padding: "2px 6px", borderRadius: 6, fontWeight: 600 }}>
            {formatDistance(distanceKm(from, c.location))}
          </span>
        </Link>
      ))}
    </div>
  );
}
