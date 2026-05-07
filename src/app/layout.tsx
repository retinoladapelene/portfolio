import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Dancing_Script, Syne, Outfit, Alex_Brush } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import PageTransition from "@/components/ui/PageTransition";

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
  title: "Premium Artist Portfolio | Custom Commissions",
  description: "High-fidelity digital art, character design, and custom commissions with a liquid glass aesthetic.",
};

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
      <body className="min-h-full flex flex-col selection:bg-purple-500/30">
        {/* Global Background Container */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <Image
            src="/backgroundpageutama.webp"
            alt="Background"
            fill
            priority
            className="object-cover opacity-100"
          />
          {/* Consistent dark overlay for the whole page */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Global left-side shadow for text readability */}
          <div className="absolute inset-y-0 left-0 w-full md:w-2/3 bg-gradient-to-r from-black/35 via-black/5 to-transparent" />
        </div>

        <main className="relative min-h-screen">
          <div className="grain-overlay" />
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </body>
    </html>
  );
}
