"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Direction = "next" | "prev";

interface Props {
  isActive: boolean;
  direction: Direction;
  children?: React.ReactNode;
  onReveal: () => void;
  onComplete: () => void;
}

type Phase = "idle" | "impact" | "slow-mo" | "release" | "done";

export default function SwordSliceTransition({
  isActive,
  direction,
  children,
  onReveal,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visible, setVisible] = useState(false);
  const audioRef = useRef<{ slice: HTMLAudioElement | null }>({ slice: null });

  useEffect(() => {
    // Optional: Slice sound
    const slice = new Audio("https://www.soundjay.com/misc/sounds/sword-gesture-1.mp3");
    slice.volume = 0.5;
    audioRef.current.slice = slice;
  }, []);

  const playSlice = () => {
    if (audioRef.current.slice) {
      audioRef.current.slice.currentTime = 0;
      audioRef.current.slice.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (!isActive) {
      setPhase("idle");
      setVisible(false);
      return;
    }

    setVisible(true);
    
    // Step 1: Impact Phase (Flash & Line)
    setPhase("impact");
    playSlice();

    // Step 2: Slow Motion Tear (After impact)
    const impactDuration = 120;
    setTimeout(() => {
      setPhase("slow-mo");
    }, impactDuration);

    // Step 3: Fast Release (After tension)
    const slowMoDuration = 500;
    setTimeout(() => {
      setPhase("release");
      // Mid-release reveal
      setTimeout(onReveal, 150);
    }, impactDuration + slowMoDuration);

    // Step 4: Cleanup
    const releaseDuration = 600;
    setTimeout(() => {
      setPhase("done");
      setVisible(false);
      onComplete();
    }, impactDuration + slowMoDuration + releaseDuration);

  }, [isActive, onReveal, onComplete]);

  if (!visible) return null;

  // Horizontal-ish Cut Polygons (Right to Left slash)
  // Part A: Top half
  const polygonA = "polygon(0% 0%, 100% 0%, 100% 55%, 0% 45%)";
  // Part B: Bottom half
  const polygonB = "polygon(0% 45%, 100% 55%, 100% 100%, 0% 100%)";

  const getTransformA = () => {
    if (phase === "idle" || phase === "impact") return { x: 0, y: 0, rotate: 0 };
    if (phase === "slow-mo") return { x: 0, y: -6, rotate: -0.2 };
    if (phase === "release") return { x: "5vw", y: "-120vh", rotate: -5, scale: 0.95 };
    return { x: 0, y: "-120vh" };
  };

  const getTransformB = () => {
    if (phase === "idle" || phase === "impact") return { x: 0, y: 0, rotate: 0 };
    if (phase === "slow-mo") return { x: 0, y: 6, rotate: 0.2 };
    if (phase === "release") return { x: "-5vw", y: "120vh", rotate: 5, scale: 0.95 };
    return { x: 0, y: "120vh" };
  };

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden">
      {/* Side A (Top-Left) */}
      <motion.div
        animate={getTransformA()}
        transition={
          phase === "release"
            ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0.5, ease: "easeOut" }
        }
        className="absolute inset-0"
        style={{ clipPath: polygonA }}
      >
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0">{children}</div>
        {/* Cut edge shadow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(175deg, transparent 48%, rgba(0,0,0,0.5) 50%, transparent 52%)",
            opacity: phase === "slow-mo" ? 1 : 0,
            transition: "opacity 0.3s"
          }}
        />
      </motion.div>

      {/* Side B (Bottom-Right) */}
      <motion.div
        animate={getTransformB()}
        transition={
          phase === "release"
            ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0.5, ease: "easeOut" }
        }
        className="absolute inset-0"
        style={{ clipPath: polygonB }}
      >
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0">{children}</div>
        {/* Cut edge shadow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(175deg, transparent 48%, rgba(0,0,0,0.5) 50%, transparent 52%)",
            opacity: phase === "slow-mo" ? 1 : 0,
            transition: "opacity 0.3s"
          }}
        />
      </motion.div>

      {/* Impact Flash Line */}
      <AnimatePresence>
        {phase === "impact" && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div 
              className="w-[200%] h-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
              style={{ transform: "rotate(-5deg)" }} // Matches the 45% -> 55% angle approx
            />
            {/* Impact Flash */}
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              className="absolute inset-0 bg-white/20"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Shake Component (Optional but requested) */}
      {phase === "impact" && (
        <style jsx global>{`
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
          body {
            animation: shake 0.15s;
          }
        `}</style>
      )}
    </div>
  );
}
