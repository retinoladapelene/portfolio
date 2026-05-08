"use client";

import { useReducedMotion, useScroll, useMotionValueEvent, useTransform, motion } from "framer-motion";
import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import BrushStrokeMask from "../portfolio/BrushStrokeMask";
import { MonitorPlay, LayoutGrid, Maximize2, Info } from "lucide-react";

const ARTWORKS = [
  { 
    id: 1, 
    image: "/art1.jpg", 
    title: "Cyberpunk Oni", 
    category: "Character Concept",
    desc: "A fusion of traditional Japanese folklore and futuristic neon aesthetics."
  },
  { 
    id: 2, 
    image: "/art2.jpg", 
    title: "Ethereal Landscape", 
    category: "Environment",
    desc: "Floating islands and bioluminescent flora in a dream-like realm."
  },
  { 
    id: 3, 
    image: "/art3.jpg", 
    title: "The Guardian", 
    category: "Portrait",
    desc: "Detailed close-up focusing on the emotional depth and mechanical textures."
  },
  { 
    id: 4, 
    image: "/art4.jpg", 
    title: "Street Samurai", 
    category: "Action",
    desc: "Dynamic pose and lighting designed for cinematic storytelling."
  },
];

const totalArtworks = ARTWORKS.length;

export default function ImmersivePortfolio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"immersive" | "grid">("immersive");
  
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion, we should default to grid or simplified immersive
  useEffect(() => {
    if (prefersReducedMotion) {
      setViewMode("grid");
    }
  }, [prefersReducedMotion]);

  // Track brush progress for each transition zone
  const [brushProgresses, setBrushProgresses] = useState<number[]>(
    () => new Array(totalArtworks - 1).fill(0)
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (viewMode === "grid") return;

    const idx = Math.min(
      Math.floor(latest * totalArtworks),
      totalArtworks - 1
    );
    if (idx !== activeIdx) setActiveIdx(idx);

    const newProgresses: number[] = [];
    for (let i = 0; i < totalArtworks - 1; i++) {
      const segStart = (i + 0.55) / totalArtworks;
      const segEnd = (i + 1.0) / totalArtworks;

      let brushP = 0;
      if (latest >= segEnd) {
        brushP = 1;
      } else if (latest > segStart) {
        brushP = (latest - segStart) / (segEnd - segStart);
      }
      newProgresses.push(Math.min(1, Math.max(0, brushP)));
    }
    setBrushProgresses(newProgresses);
  });

  return (
    <section 
      id="portfolio" 
      ref={containerRef} 
      className={cn(
        "relative bg-transparent z-20 transition-all duration-700",
        viewMode === "immersive" ? "h-[400vh]" : "min-h-screen h-auto py-32"
      )}
    >
      {viewMode === "immersive" ? (
        /* Immersive Sticky Frame */
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-white/40 backdrop-blur-sm">
          {ARTWORKS.map((art, i) => {
            const segment = 1 / totalArtworks;
            const start = i * segment;
            const end = (i + 1) * segment;
            
            const r1 = i === 0 ? 0 : Math.max(0, start - 0.05);
            const r2 = i === 0 ? 0 : start + 0.01;
            const r3 = i === totalArtworks - 1 ? 1 : end - 0.05;
            const r4 = i === totalArtworks - 1 ? 1 : end;

            return (
              <ArtworkScene
                key={art.id}
                art={art}
                index={i}
                total={totalArtworks}
                scrollYProgress={scrollYProgress}
                activeIdx={activeIdx}
                r1={r1} r2={r2} r3={r3} r4={r4}
                start={start} end={end}
                brushProgress={i > 0 ? brushProgresses[i - 1] : 0}
              />
            );
          })}

          {/* Cinematic Progress Hud */}
          <div className="absolute inset-x-0 top-0 p-12 flex justify-between items-start z-30 pointer-events-none">
             <div>
                <div className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em] mb-3">Immersive Sequence</div>
                <div className="flex gap-1">
                   {ARTWORKS.map((_, i) => (
                     <motion.div 
                       key={i}
                        className={cn(
                          "h-[2px] rounded-full transition-all duration-500",
                          activeIdx === i ? "w-12 bg-purple-600" : "w-4 bg-black/10"
                        )}
                     />
                   ))}
                </div>
             </div>

             <div className="flex flex-col items-end gap-3 pointer-events-auto">
                <div className="text-[10px] font-black text-black/40 uppercase tracking-widest">Active Layer</div>
                <div className="text-2xl font-black text-black italic tracking-tighter">
                  0{activeIdx + 1} <span className="text-black/10">/ 0{ARTWORKS.length}</span>
                </div>
             </div>
          </div>

          {/* Scroll Call to Action */}
          {!prefersReducedMotion && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4">
               <div className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] scroll-text">Scroll Experience</div>
               <div className="w-[1px] h-16 bg-gradient-to-b from-purple-600/0 via-purple-600 to-purple-600/0" />
            </div>
          )}
        </div>
      ) : (
        /* Grid View Mode */
        <div className="container mx-auto px-6">
          <div className="mb-20 space-y-4">
             <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter italic">GALLERY.</h2>
             <p className="text-black/40 max-w-xl text-lg uppercase tracking-widest font-bold">Standard Grid View</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTWORKS.map((art) => (
              <motion.div 
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-black/5"
              >
                <Image 
                  src={art.image} 
                  alt={art.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 flex flex-col justify-end">
                   <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2">{art.category}</span>
                   <h3 className="text-2xl font-bold text-white mb-2">{art.title}</h3>
                   <p className="text-white/60 text-sm line-clamp-2">{art.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode Toggle Switch */}
      <div className="fixed bottom-12 right-12 z-[100]">
         <div className="bg-white/40 backdrop-blur-2xl border border-black/5 p-1.5 flex gap-1 shadow-2xl rounded-2xl scale-110">
            <button 
              onClick={() => {
                setViewMode("immersive");
                containerRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                viewMode === "immersive" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "text-black/40 hover:text-black hover:bg-black/5"
              )}
            >
              <MonitorPlay size={14} /> Immersive
            </button>
            <button 
              onClick={() => {
                setViewMode("grid");
                containerRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                viewMode === "grid" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "text-black/40 hover:text-black hover:bg-black/5"
              )}
            >
              <LayoutGrid size={14} /> Grid
            </button>
         </div>
      </div>
    </section>
  );
}

interface ArtworkSceneProps {
  art: typeof ARTWORKS[0];
  index: number;
  total: number;
  scrollYProgress: any;
  activeIdx: number;
  r1: number; r2: number; r3: number; r4: number;
  start: number; end: number;
  brushProgress: number; // brush revealing THIS scene (entering)
}

function ArtworkScene({
  art, index, total, scrollYProgress, activeIdx,
  r1, r2, r3, r4, start, end,
  brushProgress,
}: ArtworkSceneProps) {
  const prefersReducedMotion = useReducedMotion();

  // Standard scroll-driven opacity
  const baseOpacity = useTransform(
    scrollYProgress,
    [r1, r2, r3, r4],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [start, end],
    [1, 1.05]
  );

  const blurValue = useTransform(
    scrollYProgress,
    [r1, r2, r3, r4],
    [index === 0 ? 0 : 10, 0, 0, index === total - 1 ? 0 : 10]
  );
  
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

  const maskUrl = `url(#brush-mask-${index})`;

  return (
    <motion.div
      style={{ 
        opacity: baseOpacity, 
        filter: prefersReducedMotion ? "none" : filter,
        zIndex: activeIdx === index ? 20 : (activeIdx === index - 1 ? 15 : 0),
        pointerEvents: activeIdx === index ? "auto" : "none",
        maskImage: (!prefersReducedMotion && index > 0 && brushProgress > 0 && brushProgress < 1) ? maskUrl : "none",
        WebkitMaskImage: (!prefersReducedMotion && index > 0 && brushProgress > 0 && brushProgress < 1) ? maskUrl : "none",
      }}
      className="absolute inset-0"
    >
      <motion.div style={{ scale: prefersReducedMotion ? 1 : scale }} className="relative w-full h-full">
        {/* Soft Vignette for Light Editorial feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40 z-10" />
        <Image
          src={art.image}
          alt={art.title}
          fill
          className="object-cover"
          priority={index === 0}
        />
      </motion.div>

      {/* Brush Stroke Mask Definition — only if this scene is being revealed */}
      {!prefersReducedMotion && index > 0 && brushProgress > 0 && brushProgress < 1 && (
        <BrushStrokeMask progress={brushProgress} id={index.toString()} />
      )}

      {/* Content Panel */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <div>
               <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-black tracking-widest uppercase border border-purple-500/20">
                  {art.category}
               </span>
               <h2 className="text-5xl md:text-8xl font-black text-black mt-4 tracking-tighter uppercase italic leading-[0.9]">
                  {art.title}
               </h2>
            </div>

            <div className="glass-card p-8 border-black/5 bg-white/40 backdrop-blur-xl max-w-md shadow-lg">
               <p className="text-black/60 text-base leading-relaxed mb-8">
                  {art.desc}
               </p>
               
               <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:text-purple-600 transition-all">
                     <Maximize2 size={14} /> Full Resolution
                  </button>
                  <div className="h-4 w-[1px] bg-black/10" />
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:text-purple-600 transition-all">
                     <Info size={14} /> Design Specs
                  </button>
               </div>
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
