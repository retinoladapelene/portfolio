"use client";

import React, { useRef, useMemo } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  subtitle: string;
  description: string;
}

const STEPS: Step[] = [
  {
    title: "Commission Request",
    subtitle: "01",
    description: "Please send your commission request via DM me using the commission form, give me clear references, pose, character, description, etc.",
  },
  {
    title: "Discussion",
    subtitle: "02",
    description: "I will reply to let you know that I have received your commission and we can discuss more details.",
  },
  {
    title: "Draft Sketch",
    subtitle: "03",
    description: "I will start working on a draft sketch. During this stage, you are allowed to do up to 3 major revisions (e.g. changing poses, facial expressions, etc.)",
  },
  {
    title: "Lineart & Color",
    subtitle: "04",
    description: "After we agree with the sketch, I will continue with the lineart/color. Any major adjustments or additions will not be accepted.",
  },
  {
    title: "Progress Updates",
    subtitle: "05",
    description: "I will update you on the progress of the commissions regularly. You can also see my recent art on Instagram.",
  },
];

const generateHorizontalVine = (width: number) => {
  const segments = 10;
  const segmentWidth = width / segments;
  let d = `M 0 40`;
  
  for (let i = 1; i <= segments; i++) {
    const x = i * segmentWidth;
    const y = 40 + Math.sin(i * 1.5) * 8; // Gentle organic wave
    const cp1x = x - segmentWidth / 2;
    const cp1y = 40 + Math.sin((i - 0.5) * 1.5) * 12;
    d += ` Q ${cp1x} ${cp1y}, ${x} ${y}`;
  }
  return d;
};

