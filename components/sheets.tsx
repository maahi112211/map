"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BadgeCheck, Bookmark, Cake, CalendarDays, Check, Link2, MapPin, Send, X } from "lucide-react";
import { distanceKm, formatDistance } from "@/lib/geo";
import { hoursStatus, parseHours } from "@/lib/hours";
import { MAP_STYLES, type MapStyle } from "@/lib/mapStyles";
import type { Hashtag, LatLng, Place, User } from "@/lib/types";
import { Avatar, CATEGORY_SINGULAR, FriendsVisited, Img, Rating, compactNum } from "./ui";

function Sheet({ onClose, children, label }: { onClose: () => void; children: React.ReactNode; label: string }) {
  const sheetRef = useRef<HTMLElement>(null);
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <section
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragY ? "none" : undefined }}
        onTouchStart={(e) => {
          if (sheetRef.current?.scrollTop === 0) startY.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          if (startY.current == null) return;
          setDragY(Math.max(0, e.touches[0].clientY - startY.current));
        }}
        onTouchEnd={() => {
          if (dragY > 80) onClose();
          else setDragY(0);
          startY.current = null;
        }}
      >
        <span className="handle" aria-hidden="true" />
        {children}
      </section>
    </>
  );
}

function Clamp({ text, lines = 3, moreLabel = "...more" }: { text: string; lines?: number; moreLabel?: string }) {
  const [open, setOpen] = useState(false);
  const isLong = text.length > 85;

  if (!isLong || open) {
    return (
      <p className="t-sm" style={{ margin: "2px 0 0", color: "#4B5563", lineHeight: 1.45, textAlign: "center", maxWidth: 330 }}>
        {text}
      </p>
    );
  }

  let cut = 116;
  if (text.length > cut) {
    const spaceIdx = text.lastIndexOf(" ", cut);
    if (spaceIdx > 70) cut = spaceIdx;
  }
  const snippet = text.slice(0, cut);

  return (
    <p className="t-sm" style={{ margin: "2px 0 0", color: "#4B5563", lineHeight: 1.45, textAlign: "center", maxWidth: 330 }}>
      <span>{snippet}</span>
      <button
        type="button"
        style={{ fontWeight: 700, color: "#111827", background: "none", border: "none", padding: 0, marginLeft: 2, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}
        onClick={() => setOpen(true)}
      >
        {moreLabel.startsWith(".") ? moreLabel : `.. ${moreLabel}`}
      </button>
    </p>
  );
}

/** "#topkapi museum" card */
export function HashtagSheet({ tag, onClose, onJoin }: { tag: Hashtag; onClose: () => void; onJoin?: () => void }) {
  const [joined, setJoined] = useState(tag.joined);
  return (
    <Sheet onClose={onClose} label={`#${tag.name}`}>
      <div className="hashtag-sheet-head">
        <span className="ringed" style={{ padding: 3 }}>
          <Img src={tag.imageUrl} color={tag.color} style={{ width: 86, height: 86, borderRadius: "50%", border: "3px solid #fff" }} />
        </span>
        <div className="hashtag-sheet-title">
          <h2>#{tag.name}</h2>
          <span>{tag.visibility} community</span>
        </div>
      </div>
      <div className="hashtag-sheet-body">
        <Clamp text={tag.description} lines={2} moreLabel="More" />
        {(tag.address || tag.locationName) && (
          <span className="hashtag-location">
            <MapPin size={16} strokeWidth={1.8} color="#3B82F6" />
            {tag.address || tag.locationName}
          </span>
        )}
        <div className="hashtag-meta">
          <span><b>{compactNum(tag.members)}</b> members</span>
          <span>Created by <Link href={`/u/${tag.createdBy.username}`}>
            {tag.createdBy.name.split(" ")[0]}
          </Link></span>
        </div>
      </div>
      <div className="hashtag-actions">
        <button
          className="btn outline"
          aria-pressed={joined}
          onClick={() => { setJoined((j) => !j); onJoin?.(); }}
        >
          {joined ? <><Check size={18} /> Joined #{tag.name}</> : <>Join #{tag.name}</>}
        </button>
        <button type="button" className="btn dark hashtag-view-full" aria-disabled="true">
          View #{tag.name}
        </button>
      </div>
    </Sheet>
  );
}

/** "Emma_jo" profile card */
export function ProfileSheet({ user, onClose, storyId }: { user: User; onClose: () => void; storyId?: string }) {
  const [following, setFollowing] = useState(user.isFollowing);
  const stats = [
    [compactNum(user.following), "Following"],
    [compactNum(user.followers), "Followers"],
    [compactNum(user.postCount), "Posts"],
    [compactNum(user.chitCount), "Chits"],
  ];

  return (
    <Sheet onClose={onClose} label={user.name}>
      <div className="profile-sheet-head">
        {storyId ? (
          <Link href={`/story/${storyId}`} aria-label={`View ${user.name}'s story`}>
            <Avatar user={user} size={92} ring />
          </Link>
        ) : (
          <Avatar user={user} size={92} />
        )}
        <div className="profile-sheet-identity">
          <h2>{user.name}{user.verified && <BadgeCheck size={19} fill="var(--blue)" color="#fff" aria-label="Verified" />}</h2>
          <span>@{user.username}</span>
          {user.followsYou && <span className="profile-follows-you">Follows you</span>}
        </div>
      </div>

      <div className="profile-sheet-body">
        {user.bio && <Clamp text={user.bio} lines={3} moreLabel="more" />}

        <div className="profile-meta">
          {user.locationText && (
            <Link href={`/map?person=${encodeURIComponent(user.username)}`} style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MapPin size={16} strokeWidth={1.8} color="var(--blue)" />{user.locationText}
            </Link>
          )}
          {user.link && (
            <span>
              <Link2 size={16} strokeWidth={1.8} />
              <a href={`https://${user.link}`} target="_blank" rel="noopener noreferrer">{user.link}</a>
              {user.linkCount ? <em>+{user.linkCount} more</em> : null}
            </span>
          )}
          {(user.born || user.joined) && (
            <div className="profile-dates">
              {user.born && (
                <span>
                  <Cake size={16} strokeWidth={1.8} />Born {user.born}
                </span>
              )}
              {user.joined && (
                <span>
                  <CalendarDays size={16} strokeWidth={1.8} />Joined {user.joined}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="profile-stats">
          {stats.map(([value, label]) => <span key={label}><b>{value}</b><small>{label}</small></span>)}
        </div>
      </div>

      <div className="profile-actions">
        <button
          className="btn light profile-follow"
          aria-pressed={following}
          onClick={() => setFollowing((f) => !f)}
        >
          {following ? <><Check size={17} />Following</> : user.followsYou ? "+ Follow back" : "+ Follow"}
        </button>
        <Link
          href={`/tab/chats?to=${user.username}`}
          className="btn outline"
        >
          <Send size={18} strokeWidth={2} />
          Message
        </Link>
        <button type="button" className="btn dark profile-view-full" aria-disabled="true">
          View Full Profile
        </button>
      </div>
    </Sheet>
  );
}

/** Bottom card for a selected place on the map (Save / View). */
export function PlaceCard({ place, from, onClose, bottom = 100, variant = "hours" }: { place: Place; from: LatLng; onClose: () => void; bottom?: number; variant?: "hours" | "friends" | "compact" }) {
  const [saved, setSaved] = useState(false);
  const hours = parseHours(place.openingHours);
  const status = hoursStatus(place.openingHours);
  const dist = formatDistance(distanceKm(from, place.location));
  return (
    <section className="card-float" style={{ bottom }} aria-label={place.name}>
      <button className="clear-x" style={{ position: "absolute", right: 10, top: 10 }} aria-label="Close" onClick={onClose}><X size={15} /></button>
      <Link href={`/place/${encodeURIComponent(place.id)}`} className="row-c" style={{ gap: 14, alignItems: "flex-start" }}>
        <Img src={place.photos[0]} color={place.photoColor} style={{ width: 92, height: 92, borderRadius: 16 }} />
        <span className="stack grow" style={{ gap: 4, paddingRight: 24 }}>
          {variant === "friends" && (
            <span className="row-c" style={{ justifyContent: "space-between" }}>
              <span className="caps blue">{CATEGORY_SINGULAR[place.category]}</span>
              {status && <span className="t-xs" style={{ color: status.open ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{status.open ? "Open" : "Closed"}</span>}
            </span>
          )}
          <span className="h3" style={{ fontSize: 17, lineHeight: 1.25 }}>{place.name}</span>
          <span className="t-sm muted ellipsis">
            {variant === "compact" ? `${CATEGORY_SINGULAR[place.category]}${status ? ` · ${status.open ? status.text.replace("Closes", "Open until") : status.text}` : ""}` : [place.address, dist].filter(Boolean).join(" · ")}
          </span>
          <span className="row-c" style={{ gap: 6 }}><Rating rating={place.rating} reviews={place.reviews} compact={variant !== "friends"} />{variant === "compact" && <span className="t-xs">· {dist}</span>}</span>
          {variant === "compact" && <FriendsVisited friends={place.friendsVisited} variant="here" />}
        </span>
      </Link>
      {variant === "friends" && place.friendsVisited.length > 0 && <div style={{ marginTop: 12 }}><FriendsVisited friends={place.friendsVisited} /></div>}
      {variant === "hours" && hours.known && (
        <div className="stack t-sm" style={{ gap: 6, marginTop: 12 }}>
          {hours.rules.slice(0, 2).map((r) => (
            <span key={r.label} className="row-c" style={{ justifyContent: "space-between" }}><b style={{ fontWeight: 600 }}>{r.label}</b><span>{r.hours}</span></span>
          ))}
        </div>
      )}
      {variant === "hours" ? (
        <div className="row-c" style={{ gap: 10, marginTop: 14 }}>
          <button className="btn light md" style={{ flex: 1 }} aria-pressed={saved} onClick={() => setSaved((s) => !s)}><Bookmark size={17} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button>
          <Link href={`/place/${encodeURIComponent(place.id)}`} className="btn dark md" style={{ flex: 1 }}>View</Link>
        </div>
      ) : variant === "friends" ? (
        <Link href={`/place/${encodeURIComponent(place.id)}`} className="btn dark block" style={{ marginTop: 14 }}>View place</Link>
      ) : null}
    </section>
  );
}

export function MapStyleSheet({ value, onChange, onClose }: { value: MapStyle; onChange: (s: MapStyle) => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label="Map style">
      <div className="map-style-head">
        <h2 className="h2">Map style</h2>
        <p>Choose how places and roads appear.</p>
      </div>
      <div className="map-style-grid">
        {(Object.keys(MAP_STYLES) as MapStyle[]).map((k) => (
          <button key={k} onClick={() => { onChange(k); onClose(); }} aria-pressed={value === k}
            className={`map-style-card ${k}`}>
            <span className="map-style-preview" aria-hidden="true">
              <i className="road road-a" /><i className="road road-b" /><i className="water" />
              {value === k && <span className="map-style-check"><Check size={13} strokeWidth={3} /></span>}
            </span>
            <span className="map-style-label">{MAP_STYLES[k].label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
