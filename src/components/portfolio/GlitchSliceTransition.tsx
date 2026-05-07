"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Direction } from "./GlassShatterTransition";

interface Props {
  isActive: boolean;
  children?: React.ReactNode;
  onReveal: () => void;
  onComplete: () => void;
  direction?: Direction;
}

const COLORS = {
  blue: "#00A2FF",
  magenta: "#FF2D95",
  yellow: "#FFD500",
  cyan: "#00FFD1",
  purple: "#1A0033",
};

// Balanced shards for impactful but clean transition
const SHARDS = [
  { clip: "polygon(10% 0, 30% 0, 20% 100%)", x: -40, y: -30, r: 25, s: 1.2, blend: "difference" },
  { clip: "polygon(70% 0, 90% 0, 80% 100%)", x: 60, y: -40, r: -30, s: 1.1, blend: "screen" },
  { clip: "polygon(0 40%, 100% 45%, 100% 50%, 0 55%)", x: -80, y: 10, r: 10, s: 1.3, blend: "exclusion" },
  { clip: "polygon(20% 20%, 80% 30%, 50% 80%)", x: 40, y: 50, r: 45, s: 0.9, blend: "normal" },
  { clip: "polygon(0 0, 20% 30%, 0 40%)", x: -60, y: -50, r: -40, s: 1.2, blend: "screen" },
  { clip: "polygon(80% 60%, 100% 70%, 90% 100%)", x: 90, y: 70, r: 90, s: 1.0, blend: "difference" },
  { clip: "polygon(40% 40%, 60% 40%, 50% 60%)", x: 20, y: -80, r: 180, s: 1.4, blend: "overlay" },
  { clip: "polygon(10% 80%, 30% 90%, 20% 100%)", x: -70, y: 90, r: -25, s: 1.2, blend: "difference" },
  // Needle shards - thinner and faster
  { clip: "polygon(45% 0, 55% 0, 50% 100%)", x: 10, y: 0, r: 5, s: 1.5, blend: "screen" },
  { clip: "polygon(0 48%, 100% 48%, 100% 52%, 0 52%)", x: 0, y: -5, r: -2, s: 1.5, blend: "difference" },
  { clip: "polygon(30% 10%, 40% 0, 70% 90%)", x: 50, y: -60, r: 15, s: 1.1, blend: "normal" },
  { clip: "polygon(80% 10%, 95% 20%, 85% 40%)", x: 100, y: -80, r: 35, s: 1.2, blend: "difference" },
  { clip: "polygon(45% 45%, 55% 45%, 55% 55%, 45% 55%)", x: 0, y: 0, r: 360, s: 2.5, blend: "difference" },
];

export default function GlitchSliceTransition({
  isActive,
  children,
  onReveal,
  onComplete,
  direction = "next",
}: Props) {
  const [phase, setPhase] = useState<"idle" | "desync" | "clash" | "rebuild">("idle");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (isActive) {
      const sequence = async () => {
        setPhase("desync");
        await new Promise((r) => setTimeout(r, 80));

        setPhase("clash");
        await new Promise((r) => setTimeout(r, 320));

        setShowNew(true);
        onReveal();
        
        setPhase("rebuild");
        await new Promise((r) => setTimeout(r, 350));

        setPhase("idle");
        onComplete();
      };

      sequence();
    } else {
      setPhase("idle");
      setShowNew(false);
    }
  }, [isActive, onReveal, onComplete]);

  if (!isActive && phase === "idle") return null;

  const bias = direction === "next" ? 1 : -1;

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none overflow-hidden bg-[#1A0033]">
      {/* 1. Background Chaos Flicker */}
      <motion.div 
        className="absolute inset-0 z-[5]"
        animate={{ 
          backgroundColor: phase === "clash" ? [COLORS.purple, "#2A0055", COLORS.purple] : COLORS.purple,
          opacity: phase === "clash" ? [0.9, 1, 0.9] : 1
        }}
        transition={{ duration: 0.08, repeat: Infinity }}
      />

      {/* 2. Main Visual Layers */}
      <div className="relative w-full h-full">
        
        {/* Layer A: Balanced Jitter */}
        <motion.div
          className="absolute inset-0 z-[10]"
          animate={{
            x: phase === "clash" ? [-4, 4, -2, 2, 0] : 0,
            y: phase === "clash" ? [2, -2, 4, -4, 0] : 0,
            filter: phase === "clash" ? "contrast(130%) brightness(120%) saturate(140%)" : "none"
          }}
          transition={{ duration: 0.12, repeat: phase === "clash" ? Infinity : 0 }}
        >
          {children}
        </motion.div>

        {/* 3. BALANCED SHARDS */}
        {phase === "clash" && SHARDS.map((shard, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 z-[60]"
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, shard.x * bias, shard.x * 1.3 * bias],
              y: [0, shard.y, shard.y * 1.3],
              rotate: [0, shard.r, shard.r * 1.5],
              scale: [1, shard.s, shard.s * 1.2],
              filter: [
                `hue-rotate(0deg)`,
                `hue-rotate(90deg)`,
                `hue-rotate(180deg)`
              ]
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              delay: i * 0.02,
              ease: "linear"
            }}
            style={{
              clipPath: shard.clip,
              mixBlendMode: shard.blend as any,
              zIndex: 200 + i
            }}
          >
            {children}
          </motion.div>
        ))}

        {/* 4. Reality Fracture Lines (Horizontal/Vertical) */}
        {phase === "clash" && (
          <motion.div
            className="absolute inset-0 z-[80] mix-blend-difference"
            animate={{
              opacity: [0.2, 0.8, 0.2],
              clipPath: [
                "inset(48% 0 48% 0)",
                "inset(0 48% 0 48%)",
                "inset(20% 0 78% 0)",
                "inset(0 20% 0 78%)"
              ]
            }}
            transition={{ duration: 0.05, repeat: Infinity }}
            style={{ backgroundColor: "white" }}
          />
        )}
      </div>

      {/* 5. Stabilization Flash (Extreme Color Strobe) */}
      <motion.div
        className="absolute inset-0 z-[300] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: showNew && phase === "rebuild" ? [0, 1, 0] : 0,
          backgroundColor: [COLORS.magenta, COLORS.cyan, COLORS.yellow, "transparent"] 
        }}
        transition={{ duration: 0.5, times: [0, 0.2, 0.5, 1] }}
      />

      {/* 6. Halftone Noise Overlay */}
      <motion.div 
        className="absolute inset-0 z-[150] pointer-events-none mix-blend-overlay"
        animate={{ opacity: phase === "clash" ? 0.4 : 0 }}
        style={{
          backgroundImage: `radial-gradient(circle, ${COLORS.cyan} 1px, transparent 0)`,
          backgroundSize: "3px 3px"
        }}
      />
    </div>
  );
}
