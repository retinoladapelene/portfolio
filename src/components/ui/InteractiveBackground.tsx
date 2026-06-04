"use client";

import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState, memo } from "react";

// Optimized Bloom component to reduce re-renders of the main container
const Bloom = memo(({ bloom }: { bloom: { id: number; x: number; y: number; rotate: number; scale: number } }) => {
  return (
    <motion.ellipse
      initial={{ 
        rx: 10, 
        ry: 5, 
        opacity: 0, 
        cx: bloom.x, 
        cy: bloom.y,
        rotate: bloom.rotate,
        scale: 0.1
      }}
      animate={{ 
        rx: [10, 800, 1400], 
        ry: [5, 120, 200],
        opacity: [0, 0.9, 0.6, 0],
        cy: bloom.y + 180, // Ink "sinking" through water
        cx: bloom.x + (Math.sin(bloom.id) * 80), // Swirling drift
        scale: bloom.scale
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 12, ease: "easeOut" }}
      fill="white"
      style={{ willChange: "transform, opacity, rx, ry" }}
    />
  );
});

Bloom.displayName = "Bloom";

function InteractiveBackground() {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  
  // Motion values for the automated "ink flow" path
  const maskX = useMotionValue(960);
  const maskY = useMotionValue(540);
  const springX = useSpring(maskX, { stiffness: 40, damping: 20 });
  const springY = useSpring(maskY, { stiffness: 40, damping: 20 });

  // State for the "ink injected into water" blooms
  const [blooms, setBlooms] = useState<{ id: number; x: number; y: number; rotate: number; scale: number }[]>([]);
  const bloomCounter = useRef(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      maskX.set(window.innerWidth / 2);
      maskY.set(window.innerHeight / 2);

      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener("resize", handleResize, { passive: true });
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [maskX, maskY]);

  // Periodic ink injection at the current path position
  useEffect(() => {
    if (!mounted) return;
    const spawnBloom = () => {
      const currentX = maskX.get();
      const currentY = maskY.get();
      
      setBlooms((prev) => {
        // Reduced max blooms from 15 to 8 on mobile, 15 on desktop
        const isMobile = window.innerWidth < 768;
        const maxBlooms = isMobile ? 8 : 15;
        const next = [...prev.slice(-(maxBlooms - 1)), { 
          id: bloomCounter.current++, 
          x: currentX, 
          y: currentY,
          rotate: (Math.random() - 0.5) * 30,
          scale: 0.7 + Math.random() * 0.6
        }];
        return next;
      });
    };

    // Increased interval on mobile to 1.5s, 1s on desktop
    const isMobile = window.innerWidth < 768;
    const intervalTime = isMobile ? 1500 : 1000;
    const interval = setInterval(spawnBloom, intervalTime);
    return () => clearInterval(interval);
  }, [mounted, maskX, maskY]);

  // Automated Idle Path (Lissajous curve / Figure-Eight)
  useAnimationFrame((time) => {
    if (!mounted) return;
    const centerX = windowSize.width / 2;
    const centerY = windowSize.height / 2;
    const amplitudeX = windowSize.width * 0.38;
    const amplitudeY = windowSize.height * 0.28;
    
    const targetX = centerX + Math.cos(time / 2500) * amplitudeX;
    const targetY = centerY + Math.sin(time / 5000) * amplitudeY;

    maskX.set(targetX);
    maskY.set(targetY);
  });

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden bg-white">
      {/* 1. Subtle Paper/Canvas Texture - Using CSS instead of background-image if possible, but keeping it for now */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] will-change-transform" />

      {/* 2. Revealed Atmospheric Layer (Ink Spread) — uses theme CSS vars */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{ 
          background: `linear-gradient(135deg, 
            var(--theme-light, #F3E8FF) 0%, 
            color-mix(in srgb, var(--theme-light, #E9D5FF) 70%, var(--theme-dot, #A78BFA) 30%) 50%, 
            color-mix(in srgb, var(--theme-light, #DDD6FE) 50%, var(--theme-dot, #A78BFA) 50%) 100%
          )`,
          transition: "background 1.2s ease"
        }}
      >
        {/* Interior bloom movement for added depth */}
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 will-change-transform"
          style={{
            background: `radial-gradient(ellipse at center, color-mix(in srgb, var(--theme-dot, #A78BFA) 50%, transparent) 0%, transparent 70%)`,
            transition: "background 1.2s ease",
            filter: "blur(60px)"
          }}
        />
      </div>
      
      <svg className="absolute w-full h-full pointer-events-none opacity-40 mix-blend-overlay" style={{ filter: "blur(40px)" }}>
        <g>
          {/* Main automated flow */}
          <motion.ellipse 
            cx={springX} 
            cy={springY} 
            rx="450" 
            ry="250" 
            fill="var(--theme-dot, #A78BFA)" 
            fillOpacity="0.8"
            style={{ willChange: "cx, cy" }}
          />
          
          {/* Individual ink blooms */}
          <AnimatePresence mode="popLayout">
            {blooms.map((bloom) => (
              <Bloom key={bloom.id} bloom={bloom} />
            ))}
          </AnimatePresence>
        </g>
      </svg>

      {/* 3. Subtle Atmospheric Light Bloom Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 will-change-transform"
        style={{
          background: `radial-gradient(ellipse at center, color-mix(in srgb, var(--theme-light, #F3E8FF) 30%, transparent) 0%, transparent 70%)`,
          transition: "background 1.2s ease",
        }}
      />
      
      {/* 4. Film Grain Overlay */}
      <div className="absolute inset-0 grain-overlay opacity-[0.02] pointer-events-none" />
    </div>
  );
}

export default memo(InteractiveBackground);
