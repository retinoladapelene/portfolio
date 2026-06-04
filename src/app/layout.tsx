import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Dancing_Script, Syne, Outfit, Alex_Brush } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import PageTransition from "@/components/ui/PageTransition";
import InteractiveBackground from "@/components/ui/InteractiveBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: ["400"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moonchaery Studio | Premium Digital Artist",
  description: "High-fidelity digital art, character design, and custom commissions with a liquid glass aesthetic.",
  icons: {
    icon: "/logomoonchaery.svg",
  },
};

import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${syne.variable} ${outfit.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-purple-500/30 bg-transparent">
        <main className="relative min-h-screen">
          <InteractiveBackground />
          <div className="grain-overlay" />
          <ToastProvider>
            <ConfirmProvider>
              <Suspense fallback={null}>
                <AnalyticsTracker />
              </Suspense>
              <PageTransition>
                {children}
              </PageTransition>
            </ConfirmProvider>
          </ToastProvider>
        </main>
      </body>
    </html>
  );
}