export default function HorizontalBloomingTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 30,
    restDelta: 0.001
  });

  const vinePath = useMemo(() => generateHorizontalVine(1200), []);

  return (
    <section 
      ref={containerRef}
      id="process"
      className="relative w-full h-[300vh] bg-transparent"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col pt-12 overflow-hidden">
        
        {/* BACKGROUND ELEMENTS - Refined for Dark Theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-green-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          
          {/* HEADER */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight font-dancing-script mb-4">
                The Creative <span className="text-purple-400">Journey</span>
              </h2>
              <p className="text-white/40 text-[10px] md:text-xs font-black tracking-[0.3em] uppercase italic">
                Watch ideas bloom into finished art.
              </p>
            </motion.div>
          </div>

          {/* HORIZONTAL TIMELINE WRAPPER */}
          <div className="relative w-full max-w-6xl mx-auto mt-[180px] mb-8">
            
            {/* THE STEM (SVG) */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
              <svg width="100%" height="100" viewBox="0 0 1200 100" fill="none" preserveAspectRatio="none" className="overflow-visible">
                <defs>
                  <linearGradient id="stemGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                
                {/* Ghost Path */}
                <path d={vinePath} stroke="rgba(0,0,0,0.03)" strokeWidth="2" strokeLinecap="round" />
                
                {/* Growing Stem */}
                <motion.path 
                  d={vinePath} 
                  stroke="url(#stemGradient)" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]"
                  style={{ pathLength: smoothProgress, willChange: "pathLength" }}
                />
              </svg>
            </div>

            {/* NODES & CARDS - Center axis container */}
            <div className="relative h-[100px] w-full flex justify-between items-center">
              {STEPS.map((step, index) => (
                <TimelineStep 
                  key={index} 
                  step={step} 
                  index={index} 
                  total={STEPS.length} 
                  progress={smoothProgress} 
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function TimelineStep({ step, index, total, progress }: { step: Step, index: number, total: number, progress: any }) {
  const [isActive, setIsActive] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);
  
  React.useEffect(() => {
    setHasMounted(true);
    const stepThreshold = index / (total - 0.8);
    const unsubscribe = progress.on("change", (v: number) => {
      setIsActive(v >= stepThreshold);
    });
    return () => unsubscribe();
  }, [index, total, progress]);

  const isTop = index % 2 === 0;

  return (
    <div className="relative flex-1 flex flex-col items-center">
      
      {/* CONTENT CARD */}
      <div className={cn(
        "absolute w-44 md:w-56 transition-all duration-1000",
        isTop ? "bottom-[calc(50%+2rem)]" : "top-[calc(50%+2rem)]"
      )}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: isTop ? 10 : -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="relative p-5 rounded-[24px] overflow-hidden group shadow-[0_20px_50px_rgba(139,92,246,0.12)] transition-all duration-700 hover:scale-[1.02]"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              }}
            >
              {/* Subtle Light Sweep Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px]">
                <motion.div 
                  className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                  style={{ skewX: -20 }}
                />
              </div>

              <div className="relative z-10">
                <span className="font-outfit text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 block">
                  Step {step.subtitle}
                </span>
                
                <h4 className="font-dancing-script text-[20px] md:text-[24px] font-bold leading-none mb-2">
                  <span style={{
                    background: "linear-gradient(135deg, #8B5CF6, #C4B5FD, #6D28D9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    {step.title}
                  </span>
                </h4>
                
                <p className="font-outfit text-[10px] md:text-[11px] text-slate-500 font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FLOWER NODE - Perfectly synchronized with vine curve logic */}
      <div 
        className="z-20 transition-transform duration-500"
        style={{ 
          transform: `translateY(${Math.sin(index * 2.5 * 1.5) * 8}px)` 
        }}
      >
        <FlowerNode index={index} isActive={isActive} hasMounted={hasMounted} />
      </div>
      
    </div>
  );
}

function FlowerNode({ index, isActive, hasMounted }: { index: number, isActive: boolean, hasMounted: boolean }) {
  if (!hasMounted) return null;

  // Stages: 0: Bud, 1: Sprouting, 2: Opening, 3: Bloom, 4: Full Radiance
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <AnimatePresence>
        {isActive ? (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <svg width="65" height="65" viewBox="0 0 120 120" fill="none" className="overflow-visible">
              <defs>
                {/* Soft Lilac Orchid Gradients */}
                <linearGradient id={`orchidPetal-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5F3FF" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0.5" />
                </linearGradient>
                <radialGradient id={`pollenGlow-${index}`}>
                  <stop offset="0%" stopColor="#FFF" />
                  <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
                </radialGradient>
              </defs>

              <g transform="translate(60, 60)">
                {/* STEM CONNECTION (The Receptacle) - Anchors the flower to the vine */}
                <motion.path
                  d="M-2 0 C-2 5 2 5 2 0 L0 -8 Z"
                  fill="#86EFAC"
                  fillOpacity="0.3"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1 }}
                />

                {/* THE BLOOM (Sakura 🌸 — Distinct Petals) */}
                <motion.g
                  animate={{ 
                    scale: [0.98, 1.02, 0.98],
                    rotate: [-1, 1, -1]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  {/* 5 Sakura Petals — wide teardrop with notched tip */}
                  {[
                    { angle: -90,  scale: 1.0,  opacity: 0.75 },
                    { angle: -18,  scale: 0.95, opacity: 0.6  },
                    { angle: 54,   scale: 1.0,  opacity: 0.7  },
                    { angle: 126,  scale: 0.92, opacity: 0.65 },
                    { angle: 198,  scale: 0.97, opacity: 0.7  },
                  ].map((petal, i) => (
                    <motion.g
                      key={`petal-${i}`}
                      initial={{ scale: 0, opacity: 0, rotate: petal.angle - 15 }}
                      animate={{ scale: petal.scale, opacity: petal.opacity, rotate: petal.angle + (i % 2 === 0 ? 3 : -2) }}
                      transition={{ delay: i * 0.12, duration: 1.6, ease: "easeOut" }}
                      style={{ transformOrigin: "0 0" }}
                    >
                      {/* Each petal: wide base, tapers out, notched sakura tip */}
                      <path
                        d="M0 -3 C-10 -14 -14 -28 -8 -35 C-4 -38 -1 -33 0 -30 C1 -33 4 -38 8 -35 C14 -28 10 -14 0 -3 Z"
                        fill={`url(#orchidPetal-${index})`}
                      />
                    </motion.g>
                  ))}

                  {/* Tiny accent petals between main petals for layered depth */}
                  {[
                    { angle: -54,  opacity: 0.35 },
                    { angle: 18,   opacity: 0.3  },
                    { angle: 90,   opacity: 0.35 },
                    { angle: 162,  opacity: 0.3  },
                    { angle: 234,  opacity: 0.32 },
                  ].map((accent, i) => (
                    <motion.g
                      key={`accent-${i}`}
                      initial={{ scale: 0, opacity: 0, rotate: accent.angle }}
                      animate={{ scale: 0.7, opacity: accent.opacity, rotate: accent.angle }}
                      transition={{ delay: 0.8 + i * 0.08, duration: 1.2 }}
                      style={{ transformOrigin: "0 0" }}
                    >
                      <path
                        d="M0 -2 C-6 -10 -9 -20 -5 -24 C-2 -26 0 -22 0 -20 C0 -22 2 -26 5 -24 C9 -20 6 -10 0 -2 Z"
                        fill="#F5F3FF"
                        fillOpacity="0.6"
                      />
                    </motion.g>
                  ))}

                  {/* CENTER — small, crisp, warm glow */}
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    <circle cx="0" cy="0" r="4" fill={`url(#pollenGlow-${index})`} className="blur-[1px]" />
                    <circle cx="0" cy="0" r="2.5" fill="#FEFCE8" opacity="0.9" />
                    <circle cx="0" cy="0" r="1" fill="#FFF" />
                  </motion.g>
                </motion.g>
              </g>
            </svg>
          </motion.div>
        ) : (
          /* BUD STATE - Tiny & Neat Sphere */
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center"
          >
            <div className="w-2.5 h-3 rounded-full bg-[#86EFAC] relative overflow-hidden shadow-sm border border-white/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#A78BFA]/60 rounded-full" />
            </div>
            <div className="w-[1px] h-2 bg-[#86EFAC]/30 mt-0.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
