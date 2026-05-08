"use client";

import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function InteractiveBackground() {
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
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [maskX, maskY]);

  // Periodic ink injection at the current path position
  useEffect(() => {
    if (!mounted) return;
    const spawnBloom = () => {
      const currentX = maskX.get();
      const currentY = maskY.get();
      
      setBlooms((prev) => [
        ...prev.slice(-30), 
        { 
          id: bloomCounter.current++, 
          x: currentX, 
          y: currentY,
          rotate: (Math.random() - 0.5) * 30, // Keep mostly horizontal
          scale: 0.7 + Math.random() * 0.6
        }
      ]);
    };

    const interval = setInterval(spawnBloom, 400); // Increased frequency for more effects
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
      {/* 1. Subtle Paper/Canvas Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      {/* 2. Revealed Atmospheric Layer (Ink Spread) */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 50%, #DDD6FE 100%)",
          maskImage: "url(#ink-mask-global-v10)",
          WebkitMaskImage: "url(#ink-mask-global-v10)",
          maskMode: "alpha",
          WebkitMaskMode: "alpha"
        } as any}
      >
        {/* Interior bloom movement for added depth */}
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-radial-gradient from-purple-200/50 to-transparent blur-3xl"
        />
      </div>
      
      <svg className="absolute w-full h-full">
        <defs>
          <filter id="ink-spread-filter-global">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="5" seed="42" />
            <feDisplacementMap in="SourceGraphic" scale="220" />
            <feGaussianBlur stdDeviation="12" />
          </filter>
          
          <mask id="ink-mask-global-v10" maskUnits="userSpaceOnUse">
            <g filter="url(#ink-spread-filter-global)">
              {/* Main automated flow - changed to slender ellipse */}
              <motion.ellipse 
                cx={springX} 
                cy={springY} 
                rx="650" 
                ry="150" 
                fill="white" 
                fillOpacity="0.85"
              />
              
              {/* Individual ink blooms that sink and spread */}
              <AnimatePresence>
                {blooms.map((bloom) => (
                  <motion.ellipse
                    key={bloom.id}
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
                  />
                ))}
              </AnimatePresence>
            </g>
          </mask>
        </defs>
      </svg>

      {/* 3. Subtle Atmospheric Light Bloom Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-radial-gradient from-purple-100/30 via-transparent to-transparent" />
      
      {/* 4. Film Grain Overlay */}
      <div className="absolute inset-0 grain-overlay opacity-[0.03]" />
    </div>
  );
}
