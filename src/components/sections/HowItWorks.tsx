"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Section from "@/components/ui/Section";
import { fadeUp } from "@/lib/animations";

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

const HowItWorks = () => {
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
    <Section id="process" className="bg-white py-32 lg:py-64 overflow-visible">
      <div ref={containerRef} className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-20 lg:gap-32 relative">
        
        {/* ─── STICKY HEADER ────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-40 h-fit space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px" }}
            className="space-y-4"
          >
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.8em]">Production Workflow</p>
            <h2 className="text-5xl xl:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter font-outfit">
              THE<br />CREATIVE<br />JOURNEY
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]"
          >
            Watch ideas bloom into finished art through our transparent, high-fidelity production system.
          </motion.p>

          {/* Minimalist Progress Meter */}
          <div className="hidden lg:block pt-12">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Phase</span>
              <div className="flex-1 h-[1px] bg-slate-100 relative overflow-hidden">
                <motion.div 
                  style={{ scaleX: scrollYProgress }} 
                  className="absolute inset-0 bg-purple-600 origin-left" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── SCROLLING TIMELINE ───────────────────────────────────────────── */}
        <div className="relative space-y-32 lg:space-y-64">
          
          {/* Vertical Progress Line */}
          <div className="absolute left-0 lg:left-0 top-0 bottom-0 w-[1px] bg-slate-100 hidden lg:block">
            <motion.div 
              style={{ scaleY }} 
              className="absolute top-0 left-0 right-0 bg-purple-600 origin-top" 
            />
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative pl-0 lg:pl-24 group"
            >
              {/* Massive Step Number (Background Decor) */}
              <span className="absolute -top-12 -left-4 lg:left-12 text-[12vw] font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 select-none pointer-events-none font-outfit leading-none">
                {step.id}
              </span>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm">
                    <span className="text-[10px] font-black text-purple-600">{step.id}</span>
                  </div>
                  <div className="h-[1px] w-8 bg-slate-100" />
                </div>

                <h3 className="text-3xl xl:text-4xl font-black text-slate-950 tracking-tight font-outfit uppercase">
                  {step.title}
                </h3>
                
                <p className="text-base xl:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                  {step.desc}
                </p>

                {/* Status Badge (Visual Detail) */}
                <div className="flex gap-2 pt-4">
                  <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phase {step.id}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </Section>
  );
};

export default HowItWorks;
