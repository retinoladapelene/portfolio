import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Dancing_Script, Syne, Outfit, Alex_Brush } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import PageTransition from "@/components/ui/PageTransition";
import ClientBackground from "@/components/ui/ClientBackground";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://moonchaery.com'),
  title: {
    default: "Moonchaery Studio",
    template: "%s | Moonchaery Studio"
  },
  description: "High-fidelity digital art, character design, and custom commissions with a liquid glass aesthetic by Moonchaery.",
  keywords: ["digital art", "character design", "commission", "illustration", "3D gallery", "anime art"],
  authors: [{ name: "Moonchaery" }],
  creator: "Moonchaery Studio",
  icons: {
    icon: "/moonchaerylogo.png",
    apple: "/moonchaerylogo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moonchaery.com",
    title: "Moonchaery Studio",
    description: "High-fidelity digital art, character design, and custom commissions with a liquid glass aesthetic.",
    siteName: "Moonchaery Studio",
    images: [{
      url: "/moonchaerylogo.png", // Fallback to logo, user should replace with a proper OG image
      width: 1200,
      height: 630,
      alt: "Moonchaery Studio Portfolio"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moonchaery Studio",
    description: "High-fidelity digital art and custom commissions.",
    creator: "@moonchaery", // Placeholder
    images: ["/moonchaerylogo.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Suspense } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";

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
        <LoadingScreen />
        <main className="relative min-h-screen">
          <ClientBackground />
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
