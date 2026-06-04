"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  { 
    id: "01", 
    title: "Request & Review", 
    desc: "Submit your request through our integrated commission form. I'll review your brief and references to ensure we're a perfect match." 
  },
  { 
    id: "02", 
    title: "Sketch & DP", 
    desc: "Receive initial sketches in your dashboard. Once you approve the direction, a 50% down payment secures your spot in the queue." 
  },
  { 
    id: "03", 
    title: "WIP & Progress", 
    desc: "Follow the production with regular WIP updates. You can request adjustments here before we move to the 75% progress payment." 
  },
  { 
    id: "04", 
    title: "Finalization", 
    desc: "Check the final preview of your masterpiece. After the 100% full payment is verified, the high-res files will be unlocked." 
  },
  { 
    id: "05", 
    title: "Master Delivery", 
    desc: "Download your high-res artwork directly from your dashboard. For your privacy, all project data is automatically purged after 24 hours." 
  },
];

export default function HorizontalBloomingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress for the vertical line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} id="process" className="bg-white py-24 md:py-32 lg:py-64 overflow-visible relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-[1.2fr_2fr] gap-16 md:gap-20 lg:gap-40 relative">
        
        {/* ─── STICKY HEADER (THE CREATIVE JOURNEY) ────────────────────────── */}
        <div className="lg:sticky lg:top-40 h-fit space-y-6 md:space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-6"
          >
            <p className="text-[9px] md:text-[10px] font-black text-purple-600 uppercase tracking-[0.4em] md:tracking-[0.8em]">Production Loop</p>
            <h2 className="text-4xl md:text-6xl xl:text-8xl font-black text-slate-950 leading-[0.95] md:leading-[0.85] tracking-tighter font-outfit uppercase">
              THE<br />CREATIVE<br />JOURNEY
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed max-w-[320px]"
          >
            Watch ideas bloom into finished art through our transparent, high-fidelity production system.
          </motion.p>

          {/* Minimalist Progress Meter (Desktop Only) */}
          <div className="hidden lg:block pt-16">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Phase Control</span>
              <div className="flex-1 h-[1px] bg-slate-100 relative overflow-hidden">
                <motion.div 
                  style={{ scaleX: scrollYProgress }} 
                  className="absolute inset-0 bg-purple-600 origin-left" 
                />
              </div>
              <span className="text-[10px] font-bold text-slate-300 font-outfit">
                {Math.round(scrollYProgress.get() * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* ─── SCROLLING TIMELINE STEPS ────────────────────────────────────── */}
        <div className="relative space-y-20 md:space-y-40 lg:space-y-72">
          
          {/* Vertical Progress Line (Desktop and larger tablets) */}
          <div className="absolute left-0 lg:left-0 top-0 bottom-0 w-[1px] bg-slate-100 hidden sm:block">
            <motion.div 
              style={{ scaleY }} 
              className="absolute top-0 left-0 right-0 bg-purple-600 origin-top shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
            />
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative pl-0 sm:pl-16 lg:pl-32 group"
            >
              {/* Massive Background Step Number (Hidden or very subtle on mobile) */}
              <span className="absolute -top-12 -left-2 lg:left-16 text-[18vw] md:text-[14vw] font-black text-slate-50 opacity-0 md:group-hover:opacity-100 transition-all duration-1000 select-none pointer-events-none font-outfit leading-none">
                {step.id}
              </span>

              <div className="space-y-6 md:space-y-8 relative z-10">
                {/* Technical Index */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm group-hover:border-purple-300 group-hover:scale-110 transition-all duration-500">
                    <span className="text-[10px] md:text-[11px] font-black text-purple-600">{step.id}</span>
                  </div>
                  <div className="h-[1px] w-8 md:w-12 bg-slate-100 group-hover:w-20 transition-all duration-700" />
                  <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-purple-400 transition-colors">
                    Workflow Phase
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl xl:text-5xl font-black text-slate-950 tracking-tighter font-outfit uppercase leading-none">
                  {step.title}
                </h3>
                
                <p className="text-base md:text-lg xl:text-xl text-slate-500 font-medium leading-relaxed max-w-xl group-hover:text-slate-700 transition-colors">
                  {step.desc}
                </p>

                {/* Technical Footnote */}
                <div className="pt-2 md:pt-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-50" />
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Verified Workflow
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
