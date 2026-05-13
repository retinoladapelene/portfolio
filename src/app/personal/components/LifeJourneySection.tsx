"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Sparkles, Palette } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const initialMilestones = [
  {
    id: "m0",
    year: "2000",
    title: "Origins",
    caption: "day one",
    desc: "Born in Indonesia. The beginning of this whole story.",
    icon: "baby",
    stickyColor: { bg: "#FAEEDA", border: "#FAC775", title: "#633806", text: "#854F0B" },
    tapeColor: { bg: "#FAEEDA", border: "#FAC775" },
    rotate: "-rotate-2",
    stickyRotate: "rotate-1",
    offset: "mt-0",
    key: false,
    image_url: null as string | null,
  },
  {
    id: "m1",
    year: "2012",
    title: "Started Drawing",
    caption: "sketchbook vol.1",
    desc: "First sketch born in a school notebook. Never stopped since then.",
    icon: "pencil",
    stickyColor: { bg: "#E1F5EE", border: "#9FE1CB", title: "#085041", text: "#0F6E56" },
    tapeColor: { bg: "#CECBF6", border: "#AFA9EC" },
    rotate: "rotate-2",
    stickyRotate: "-rotate-1",
    offset: "mt-6",
    key: false,
    image_url: null as string | null,
  },
  {
    id: "m2",
    year: "2018",
    title: "First Commission",
    caption: "first commission",
    desc: "First paid artwork — a historic moment that turned a hobby into a profession.",
    icon: "star",
    stickyColor: { bg: "#EEEDFE", border: "#AFA9EC", title: "#3C3489", text: "#534AB7" },
    tapeColor: { bg: "#CECBF6", border: "#7F77DD" },
    rotate: "-rotate-1",
    stickyRotate: "rotate-2",
    offset: "mt-0",
    key: true,
    image_url: null as string | null,
  },
  {
    id: "m3",
    year: "2021",
    title: "Full Digital Switch",
    caption: "procreate & beyond",
    desc: "Switched 100% to digital art. A new world opened up with Procreate and Clip Studio.",
    icon: "device-laptop",
    stickyColor: { bg: "#FBEAF0", border: "#F4C0D1", title: "#72243E", text: "#993556" },
    tapeColor: { bg: "#F4C0D1", border: "#ED93B1" },
    rotate: "rotate-3",
    stickyRotate: "-rotate-2",
    offset: "mt-8",
    key: false,
    image_url: null as string | null,
  },
  {
    id: "m4",
    year: "2024",
    title: "150+ Clients",
    caption: "global community",
    desc: "Over 150 clients from around the world. Each piece brings a new story.",
    icon: "heart",
    stickyColor: { bg: "#E1F5EE", border: "#9FE1CB", title: "#085041", text: "#0F6E56" },
    tapeColor: { bg: "#9FE1CB", border: "#5DCAA5" },
    rotate: "-rotate-2",
    stickyRotate: "rotate-1",
    offset: "mt-4",
    key: false,
    image_url: null as string | null,
  },
];

