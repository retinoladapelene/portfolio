"use client";

import React, { useRef, useMemo } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  subtitle: string;
  description: string;
  flowerMood: string;
}

const STEPS: Step[] = [
  {
    title: "The Inquiry",
    subtitle: "01",
    description: "Your journey begins with a message. We plant the seed of your vision through the inquiry form, sharing references and initial inspirations.",
    flowerMood: "tiny bud",
  },
  {
    title: "Creative Dialogue",
    subtitle: "02",
    description: "We nurture the idea through deep discussion. Every detail is explored to ensure the artistic direction aligns with your soul.",
    flowerMood: "soft bloom",
  },
  {
    title: "The First Bloom",
    subtitle: "03",
    description: "The draft sketch emerges—a delicate growth. This is where we refine the pose and composition, allowing the artwork to take root.",
    flowerMood: "larger bloom",
  },
  {
    title: "Refined Petals",
    subtitle: "04",
    description: "Lineart and base colors are meticulously applied. The vision strengthens, gaining form and vibrant life as it approaches completion.",
    flowerMood: "layered petals",
  },
  {
    title: "Final Radiance",
    subtitle: "05",
    description: "The masterpiece is fully bloomed. High-resolution files are delivered, marking the beautiful conclusion of our artistic journey together.",
    flowerMood: "ethereal blossom",
  },
];

// Helper to build an organic wavy vertical path
const generateVinePath = (height: number, width: number) => {
  const segments = 20;
  const segmentHeight = height / segments;
  let d = `M ${width / 2} 0`;
  
  for (let i = 1; i <= segments; i++) {
    const y = i * segmentHeight;
    // Varying curve intensity for organic feel
    const curveOffset = Math.sin(i * 0.8) * 40 + Math.cos(i * 1.2) * 15;
    const x = width / 2 + curveOffset;
    
    const cp1y = y - segmentHeight / 2;
    const cp1x = width / 2 + (Math.sin((i - 0.5) * 0.8) * 40 + Math.cos((i - 0.5) * 1.2) * 15);
    
    d += ` Q ${cp1x} ${cp1y}, ${x} ${y}`;
  }
  return d;
};

