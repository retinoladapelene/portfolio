"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Hero from "@/components/sections/Hero";
import dynamic from "next/dynamic";

const HorizontalBloomingTimeline = dynamic(() => import("@/components/portfolio/HorizontalBloomingTimeline"), {
  ssr: false,
});
const Pricing = dynamic(() => import("@/components/sections/Pricing"), {
  ssr: false,
});
const ClientStories = dynamic(() => import("@/components/sections/ClientStories"), {
  ssr: false,
});
const OrderForm = dynamic(() => import("@/components/sections/OrderForm"), {
  ssr: false,
});
const FAQ = dynamic(() => import("@/components/sections/FAQ"), {
  ssr: false,
});
const QueueBoard = dynamic(() => import("@/components/sections/QueueBoard"), {
  ssr: false,
});

// ─── SECTION REVEAL WRAPPER (120FPS OPTIMIZED) ─────────────────────────────
const SectionReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ 
      duration: 1.2, 
      delay: delay,
      ease: [0.16, 1, 0.3, 1] // Luxurious "Slow-to-Fast" curve
    }}
    className="will-change-transform"
  >
    {children}
  </motion.div>
);

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      
      {/* Hero stays static or has its own internal entrance to prevent initial load jank */}
      <Hero />

      <div className="space-y-0">
        <SectionReveal>
          <HorizontalBloomingTimeline />
        </SectionReveal>

        <SectionReveal>
          <Pricing />
        </SectionReveal>

        <SectionReveal>
          <QueueBoard />
        </SectionReveal>

        <SectionReveal>
          <ClientStories />
        </SectionReveal>

        <OrderForm />

        <SectionReveal>
          <FAQ />
        </SectionReveal>
      </div>

      <Footer />
    </div>
  );
}
