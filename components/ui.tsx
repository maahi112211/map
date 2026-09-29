"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft, Bed, Bell, Building2, ChevronLeft, Coffee, Fuel, Hash, Home, Hospital, Landmark, MapPin,
  MessagesSquare, ParkingSquare, Search, ShoppingBag, Star, Trees, UtensilsCrossed, Wallet, Wine,
} from "lucide-react";
import type { PlaceCategory, User } from "@/lib/types";

export const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  coffee: "Coffee", restaurant: "Restaurants", park: "Parks", hotel: "Hotels", bar: "Bars", museum: "Museums",
  fuel: "Fuel", atm: "ATMs", hospital: "Hospitals", parking: "Parking", shop: "Shops", other: "Places",
};
export const CATEGORY_SINGULAR: Record<PlaceCategory, string> = {
  coffee: "Coffee shop", restaurant: "Restaurant", park: "Park", hotel: "Hotel", bar: "Bar", museum: "Museum",
  fuel: "Fuel station", atm: "ATM / Bank", hospital: "Hospital", parking: "Parking", shop: "Shop", other: "Place",
};

export function CategoryIcon({ category, size = 20 }: { category: PlaceCategory; size?: number }) {
  const I = { coffee: Coffee, restaurant: UtensilsCrossed, park: Trees, hotel: Bed, bar: Wine, museum: Landmark, fuel: Fuel, atm: Wallet, hospital: Hospital, parking: ParkingSquare, shop: ShoppingBag, other: Building2 }[category];
  return <I size={size} strokeWidth={1.8} aria-hidden="true" />;
}

/** Background-image with a colour fallback (works even when the image can't load). */
export function Img({ src, color = "#d9d4cc", className = "", style, label }: { src?: string; color?: string; className?: string; style?: React.CSSProperties; label?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`img ${className}`}
      style={{ display: "block", backgroundColor: color, backgroundImage: src ? `url("${src}")` : undefined, ...style }}
    />
  );
}

export function Avatar({ user, size = 44, ring = false }: { user: Pick<User, "name" | "avatarUrl" | "color">; size?: number; ring?: boolean }) {
  const [broken, setBroken] = useState(false);
  const initials = user.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const inner = (
    <span className="avatar" style={{ width: size, height: size, background: user.color, fontSize: Math.round(size * 0.34) }} aria-hidden="true">
      {initials}
      {user.avatarUrl && !broken && <img src={user.avatarUrl} alt="" onError={() => setBroken(true)} loading="lazy" />}
    </span>
  );
  return ring ? <span className="ringed">{inner}</span> : inner;
}

export function Rating({ rating, reviews, compact = false }: { rating?: number; reviews?: number; compact?: boolean }) {
  if (rating == null) return <span className="t-xs muted">No reviews yet</span>;
  return (
    <span className="row-c t-xs" style={{ gap: 4, fontWeight: 600 }}>
      <Star size={13} fill="#F5B301" color="#F5B301" aria-hidden="true" />
      {rating.toFixed(1)}
      {reviews != null && <span className="muted" style={{ fontWeight: 500 }}>{compact ? `(${reviews})` : ` · ${reviews} reviews`}</span>}
    </span>
  );
}

export function BackButton({ href, label = "Back", variant = "round" }: { href?: string; label?: string; variant?: "round" | "arrow" }) {
  const router = useRouter();
  const Icon = variant === "arrow" ? ArrowLeft : ChevronLeft;
  return (
    <button
      type="button"
      className="round sm"
      aria-label={label}
      onClick={() => (href ? router.push(href) : window.history.length > 1 ? router.back() : router.push("/map"))}
    >
      <Icon size={22} strokeWidth={2} />
    </button>
  );
}

export function BottomNav({ me }: { me?: Pick<User, "name" | "avatarUrl" | "color"> }) {
  const path = usePathname();
  const items = [
    { href: "/tab/home", label: "Home", icon: <Home size={23} strokeWidth={1.8} /> },
    { href: "/tab/chats", label: "Chats", icon: <MessagesSquare size={23} strokeWidth={1.8} /> },
    { href: "/map", label: "Discover map", icon: <Hash size={24} strokeWidth={2.2} /> },
    { href: "/search", label: "Search", icon: <Search size={23} strokeWidth={1.8} /> },
  ];
  return (
    <nav className="bottom-nav" aria-label="Main">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-label={i.label} aria-current={i.href !== "/search" && path === i.href ? "page" : undefined}>{i.icon}</Link>
      ))}
      <Link href="/tab/profile" aria-label="Your profile" aria-current={path === "/tab/profile" ? "page" : undefined}>
        <Avatar user={me ?? { name: "Me", color: "#E3E9F8", avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=me&backgroundColor=d6e4f5" }} size={34} />
      </Link>
    </nav>
  );
}

export function PlaceLine({ address, distance }: { address?: string; distance?: string }) {
  return (
    <span className="list-sub ellipsis">
      <MapPin size={13} aria-hidden="true" />
      <span className="ellipsis">{[address, distance].filter(Boolean).join(" · ")}</span>
    </span>
  );
}

export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return <div className="toast" role="status">{text}</div>;
}

export function compactNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function FriendsVisited({ friends, variant = "month" }: { friends: Pick<User, "name" | "avatarUrl" | "color" | "id">[]; variant?: "month" | "here" }) {
  if (!friends.length) return null;
  return (
    <span className="row-c t-xs" style={{ gap: 8 }}>
      <span className="row-c">
        {friends.slice(0, 3).map((f, i) => (
          <span key={f.id} style={{ marginLeft: i ? -8 : 0, border: "2px solid #fff", borderRadius: "50%", display: "inline-flex" }}>
            <Avatar user={f} size={22} />
          </span>
        ))}
      </span>
      <span className={variant === "here" ? "blue" : "muted"}>
        {friends.length} {friends.length === 1 ? "friend" : "friends"} {variant === "here" ? (friends.length === 1 ? "has been here" : "have been here") : "visited this month"}
      </span>
    </span>
  );
}
