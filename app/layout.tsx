import type { Metadata, Viewport } from "next";
// Self-hosted fonts (no Google Fonts request at build or runtime).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import IPhoneFrame from "@/components/IPhoneFrame";

export const metadata: Metadata = {
  title: "OpenOne Map",
  description: "Stories, posts, people and places around you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F5F6F8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IPhoneFrame>{children}</IPhoneFrame>
      </body>
    </html>
  );
}
