import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResourceBox",
  description: "A local-first resource publishing application.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
