"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InteractivePhoto } from "./InteractivePhoto";

export function HeroSection({ imageRef, currentTime, activeTheme, heroSettings }: { 
  imageRef: React.RefObject<HTMLDivElement | null>;
  currentTime: string;
  activeTheme: any;
  heroSettings: any;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      id="sticky-transition"
      className="sticky top-0 z-30 flex h-screen w-full items-center justify-center overflow-hidden pointer-events-auto"
    >
      {/* Background Marquee */}
      <motion.div
        id="marquee-container"
        className="absolute inset-0 z-0 flex flex-col justify-center gap-0 select-none overflow-hidden pointer-events-none opacity-0"
      >
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[1, 2, 3, 4].map((i) => (
            <h2 key={`mq-1-${i}`} className="font-syne text-[10vw] font-black tracking-tighter px-8 leading-[0.8]" style={{ color: 'var(--theme-primary)' }}>
              DIGITAL ARTISTRY • VISUAL EMOTIONS • BEYOND THE CANVAS •
            </h2>
          ))}
        </motion.div>
        <motion.div
          animate={{ x: [-1000, 0] }}
          transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[1, 2, 3, 4].map((i) => (
            <h2 key={`mq-2-${i}`} className="font-syne text-[10vw] font-black tracking-tighter px-8 leading-[0.8]" style={{ color: 'var(--theme-primary)' }}>
              REDEFINING AESTHETICS • CREATIVE ARCHIVE • EST. 2018 •
            </h2>
          ))}
        </motion.div>
      </motion.div>

      <div
        ref={imageRef}
        className="pointer-events-auto relative flex w-full items-end md:items-center justify-center will-change-transform h-full"
      >
        <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-0">
          <div
            id="transition-text"
            className="text-center opacity-0 absolute top-20 md:relative md:top-0 md:mb-12 flex flex-col items-center"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-6 opacity-40" style={{ background: 'var(--theme-primary)' }} />
              <span className="font-outfit text-[7px] font-black uppercase tracking-[0.5em] opacity-60" style={{ color: 'var(--theme-primary)' }}>
                Portfolio Index v.04
              </span>
              <div className="h-[1px] w-6 opacity-40" style={{ background: 'var(--theme-primary)' }} />
            </div>
            <h3 className="font-syne text-4xl font-extrabold tracking-tighter text-[#1A1F2B] md:text-5xl">
              REDEFINING <span className="font-light italic" style={{ color: 'var(--theme-primary)' }}>Aesthetics</span>
            </h3>
            <p className="mt-4 font-outfit text-[8px] font-bold uppercase tracking-[0.3em] text-black/30">
              Exploration of visual emotions & digital strokes
            </p>
          </div>

          <div className="relative group w-full flex justify-center">
            <div className="absolute -inset-8 pointer-events-none hidden md:block">
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: 'var(--theme-light)' }} />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: 'var(--theme-light)' }} />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: 'var(--theme-light)' }} />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: 'var(--theme-light)' }} />
            </div>

            <div className="relative flex items-end justify-center rounded-t-[32px] md:rounded-[32px] bg-white/5 border-t border-x border-purple-100/10 md:border-b h-[85vh] md:h-[95vh] self-end md:self-auto w-full md:w-[60vw]">
              <div className="relative w-full h-full flex items-end justify-center">
                <InteractivePhoto settings={heroSettings} />
              </div>

              <div
                id="reveal-name-back"
                className="absolute inset-0 -z-10 flex flex-col justify-end items-center opacity-0 pointer-events-none select-none pb-[18vw]"
              >
                <h2 className="font-outfit font-black text-[25vw] leading-[0.7] text-white tracking-tighter uppercase scale-y-105 origin-bottom" style={{ filter: `drop-shadow(0 10px 60px rgb(var(--theme-shadow-rgb) / 0.4))` }}>
                  RATU
                </h2>
              </div>

              <div
                id="reveal-name-front"
                className="absolute inset-0 z-50 flex flex-col justify-end items-center opacity-0 pointer-events-none select-none"
              >
                <h2 className="font-outfit font-black text-[25vw] leading-[0.7] text-white tracking-tighter uppercase mb-[-0.5vw] scale-y-105 origin-bottom" style={{ filter: `drop-shadow(0 10px 60px rgb(var(--theme-shadow-rgb) / 0.4))` }}>
                  BALQIS
                </h2>
              </div>
            </div>

            {/* Side labels */}
            <div
              id="side-label-left"
              className="absolute -left-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-4 pointer-events-none opacity-0"
            >
              <div className="h-12 w-[1px]" style={{ background: 'var(--theme-dot)' }} />
              <div className="flex flex-col items-center font-outfit text-[10px] font-bold uppercase tracking-[0.6em]" style={{ color: 'var(--theme-primary)' }}>
                {"AESTHETICS".split("").map((l, i) => (
                  <span key={i} className="my-1">{l}</span>
                ))}
              </div>
            </div>

            <div
              id="side-label-right"
              className="absolute -right-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-4 pointer-events-none opacity-0"
            >
              <div className="flex flex-col items-center font-outfit text-[10px] font-bold uppercase tracking-[0.6em]" style={{ color: 'var(--theme-primary)' }}>
                {"ARCHIVE".split("").map((l, i) => (
                  <span key={i} className="my-1">{l}</span>
                ))}
                <span className="mt-4 font-black" style={{ color: 'var(--theme-primary)' }}>v.04</span>
              </div>
              <div className="h-12 w-[1px]" style={{ background: 'var(--theme-dot)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorialIntro({ mounted, currentTime }: { mounted: boolean; currentTime: string }) {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-transparent">
      {mounted && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-purple-900/30 blur-[1px]"
              initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: Math.random() * 0.5 }}
              animate={{ y: ["-10%", "110%"], opacity: [0, 1, 0] }}
              transition={{ duration: 15 + Math.random() * 20, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            />
          ))}
        </div>
      )}



      <Link
        href="/"
        className="absolute left-6 top-6 z-50 flex items-center gap-2 group cursor-pointer font-dancing-script text-2xl text-[#1A1F2B] md:left-10 md:top-10"
      >
        <div className="w-5 h-5 rounded-lg shadow-sm rotate-12 group-hover:rotate-0 transition-transform" style={{ background: 'var(--theme-primary)' }} />
      </Link>

      {/* Background Names (Solid - Behind Photo) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none hidden md:flex flex-col justify-center p-6 md:p-20">
        <div className="relative h-full flex flex-col justify-center">
          <h2 className="font-outfit text-[22vw] md:text-[15vw] font-black leading-[0.7] tracking-tighter text-white absolute top-1/4 -left-4 md:static">
            RATU
          </h2>
          <h2 className="font-outfit text-[22vw] md:text-[15vw] font-black leading-[0.7] tracking-tighter text-white absolute bottom-1/4 -right-4 md:static md:ml-[10vw]">
            BALQIS
          </h2>
        </div>
      </div>

      {/* Foreground editorial layout (Includes Outline Names in front of Photo) */}
      <div className="absolute inset-0 z-[50] pointer-events-none select-none flex flex-col justify-between pt-12 p-6 md:pt-20 md:px-20 md:pb-6">
        {/* Outline Overlay for Sandwich Effect */}
        <div className="absolute inset-0 z-0 hidden md:flex flex-col justify-center p-20">
          <div className="relative h-full flex flex-col justify-center">
            <h2 
              className="font-outfit text-[22vw] md:text-[15vw] font-black leading-[0.7] tracking-tighter text-transparent static"
              style={{ WebkitTextStroke: '2px rgba(255, 255, 255, 0.7)' }}
            >
              RATU
            </h2>
            <h2 
              className="font-outfit text-[22vw] md:text-[15vw] font-black leading-[0.7] tracking-tighter text-transparent static ml-[10vw]"
              style={{ WebkitTextStroke: '2px rgba(255, 255, 255, 0.7)' }}
            >
              BALQIS
            </h2>
          </div>
        </div>

        <div className="flex flex-col items-center w-full pt-28 md:hidden">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-0"
          >
            <h1 className="font-outfit text-4xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              Ratu Balqis
            </h1>
            <p className="font-dancing-script text-2xl font-bold drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)] mt-[-8px]" style={{ color: 'var(--theme-primary)' }}>
              Creative Director & Illustrator
            </p>
          </motion.div>
        </div>

        <div className="hidden md:flex justify-between items-start" />
        <div className="flex-1" />

        <div className="grid grid-cols-12 gap-4 items-end pb-4 md:pb-0">
          <div className="col-span-8 md:hidden hidden" />

          <div className="hidden md:flex col-span-12 justify-between items-end w-full">
            <div className="flex items-baseline gap-4 mb-[-4px] md:-ml-12">
              <div className="h-[1px] w-12 mb-2" style={{ background: 'var(--theme-primary)', opacity: 0.4 }} />
              <p className="font-dancing-script text-4xl font-bold leading-none drop-shadow-md whitespace-nowrap" style={{ color: 'var(--theme-primary)' }}>
                Creative Director & Illustrator
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 group translate-y-2">
              <div className="flex items-center gap-4 mb-1">
                <span className="font-outfit text-[10px] font-black uppercase tracking-[0.5em] text-black/40">
                  Jakarta / GMT +7
                </span>
                <span className="font-outfit text-[9px] font-medium tracking-widest text-black/20">
                  Local Time: {currentTime}
                </span>
              </div>
              <div className="w-64 h-[1px] bg-purple-100 origin-right transition-transform group-hover:scale-x-105" />
              <div className="flex items-center gap-2 pt-1">
                <span className="font-outfit text-[11px] font-black uppercase tracking-[0.6em] text-purple-600/50">
                  Illustrator
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/30" />
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col items-end md:hidden">
            <span className="font-outfit text-[8px] font-black uppercase tracking-[0.3em] text-black/20">
              Indonesia
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
