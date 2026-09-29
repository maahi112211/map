"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, AtSign, BellOff, Bookmark, ChevronRight, Clock3, Heart, MapPin, MessageCircle, Repeat2, Reply, Search, Settings, ShieldCheck, Tag, UserRoundPlus, UsersRound, X } from "lucide-react";
import { Toast } from "@/components/ui";

function AiSparkleIcon({ size = 20, fill = "currentColor", style }: { size?: number; fill?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
    </svg>
  );
}

function AiAvatarBadge({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", borderRadius: "50%", width: "100%", height: "100%" }}
    >
      <circle cx="28" cy="28" r="28" fill="#0c0d11" />
      <path
        d="M 28 10 Q 28 28 46 28 Q 28 28 28 46 Q 28 28 10 28 Q 28 28 28 10 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

type Filter = "All" | "Requests" | "Mentions" | "Activity" | "AI";
type Kind = "mention" | "tag" | "like" | "comment" | "comment-like" | "chat-like" | "reply" | "follow" | "follow-request" | "repost" | "save" | "reaction" | "story-like" | "group-add" | "role" | "ai";

type Notice = {
  id: number;
  section: "TODAY" | "THIS WEEK";
  kind: Kind;
  initials: string;
  avatarUrl?: string;
  hasStory?: boolean;
  color: string;
  lead: string;
  text: string;
  time: string;
  quote?: string;
  image?: string;
  action?: "follow" | "request" | "following" | "role-request";
  chatPreview?: { tag: string; location: string; image: string };
  unread?: boolean;
};

type Preferences = {
  pauseAll: boolean;
  chits: boolean;
  comments: boolean;
  chats: boolean;
  stories: boolean;
  follows: boolean;
  ai: boolean;
};

const defaultPreferences: Preferences = {
  pauseAll: false,
  chits: true,
  comments: true,
  chats: true,
  stories: true,
  follows: true,
  ai: true,
};

const STORAGE_KEY = "openone-notifications";

const initialNotices: Notice[] = [
  { id: 1, section: "TODAY", kind: "like", initials: "AM", avatarUrl: "https://i.pravatar.cc/160?img=12", hasStory: true, color: "#d9eee6", lead: "Aarav Mehta", text: "and 24 others have liked your Chit", time: "2m", image: "https://picsum.photos/seed/cafe-notification/120/120", unread: true },
  { id: 2, section: "TODAY", kind: "comment", initials: "SI", avatarUrl: "https://i.pravatar.cc/160?img=47", color: "#f8e9bf", lead: "Sana Iqbal", text: "has commented on your Chit", time: "8m", quote: "“Loved the colours in this one.”", image: "https://picsum.photos/seed/cafe-notification/120/120", unread: true },
  { id: 3, section: "TODAY", kind: "mention", initials: "MS", avatarUrl: "https://i.pravatar.cc/160?img=15", color: "#f7d9cc", lead: "@mansation", text: "has mentioned you in a comment", time: "16m", quote: "“@ananya, you need to see this place!”", image: "https://picsum.photos/seed/mention-notification/120/120", unread: true },
  { id: 4, section: "TODAY", kind: "tag", initials: "RK", avatarUrl: "https://i.pravatar.cc/160?img=44", hasStory: true, color: "#dfdaf7", lead: "Riya Kapoor", text: "has tagged you in a Chit", time: "32m", image: "https://picsum.photos/seed/tag-notification/120/120", unread: true },
  { id: 16, section: "TODAY", kind: "role", initials: "RA", avatarUrl: "https://i.pravatar.cc/160?img=33", color: "#d9e8f6", lead: "Rohan Arya", text: "has invited you to become an Admin in City Explorers", time: "25m", action: "role-request", unread: true },
  { id: 5, section: "TODAY", kind: "repost", initials: "KS", avatarUrl: "https://i.pravatar.cc/160?img=33", color: "#d7ebfa", lead: "Kabir Singh", text: "has reposted your Chit", time: "1h", image: "https://picsum.photos/seed/repost-notification/120/120" },
  { id: 6, section: "TODAY", kind: "reaction", initials: "TN", avatarUrl: "https://i.pravatar.cc/160?img=49", color: "#f7d8cd", lead: "Tanvi Nair", text: "has reacted ❤️ to your Story", time: "2h", image: "https://picsum.photos/seed/story-notification/120/120" },
  { id: 7, section: "TODAY", kind: "ai", initials: "AI", color: "#e9e2ff", lead: "Chat Summary for #London Weather", text: "is ready", time: "32m", quote: "London’s weather was described as cool (15°C / 59°F) and cloudy, with mild dissatisfaction.", unread: true },
  { id: 8, section: "THIS WEEK", kind: "save", initials: "MN", avatarUrl: "https://i.pravatar.cc/160?img=32", color: "#d7ece7", lead: "Meera Nair", text: "has saved your Chit to Places to Visit", time: "1d", image: "https://picsum.photos/seed/saved-notification/120/120" },
  { id: 9, section: "THIS WEEK", kind: "follow", initials: "NJ", avatarUrl: "https://i.pravatar.cc/160?img=45", color: "#f5e7bd", lead: "Neha Jain", text: "has started following you", time: "2d", action: "follow" },
  { id: 10, section: "TODAY", kind: "comment-like", initials: "TT", avatarUrl: "https://i.pravatar.cc/160?img=11", color: "#f4d6df", lead: "@terry_torres", text: "has liked your comment", time: "3h", quote: "“A very different approach — instead of adding AI to the workflow.”", unread: true },
  { id: 11, section: "TODAY", kind: "reply", initials: "RB", avatarUrl: "https://i.pravatar.cc/160?img=13", color: "#d9e8f6", lead: "@robert", text: "has replied to your comment", time: "4h", quote: "“I prefer fine dining, though.”", unread: true },
  { id: 12, section: "THIS WEEK", kind: "group-add", initials: "SN", avatarUrl: "https://i.pravatar.cc/160?img=48", color: "#e8d9ef", lead: "Sara North", text: "has added you to the group Hello Everyone", time: "1d", unread: true },
  { id: 13, section: "THIS WEEK", kind: "role", initials: "JD", avatarUrl: "https://i.pravatar.cc/160?img=68", color: "#d9e6dc", lead: "Jack Deo", text: "has invited you to become a Moderator in Hello Everyone", time: "1d", action: "role-request", unread: true },
  { id: 17, section: "THIS WEEK", kind: "follow-request", initials: "TJ", color: "#dff1fa", lead: "Tara Joshi", text: "requested to follow you", time: "1d", action: "request", unread: true },
  { id: 14, section: "TODAY", kind: "story-like", initials: "EM", avatarUrl: "https://i.pravatar.cc/160?img=9", hasStory: true, color: "#f6dfd5", lead: "Emma Wilson", text: "has liked your Story", time: "12m", image: "https://picsum.photos/seed/emma-story/120/120", unread: true },
  { id: 15, section: "TODAY", kind: "chat-like", initials: "MJ", avatarUrl: "https://i.pravatar.cc/160?img=25", color: "#eee5dc", lead: "mike.jk", text: "has liked your Chat", time: "6m", quote: "Content such as visuals and sports videos can increase your audience’s attention span…", chatPreview: { tag: "#ios_2027", location: "New York, USA", image: "https://i.pravatar.cc/160?img=16" }, unread: true },
];

const isRequestNotice = (notice: Notice) => {
  return (
    notice.kind === "role" ||
    notice.kind === "group-add" ||
    notice.kind === "follow-request" ||
    notice.action === "request" ||
    notice.action === "role-request"
  );
};

const filterMatches = (filter: Filter, notice: Notice) => {
  if (filter === "All") return true;
  if (filter === "Requests") return isRequestNotice(notice);
  if (filter === "Mentions") return notice.kind === "mention" || notice.kind === "tag";
  if (filter === "AI") return notice.kind === "ai";
  return (
    notice.kind !== "mention" &&
    notice.kind !== "tag" &&
    notice.kind !== "ai" &&
    !isRequestNotice(notice)
  );
};

function NoticeIcon({ kind }: { kind: Kind }) {
  if (kind === "like" || kind === "reaction" || kind === "story-like" || kind === "comment-like" || kind === "chat-like") return <Heart size={13} fill="currentColor" />;
  if (kind === "comment") return <MessageCircle size={13} />;
  if (kind === "reply") return <Reply size={13} />;
  if (kind === "mention") return <AtSign size={13} strokeWidth={2.5} />;
  if (kind === "tag") return <Tag size={13} />;
  if (kind === "repost") return <Repeat2 size={13} />;
  if (kind === "save") return <Bookmark size={13} fill="currentColor" />;
  if (kind === "group-add") return <UsersRound size={13} />;
  if (kind === "role") return <ShieldCheck size={13} />;
  if (kind === "follow-request") return <Clock3 size={13} strokeWidth={2.5} />;
  if (kind === "ai") return <AiSparkleIcon size={13} fill="#fff" />;
  return <UserRoundPlus size={13} />;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [notices, setNotices] = useState(initialNotices);
  const [toast, setToast] = useState<string | null>(null);
  const [actions, setActions] = useState<Record<number, string>>({});
  const [manageOpen, setManageOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isReady, setIsReady] = useState(false);
  const toastTimer = useRef<number | null>(null);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as {
          unreadIds?: number[];
          actions?: Record<number, string>;
          preferences?: Partial<Preferences>;
        };
        if (Array.isArray(state.unreadIds)) {
          const unreadIds = new Set(state.unreadIds);
          setNotices((current) => current.map((notice) => ({ ...notice, unread: unreadIds.has(notice.id) })));
        }
        if (state.actions) setActions(state.actions);
        if (state.preferences) setPreferences({ ...defaultPreferences, ...state.preferences });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      unreadIds: notices.filter((notice) => notice.unread).map((notice) => notice.id),
      actions,
      preferences,
    }));
  }, [actions, isReady, notices, preferences]);

  useEffect(() => {
    if (!manageOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setManageOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [manageOpen]);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const requestCount = useMemo(() => {
    return notices.filter((n) => isRequestNotice(n) && !actions[n.id]).length;
  }, [notices, actions]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (searchOpen && !term) return [];
    return notices.filter((notice) => {
      if (filter === "Requests" && actions[notice.id]) return false;
      return filterMatches(filter, notice) && (!term || `${notice.lead} ${notice.text} ${notice.quote ?? ""}`.toLowerCase().includes(term));
    });
  }, [actions, filter, notices, query, searchOpen]);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  };

  const runAction = (id: number, label: string) => {
    setActions((current) => ({ ...current, [id]: label }));
    setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, unread: false } : notice));
    notify(label === "Accepted" ? "Role request accepted" : label === "Rejected" ? "Role request rejected" : label === "Confirmed" ? "Follow request confirmed" : label === "Following" ? "You’re now following them" : label === "Follow back" ? "Unfollowed" : "Request deleted");
  };

  const preferenceRows = [
    { key: "chits", label: "Chit activity", detail: "Likes, tags, reposts and saves" },
    { key: "comments", label: "Comments and replies", detail: "Mentions, replies and comment likes" },
    { key: "chats", label: "Chats and groups", detail: "Chat likes, invitations and role requests" },
    { key: "stories", label: "Story activity", detail: "Story likes and reactions" },
    { key: "follows", label: "New followers", detail: "Follow requests and new followers" },
    { key: "ai", label: "AI chat summaries", detail: "Summaries from active group chats" },
  ] as const;

  return (
    <main className="screen notifications-screen">
      <header className="notifications-header">
        {searchOpen ? (
          <div className="notification-search-screen-header">
            <button
              type="button"
              className="notification-back"
              aria-label="Back to notifications"
              onClick={() => { setSearchOpen(false); setQuery(""); }}
            >
              <ArrowLeft size={24} strokeWidth={2} />
            </button>
            <label className="notification-search">
              <Search size={21} aria-hidden="true" />
              <span className="sr">Search notifications</span>
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notifications"
              />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} strokeWidth={2.5} /></button>}
            </label>
          </div>
        ) : <>
          <div className="notifications-title-row">
            <button type="button" className="notification-back" aria-label="Back" onClick={() => (window.history.length > 1 ? router.back() : router.push("/map"))}>
              <ArrowLeft size={24} strokeWidth={2} />
            </button>
            <h1>Notifications</h1>
            <div className="notifications-header-right">
              <button type="button" className="notification-header-btn" aria-label="Search notifications" onClick={() => { setFilter("All"); setSearchOpen(true); }}>
                <Search size={22} strokeWidth={2} />
              </button>
              <button type="button" className="notification-settings" aria-label="Manage notifications" onClick={() => setManageOpen(true)}>
                <Settings size={22} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div id="notification-filters" className="notification-filters" role="tablist" aria-label="Filter notifications">
          {(["All", "AI", "Activity", "Mentions", "Requests"] as Filter[]).map((item) => (
            <button key={item} className={item === "AI" ? "notification-ai-filter" : undefined} role="tab" aria-selected={filter === item} onClick={() => setFilter(item)}>
              {item === "AI" && (
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#0c0d11",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: 8,
                  }}
                >
                  <AiSparkleIcon size={15} fill="#ffffff" />
                </span>
              )}
              {item}
              {item === "Requests" && requestCount > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 10,
                    background: filter === "Requests" ? "var(--ink)" : "#6849e8",
                    color: "#fff",
                    lineHeight: "15px",
                    display: "inline-block",
                  }}
                >
                  {requestCount}
                </span>
              )}
            </button>
          ))}
          </div>
        </>}
      </header>

      <div className="notification-list">
        {(["TODAY", "THIS WEEK"] as const).map((section) => {
          const items = visible.filter((notice) => notice.section === section);
          if (!items.length) return null;
          return (
            <section key={section} className="notification-section" aria-labelledby={`notifications-${section}`}>
              <div className="notification-section-heading">
                <h2 id={`notifications-${section}`}>{section}</h2>
                {section === "TODAY" && <button disabled={!visible.some((notice) => notice.unread)} onClick={() => {
                  const visibleIds = new Set(visible.map((notice) => notice.id));
                  setNotices((items) => items.map((item) => visibleIds.has(item.id) ? { ...item, unread: false } : item));
                  notify("Visible notifications marked as read");
                }}>Mark all as read</button>}
              </div>
              <div className={section === "TODAY" ? "notification-group unread-group" : "notification-group"}>
                {items.map((notice) => (
                  <article key={notice.id} className="notification-item" onClick={() => setNotices((current) => current.map((item) => item.id === notice.id ? { ...item, unread: false } : item))}>
                    <div
                      className={`notification-avatar${notice.kind === "ai" ? " ai-avatar" : ""}${notice.avatarUrl ? " has-image" : ""}${notice.hasStory ? " has-story" : ""}`}
                      style={{ background: notice.kind === "ai" ? "transparent" : notice.color }}
                    >
                      {notice.kind === "ai" ? (
                        <AiAvatarBadge size={56} />
                      ) : (
                        <span>{notice.initials}</span>
                      )}
                      {notice.avatarUrl && notice.kind !== "ai" && <img src={notice.avatarUrl} alt={`${notice.lead} profile`} />}
                      {notice.kind !== "ai" && <i className={`notification-kind ${notice.kind}`} aria-hidden="true"><NoticeIcon kind={notice.kind} /></i>}
                    </div>
                    <div className="notification-copy">
                      <p><strong>{notice.lead}</strong> {notice.text} <time>· {notice.time}</time></p>
                      {notice.quote && <p className="notification-quote">{notice.quote}</p>}
                      {notice.chatPreview && <button className="notification-chat-preview" onClick={(event) => { event.stopPropagation(); notify(`Opening ${notice.chatPreview!.tag}`); }}>
                        <img src={notice.chatPreview.image} alt="" />
                        <span><strong>{notice.chatPreview.tag}</strong><small><MapPin size={15} />{notice.chatPreview.location}</small></span>
                        <ChevronRight size={22} />
                      </button>}
                      {notice.action === "request" && !actions[notice.id] && (
                        <div className="notification-actions follow-request-actions">
                          <button onClick={(event) => { event.stopPropagation(); runAction(notice.id, "Confirmed"); }}>Confirm</button>
                          <button onClick={(event) => { event.stopPropagation(); runAction(notice.id, "Deleted"); }}>Delete</button>
                        </div>
                      )}
                      {notice.action === "role-request" && !actions[notice.id] && (
                        <div className="notification-actions role-actions">
                          <button onClick={(event) => { event.stopPropagation(); runAction(notice.id, "Accepted"); }}>Accept</button>
                          <button onClick={(event) => { event.stopPropagation(); runAction(notice.id, "Rejected"); }}>Reject</button>
                        </div>
                      )}
                      {(notice.action === "request" || notice.action === "role-request") && actions[notice.id] && (
                        <span className={`notification-action-state ${actions[notice.id].toLowerCase()}`}>{actions[notice.id]}</span>
                      )}
                    </div>
                    {notice.image && <span className="notification-thumb" style={{ backgroundImage: `url(${notice.image})` }} aria-hidden="true" />}
                    {notice.action === "follow" && <button className="notification-follow" onClick={(event) => { event.stopPropagation(); runAction(notice.id, actions[notice.id] ? "Follow back" : "Following"); }}>{actions[notice.id] || "Follow back"}</button>}
                    {notice.action === "following" && <button className="notification-follow muted-action" onClick={(event) => event.stopPropagation()}>Following</button>}
                    {notice.unread && <span className="unread-dot" aria-label="Unread" />}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
        {!visible.length && (
          <div className="notification-empty">
            {searchOpen ? <Search size={34} /> : <Clock3 size={34} />}
            <strong>{searchOpen && !query.trim() ? "Search notifications" : filter === "Requests" ? "No pending requests" : "No notifications found"}</strong>
            <span>{searchOpen && !query.trim() ? "Search by person, activity or message." : filter === "Requests" ? "You have no pending invitations or requests." : "Try a different search or filter."}</span>
          </div>
        )}
      </div>
      {manageOpen && <>
        <button className="notification-manage-scrim" aria-label="Close notification settings" onClick={() => setManageOpen(false)} />
        <section className="notification-manage-sheet" role="dialog" aria-modal="true" aria-labelledby="manage-notifications-title">
          <div className="notification-sheet-handle" aria-hidden="true" />
          <div className="notification-manage-title">
            <div><h2 id="manage-notifications-title">Manage notifications</h2><p>Choose what you would like to hear about.</p></div>
          </div>
          <div className="notification-pause-row">
            <span className="notification-manage-icon"><BellOff size={20} /></span>
            <span><strong>Pause all</strong><small>Temporarily silence every notification</small></span>
            <button className="switch" role="switch" aria-checked={preferences.pauseAll} aria-label="Pause all notifications" onClick={() => setPreferences((current) => ({ ...current, pauseAll: !current.pauseAll }))} />
          </div>
          <div className="notification-preference-list">
            {preferenceRows.map((row) => <div className="notification-preference-row" key={row.key}>
              <span><strong>{row.label}</strong><small>{row.detail}</small></span>
              <button className="switch" role="switch" disabled={preferences.pauseAll} aria-checked={!preferences.pauseAll && preferences[row.key]} aria-label={`Toggle ${row.label}`} onClick={() => setPreferences((current) => ({ ...current, [row.key]: !current[row.key] }))} />
            </div>)}
          </div>
          <button className="notification-done" onClick={() => { setManageOpen(false); notify("Notification preferences saved"); }}>Done</button>
        </section>
      </>}
      <Toast text={toast} />
    </main>
  );
}
