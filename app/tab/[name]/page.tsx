"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/ui";
import HomeScreen from "@/components/HomeScreen";
import NotificationsScreen from "@/components/NotificationsScreen";

// Placeholder for app tabs that live outside the map feature.
export default function TabPlaceholder() {
  const { name } = useParams<{ name: string }>();
  if (name === "home") return <HomeScreen />;
  if (name === "notifications") return <NotificationsScreen />;
  const title = { home: "Home", chats: "Chats", notifications: "Notifications", profile: "Profile" }[name] ?? name;
  return (
    <main className="screen pad">
      <h1 className="h1" style={{ marginTop: 12 }}>{title}</h1>
      <p className="t-sm muted">This tab is part of your main app. The map feature lives on the # tab.</p>
      <Link href="/map" className="btn dark" style={{ marginTop: 12 }}>Open map</Link>
      <BottomNav />
    </main>
  );
}