export default function BloomingTimeline() {
  const [hasMounted, setHasMounted] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 25,
    restDelta: 0.0001
  });

  // SVG Path logic
  const svgHeight = 2800; // Increased for more scroll space
  const svgWidth = 400;
  const vinePath = useMemo(() => generateVinePath(svgHeight, svgWidth), []);

  return (
    <section 
      ref={containerRef}
      id="process"
      className="relative w-full bg-[#FCFBF9] py-32 md:py-64 overflow-visible"
    >
      {/* 1. BACKGROUND TEXTURES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Optimized Watercolor Background (Single layer) */}
        <div className="absolute inset-0 opacity-40 mix-blend-multiply transition-opacity duration-1000"
          style={{ 
            background: `radial-gradient(circle at 10% 10%, #DDD6FE 0%, transparent 50%),
                         radial-gradient(circle at 90% 40%, #D8B4FE 0%, transparent 50%),
                         radial-gradient(circle at 20% 90%, #86EFAC 0%, transparent 50%)`,
            filter: "blur(80px)",
            willChange: "transform"
          }} 
        />
        
        {/* Soft Grain Texture */}
        <div className="absolute inset-0 opacity-[0.04] contrast-150 brightness-100 pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* HEADER */}
        <div className="text-center mb-64">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[#A78BFA] text-[10px] font-black uppercase tracking-[0.6em] mb-6 block">
              The Artistic Journey
            </span>
            <h2 className="text-5xl md:text-8xl font-black text-black uppercase tracking-tighter italic leading-none font-syne">
              A Living <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#D8B4FE] to-[#86EFAC]">Floral</span> Journey
            </h2>
            <div className="w-24 h-[1px] bg-black/10 mx-auto mt-12 mb-8" />
            <p className="text-black/30 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase max-w-xs mx-auto leading-relaxed">
              Witness the growth of your vision from seed to blossom.
            </p>
          </motion.div>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative max-w-5xl mx-auto" style={{ height: svgHeight }}>
          
          {/* THE VINE (SVG) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-[400px] pointer-events-none">
            <svg width="400" height={svgHeight} viewBox={`0 0 400 ${svgHeight}`} fill="none" className="overflow-visible">
              <defs>
                <linearGradient id="vineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8" />
                  <stop offset="33%" stopColor="#86EFAC" stopOpacity="0.5" />
                  <stop offset="66%" stopColor="#D8B4FE" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Ghost Path (The latent structure) */}
              <path d={vinePath} stroke="rgba(0,0,0,0.02)" strokeWidth="6" strokeLinecap="round" />
              
              {/* Growing Vine (The primary stroke) */}
              {hasMounted && (
                <>
                  <motion.path 
                    d={vinePath} 
                    stroke="url(#vineGradient)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]"
                    style={{ pathLength: smoothProgress, willChange: "pathLength" }}
                  />

                  {/* Glowing Growing Tip (The Pen) */}
                  <GrowingTip progress={smoothProgress} path={vinePath} />
                </>
              )}
            </svg>
          </div>

          {/* STEPS CONTENT */}
          {STEPS.map((step, index) => (
            <TimelineStep 
              key={index} 
              step={step} 
              index={index} 
              progress={smoothProgress} 
              totalSteps={STEPS.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GrowingTip({ progress, path }: { progress: any, path: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [point, setPoint] = React.useState({ x: 200, y: 0 });

  React.useEffect(() => {
    const update = () => {
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        const currentLength = length * progress.get();
        const p = pathRef.current.getPointAtLength(currentLength);
        setPoint({ x: p.x, y: p.y });
      }
    };
    const unsubscribe = progress.on("change", update);
    return () => unsubscribe();
  }, [progress]);

  return (
    <>
      <path ref={pathRef} d={path} fill="none" stroke="none" />
      <motion.circle 
        cx={point.x} 
        cy={point.y} 
        r="5" 
        fill="white"
        className="drop-shadow-[0_0_15px_rgba(167,139,250,0.8)]"
        style={{ willChange: "transform" }}
      />
      {/* Pulse rings */}
      <motion.circle 
        cx={point.x} 
        cy={point.y} 
        r="15" 
        stroke="rgba(167,139,250,0.4)"
        strokeWidth="1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </>
  );
}

function TimelineStep({ step, index, progress, totalSteps }: { step: Step, index: number, progress: any, totalSteps: number }) {
  const [isActive, setIsActive] = React.useState(false);
  const stepThreshold = index / (totalSteps - 0.5);

  React.useEffect(() => {
    const unsubscribe = progress.on("change", (v: number) => {
      setIsActive(v >= stepThreshold);
    });
    return () => unsubscribe();
  }, [index, progress, stepThreshold]);

  const isLeft = index % 2 === 0;
  const yPos = (index / (totalSteps - 1)) * 100;

  return (
    <div 
      className="absolute w-full flex items-center" 
      style={{ top: `${yPos}%`, transform: 'translateY(-50%)' }}
    >
      {/* CONTENT PANEL (Floating Editorial Panel) */}
      <motion.div 
        initial={{ opacity: 0, y: 30, x: isLeft ? -40 : 40 }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        viewport={{ once: true, margin: "-100px" }}
        className={cn(
          "w-[75%] md:w-[42%] p-8 md:p-14 rounded-[32px] md:rounded-[40px] bg-white border border-black/[0.05] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] relative group transition-all duration-700 hover:shadow-[0_48px_80px_-16px_rgba(167,139,250,0.08)]",
          isLeft ? "mr-auto ml-4 md:ml-0 text-right" : "ml-auto mr-4 md:mr-0 text-left"
        )}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Huge Engraved Background Number */}
        <span className={cn(
          "absolute -top-12 md:-top-16 opacity-[0.03] text-[100px] md:text-[180px] font-black italic select-none pointer-events-none font-syne group-hover:opacity-[0.05] transition-opacity duration-700",
          isLeft ? "right-6" : "left-6"
        )}>
          {step.subtitle}
        </span>

        <div className="relative z-10">
          <motion.span 
            animate={isActive ? { color: "#A78BFA" } : { color: "rgba(0,0,0,0.2)" }}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4 block transition-colors duration-1000"
          >
            Artistic Phase 0{index + 1}
          </motion.span>
          <h3 className="text-xl md:text-4xl font-black text-black uppercase tracking-tighter italic mb-4 md:group-hover:translate-x-2 transition-transform duration-700 leading-tight">
            {step.title}
          </h3>
          <p className="text-black/50 text-[11px] md:text-base leading-relaxed italic font-medium max-w-[340px] ml-auto">
            &quot;{step.description}&quot;
          </p>
        </div>

        {/* Ambient Glow */}
        <div className={cn(
          "absolute -inset-2 bg-gradient-to-br from-[#A78BFA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[42px] blur-2xl pointer-events-none"
        )} />
      </motion.div>

      {/* BLOOM NODE (The center anchor) */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
        <BloomFlower isActive={isActive} index={index} />
        {isActive && <PetalParticles />}
      </div>
    </div>
  );
}

function PetalParticles() {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => setHasMounted(true), []);

  const particles = useMemo(() => [...Array(4)].map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 120,
    y: 40 + Math.random() * 80,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 4,
    rotation: Math.random() * 360
  })), []);

  if (!hasMounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.5 }}
          animate={{ 
            x: p.x, 
            y: p.y, 
            opacity: [0, 0.4, 0],
            rotate: p.rotation + 360,
            scale: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "linear"
          }}
          className="absolute w-2 h-2 bg-[#DDD6FE]/30 rounded-full blur-[1px]"
          style={{
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            willChange: "transform, opacity"
          }}
        />
      ))}
    </div>
  );
}

