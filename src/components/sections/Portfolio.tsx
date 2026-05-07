"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Section from "@/components/ui/Section";
import GlassCard from "@/components/ui/GlassCard";
import { fadeUp } from "@/lib/animations";

const CATEGORIES = ["All", "Portrait", "Character", "Concept Art"];

const PORTFOLIO_ITEMS = [
  { id: 1, category: "Portrait", title: "Cyberpunk Girl", bestSeller: true },
  { id: 2, category: "Character", title: "Fantasy Knight", bestSeller: false },
  { id: 3, category: "Portrait", title: "Neon Samurai", bestSeller: true },
  { id: 4, category: "Concept Art", title: "Lost Ruins", bestSeller: false },
  { id: 5, category: "Character", title: "Druid Mage", bestSeller: false },
  { id: 6, category: "Portrait", title: "Space Pilot", bestSeller: true },
  { id: 7, category: "Concept Art", title: "Astro City", bestSeller: false },
  { id: 8, category: "Character", title: "Rogue Assassin", bestSeller: true },
];

const Portfolio = () => {
  const [filter, setFilter] = useState("All");

  const filteredItems = PORTFOLIO_ITEMS.filter(
    (item) => filter === "All" || item.category === filter
  );

  return (
    <Section id="portfolio" className="relative">
      <motion.div 
        {...fadeUp}
        className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16"
      >
        <div className="space-y-4">
          <h2 className="text-[40px] font-bold">Featured Works</h2>
          <p className="body text-text-secondary max-w-md">
            Filtered curated best works. Not just a gallery, but a showcase of 
            premium execution.
          </p>
        </div>

        {/* Filters */}
        <div className="flex p-1.5 glass-card rounded-xl gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                filter === cat 
                  ? "bg-brand-primary text-white shadow-lg" 
                  : "bg-white border border-gray-200 text-text-secondary hover:border-brand-primary hover:text-brand-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 4 Column Grid / 24px Gap */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="art-frame h-[320px] group shimmer-effect"
            >
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                 <p className="caption opacity-20 uppercase font-black tracking-[0.3em] text-text-primary">{item.category}</p>
                 {/* Liquid background effect */}
                 <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/10 transition-colors" />
              </div>

              {/* Hover Info Overlay */}
              <div className="hover-overlay" />

              {/* Badges - Animated Reveal */}
              <motion.div 
                className="absolute top-4 left-4 z-10 flex flex-col gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                 {item.bestSeller && (
                   <div className="px-3 py-1 bg-brand-accent text-[8px] font-black text-white rounded-full tracking-tighter shadow-lg pulse-glow">
                      BEST SELLER
                   </div>
                 )}
                 <div className="px-3 py-1 glass-strong text-[8px] font-black rounded-full tracking-tighter border border-black/5 text-text-primary">
                    {item.category.toUpperCase()}
                 </div>
              </motion.div>

              {/* Hover Info Text */}
              <div className="absolute inset-x-0 bottom-0 p-6 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                 <h3 className="text-lg font-bold mb-1 text-white">{item.title}</h3>
                 <p className="text-[10px] font-black tracking-widest text-white/80 uppercase">Premium Render</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
};

export default Portfolio;
