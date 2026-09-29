"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Bookmark, Camera, ChevronDown, ChevronLeft, ChevronRight, Globe, Navigation, Phone, Send, Star, ThumbsUp, Users, X } from "lucide-react";
import Map from "@/components/Map";
import { ChitGrid, HashtagRow, PersonRow } from "@/components/ResultRows";
import { Avatar, BackButton, CATEGORY_SINGULAR, FriendsVisited, Img, Toast } from "@/components/ui";
import { hoursStatus } from "@/lib/hours";
import { pinHtml } from "@/lib/markers";
import type { Chit, Hashtag, Place, Story } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { qs, useLocation } from "@/lib/useLocation";

type Detail = { place: Place; chits: Chit[]; stories: Story[]; hashtags: Hashtag[] };

// 12 · Place detail — map provider info + your community's chits, stories, hashtags.
export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const loc = useLocation();
  const pid = decodeURIComponent(id);
  const { data, error, retry } = useApi<Detail>(loc.ready ? `/api/places/${encodeURIComponent(pid)}?${qs(loc.center)}` : null, `place:${pid}`);
  const [saved, setSaved] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [communityTab, setCommunityTab] = useState<"chits" | "hashtags" | "friends">("chits");
  const [showAllChits, setShowAllChits] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [placePhotoIndex, setPlacePhotoIndex] = useState<number | null>(null);
  const placePhotoSwipeStart = useRef<number | null>(null);
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1800); };

  if (error) {
    return (
      <main className="screen pad">
        <BackButton />
        <div className="state">
          <h1 className="h2">{error === "not-found" ? "Place not found" : "Couldn't load this place"}</h1>
          {error !== "not-found" && <button className="btn dark block" onClick={retry}>Try again</button>}
          <Link href="/map" className="btn outline block">Back to map</Link>
        </div>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="screen">
        <div className="skeleton" style={{ height: 270, borderRadius: 0 }} />
        <div className="pad stack" style={{ gap: 12 }}>
          <div className="skeleton" style={{ height: 14, width: 90 }} /><div className="skeleton" style={{ height: 30, width: "80%" }} /><div className="skeleton" style={{ height: 70 }} />
        </div>
      </main>
    );
  }

  const p = data.place;
  const status = hoursStatus(p.openingHours);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${p.location.lat},${p.location.lng}&travelmode=driving`;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: location.href });
      else { await navigator.clipboard.writeText(location.href); flash("Link copied"); }
    } catch { /* cancelled */ }
  };
  const actions = [
    { label: "Directions", icon: <Navigation size={20} />, href: directions },
    p.phone ? { label: "Call", icon: <Phone size={20} />, href: `tel:${p.phone.replace(/\s/g, "")}` } : null,
    p.website ? { label: "Website", icon: <Globe size={20} />, href: p.website, external: true } : null,
    { label: "Share", icon: <Send size={20} />, onClick: share },
  ].filter(Boolean) as { label: string; icon: React.ReactNode; href?: string; external?: boolean; onClick?: () => void }[];

  return (
    <main className="screen" style={{ background: "var(--surface)", paddingBottom: 100 }}>
      <div style={{ position: "relative", height: 270 }}>
        <Img src={p.photos[0]} color={p.photoColor} style={{ position: "absolute", inset: 0 }} label={`Photo of ${p.name}`} />
        <div className="row-c" style={{ position: "absolute", left: 16, right: 16, top: "var(--sat, 54px)", justifyContent: "space-between" }}>
          <BackButton variant="arrow" />
          <button className="round sm" aria-label={saved ? "Remove from saved" : "Save place"} aria-pressed={saved} onClick={() => { setSaved(!saved); flash(saved ? "Removed from saved" : "Saved"); }}>
            <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="stack" style={{ padding: "18px 16px 0", gap: 14 }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="row-c" style={{ justifyContent: "space-between" }}>
            <span style={{ color: "var(--ink-2)", fontSize: 16, fontWeight: 700 }}>{CATEGORY_SINGULAR[p.category]}</span>
            {p.rating != null && (
              <span className="row-c" style={{ gap: 7, color: "var(--ink-2)", fontSize: 17, fontWeight: 700 }}>
                <span style={{ color: "#f3aa14", display: "inline-flex" }}><Star size={21} fill="currentColor" /></span>
                {p.rating.toFixed(1)} ({p.reviews})
              </span>
            )}
          </div>
          <h1 className="h1" style={{ marginTop: 18, fontSize: 29, lineHeight: 1.15, letterSpacing: "-.025em" }}>{p.name}</h1>
          <span style={{ color: "var(--ink)", fontSize: 18, lineHeight: 1.35 }}>{p.address}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))`, gap: 8 }}>
          {actions.map((a) => {
            const inner = <>{a.icon}<span className="t-xs">{a.label}</span></>;
            const style: React.CSSProperties = { height: 66, borderRadius: 14, background: "var(--soft)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 };
            return a.href ? (
              <Link key={a.label} href={a.href} style={style} {...(a.external ? { target: "_blank", rel: "noreferrer" } : {})}>{inner}</Link>
            ) : <button key={a.label} style={style} onClick={a.onClick}>{inner}</button>;
          })}
        </div>

        {status && (
          <div style={{ borderRadius: 14, background: status.open ? "var(--green-soft)" : "var(--red-soft)" }}>
            <button className="row-c" style={{ width: "100%", padding: "12px 14px", gap: 8 }} aria-expanded={hoursOpen} onClick={() => setHoursOpen(!hoursOpen)}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: status.open ? "var(--green)" : "var(--red)" }} />
              <span className="t-sm grow" style={{ textAlign: "left" }}><b>{status.open ? "Open now" : "Closed"}</b> <span className="muted">· {status.text}</span></span>
              <ChevronDown size={18} style={{ transform: hoursOpen ? "rotate(180deg)" : undefined, transition: "transform .2s" }} />
            </button>
            {hoursOpen && (
              <div className="stack t-sm" style={{ gap: 6, padding: "0 14px 12px 30px" }}>
                {status.rules.map((r) => <span key={r.label} className="row-c" style={{ justifyContent: "space-between" }}><span>{r.label}</span><span>{r.hours}</span></span>)}
              </div>
            )}
          </div>
        )}

        {p.description && <p className="t-sm" style={{ margin: 0, color: "var(--ink-2)", lineHeight: 1.55 }}>{p.description}</p>}
        <FriendsVisited friends={p.friendsVisited} />

        {p.photos.length > 1 && (
          <div className="row-c" style={{ gap: 8, overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
            {p.photos.slice(1).map((ph, i) => (
              <button key={`${ph}-${i}`} type="button" onClick={() => setPlacePhotoIndex(i)} aria-label={`Open ${p.name} photo ${i + 2}`} style={{ flex: "0 0 auto", borderRadius: 12, overflow: "hidden" }}>
                <Img src={ph} color={p.photoColor} style={{ width: 84, height: 84 }} label={`${p.name} photo ${i + 2}`} />
              </button>
            ))}
          </div>
        )}

        <ReviewSection place={p} onToast={flash} />

        <Link href={`/map?place=${encodeURIComponent(p.id)}`} aria-label={`Open ${p.name} on map`} style={{ position: "relative", height: 130, borderRadius: 16, overflow: "hidden", display: "block" }}>
          {loc.ready && <Map center={p.location} zoom={15} interactive={false} markers={[{ id: "pin", position: p.location, html: pinHtml(p.category), size: [44, 44], label: p.name }]} />}
        </Link>

        {(data.stories.length > 0 || data.chits.length > 0 || data.hashtags.length > 0 || p.friendsVisited.length > 0) && (
          <section className="stack community-section" style={{ gap: 14 }}>
            <div className="community-tabs" role="tablist" aria-label="Community activity at this place">
              <button role="tab" aria-selected={communityTab === "chits"} onClick={() => setCommunityTab("chits")}>Chits <span>{data.chits.length}</span></button>
              <button role="tab" aria-selected={communityTab === "hashtags"} onClick={() => setCommunityTab("hashtags")}>Chats <span>{data.hashtags.length}</span></button>
              <button role="tab" aria-selected={communityTab === "friends"} onClick={() => setCommunityTab("friends")}>Friends <span>{p.friendsVisited.length}</span></button>
            </div>

            {communityTab === "chits" && (
              <div className="stack" style={{ gap: 12 }}>
                {data.chits.length > 6 && <button className="link-blue community-see-all" onClick={() => setShowAllChits((v) => !v)}>{showAllChits ? "Show less" : "See all chits"}</button>}
                {data.stories.length > 0 && (
                  <div className="row-c" style={{ gap: 12, overflowX: "auto" }}>
                    {data.stories.map((s) => (
                      <Link key={s.id} href={`/story/${s.id}`} className="stack" style={{ alignItems: "center", gap: 4, width: 64, flexShrink: 0 }}>
                        <Avatar user={s.user} size={56} ring /><span className="t-xs ellipsis" style={{ width: 64, textAlign: "center" }}>{s.user.name.split(" ")[0]}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {data.chits.length > 0 ? <ChitGrid chits={showAllChits ? data.chits : data.chits.slice(0, 6)} from={loc.center} /> : <p className="community-empty">No chits here yet.</p>}
              </div>
            )}

            {communityTab === "hashtags" && (
              <div>
                {data.hashtags.length > 3 && <button className="link-blue community-see-all" onClick={() => setShowAllTags((v) => !v)}>{showAllTags ? "Show less" : "See all hashtags"}</button>}
                {(showAllTags ? data.hashtags : data.hashtags.slice(0, 3)).map((h) => <HashtagRow key={h.tag} tag={h} />)}
                {!data.hashtags.length && <p className="community-empty">No hashtags here yet.</p>}
              </div>
            )}

            {communityTab === "friends" && (
              <div>
                {p.friendsVisited.map((friend) => <PersonRow key={friend.id} user={friend} />)}
                {!p.friendsVisited.length && <p className="community-empty">No friends have visited yet.</p>}
              </div>
            )}
          </section>
        )}
        <p className="t-xs faint" style={{ margin: 0 }}>Place info © OpenStreetMap contributors · ratings, photos & chits from our community</p>
      </div>

      {placePhotoIndex != null && (() => {
        const photos = p.photos.slice(1);
        return (
          <div
            className="review-photo-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`${p.name} photo viewer`}
            onPointerDown={(e) => { placePhotoSwipeStart.current = e.clientX; }}
            onPointerUp={(e) => {
              if (placePhotoSwipeStart.current == null) return;
              const distance = e.clientX - placePhotoSwipeStart.current;
              placePhotoSwipeStart.current = null;
              if (Math.abs(distance) < 45) return;
              setPlacePhotoIndex((index) => index == null ? null : distance < 0 ? (index + 1) % photos.length : (index - 1 + photos.length) % photos.length);
            }}
          >
            <div className="review-photo-viewer-top">
              <button type="button" aria-label="Back" onClick={() => setPlacePhotoIndex(null)}><ArrowLeft size={22} /></button>
              <span>{placePhotoIndex + 1} / {photos.length}</span>
            </div>
            <img src={photos[placePhotoIndex]} className="review-photo-full" alt={`${p.name} photo ${placePhotoIndex + 2}`} draggable={false} />
            {photos.length > 1 && (
              <>
                <button className="review-photo-nav prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); setPlacePhotoIndex((placePhotoIndex - 1 + photos.length) % photos.length); }}><ChevronLeft size={26} /></button>
                <button className="review-photo-nav next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); setPlacePhotoIndex((placePhotoIndex + 1) % photos.length); }}><ChevronRight size={26} /></button>
              </>
            )}
            <div className="review-photo-thumbnails" aria-label="Choose photo">
              {photos.map((photo, index) => (
                <button key={`${photo}-place-thumb-${index}`} aria-label={`Show photo ${index + 1}`} aria-pressed={index === placePhotoIndex} onClick={(e) => { e.stopPropagation(); setPlacePhotoIndex(index); }}>
                  <Img src={photo} color={p.photoColor} />
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="dock">
        <a href={directions} target="_blank" rel="noopener noreferrer" className="btn dark" style={{ flex: 1 }}>Get directions</a>
        <button className="round" style={{ width: 52, height: 52 }} aria-label={saved ? "Remove from saved" : "Save place"} aria-pressed={saved} onClick={() => { setSaved(!saved); flash(saved ? "Removed from saved" : "Saved"); }}>
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <Toast text={toast} />
    </main>
  );
}

type Review = {
  id: string;
  name: string;
  username: string;
  color: string;
  avatarUrl?: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  friend: boolean;
  photo?: string;
  photos?: string[];
};

function ReviewSection({ place, onToast }: { place: Place; onToast: (text: string) => void }) {
  const friend = place.friendsVisited[0];
  const initial: Review[] = [
    {
      id: "friend-review",
      name: friend?.name ?? "Maya Chen",
      username: friend?.username ?? "maya.chen",
      color: friend?.color ?? "#f3d6a3",
      avatarUrl: friend?.avatarUrl,
      rating: 5,
      text: `Loved the atmosphere at ${place.name}. The staff were welcoming and it felt worth the visit.`,
      date: "2 days ago",
      helpful: 18,
      friend: true,
      photo: place.photos[1],
    },
    {
      id: "community-review",
      name: "Noah Williams",
      username: "noah.explores",
      color: "#c9d8e8",
      rating: 4,
      text: "A really good local spot. It gets busy later in the day, so arriving early is a good idea.",
      date: "1 week ago",
      helpful: 9,
      friend: false,
      photos: place.photos.slice(0, 5),
    },
  ];
  const [reviews, setReviews] = useState(initial);
  const [sort, setSort] = useState<"friends" | "latest" | "highest">("friends");
  const [helpful, setHelpful] = useState<Set<string>>(new Set());
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoViewer, setPhotoViewer] = useState<{ photos: string[]; index: number } | null>(null);
  const photoSwipeStart = useRef<number | null>(null);

  const sorted = [...reviews].sort((a, b) =>
    sort === "friends" ? Number(b.friend) - Number(a.friend) :
    sort === "highest" ? b.rating - a.rating : b.id.localeCompare(a.id)
  );

  const submit = () => {
    if (!rating || !text.trim()) return;
    setReviews((list) => [{ id: `mine-${Date.now()}`, name: "You", username: "you", color: "#dce7ff", rating, text: text.trim(), date: "Just now", helpful: 0, friend: true, photo: hasPhoto ? place.photos[0] : undefined }, ...list]);
    setRating(0); setText(""); setHasPhoto(false); setWriting(false); setSort("latest");
    onToast("Review posted");
  };

  return (
    <section className="reviews-section">
      <div className="row-c reviews-heading">
        <div className="grow">
          <h2 className="h2">Ratings &amp; Reviews</h2>
          <span className="t-xs muted">From friends and the community</span>
        </div>
        <button className="btn dark sm" onClick={() => setWriting(true)}>Write a review</button>
      </div>

      <div className="review-score-card">
        <div className="review-score">
          <b>{(place.rating ?? 4.6).toFixed(1)}</b>
          <small>{place.reviews ?? reviews.length} ratings</small>
        </div>
        <div className="sentiment-bars" aria-label="Star rating breakdown">
          {[
            { stars: 5, width: 86, count: Math.max(1, (place.reviews ?? 25) - 6) },
            { stars: 4, width: 38, count: 3 },
            { stars: 3, width: 20, count: 2 },
            { stars: 2, width: 12, count: 1 },
            { stars: 1, width: 8, count: 1 },
          ].map(({ stars, width, count }) => <div key={stars} className="sentiment-row great"><span className="rating-row-label">{stars}<Star size={12} fill="currentColor" /></span><span><i style={{ width: `${width}%` }} /></span><b>{count}</b></div>)}
        </div>
      </div>

      <div className="rating-prompt">
        <div className="rating-faces" aria-label="Rate this place">
          {[1, 2, 3, 4, 5].map((value) => <button key={value} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => { setRating(value); setWriting(true); }}><Star size={28} fill="currentColor" /></button>)}
        </div>
        <p>Your review will help guide your friends and the community.</p>
      </div>

      <div className="review-sort" role="group" aria-label="Sort reviews">
        <button aria-pressed={sort === "friends"} onClick={() => setSort("friends")}><Users size={14} />Friends first</button>
        <button aria-pressed={sort === "latest"} onClick={() => setSort("latest")}>Latest</button>
        <button aria-pressed={sort === "highest"} onClick={() => setSort("highest")}>Highest rated</button>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {sorted.map((review) => {
          const user = { name: review.name, username: review.username, color: review.color, avatarUrl: review.avatarUrl };
          const voted = helpful.has(review.id);
          return (
            <article key={review.id} className="review-card">
              <div className="row-c" style={{ gap: 10 }}>
                <Avatar user={user} size={42} />
                <div className="grow stack" style={{ gap: 2 }}>
                  <b className="t-sm">{review.name}</b>
                  <span className="row-c" style={{ gap: 7 }}>
                    <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={12} fill={value <= review.rating ? "currentColor" : "none"} />)}</span>
                    <span className="t-xs muted">{review.date}</span>
                  </span>
                </div>
              </div>
              <p>{review.text}</p>
              {(() => {
                const photos = review.photos?.length ? review.photos : review.photo ? [review.photo] : [];
                if (!photos.length) return null;
                return (
                  <div className={`review-photo-grid count-${Math.min(photos.length, 5)}`}>
                    {photos.slice(0, 5).map((photo, index) => (
                      <button key={`${photo}-${index}`} type="button" className="review-photo-item" onClick={() => setPhotoViewer({ photos, index })} aria-label={`Open review photo ${index + 1} of ${photos.length}`}>
                        <Img src={photo} color={place.photoColor} className="review-photo" label={`Review photo ${index + 1} by ${review.name}`} />
                        {index === 4 && photos.length > 5 && <span className="review-photo-more">+{photos.length - 5}</span>}
                      </button>
                    ))}
                  </div>
                );
              })()}
              <button className="helpful-button" aria-pressed={voted} onClick={() => setHelpful((old) => { const next = new Set(old); voted ? next.delete(review.id) : next.add(review.id); return next; })}>
                <ThumbsUp size={14} fill={voted ? "currentColor" : "none"} />Helpful · {review.helpful + (voted ? 1 : 0)}
              </button>
            </article>
          );
        })}
      </div>

      {photoViewer && (
        <div
          className="review-photo-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Review photo viewer"
          onPointerDown={(e) => { photoSwipeStart.current = e.clientX; }}
          onPointerUp={(e) => {
            if (photoSwipeStart.current == null) return;
            const distance = e.clientX - photoSwipeStart.current;
            photoSwipeStart.current = null;
            if (Math.abs(distance) < 45) return;
            setPhotoViewer((viewer) => viewer && ({ ...viewer, index: distance < 0 ? (viewer.index + 1) % viewer.photos.length : (viewer.index - 1 + viewer.photos.length) % viewer.photos.length }));
          }}
        >
          <div className="review-photo-viewer-top">
            <button type="button" aria-label="Back" onClick={() => setPhotoViewer(null)}><ArrowLeft size={22} /></button>
            <span>{photoViewer.index + 1} / {photoViewer.photos.length}</span>
          </div>
          <img
            src={photoViewer.photos[photoViewer.index]}
            className="review-photo-full"
            alt={`Review photo ${photoViewer.index + 1}`}
            draggable={false}
          />
          {photoViewer.photos.length > 1 && (
            <>
              <button className="review-photo-nav prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); setPhotoViewer((viewer) => viewer && ({ ...viewer, index: (viewer.index - 1 + viewer.photos.length) % viewer.photos.length })); }}><ChevronLeft size={26} /></button>
              <button className="review-photo-nav next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); setPhotoViewer((viewer) => viewer && ({ ...viewer, index: (viewer.index + 1) % viewer.photos.length })); }}><ChevronRight size={26} /></button>
            </>
          )}
          <div className="review-photo-thumbnails" aria-label="Choose photo">
            {photoViewer.photos.map((photo, index) => (
              <button key={`${photo}-thumb-${index}`} aria-label={`Show photo ${index + 1}`} aria-pressed={index === photoViewer.index} onClick={(e) => { e.stopPropagation(); setPhotoViewer((viewer) => viewer && ({ ...viewer, index })); }}>
                <Img src={photo} color={place.photoColor} />
              </button>
            ))}
          </div>
        </div>
      )}

      {writing && (
        <div className="review-compose" role="dialog" aria-modal="true" aria-label="Write a review">
          <div className="row-c"><h2 className="h2 grow">Review {place.name}</h2><button className="round flat sm" aria-label="Close" onClick={() => setWriting(false)}><X size={20} /></button></div>
          <div className="review-rating-input sentiment-input" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} aria-pressed={rating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setRating(value)}><Star size={25} fill={value <= rating ? "currentColor" : "none"} /><span>{value}</span></button>)}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you like? What should others know?" rows={4} />
          <button className={`review-photo-button ${hasPhoto ? "on" : ""}`} onClick={() => setHasPhoto(!hasPhoto)}><Camera size={18} />{hasPhoto ? "Photo added" : "Add a photo"}</button>
          <button className="btn dark block" disabled={!rating || !text.trim()} onClick={submit}>Post review</button>
        </div>
      )}
    </section>
  );
}
