"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Milestone, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import PersonalManager from "./PersonalManager";
import JourneyManager from "./JourneyManager";
import SketchbookManager from "./SketchbookManager";

const PersonalPageManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'journey' | 'sketches'>('hero');

  const subTabs = [
    { id: 'hero', label: 'Hero Section', icon: ImageIcon },
    { id: 'journey', label: 'Life Journey', icon: Milestone },
    { id: 'sketches', label: 'Sketchbook', icon: PenTool },
  ];

  return (
    <div className="space-y-8">
      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 relative",
              activeSubTab === tab.id 
                ? "text-white" 
                : "text-white/30 hover:text-white/60"
            )}
          >
            {activeSubTab === tab.id && (
              <motion.div
                layoutId="activeSubTab"
                className="absolute inset-0 bg-purple-500/20 rounded-xl border border-purple-500/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon size={14} className={cn(
              "relative z-10",
              activeSubTab === tab.id ? "text-purple-400" : "text-white/20"
            )} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {activeSubTab === 'hero' ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <PersonalManager />
            </motion.div>
          ) : activeSubTab === 'journey' ? (
            <motion.div
              key="journey"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <JourneyManager />
            </motion.div>
          ) : (
            <motion.div
              key="sketches"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SketchbookManager />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PersonalPageManager;
