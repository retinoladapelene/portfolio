"use client";

import { motion, useInView } from "framer-motion";
import { useRef, memo } from "react";
import { Star, ArrowUpRight, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── DATA ──────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aurelius V.",
    handle: "@v_aurelius",
    text: "The level of detail provided in my character's portrait surpassed all expectations. It's not just art; it's a legacy.",
    size: "large"
  },
  {
    id: 2,
    name: "Seraphina",
    handle: "@seraph_art",
    text: "Working with this artist is like watching a vision come to life. Truly unique aesthetic.",
    size: "small"
  },
  {
    id: 3,
    name: "Kaelen Drake",
    handle: "@kdrake_concept",
    text: "Absolute mastery of silhouettes. The pricing reflects the premium quality delivered.",
    size: "medium"
  },
  {
    id: 4,
    name: "Elena Rossi",
    handle: "@elena_designs",
    text: "Fast, communicative, and possesses an incredible eye for lighting. High priority delivery.",
    size: "small"
  }
];

// ─── TYPES ──────────────────────────────────────────────────────────────────

type TestimonialItem = {
  id: number;
  name: string;
  handle: string;
  text: string;
  size: string;
};

// ─── MINIMALIST CARD COMPONENT ──────────────────────────────────────────────

const StoryCard = memo(({ item, index }: { item: TestimonialItem; index: number }) => {
  const cardRef = useRef(null);
  const isCardInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isCardInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative p-8 md:p-12 rounded-[48px] bg-white border border-slate-100 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:border-slate-200 overflow-hidden",
        item.size === "large" ? "md:col-span-2 md:row-span-2" : "",
        item.size === "medium" ? "md:col-span-2" : ""
      )}
    >
      <div className="relative z-10 space-y-8">
        <blockquote className={cn(
          "font-outfit font-bold text-slate-950 leading-tight tracking-tight",
          item.size === "large" ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
        )}>
          &ldquo;{item.text}&rdquo;
        </blockquote>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-12 pt-8 border-t border-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-black text-sm">
            {item.name[0]}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-950 uppercase tracking-tighter">{item.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 tracking-tight">{item.handle}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={10} className="text-purple-600 fill-purple-600" />
          ))}
        </div>
      </div>
    </motion.div>
  );
});
StoryCard.displayName = "StoryCard";

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function ClientStories() {
  return (
    <section id="stories" className="relative w-full py-24 md:py-40 bg-white px-4 md:px-12 overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Minimalist Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 md:mb-32">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-6xl md:text-[9vw] font-black text-slate-950 font-outfit uppercase tracking-tighter leading-[0.85]">
              Client<br />
              <span className="text-purple-600 italic">Stories.</span>
            </h2>
          </div>
          
          <div className="lg:col-span-4 flex flex-col justify-end lg:text-right">
            <div className="flex gap-12 lg:justify-end">
              <div className="space-y-1">
                <div className="flex items-center lg:justify-end gap-2 text-slate-950">
                  <ShieldCheck size={18} />
                  <span className="text-3xl md:text-4xl font-black font-outfit tracking-tighter uppercase">98%</span>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Satisfaction</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center lg:justify-end gap-2 text-slate-950">
                  <Globe size={18} />
                  <span className="text-3xl md:text-4xl font-black font-outfit tracking-tighter uppercase">150+</span>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {TESTIMONIALS.map((item, i) => (
            <StoryCard key={item.id} item={item} index={i} />
          ))}

          {/* Minimalist CTA Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-10 rounded-[48px] bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl"
          >
            <div className="space-y-10">
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9] italic">
                Verified archives of artistic collaborations.
              </h3>
            </div>

            <div className="flex items-center justify-between mt-12">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Join the gallery
              </span>
              <div className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <ArrowUpRight size={24} />
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