function BloomFlower({ isActive, index }: { isActive: boolean, index: number }) {
  // Scale of bloom based on index
  const bloomScale = 0.8 + (index * 0.15);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{ scale: bloomScale, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.1 }}
            className="relative"
          >
            {/* Abstract Translucent Flower */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">
              <defs>
                <linearGradient id={`bloomGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Petals layer 1 */}
              {[...Array(6 + index)].map((_, i) => (
                <motion.path
                  key={`p1-${i}`}
                  d="M60 60 C60 60 85 20 60 5 C35 20 60 60 60 60"
                  fill={`url(#bloomGradient-${index})`}
                  className="blur-[1px]"
                  style={{ rotate: i * (360 / (6 + index)), originX: "60px", originY: "60px", willChange: "transform, opacity" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 1.5, ease: "easeOut" }}
                />
              ))}

              {/* Petals layer 2 (smaller, inner) */}
              {[...Array(5)].map((_, i) => (
                <motion.path
                  key={`p2-${i}`}
                  d="M60 60 C60 60 75 35 60 25 C45 35 60 60 60 60"
                  fill="white"
                  style={{ rotate: i * 72 + 36, originX: "60px", originY: "60px" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                />
              ))}
              
              {/* Core Glow */}
              <circle cx="60" cy="60" r="4" fill="white" className="shadow-lg" />
              <circle cx="60" cy="60" r="10" fill="white" fillOpacity="0.2" />
            </svg>
            
            {/* Ethereal Glow Pulse */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-tr from-[#A78BFA] to-[#86EFAC] rounded-full blur-3xl opacity-20 -z-10"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* The Bud (Pre-bloom) */}
      {!isActive && (
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="w-4 h-4 bg-gradient-to-b from-[#86EFAC] to-[#A78BFA] rounded-full border border-white/80 shadow-md z-10 relative"
            animate={{ scale: [1, 1.15, 1], y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-4 bg-[#86EFAC]/50" />
        </motion.div>
      )}
    </div>
  );
}
