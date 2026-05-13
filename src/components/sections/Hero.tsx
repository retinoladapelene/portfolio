"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Users, Palette, Zap, ArrowRight, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer, magneticHover, viewportSettings } from "@/lib/animations";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, -150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse move effect for background glows
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const [commissionsOpen, setCommissionsOpen] = useState(true);
  const [closedReason, setClosedReason] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const result = await res.json();
        if (result.success && result.data) {
          setCommissionsOpen(result.data.commissions_open);
          setClosedReason(result.data.closed_reason || "");
        }
      } catch (error) {
        console.error('Fetch settings error:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 100);
      mouseY.set((clientY / innerHeight - 0.5) * 100);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative min-h-[110vh] w-full overflow-hidden bg-transparent pt-20">
      {/* ─── ARTISTIC BACKGROUND ELEMENTS ────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dynamic Blooms - Subtle and soft for light theme */}
        <motion.div 
          style={{ x: springX, y: springY }}
          className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-400/5 rounded-full blur-[160px] opacity-30" 
        />
        
        {/* Vertical Editorial Text */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 -rotate-90 origin-left hidden xl:block">
          <span className="text-[10px] font-black text-black/5 uppercase tracking-[1em] whitespace-nowrap">
            ESTABLISHED // 2019 — DIGITAL ARCHIVE // 04.24
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 h-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-0 min-h-screen py-20">
          
          {/* ─── LEFT COLUMN: TYPOGRAPHY ───────────────────────────────────────── */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={viewportSettings}
            className="flex-1 z-20 text-center lg:text-left"
          >
            {/* Artistic Badge */}
            <motion.div
              variants={fadeUp}
              className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/[0.03] backdrop-blur-xl border border-black/5 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
              <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] font-outfit">
                Curating Visual Emotions
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={fadeUp} className="relative">
              <h1 className="text-black text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-normal leading-[0.95] tracking-tight mb-8">
                <span className="block font-outfit font-black opacity-90">Digital Art</span>
                <span className="block font-dancing-script text-purple-600 -mt-2 md:-mt-4 relative">
                  Paralaxed.
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-purple-600/0 via-purple-600/50 to-purple-600/0"
                  />
                </span>
              </h1>
            </motion.div>

            {/* Subtext with Editorial Line */}
            <div className="flex flex-col md:flex-row items-center lg:items-start gap-8 mb-12">
              <div className="w-12 h-px bg-black/10 mt-4 hidden md:block" />
              <motion.p
                variants={fadeUp}
                className="text-black/60 text-lg md:text-xl font-medium max-w-lg leading-relaxed font-outfit"
              >
                Where high-fidelity character design meets ethereal artistic vision. 
                Creating bespoke masterpieces for those who seek the extraordinary.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex flex-col items-center lg:items-start gap-4">
                <motion.button
                  onClick={() => window.dispatchEvent(new CustomEvent("openOrderForm"))}
                  {...magneticHover}
                  className={cn(
                    "group relative px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 overflow-hidden",
                    commissionsOpen 
                      ? "bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)]" 
                      : "bg-black/5 text-black/30 border border-black/5"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {commissionsOpen ? 'Request Commission' : 'Commissions Resting'} 
                    {commissionsOpen ? (
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <Sparkles size={16} className="opacity-30" />
                    )}
                  </span>
                  {commissionsOpen && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                  )}
                </motion.button>
                {!commissionsOpen && closedReason && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[9px] font-bold text-red-500/50 uppercase tracking-[0.2em] px-4"
                  >
                    Reason: {closedReason}
                  </motion.p>
                )}
              </div>

              <motion.a
                href="/portfolio"
                {...magneticHover}
                className="px-10 py-5 bg-white border border-purple-100 text-[#1A1F2B] rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-sm hover:bg-purple-50 transition-all hover:text-purple-600"
              >
                Explore Archive
              </motion.a>
            </motion.div>

            {/* Metrics */}
            <motion.div variants={fadeUp} className="mt-20 pt-10 border-t border-black/5 flex flex-wrap justify-center lg:justify-start gap-12 items-center opacity-70 hover:opacity-100 transition-opacity duration-700">
              {[
                { label: "Satisfied Soul", val: "150+" },
                { label: "Artistic Years", val: "06" },
                { label: "Unique Assets", val: "400+" },
              ].map((m) => (
                <div key={m.label} className="text-center lg:text-left">
                  <div className="text-2xl font-black text-black font-outfit tracking-tighter">{m.val}</div>
                  <div className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em] font-outfit mt-1">{m.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ─── RIGHT COLUMN: FLOATING ART GALLERY ────────────────────────────── */}
          <div className="flex-1 relative w-full h-[600px] lg:h-auto flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-square">
              
              {/* Main Floating Card */}
              <motion.div
                style={{ y: y1 }}
                initial={{ opacity: 0, rotate: 5, scale: 0.9 }}
                animate={{ opacity: 1, rotate: -2, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute top-10 left-10 w-4/5 aspect-[3/4] z-30"
              >
                <GlassCard level={2} className="w-full h-full p-3 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] border-white/20">
                  <div className="relative w-full h-full rounded-[30px] overflow-hidden">
                    <Image 
                      src="/artwork-hero.webp" 
                      alt="Art Showcase 1" 
                      fill 
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center text-white/80">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-widest">Masterpiece 01</div>
                        <div className="text-[8px] text-white/50 font-outfit">DIGITAL PORTRAIT // 2024</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Secondary Layering Cards */}
              <motion.div
                style={{ y: y2 }}
                initial={{ opacity: 0, x: 100, rotate: 10 }}
                animate={{ opacity: 0.6, x: 60, rotate: 8 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="absolute top-40 right-0 w-3/4 aspect-[4/5] z-10"
              >
                <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-purple-100 opacity-60 grayscale hover:grayscale-0 transition-all duration-1000 bg-white shadow-sm">
                  <Image src="/artwork-hero.webp" alt="Art Showcase 2" fill className="object-cover" sizes="(max-width: 768px) 100vw, 30vw" />
                </div>
              </motion.div>

              <motion.div
                style={{ y: y3 }}
                initial={{ opacity: 0, x: -100, rotate: -15 }}
                animate={{ opacity: 0.4, x: -60, rotate: -12 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="absolute -bottom-10 left-0 w-2/3 aspect-[4/3] z-0"
              >
                <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-purple-50 opacity-40 bg-white">
                  <Image src="/artwork-hero.webp" alt="Art Showcase 3" fill className="object-cover" sizes="(max-width: 768px) 100vw, 30vw" />
                </div>
              </motion.div>

              {/* Background Geometric Detail */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-purple-50 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-t border-b border-purple-50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
          </div>

        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em] rotate-90 mb-4">Scroll to Explore</span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-black/20 to-transparent" />
      </motion.div>
    </section>
  );
}
