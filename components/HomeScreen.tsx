"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell, Bookmark, Check, ChevronLeft, ChevronRight, Eye, Heart, MapPin, Menu,
  MessageCircle, MessagesSquare, MoreHorizontal, MoreVertical, Navigation,
  Repeat2, Search, Send, Settings, Share2, User as UserIcon, Volume2, VolumeX, X
} from "lucide-react";
import { BottomNav } from "@/components/ui";
import { STORY_SEEDS, USERS, photo } from "@/lib/data/mock";

const STACKED_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
];

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
];

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Card 1 (Video) state
  const [card1Liked, setCard1Liked] = useState(false);
  const [card1Muted, setCard1Muted] = useState(true);
  const [card1Following, setCard1Following] = useState(false);
  const [card1Bookmarked, setCard1Bookmarked] = useState(false);
  const [card1More, setCard1More] = useState(false);

  // Card 2 (Carousel) state
  const [card2Liked, setCard2Liked] = useState(false);
  const [card2Bookmarked, setCard2Bookmarked] = useState(false);
  const [card2CarouselIdx, setCard2CarouselIdx] = useState(1); // default to 2/5 as in mockup
  const [card2More, setCard2More] = useState(false);

  // Card 3 (Chat Thread) state
  const [card3Liked, setCard3Liked] = useState(true); // Red heart in mockup
  const [card3Joined, setCard3Joined] = useState(false);
  const [card3Bookmarked, setCard3Bookmarked] = useState(false);
  const [card3More, setCard3More] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const stories = STORY_SEEDS.slice(0, 8).map((s) => {
    const u = USERS.find((user) => user.id === s.userId) ?? USERS[0];
    return { ...s, user: u };
  });

  return (
    <main className="screen home-screen">
      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Header with Menu on Left, Home in Center, and Notifications on Right */}
      <header className="home-header">
        <button
          type="button"
          className="home-header-btn"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={24} strokeWidth={2} />
        </button>

        <h1>Home</h1>

        <Link
          href="/tab/notifications"
          className="home-header-btn"
          aria-label="Notifications"
        >
          <Bell size={24} strokeWidth={2} />
          <span className="home-badge-dot" />
        </Link>
      </header>

      {/* Side Menu Drawer */}
      {menuOpen && (
        <>
          <div
            className="menu-scrim"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="menu-drawer" role="dialog" aria-modal="true" aria-label="Main menu">
            <div className="menu-drawer-head">
              <Link
                href="/tab/profile"
                className="menu-drawer-profile"
                onClick={() => setMenuOpen(false)}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: "#E3E9F8",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  EJ
                </div>
                <div>
                  <strong>Emma Joe</strong>
                  <span>@emma_10gk</span>
                </div>
              </Link>
              <button
                type="button"
                className="menu-close-btn"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <nav className="menu-drawer-nav">
              <Link
                href="/map"
                className="menu-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <Navigation size={20} />
                <span>Discover Map</span>
              </Link>
              <Link
                href="/tab/chats"
                className="menu-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <MessagesSquare size={20} />
                <span>Chats</span>
              </Link>
              <Link
                href="/search"
                className="menu-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <Search size={20} />
                <span>Search</span>
              </Link>
              <Link
                href="/tab/notifications"
                className="menu-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <Bell size={20} />
                <span>Notifications</span>
              </Link>
              <Link
                href="/tab/profile"
                className="menu-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon size={20} />
                <span>Your Profile</span>
              </Link>
            </nav>

            <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <Link
                href="/tab/notifications"
                className="menu-nav-link"
                style={{ color: "var(--muted)" }}
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={19} />
                <span>Settings</span>
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Stories Carousel */}
      <div className="home-stories-tray">
        <div className="home-story-item">
          <div className="home-story-ring add">
            <span className="home-story-plus">+</span>
          </div>
          <span className="home-story-label">Your story</span>
        </div>
        {stories.map((s) => (
          <Link
            key={s.id}
            href={`/story/${s.id}`}
            className="home-story-item"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="home-story-ring active">
              <img
                src={photo(`story-${s.id}`, 120, 120)}
                alt=""
                className="home-story-img"
              />
            </div>
            <span className="home-story-label ellipsis">{s.user.name.split(" ")[0]}</span>
          </Link>
        ))}
      </div>

      {/* Feed Section matching media_1790674255060.png */}
      <section className="home-feed-section">

        {/* ----------------- FRAME 1: Video Post with Dark Header Overlay ----------------- */}
        <article className="feed-card">
          <div className="feed-media-container">
            {/* Header overlaid over top of media */}
            <div className="feed-header overlaid">
              <div className="feed-header-left">
                <Link href="/u/emma" className="feed-avatar-ring">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt="Emma"
                  />
                </Link>
                <div className="feed-user-meta">
                  <Link href="/u/emma" className="feed-username">
                    @emma
                  </Link>
                  <span className="feed-subtitle">
                    <MapPin size={11} strokeWidth={2.2} />
                    New York, NY, Uni... | 11:30 am
                  </span>
                </div>
              </div>

              <div className="feed-header-right">
                <button
                  type="button"
                  className={`feed-follow-btn ${card1Following ? "following" : ""}`}
                  onClick={() => {
                    setCard1Following(!card1Following);
                    showToast(card1Following ? "Unfollowed @emma" : "Following @emma");
                  }}
                >
                  {card1Following ? "Following" : "+Follow"}
                </button>
                <button
                  type="button"
                  className="feed-more-btn"
                  aria-label="More options"
                  onClick={() => showToast("Options menu")}
                >
                  <MoreVertical size={19} />
                </button>
              </div>
            </div>

            {/* Media Image / Video */}
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80"
              alt="Friends hanging out"
              className="feed-media-img"
            />

            {/* Mute / Unmute Button */}
            <button
              type="button"
              className="feed-mute-btn"
              aria-label={card1Muted ? "Unmute video" : "Mute video"}
              onClick={() => setCard1Muted(!card1Muted)}
            >
              {card1Muted ? <VolumeX size={17} strokeWidth={2} /> : <Volume2 size={17} strokeWidth={2} />}
            </button>
          </div>

          {/* Action Metrics Row */}
          <div className="feed-actions">
            <button
              type="button"
              className={`feed-action-stat ${card1Liked ? "liked" : ""}`}
              onClick={() => setCard1Liked(!card1Liked)}
            >
              <Heart size={20} strokeWidth={card1Liked ? 0 : 2} />
              <span>{card1Liked ? "2.6k" : "2.5k"}</span>
            </button>

            <button type="button" className="feed-action-stat">
              <MessageCircle size={20} strokeWidth={2} />
              <span>25</span>
            </button>

            <button type="button" className="feed-action-stat">
              <Eye size={20} strokeWidth={2} />
              <span>1,5m</span>
            </button>

            <button
              type="button"
              className="feed-action-stat"
              onClick={() => showToast("Reposted to your feed!")}
            >
              <Repeat2 size={20} strokeWidth={2} />
              <span>200</span>
            </button>

            <div className="feed-action-right">
              <button
                type="button"
                className="feed-icon-btn"
                aria-label="Share post"
                onClick={() => showToast("Post link copied!")}
              >
                <Share2 size={20} strokeWidth={2} />
              </button>

              <button
                type="button"
                className={`feed-icon-btn ${card1Bookmarked ? "bookmarked" : ""}`}
                aria-label="Save post"
                onClick={() => {
                  setCard1Bookmarked(!card1Bookmarked);
                  showToast(card1Bookmarked ? "Removed from saved" : "Saved to bookmarks!");
                }}
              >
                <Bookmark size={20} strokeWidth={2} fill={card1Bookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Social Proof Row */}
          <div className="feed-social-proof">
            <div className="feed-stacked-avatars">
              {STACKED_AVATARS.map((src, i) => (
                <img key={i} src={src} alt="user" />
              ))}
            </div>
            <span className="feed-social-text">
              Like by <strong>emma</strong> and <strong>others</strong>
            </span>
          </div>

          {/* Caption */}
          <p className="feed-caption">
            <strong>@emma</strong>
            {card1More
              ? "Content like visuals, sports events entertainment videos can increase attention span and boost community engagement across your channel."
              : "Content like visuals, sports events entertainment videos can incre..."}
            <button
              type="button"
              className="feed-more-btn-inline"
              onClick={() => setCard1More(!card1More)}
            >
              {card1More ? " Less" : "More"}
            </button>
          </p>

          {/* Hashtag Pills */}
          <div className="feed-tag-row">
            <Link href="/tag/game" className="feed-tag-pill">#game</Link>
            <Link href="/tag/workout" className="feed-tag-pill">#workout</Link>
            <Link href="/tag/music" className="feed-tag-pill">#music</Link>
          </div>
        </article>

        {/* ----------------- FRAME 2: Carousel / Multi-Photo Post ----------------- */}
        <article className="feed-card">
          {/* Header on White Background */}
          <div className="feed-header">
            <div className="feed-header-left">
              <Link href="/u/emma" className="feed-avatar-ring">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Emma"
                />
              </Link>
              <div className="feed-user-meta">
                <Link href="/u/emma" className="feed-username">
                  @emma
                </Link>
                <span className="feed-subtitle">
                  <MapPin size={11} strokeWidth={2.2} />
                  New York, NY, United States &nbsp; 11:30 am
                </span>
              </div>
            </div>

            <div className="feed-header-right">
              <button
                type="button"
                className="feed-more-btn"
                aria-label="More options"
                onClick={() => showToast("Options menu")}
              >
                <MoreVertical size={19} />
              </button>
            </div>
          </div>

          {/* Media with 2/5 Counter Badge */}
          <div className="feed-media-container">
            <img
              src={CAROUSEL_IMAGES[card2CarouselIdx]}
              alt="Bridal bouquet"
              className="feed-media-img"
            />

            <span className="feed-carousel-badge">
              {card2CarouselIdx + 1}/{CAROUSEL_IMAGES.length}
            </span>

            {/* Navigation buttons for Carousel */}
            {card2CarouselIdx > 0 && (
              <button
                type="button"
                className="feed-carousel-nav prev"
                aria-label="Previous photo"
                onClick={() => setCard2CarouselIdx((prev) => prev - 1)}
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
            )}
            {card2CarouselIdx < CAROUSEL_IMAGES.length - 1 && (
              <button
                type="button"
                className="feed-carousel-nav next"
                aria-label="Next photo"
                onClick={() => setCard2CarouselIdx((prev) => prev + 1)}
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Action Metrics Row */}
          <div className="feed-actions">
            <button
              type="button"
              className={`feed-action-stat ${card2Liked ? "liked" : ""}`}
              onClick={() => setCard2Liked(!card2Liked)}
            >
              <Heart size={20} strokeWidth={card2Liked ? 0 : 2} />
              <span>{card2Liked ? "2.6k" : "2.5k"}</span>
            </button>

            <button type="button" className="feed-action-stat">
              <MessageCircle size={20} strokeWidth={2} />
              <span>58</span>
            </button>

            <button type="button" className="feed-action-stat">
              <Eye size={20} strokeWidth={2} />
              <span>1,5m</span>
            </button>

            <button
              type="button"
              className="feed-action-stat"
              onClick={() => showToast("Reposted to your feed!")}
            >
              <Repeat2 size={20} strokeWidth={2} />
              <span>200</span>
            </button>

            <div className="feed-action-right">
              <button
                type="button"
                className="feed-icon-btn"
                aria-label="Share post"
                onClick={() => showToast("Post link copied!")}
              >
                <Share2 size={20} strokeWidth={2} />
              </button>

              <button
                type="button"
                className={`feed-icon-btn ${card2Bookmarked ? "bookmarked" : ""}`}
                aria-label="Save post"
                onClick={() => {
                  setCard2Bookmarked(!card2Bookmarked);
                  showToast(card2Bookmarked ? "Removed from saved" : "Saved to bookmarks!");
                }}
              >
                <Bookmark size={20} strokeWidth={2} fill={card2Bookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Social Proof Row */}
          <div className="feed-social-proof">
            <div className="feed-stacked-avatars">
              {STACKED_AVATARS.map((src, i) => (
                <img key={i} src={src} alt="user" />
              ))}
            </div>
            <span className="feed-social-text">
              Like by <strong>emma</strong> and <strong>others</strong>
            </span>
          </div>

          {/* Caption */}
          <p className="feed-caption">
            <strong>@emma</strong>
            {card2More
              ? "Content like visuals, sports events videos can attention span of your post and create deep memorable impressions."
              : "Content like visuals, sports events videos can attention span of your post ..."}
            <button
              type="button"
              className="feed-more-btn-inline"
              onClick={() => setCard2More(!card2More)}
            >
              {card2More ? " Less" : "More"}
            </button>
          </p>

          {/* Hashtag Pills */}
          <div className="feed-tag-row">
            <Link href="/tag/game" className="feed-tag-pill">#game</Link>
            <Link href="/tag/workout" className="feed-tag-pill">#workout</Link>
            <Link href="/tag/music" className="feed-tag-pill">#music</Link>
          </div>
        </article>

        {/* ----------------- FRAME 3: Hashtag Community Chat Thread Post ----------------- */}
        <article className="feed-card">
          {/* Header with Hashtag and +Join */}
          <div className="feed-header">
            <div className="feed-header-left">
              <div className="feed-avatar-plain">
                <img
                  src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop&q=80"
                  alt="#travel&food"
                  className="feed-avatar-img"
                />
              </div>
              <div className="feed-user-meta">
                <Link href="/tag/travel-food" className="feed-username">
                  #travel&food
                </Link>
                <span className="feed-subtitle">
                  <MapPin size={11} strokeWidth={2.2} />
                  San Francisco... | 1:15 pm
                </span>
              </div>
            </div>

            <div className="feed-header-right">
              <button
                type="button"
                className={`feed-join-btn ${card3Joined ? "joined" : ""}`}
                onClick={() => {
                  setCard3Joined(!card3Joined);
                  showToast(card3Joined ? "Left #travel&food" : "Joined #travel&food!");
                }}
              >
                {card3Joined ? "Joined" : "+ Join"}
              </button>
              <button
                type="button"
                className="feed-more-btn"
                aria-label="More options"
                onClick={() => showToast("Options menu")}
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Post Description */}
          <p className="feed-post-text">
            {card3More
              ? "I like where your head is at. Sometimes the best way to find a solution isn't to sift through a billion search results, but simply talk to local food lovers who know every hidden secret spot in the city."
              : "I like where your head is at. Sometimes the best way to find a solution isn't to sift through a billion search..."}
            <button
              type="button"
              className="feed-more-btn-inline"
              onClick={() => setCard3More(!card3More)}
            >
              {card3More ? " hide" : " view more"}
            </button>
          </p>

          {/* Hashtag Pills (above chat thread) */}
          <div className="feed-tag-row">
            <Link href="/tag/game" className="feed-tag-pill">#game</Link>
            <Link href="/tag/workout" className="feed-tag-pill">#workout</Link>
            <Link href="/tag/music" className="feed-tag-pill">#music</Link>
          </div>

          {/* Nested Chat Thread Preview */}
          <div className="feed-chat-thread-container">
            {/* Vertical timeline connecting line */}
            <div className="feed-chat-line" />

            {/* Message 1: Jess */}
            <div className="feed-chat-msg">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
                alt="Jess"
                className="feed-chat-avatar"
              />
              <div className="feed-chat-bubble">
                <span className="feed-chat-bubble-author cyan">@jess</span>
                <p className="feed-chat-bubble-text">
                  &ldquo;Street tacos are an essential part of the experience here. You can&apos;t visit without trying them!&rdquo;
                </p>
                <div className="feed-chat-bubble-footer">
                  <span>12:45 PM</span>
                  <Check size={12} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Message 2: Robert */}
            <div className="feed-chat-msg">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="Robert"
                className="feed-chat-avatar"
              />
              <div className="feed-chat-bubble">
                <span className="feed-chat-bubble-author purple">@robert</span>
                <p className="feed-chat-bubble-text">
                  &ldquo;I prefer fine dining, though.
                </p>
                <div className="feed-chat-bubble-footer">
                  <span>12:46 PM</span>
                  <Check size={12} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Message 3: Robert */}
            <div className="feed-chat-msg">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="Robert"
                className="feed-chat-avatar"
              />
              <div className="feed-chat-bubble">
                <span className="feed-chat-bubble-author purple">@robert</span>
                <p className="feed-chat-bubble-text">
                  &ldquo;I prefer fine dining, though. There&apos;s nothing like a Michelin-starred meal to remember your trip by.&rdquo;
                </p>
                <div className="feed-chat-bubble-footer">
                  <span>12:46 PM</span>
                  <Check size={12} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Metrics Row (Frame 3 has red filled heart, 24 comments, 1.5m, send, bookmark) */}
          <div className="feed-actions">
            <button
              type="button"
              className={`feed-action-stat ${card3Liked ? "liked" : ""}`}
              onClick={() => setCard3Liked(!card3Liked)}
            >
              <Heart
                size={20}
                strokeWidth={card3Liked ? 0 : 2}
                fill={card3Liked ? "#e5484d" : "none"}
                color={card3Liked ? "#e5484d" : "currentColor"}
              />
              <span>{card3Liked ? "2.5k" : "2.4k"}</span>
            </button>

            <button type="button" className="feed-action-stat">
              <MessageCircle size={20} strokeWidth={2} />
              <span>24</span>
            </button>

            <button type="button" className="feed-action-stat">
              <Eye size={20} strokeWidth={2} />
              <span>1,5m</span>
            </button>

            <div className="feed-action-right">
              <button
                type="button"
                className="feed-icon-btn"
                aria-label="Send post"
                onClick={() => showToast("Sent to direct messages!")}
              >
                <Send size={19} strokeWidth={2} />
              </button>

              <button
                type="button"
                className={`feed-icon-btn ${card3Bookmarked ? "bookmarked" : ""}`}
                aria-label="Save post"
                onClick={() => {
                  setCard3Bookmarked(!card3Bookmarked);
                  showToast(card3Bookmarked ? "Removed from saved" : "Saved to bookmarks!");
                }}
              >
                <Bookmark size={20} strokeWidth={2} fill={card3Bookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Social Proof Row */}
          <div className="feed-social-proof">
            <div className="feed-stacked-avatars">
              {STACKED_AVATARS.map((src, i) => (
                <img key={i} src={src} alt="user" />
              ))}
            </div>
            <span className="feed-social-text">
              Like by <strong>emma</strong> and <strong>others</strong>
            </span>
          </div>
        </article>

      </section>

      <BottomNav />
    </main>
  );
}
