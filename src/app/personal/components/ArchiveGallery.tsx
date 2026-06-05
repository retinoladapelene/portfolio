"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Palette } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ArchiveGallery() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const supabase = createClient();

  useEffect(() => {
    isMounted.current = true;
    async function fetchArchive() {
      try {
        const { data, error } = await supabase
          .from("sketchbook_archive")
          .select("*")
          .order("order_index", { ascending: true });

        if (!isMounted.current) return;
        if (error) throw error;
        setItems(data || []);
      } catch (err: any) {
        if (err.message?.includes("Could not find the table")) {
          console.warn("Table 'sketchbook_archive' not found. Sketchbook gallery will be empty until table is created.");
        } else {
          console.error("Error fetching sketchbook archive:", err.message || err.details || err);
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }
    fetchArchive();
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 font-outfit">
          Recalibrating Ink Flow...
        </p>
      </div>
    );
  }

  const galleryItems =
    items.length > 0
      ? items
      : [
        { title: "Ethereal Guard", year: "2024", type: "Character Study", image_url: "/character_design_1_1778232321637.png" },
        { title: "Floating Echo", year: "2023", type: "Concept Art", image_url: "/character_design_2_1778232337093.png" },
        { title: "Neon Pulse", year: "2024", type: "Hi-Fi Portrait", image_url: "/character_design_3_1778232352660.png" },
        { title: "Silken Blade", year: "2024", type: "Full Body Design", image_url: "/character_design_4_1778232367976.png" },
        { title: "Sci-Fi Rogue", year: "2024", type: "Action Pose", image_url: "/character_design_5_1778232929169.png" },
        { title: "Forest Spirit", year: "2023", type: "Digital Painting", image_url: "/character_design_6_1778232945265.png" },
        { title: "Cyber City", year: "2024", type: "Concept Art", image_url: "/character_design_7_1778232963329.png" },
        { title: "Warrior Priestess", year: "2024", type: "Hi-Fi Portrait", image_url: "/character_design_8_1778232978614.png" },
        { title: "Tech Fashion", year: "2023", type: "Fashion Design", image_url: "/character_design_9_1778232997506.png" },
      ];

  return (
    <motion.section
      id="gallery-section"
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative px-6 py-16 md:px-12 md:py-32 bg-transparent"
    >
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="brush-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <clipPath id="tape-tear" clipPathUnits="objectBoundingBox">
          <path d="M 0,0.2 L 0.2,0 L 0.8,0.1 L 1,0 L 1,0.8 L 0.7,1 L 0.3,0.9 L 0,1 Z" />
        </clipPath>
      </svg>

      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-24">
          <div className="gallery-card-morph">
            <span className="font-outfit text-[10px] font-black uppercase tracking-[1em] transition-colors duration-500 block mb-6"
              style={{ color: "var(--theme-primary, #7C3AED)" }}>
              Sketchbook Archive v.01
            </span>
            <h2 className="font-syne text-4xl md:text-8xl font-bold text-[#1A1F2B] tracking-tighter leading-none">
              RAW
              <br />
              STROKES.
            </h2>
          </div>
          <p className="font-outfit text-[11px] text-black/40 max-w-sm leading-relaxed gallery-card-morph">
            A collection of raw line explorations and sketches. Showcasing the
            initial creative process and the pure energy of every stroke before
            evolving into a final masterpiece.
          </p>
        </div>

        <svg className="hidden">
          <defs>
            <filter id="noise-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            </filter>
            <filter id="brush-jitter">
              <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" />
              <feDisplacementMap in="SourceGraphic" scale="2" />
            </filter>
            <linearGradient id="global-dry-paint-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--theme-dot, #D6BCFA)" stopOpacity="0.95" />
              <stop offset="50%" stopColor="var(--theme-light, #E9E3FF)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-x-2 md:gap-x-12 gap-y-6 md:gap-y-24 gallery-trigger relative z-10">
          {galleryItems.slice(0, 9).map((item: any, i: number) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 1.2, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative break-inside-avoid mb-12 md:mb-32"
              >
                {/* Back "Shadow" Card */}
                <div className="absolute inset-0 -rotate-2 rounded-sm transition-transform duration-500 group-hover:-rotate-3"
                  style={{ background: "var(--theme-primary, #7C3AED)", opacity: 0.05 }} />

                {/* Front Card */}
                <div className="relative bg-[#FFF9F0] p-4 pb-10 shadow-md transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl">
                  {/* Top Washi Tape */}
                  <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-[50px] h-5 -rotate-1 z-30 transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{
                      background: "var(--theme-primary, #7C3AED)",
                      opacity: 0.7,
                      backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`,
                      backgroundSize: '10px 10px'
                    }}
                  />

                  {/* Image Area */}
                  <div className="relative aspect-[4/5] bg-[#F5F4F2] overflow-hidden">
                    <img
                      src={item.image_url || item.img}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    />
                    
                    {/* Corner Pegs */}
                    <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-[#000033]/40 z-20" />
                    <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#000033]/40 z-20" />
                    <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-[#000033]/40 z-20" />
                    <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-[#000033]/40 z-20" />
                  </div>

                  {/* Bottom Annotation & Label */}
                  <div className="mt-6">
                    <p className="font-dancing-script italic text-sm mb-1"
                      style={{ color: "var(--theme-primary, #7C3AED)", opacity: 0.6 }}>
                      {item.type || "Sketch exploration"}
                    </p>
                    
                    <div className="relative inline-block mb-1">
                      <h4 className="font-serif italic text-lg md:text-xl text-[#1A1F2B]">
                        {item.title}
                      </h4>
                      <div className="h-[0.5px] w-full mt-0.5"
                        style={{ background: "var(--theme-dot, #AFA9EC)" }} />
                    </div>

                    <p className="font-mono text-[7px] text-[#1A1F2B]/40 uppercase tracking-[0.3em] mt-1.5">
                      {item.ref_id || `REF_${item.year}_${i}`} • {item.year}
                    </p>
                  </div>

                  {/* Bottom Right Tape */}
                  <div className="absolute -bottom-1.5 -right-2 w-8 h-3 bg-[#000033]/60 rotate-3 z-30 transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
