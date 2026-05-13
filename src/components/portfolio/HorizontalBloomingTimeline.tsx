"use client";

import React, { useRef, useMemo, memo } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  subtitle: string;
  description: string;
}

const STEPS: Step[] = [
  {
    title: "Request & Review",
    subtitle: "01",
    description: "Submit your request through our integrated commission form. I'll review your brief and references to ensure we're a perfect match.",
  },
  {
    title: "Sketch & DP",
    subtitle: "02",
    description: "Receive initial sketches in your dashboard. Once you approve the direction, a 50% down payment secures your spot in the queue.",
  },
  {
    title: "WIP & Progress",
    subtitle: "03",
    description: "Follow the production with regular WIP updates. You can request adjustments here before we move to the 75% progress payment.",
  },
  {
    title: "Finalization",
    subtitle: "04",
    description: "Check the final preview of your masterpiece. After the 100% full payment is verified, the high-res files will be unlocked.",
  },
  {
    title: "Master Delivery",
    subtitle: "05",
    description: "Download your high-res artwork directly from your dashboard. For your privacy, all project data is automatically purged after 24 hours.",
  },
];

const generateHorizontalVine = (width: number) => {
  const segments = 10;
  const segmentWidth = width / segments;
  let d = `M 0 40`;
  
  for (let i = 1; i <= segments; i++) {
    const x = i * segmentWidth;
    const y = 40 + Math.sin(i * 1.5) * 8;
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
      className="relative w-full h-auto md:h-[300vh] bg-transparent"
    >
      <div className="relative md:sticky md:top-0 h-auto md:h-screen w-full flex flex-col pt-12 md:overflow-visible">
        
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="stemGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-green-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight font-dancing-script mb-4">
                The Creative <span className="text-purple-600">Journey</span>
              </h2>
              <p className="text-slate-900/40 text-[10px] md:text-xs font-black tracking-[0.3em] uppercase italic">
                Watch ideas bloom into finished art.
              </p>
            </motion.div>
          </div>

          <div className="hidden md:block relative w-full max-w-6xl mx-auto mt-[220px] mb-32">
            
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
              <svg width="100%" height="100" viewBox="0 0 1200 100" fill="none" preserveAspectRatio="none" className="overflow-visible">
                <path d={vinePath} stroke="rgba(0,0,0,0.03)" strokeWidth="2" strokeLinecap="round" />
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

            <div className="relative h-[150px] w-full flex justify-between items-center">
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

          <div className="block md:hidden relative w-full max-w-sm mx-auto mt-12 mb-20">
            <div className="relative w-full flex flex-col items-center gap-0">
              {STEPS.map((step, index) => (
                <MobileTimelineStep 
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

// Optimized Step Component
const TimelineStep = memo(({ step, index, total, progress }: { step: Step, index: number, total: number, progress: any }) => {
  const stepThreshold = index / (total - 0.8);
  
  // Use transforms instead of state for performance
  const opacity = useTransform(progress, [stepThreshold - 0.05, stepThreshold], [0, 1]);
  const scale = useTransform(progress, [stepThreshold - 0.05, stepThreshold], [0.95, 1]);
  const y = useTransform(progress, [stepThreshold - 0.05, stepThreshold], [10, 0]);
  
  const isTop = index % 2 === 0;

  return (
    <div className="relative flex-1 flex flex-col items-center">
      <motion.div 
        style={{ 
          opacity, 
          scale, 
          y: isTop ? useTransform(progress, [stepThreshold - 0.05, stepThreshold], [10, 0]) : useTransform(progress, [stepThreshold - 0.05, stepThreshold], [-10, 0]),
          willChange: "transform, opacity"
        }}
        className={cn(
          "absolute w-44 md:w-56",
          isTop ? "bottom-[calc(50%+2rem)]" : "top-[calc(50%+2rem)]"
        )}
      >
        <div
          className="relative p-5 rounded-[24px] overflow-hidden group shadow-[0_20px_50px_rgba(139,92,246,0.12)] bg-white/80 backdrop-blur-[12px] border border-white/50 transition-all duration-700 hover:scale-[1.02]"
        >
          <div className="relative z-10">
            <span className="font-outfit text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 block">
              Step {step.subtitle}
            </span>
            
            <h4 className="font-dancing-script text-[20px] md:text-[24px] font-bold leading-none mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                {step.title}
              </span>
            </h4>
            
            <p className="font-outfit text-[10px] md:text-[11px] text-slate-500 font-light leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </motion.div>

      <div 
        className="z-20"
        style={{ 
          transform: `translateY(${Math.sin(index * 2.5 * 1.5) * 8}px)` 
        }}
      >
        <FlowerNode index={index} progress={progress} threshold={stepThreshold} />
      </div>
    </div>
  );
});

TimelineStep.displayName = "TimelineStep";

const FlowerNode = memo(({ index, progress, threshold }: { index: number, progress: any, threshold: number }) => {
  const scale = useTransform(progress, [threshold - 0.05, threshold], [0.5, 1]);
  const opacity = useTransform(progress, [threshold - 0.1, threshold - 0.05], [0, 1]);
  const bloomOpacity = useTransform(progress, [threshold - 0.05, threshold], [0, 1]);
  const budOpacity = useTransform(progress, [threshold - 0.05, threshold], [1, 0]);

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      {/* Bloom State */}
      <motion.div
        style={{ scale, opacity: bloomOpacity, willChange: "transform, opacity" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg width="65" height="65" viewBox="0 0 120 120" fill="none" className="overflow-visible">
          <defs>
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
              {[
                { angle: -90,  scale: 1.0,  opacity: 0.75 },
                { angle: -18,  scale: 0.95, opacity: 0.6  },
                { angle: 54,   scale: 1.0,  opacity: 0.7  },
                { angle: 126,  scale: 0.92, opacity: 0.65 },
                { angle: 198,  scale: 0.97, opacity: 0.7  },
              ].map((petal, i) => (
                <g key={`petal-${i}`} style={{ transform: `rotate(${petal.angle}deg)`, opacity: petal.opacity }}>
                  <path
                    d="M0 -3 C-10 -14 -14 -28 -8 -35 C-4 -38 -1 -33 0 -30 C1 -33 4 -38 8 -35 C14 -28 10 -14 0 -3 Z"
                    fill={`url(#orchidPetal-${index})`}
                  />
                </g>
              ))}

              <circle cx="0" cy="0" r="4" fill={`url(#pollenGlow-${index})`} className="blur-[1px]" />
              <circle cx="0" cy="0" r="2.5" fill="#FEFCE8" opacity="0.9" />
            </motion.g>
          </g>
        </svg>
      </motion.div>

      {/* Bud State */}
      <motion.div 
        style={{ opacity: budOpacity, scale: useTransform(progress, [threshold - 0.1, threshold - 0.05], [0.5, 1]), willChange: "opacity, scale" }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <div className="w-2.5 h-3 rounded-full bg-[#86EFAC] relative overflow-hidden shadow-sm border border-white/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#A78BFA]/60 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
});

FlowerNode.displayName = "FlowerNode";

const MobileTimelineStep = memo(({ step, index, total, progress }: { step: Step, index: number, total: number, progress: any }) => {
  const stepThreshold = index / (total - 0.5);
  const opacity = useTransform(progress, [stepThreshold - 0.05, stepThreshold], [0, 1]);
  const scale = useTransform(progress, [stepThreshold - 0.05, stepThreshold], [0.95, 1]);

  return (
    <div className="relative flex flex-col items-center w-full">
      {index !== 0 && (
        <motion.div 
          style={{ height: useTransform(progress, [stepThreshold - 0.1, stepThreshold - 0.05], [0, 60]), willChange: "height" }}
          className="w-[2px] bg-gradient-to-b from-purple-400/40 to-green-300/20"
        />
      )}

      <div className="z-20 relative py-4">
        <FlowerNode index={index} progress={progress} threshold={stepThreshold} />
      </div>

      <motion.div 
        style={{ height: useTransform(progress, [stepThreshold - 0.05, stepThreshold], [0, 20]), opacity, willChange: "height, opacity" }}
        className="w-[1.5px] bg-purple-300/30"
      />

      <motion.div 
        style={{ opacity, scale, willChange: "opacity, scale" }}
        className="w-full px-8 max-w-[280px]"
      >
        <div className="relative p-4 rounded-[20px] overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.1)] bg-white border border-purple-50 text-center">
          <div className="relative z-10">
            <span className="font-outfit text-[8px] font-black uppercase tracking-[0.2em] text-purple-600 mb-1 block">
              Step {step.subtitle}
            </span>
            <h4 className="font-syne text-[18px] font-bold leading-tight mb-1.5 text-[#1A1F2B]">
              {step.title}
            </h4>
            <p className="font-outfit text-[10px] text-slate-500 font-medium leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </motion.div>

      {index !== total - 1 && (
        <motion.div 
          style={{ height: useTransform(progress, [stepThreshold, stepThreshold + 0.05], [0, 60]), willChange: "height" }}
          className="w-[2px] bg-gradient-to-b from-green-300/20 to-purple-400/40 mt-4"
        />
      )}
    </div>
  );
});

MobileTimelineStep.displayName = "MobileTimelineStep";
