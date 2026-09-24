import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuietFind",
  description: "Find the quietest, smartest study spots on campus with real-time recommendations and student reviews.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#fffaf7] text-slate-800">{children}</body>
    </html>
  );
}
