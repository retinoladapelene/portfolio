"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Quote, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import { SkillsSection, themeColors, ThemeStyleInjector } from "@/app/personal/SkillsSection";
import { ProfileSection } from "./components/ProfileSection";
import { LifeJourneySection } from "./components/LifeJourneySection";
import { ArchiveGallery } from "./components/ArchiveGallery";
import { HeroSection, EditorialIntro } from "./components/HeroSection";
import { usePersonalAnimations } from "./hooks/usePersonalAnimations";
import { personalData } from "./constants";

export default function PersonalPage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [activeThemeId, setActiveThemeId] = useState("lilac");
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [heroSettings, setHeroSettings] = useState<any>(null);

  const activeTheme = themeColors.find(t => t.id === activeThemeId) || themeColors[0];

  usePersonalAnimations({
    mounted,
    trackRef,
    imageRef,
    activeTheme,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Jakarta",
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Fetch hero settings
    fetch('/api/admin/personal-settings')
      .then(res => res.json())
      .then(result => {
        if (result.success) setHeroSettings(result.data);
      })
      .catch(err => console.error('Failed to fetch hero settings:', err));
  }, []);

  return (
    <div className="relative min-h-screen transition-colors duration-700"
      style={{
        "--theme-primary": activeTheme.primary,
        "--theme-light": activeTheme.light,
        "--theme-dot": activeTheme.dot,
      } as React.CSSProperties}
    >
      <ThemeStyleInjector activeThemeId={activeThemeId} />
      
      {/* Fixed Back Button */}
      <Link
        href="/"
        className="fixed right-3 top-3 sm:right-6 sm:top-6 md:right-10 md:top-10 z-[100] flex items-center gap-1.5 sm:gap-3 px-3.5 py-2 sm:px-6 sm:py-3 rounded-full bg-white/30 md:bg-white/20 backdrop-blur-xl border border-white/30 text-[#1A1F2B] shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all hover:bg-white/40 hover:scale-105 group"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        <span className="font-outfit text-[8px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em]">Back to Studio</span>
      </Link>
      
      <div ref={trackRef} className="relative w-full">
        <HeroSection 
          imageRef={imageRef} 
          currentTime={currentTime} 
          activeTheme={activeTheme} 
          heroSettings={heroSettings}
        />

        <div className="relative -mt-[100vh]">
          <EditorialIntro mounted={mounted} currentTime={currentTime} />
          <section className="relative h-[150vh] w-full overflow-hidden bg-transparent" />
        </div>
      </div>

      <ProfileSection />
      <LifeJourneySection />

      <div className="relative z-40 bg-transparent">
        <SkillsSection activeThemeId={activeThemeId} onThemeChange={setActiveThemeId} />
        <ArchiveGallery />

        {/* Quote Section */}
        <motion.section
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative px-6 py-24 text-center md:py-64 overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-200 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[100px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-5xl relative z-10"
          >
            <Quote className="mx-auto mb-8 md:mb-10 text-purple-500/30" size={40} />
            <p className="font-syne text-3xl leading-[1.2] text-[#1A1F2B] md:text-7xl font-bold italic tracking-tight">
              &quot;{personalData.quote}&quot;
            </p>

            <div className="mt-12 md:mt-20 flex flex-col items-center gap-6 md:gap-8">
              <span className="font-dancing-script text-2xl md:text-3xl text-purple-600">Ratu Balqis</span>

              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {["visual emotion", "high-fidelity render", "character soul"].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 md:px-6 md:py-2.5 rounded-full border border-purple-100 bg-white/50 backdrop-blur-sm font-outfit text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.section>

        <Footer />
      </div>
    </div>
  );
}
