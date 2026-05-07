"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

interface Props {
  isActive: boolean;
  children?: React.ReactNode;
  onReveal: () => void;
  onComplete: () => void;
}

type Phase = 
  | "idle" 
  | "gentle"      // Phase B: Gentle Wind (500ms)
  | "curl"        // Phase C: Edge Lift & Curl (500ms)
  | "escalation"  // Phase D: Wind Escalation (500ms)
  | "resistance"  // Phase E: Resistance Phase (250ms)
  | "snap"        // Phase F: Detachment Snap (100ms)
  | "flight"      // Phase G: Full Flight to the Left (800ms)
  | "settle";     // Phase I: Aftermath Stabilization (400ms)

export default function PaperPeelTransition({
  isActive,
  children,
  onReveal,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const controls = useAnimation();
  const audioRef = useRef<{ rustle: HTMLAudioElement | null }>({ rustle: null });

  useEffect(() => {
    const rustle = new Audio("https://www.soundjay.com/misc/sounds/paper-rustle-1.mp3");
    rustle.volume = 0.2;
    audioRef.current.rustle = rustle;
  }, []);

  const playRustle = (volume = 0.2, speed = 1) => {
    if (audioRef.current.rustle) {
      const s = audioRef.current.rustle.cloneNode() as HTMLAudioElement;
      s.volume = volume;
      s.playbackRate = speed;
      s.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (isActive) {
      const sequence = async () => {
        // Phase B: Gentle Wind (500ms)
        setPhase("gentle");
        playRustle(0.1, 0.8);
        await new Promise((r) => setTimeout(r, 500));

        // Phase C: Curl Formation (500ms)
        setPhase("curl");
        playRustle(0.2, 1);
        await new Promise((r) => setTimeout(r, 500));

        // Phase D: Wind Escalation (500ms)
        setPhase("escalation");
        playRustle(0.3, 1.2);
        await new Promise((r) => setTimeout(r, 500));

        // Phase E: Resistance (250ms) - Tension build-up
        setPhase("resistance");
        playRustle(0.4, 1.5);
        await new Promise((r) => setTimeout(r, 250));

        // Phase F: Snap (100ms)
        setPhase("snap");
        playRustle(0.5, 2);
        await new Promise((r) => setTimeout(r, 100));

        // Phase G: Flight (800ms)
        setPhase("flight");
        setTimeout(onReveal, 200); // Reveal project underneath
        await new Promise((r) => setTimeout(r, 800));

        // Phase I: Settle (400ms)
        setPhase("settle");
        await new Promise((r) => setTimeout(r, 400));

        // Reset
        setPhase("idle");
        onComplete();
      };
      sequence();
    } else {
      setPhase("idle");
    }
  }, [isActive, onReveal, onComplete]);

  if (!isActive && phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-[600] pointer-events-none overflow-hidden perspective-[2000px] bg-black/20">
      <div className="relative w-full h-full">
        
        {/* Sketchbook Spine Simulation (The anchor) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent z-50 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 z-[51]" />

        {/* The Paper Sheet */}
        <motion.div
          className="absolute inset-0 z-10 origin-left preserve-3d"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform",
            transformStyle: "preserve-3d",
            translateZ: "1px",
          }}
          initial={{ rotateY: 0, rotateX: 0, rotateZ: 0, skewY: 0, scaleX: 1, x: 0, y: 0, opacity: 1 }}
          animate={
            phase === "gentle" ? {
              rotateY: [0, 4, 0],
              skewY: [0, -1, 0],
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            } :
            phase === "curl" ? {
              rotateY: 25,
              skewY: -5,
              scaleX: 0.98,
              x: -30,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
            } :
            phase === "escalation" ? {
              rotateY: [25, 35, 30],
              rotateX: [0, 2, -2, 0],
              skewY: [-5, -12, -8],
              rotateZ: [0, -2, 1, 0],
              x: [-30, -60, -45],
              transition: { 
                duration: 0.2, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut" 
              }
            } :
            phase === "resistance" ? {
              rotateY: 55,
              skewY: -15,
              scaleX: 0.92,
              x: -150,
              rotateZ: [-2, -3, -2],
              transition: { duration: 0.3, ease: "circIn" }
            } :
            phase === "snap" ? {
              rotateY: 75,
              skewY: -20,
              x: -300,
              opacity: 0.8,
              transition: { duration: 0.15, ease: "easeIn" }
            } :
            phase === "flight" ? {
              x: "-180vw",
              y: "-60vh",
              rotateY: 180,
              rotateZ: -60,
              rotateX: 45,
              scale: 0.6,
              opacity: 0,
              transition: { duration: 0.9, ease: [0.45, 0, 0.55, 1] }
            } :
            { rotateY: 0, rotateX: 0, rotateZ: 0, skewY: 0, scaleX: 1, x: 0, y: 0, opacity: 1 }
          }
        >
          {/* Paper Content Wrapper */}
          <div className="absolute inset-0 bg-black overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
            {children}
            
            {/* Spine Shadow (Left side adhesion) */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black/60 to-transparent z-40" />

            {/* Surface Highlight (Fold simulation) */}
            <motion.div 
              className="absolute inset-0 z-40 pointer-events-none"
              animate={{
                background: (phase === "curl" || phase === "escalation" || phase === "resistance") 
                  ? "linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 80%)"
                  : "none",
                x: phase === "escalation" ? ["-10%", "10%"] : "0%"
              }}
              transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
            />

            {/* Grain Texture */}
            <div 
              className="absolute inset-0 z-20 pointer-events-none opacity-[0.07] mix-blend-overlay"
              style={{
                backgroundImage: `url('https://www.transparenttextures.com/patterns/handmade-paper.png')`,
                backgroundColor: "white",
              }}
            />
          </div>
        </motion.div>

        {/* Dynamic Shadow (Underneath the paper) */}
        {(phase !== "idle" && phase !== "flight" && phase !== "settle") && (
          <motion.div 
            className="absolute inset-0 z-0 bg-black/40 blur-3xl pointer-events-none origin-left"
            animate={{
              scaleX: phase === "gentle" ? 1 : 0.8,
              opacity: phase === "resistance" ? 0.6 : 0.3,
              skewY: phase === "curl" ? -5 : 0
            }}
          />
        )}

        {/* Aftermath Settle (Phase I) */}
        {phase === "settle" && (
          <motion.div 
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-white/5"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
            {/* Subtle leftover wind effect on new content */}
            <motion.div 
              className="w-full h-full"
              initial={{ x: 10, scale: 0.99 }}
              animate={{ x: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
