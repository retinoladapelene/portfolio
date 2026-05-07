"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isActive: boolean;
  children?: React.ReactNode;
  onReveal: () => void;
  onComplete: () => void;
}

type Phase = "idle" | "impact" | "bleed" | "cover" | "reveal" | "done";

export default function InkBleedTransition({
  isActive,
  children,
  onReveal,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setPhase("idle");
      setVisible(false);
      return;
    }

    setVisible(true);
    setPhase("impact");

    // Phase Timeline
    // 1. Impact (0-100ms)
    const t1 = setTimeout(() => {
      setPhase("bleed");
    }, 50);

    // 2. Full Coverage (700ms)
    const t2 = setTimeout(() => {
      setPhase("cover");
      onReveal();
    }, 850);

    // 3. Reveal (After coverage, wait a bit)
    const t3 = setTimeout(() => {
      setPhase("reveal");
    }, 1300);

    // 4. Done
    const t4 = setTimeout(() => {
      setPhase("done");
      setVisible(false);
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };

  }, [isActive, onReveal, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden flex items-center justify-center">
      {/* SVG Filters for Organic Edges */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="ink-bleed-filter">
            {/* Base fractal noise */}
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.012" 
              numOctaves="4" 
              result="noise" 
              seed="5"
            />
            {/* Displacement to create irregular edges */}
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale={phase === "bleed" || phase === "cover" ? "100" : "20"} 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
            {/* Softening the edges */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="tendril-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" seed="42" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="150" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* The Current Scene (being masked) */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          opacity: phase === "reveal" ? 0 : 1,
          scale: phase === "reveal" ? 1.05 : 1
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0">{children}</div>
      </motion.div>

      {/* The Ink Layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "url(#ink-bleed-filter)" }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{ 
            width: phase === "idle" ? 0 : "160vmax",
            height: phase === "idle" ? 0 : "160vmax",
            opacity: phase === "reveal" ? 0 : 1,
            scale: phase === "impact" ? 0.01 : phase === "bleed" ? [0.01, 1] : 1,
          }}
          transition={{ 
            duration: phase === "bleed" ? 1.0 : 0.8, 
            ease: phase === "bleed" ? [0.4, 0, 0.2, 1] : "easeInOut" 
          }}
          style={{
            background: "radial-gradient(circle at center, #0B0F1A 0%, #0B0F1A 40%, rgba(11, 15, 26, 0.95) 70%, transparent 100%)",
            boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)"
          }}
        />

        {/* Secondary Tendrils (Simulated with multiple smaller blobs) */}
        {(phase === "bleed" || phase === "cover") && (
           <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
             {[...Array(8)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-72 h-72 bg-[#0B0F1A]/80 rounded-full"
                 initial={{ scale: 0, x: 0, y: 0 }}
                 animate={{ 
                   scale: [0, 2.5, 5],
                   x: [0, (i % 2 === 0 ? 1 : -1) * (150 + i * 60)],
                   y: [0, (i % 3 === 0 ? 1 : -1) * (120 + i * 40)],
                   opacity: [0, 0.7, 0]
                 }}
                 transition={{ 
                   duration: 1.8, 
                   delay: 0.1 + i * 0.12,
                   ease: "easeOut"
                 }}
                 style={{ filter: "url(#tendril-filter)" }}
               />
             ))}
           </div>
        )}
      </div>

      {/* Final Solid Cover Fill */}
      {phase === "cover" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-[#0B0F1A] z-20"
        />
      )}
    </div>
  );
}
