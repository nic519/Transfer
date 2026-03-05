import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clash Proxy Console",
  description: "Professional proxy service console for Clash subscription links",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