export function LifeJourneySection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [milestones, setMilestones] = useState(initialMilestones);
  const supabase = createClient();
  const isMounted = useRef(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    isMounted.current = true;
    async function fetchMilestones() {
      try {
        const { data, error } = await supabase
          .from("life_journey")
          .select("*")
          .order("order_index", { ascending: true });

        if (!isMounted.current) return;
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map database schema (life_journey) to frontend component structure
          const mappedMilestones = data.map((m: any) => ({
            id: m.id,
            year: m.year,
            title: m.title,
            caption: m.caption,
            desc: m.description,
            icon: m.icon,
            stickyColor: {
              bg: m.sticky_bg || "#EEEDFE",
              border: m.sticky_border || "#AFA9EC",
              title: m.sticky_title_color || "#3C3489",
              text: m.sticky_text_color || "#534AB7"
            },
            tapeColor: {
              bg: m.tape_bg || "#CECBF6",
              border: m.tape_border || "#7F77DD"
            },
            rotate: m.rotate_card || "rotate-0",
            stickyRotate: m.rotate_sticky || "rotate-0",
            offset: m.offset_class || "mt-0",
            key: m.is_key,
            image_url: m.image_url
          }));
          setMilestones(mappedMilestones);
        }
      } catch (err: any) {
        if (err.message?.includes("Could not find the table")) {
          console.warn("Table 'life_journey' not found. Using local initialMilestones fallback.");
        } else {
          console.error("Error fetching milestones:", err.message || err.details || err);
        }
      }
    }
    fetchMilestones();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef as any, offset: ["start end", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.section
      ref={sectionRef}
      id="life-journey"
      className="relative px-6 py-16 md:px-12 md:py-32 bg-transparent"
    >
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-24 md:mb-44 flex flex-col md:flex-row items-end justify-between gap-12 px-4 w-full relative">
          {/* Background Decor */}
          <motion.div 
            style={{ y: backgroundY }}
            className="absolute -left-16 -top-24 opacity-[0.03] select-none pointer-events-none hidden lg:block"
          >
            <span className="font-syne text-[22rem] font-black leading-none">01</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-start"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              </div>
              <span className="font-outfit text-[10px] font-black uppercase tracking-[0.5em] text-purple-600/60">
                Archive / Series.24
              </span>
            </div>

            <motion.h2 
              initial={{ letterSpacing: "-0.05em", filter: "blur(10px)", opacity: 0 }}
              whileInView={{ letterSpacing: "-0.02em", filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              viewport={{ once: true }}
              className="font-syne font-bold leading-[0.85] tracking-tightest"
            >
              <span className="block text-7xl md:text-[9rem] text-[#1A1F2B]">LIFE</span>
              <span 
                className="block text-5xl md:text-[7rem] font-dancing-script font-normal text-transparent py-2 md:-mt-4"
                style={{ WebkitTextStroke: "1.5px rgba(26, 31, 43, 0.15)" }}
              >
                Journey<span className="text-purple-600/40">.</span>
              </span>
            </motion.h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="max-w-xs text-right self-end pb-8 hidden md:block relative"
          >
             <div className="absolute -top-12 -right-4 w-px h-24 bg-gradient-to-b from-transparent via-purple-100 to-transparent" />
             <div className="font-alex-brush text-5xl text-purple-600/20 mb-4 -rotate-3 origin-right select-none pr-2">
                Prasetia
             </div>
             <p className="font-outfit text-[10px] md:text-[11px] text-[#1A1F2B]/40 leading-relaxed uppercase tracking-[0.3em] font-bold border-r-[1px] border-purple-200/50 pr-8">
                A non-linear exploration of creative evolution and the moments that define a path.
             </p>
             <div className="mt-6 flex items-center justify-end gap-3 opacity-30">
                <span className="w-8 h-[1px] bg-black/20" />
                <span className="font-syne text-[8px] font-black uppercase tracking-widest">Curator Statement</span>
             </div>
          </motion.div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <div className="flex gap-4 items-start overflow-x-auto pb-20 pt-10 scrollbar-hide px-4">
            {milestones.map((m, i) => (
              <div key={m.id || i} className={`flex-1 min-w-[280px] flex flex-col items-center gap-6 ${m.offset}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="font-syne text-5xl font-bold leading-none tracking-tighter transition-colors duration-500"
                    style={{ color: "var(--theme-dot, #E5E7EB)", opacity: 0.4 }}>
                    {m.year}
                  </div>
                  <div className="h-[2px] w-12 rounded-full bg-purple-100" />
                </div>

                <div className="relative group perspective-1000">
                  <div
                    className={`relative bg-white border p-4 pb-12 transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2 group-hover:shadow-[20px_20px_0px_rgba(206,203,246,0.3)] ${m.rotate}`}
                      style={{
                        width: "240px",
                        borderColor: m.key ? "var(--theme-dot, #AFA9EC)" : "#E5E5E3",
                        boxShadow: m.key ? "12px 12px 0px var(--theme-light, #CECBF6)" : "8px 8px 0px #E5E5E3",
                      }}
                  >
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-1 w-14 h-4 rounded-sm opacity-80 z-20"
                      style={{ background: `repeating-linear-gradient(90deg,var(--theme-dot, #CECBF6) 0 8px,var(--theme-primary, #7F77DD) 8px 16px)` }}
                    />
                    <div
                      className="w-full flex items-center justify-center rounded-sm mb-3 overflow-hidden bg-[#F5F4F2]"
                      style={{ height: "180px", background: m.key ? "#EEEDFE" : "#F5F4F2" }}
                    >
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles size={60} style={{ color: "var(--theme-primary, #7F77DD)", opacity: 0.7 }} />
                      )}
                    </div>
                    <p className="absolute bottom-3 left-0 right-0 text-center font-outfit text-xs italic text-gray-400">
                      {m.caption}
                    </p>
                    {m.key && (
                      <span className="absolute top-4 right-4 font-outfit text-[8px] font-black uppercase tracking-wide text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded">
                        ★ key moment
                      </span>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className={`absolute -right-12 -bottom-8 p-5 ${m.stickyRotate} z-30 shadow-2xl backdrop-blur-md`}
                    style={{
                      width: "160px",
                      background: "var(--theme-light, #EEEDFE)",
                      border: `0.5px solid var(--theme-dot, #AFA9EC)`,
                    }}
                  >
                    <p className="font-outfit text-xs font-black mb-1 uppercase tracking-wider" style={{ color: "var(--theme-primary, #3C3489)" }}>
                      {m.title}
                    </p>
                    <p className="font-outfit text-[10px] leading-relaxed" style={{ color: "var(--theme-primary, #534AB7)", opacity: 0.8 }}>
                      {m.desc}
                    </p>
                  </motion.div>

                  <div
                    className="absolute bottom-0 right-0 w-4 h-4"
                    style={{ background: "rgba(255,255,255,0.5)", clipPath: "polygon(100% 0,100% 100%,0 100%)" }}
                  />
                </div>
              </div>
            ))}

            {/* "Now" card */}
            <div className="flex-1 min-w-[160px] flex flex-col items-center gap-3 px-4 mt-12 opacity-50">
              <div className="font-syne text-3xl font-bold text-gray-300 leading-none tracking-tighter">now…</div>
              <div className="h-[2px] w-8 rounded-full bg-gray-200" />
              <div
                className="w-full flex flex-col items-center justify-center rounded-sm border-dashed border border-gray-200"
                style={{ height: "110px" }}
              >
                <Palette size={24} className="text-gray-300 mb-1" />
                <p className="font-outfit text-[8px] text-gray-300 uppercase tracking-widest">to be continued</p>
              </div>
              <p className="font-outfit text-[9px] text-center italic text-black/20 leading-relaxed">
                cerita belum
                <br />
                selesai…
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div
              className="h-2 w-32 rounded-sm opacity-40"
              style={{ background: "repeating-linear-gradient(90deg,#F4C0D1 0 8px,#ED93B1 8px 16px,#F4C0D1 16px 24px)" }}
            />
            <div className="h-px flex-1 border-t border-dashed border-purple-100" />
            <span className="font-outfit text-[9px] uppercase tracking-[0.2em] text-black/20 font-bold">
              personal archive · ratu balqis
            </span>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex justify-center mb-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 16, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: milestones[activeIdx]?.key ? -1 : -2 }}
                exit={{ opacity: 0, y: -12, rotate: 2 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white border p-3 pb-10"
                style={{
                  width: "200px",
                  borderColor: milestones[activeIdx]?.key ? "var(--theme-dot, #AFA9EC)" : "#E5E5E3",
                  boxShadow: milestones[activeIdx]?.key ? "6px 6px 0px var(--theme-light, #CECBF6)" : "3px 3px 0px #E5E5E3",
                }}
              >
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-1 w-10 h-3 rounded-sm opacity-80"
                  style={{
                    background: `repeating-linear-gradient(90deg,var(--theme-dot, #CECBF6) 0 6px,var(--theme-primary, #7F77DD) 6px 12px)`,
                  }}
                />
                <div
                  className="w-full flex items-center justify-center rounded-sm mb-2 overflow-hidden bg-[#F5F4F2]"
                  style={{ height: "140px", background: milestones[activeIdx]?.key ? "#EEEDFE" : "#F5F4F2" }}
                >
                  {milestones[activeIdx]?.image_url ? (
                    <img src={milestones[activeIdx]?.image_url} alt={milestones[activeIdx]?.title} className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles size={40} style={{ color: "var(--theme-primary, #7F77DD)", opacity: 0.7 }} />
                  )}
                </div>
                <p
                  className="absolute bottom-2.5 left-0 right-0 text-center font-outfit text-[9px] italic"
                  style={{ color: milestones[activeIdx]?.key ? "#534AB7" : "#888780" }}
                >
                  {milestones[activeIdx]?.caption}
                </p>
                {milestones[activeIdx]?.key && (
                  <span className="absolute top-2 right-2 font-outfit text-[7px] font-black uppercase tracking-wide text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                    ★ key
                  </span>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`sticky-${activeIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute right-4 top-6 p-3"
                style={{
                  width: "110px",
                  zIndex: 0,
                  background: "var(--theme-light, #EEEDFE)",
                  border: `0.5px solid var(--theme-dot, #AFA9EC)`,
                  transform: "rotate(5deg)",
                }}
              >
                <p className="font-outfit text-[10px] font-black" style={{ color: "var(--theme-primary, #3C3489)" }}>
                  {milestones[activeIdx]?.year}
                </p>
                <p className="font-outfit text-[9px] leading-snug" style={{ color: "var(--theme-primary, #534AB7)", opacity: 0.8 }}>
                  {milestones[activeIdx]?.title}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${activeIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-center font-outfit text-xs text-black/40 leading-relaxed mb-8 px-4"
            >
              {milestones[activeIdx]?.desc}
            </motion.p>
          </AnimatePresence>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
            {milestones.map((m, i) => (
              <button
                key={m.id || i}
                onClick={() => setActiveIdx(i)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 transition-opacity duration-200 ${i === activeIdx ? "opacity-100" : "opacity-40"}`}
              >
                <div
                  className={`relative bg-white border p-1.5 pb-5 ${m.rotate}`}
                  style={{
                    width: "80px",
                    borderColor: m.key ? "var(--theme-dot, #AFA9EC)" : "#E5E5E3",
                    boxShadow: i === activeIdx ? (m.key ? "3px 3px 0px var(--theme-light, #CECBF6)" : "2px 2px 0px #D3D1C7") : "none",
                  }}
                >
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 rounded-sm opacity-70"
                    style={{ background: `repeating-linear-gradient(90deg,var(--theme-dot, #CECBF6) 0 4px,var(--theme-primary, #7F77DD) 4px 8px)` }}
                  />
                  <div
                    className="w-full flex items-center justify-center rounded-sm"
                    style={{ height: "55px", background: m.key ? "#EEEDFE" : "#F5F4F2" }}
                  >
                    <Sparkles size={16} style={{ color: "var(--theme-primary, #7F77DD)", opacity: 0.7 }} />
                  </div>
                  <p className="absolute bottom-1 left-0 right-0 text-center font-outfit" style={{ fontSize: "7px", color: "var(--theme-primary, #534AB7)" }}>
                    {m.year}
                  </p>
                </div>
                <p className="font-outfit text-[8px] text-center text-black/40 leading-tight w-20">{m.title}</p>
              </button>
            ))}
            <div className="flex-shrink-0 flex flex-col items-center gap-2 opacity-30">
              <div className="border border-dashed border-gray-200 flex items-center justify-center rounded-sm" style={{ width: "80px", height: "78px" }}>
                <Palette size={16} className="text-gray-300" />
              </div>
              <p className="font-outfit text-[8px] text-center text-black/30 leading-tight w-20">now…</p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <div
              className="h-2 w-20 rounded-sm opacity-40"
              style={{ background: "repeating-linear-gradient(90deg,#F4C0D1 0 6px,#ED93B1 6px 12px,#F4C0D1 12px 18px)" }}
            />
            <div
              className="h-2 w-12 rounded-sm opacity-30"
              style={{ background: "repeating-linear-gradient(90deg,#CECBF6 0 6px,#AFA9EC 6px 12px,#CECBF6 12px 18px)" }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
