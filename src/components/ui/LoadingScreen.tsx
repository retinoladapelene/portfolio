"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

// Minimalist art icon paths for the fill pattern
const ART_PATHS = [
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-5 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z", // Palette
  "M7 14c-1.1 0-2 .9-2 2 0 2.5 5 5 5 5s5-2.5 5-5c0-1.1-.9-2-2-2h-6zm12.71-8.29c.39-.39.39-1.02 0-1.41L17.7 2.29a.996.996 0 0 0-1.41 0L8 11V16h5l8.71-8.29z", // Brush
  "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z", // Pencil
  "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z", // Image
  "M12 2l2.4 7.6h7.6l-6.1 4.7L18.3 22l-6.3-4.8L5.7 22l2.4-7.7L2 9.6h7.6L12 2z", // Star
];

// Deterministic pseudo-random function to prevent hydration mismatch
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  const val = x - Math.floor(x);
  return Math.round(val * 10000) / 10000; // Round to 4 decimal places for consistency
};


export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const text = "MOONCHAERY";
  const letters = text.split("");

  useEffect(() => {
    // Show loading screen on initial mount and on every pathname change
    setIsVisible(true);
    
    // Duration: 2.2 seconds for a premium feel that isn't too slow for transitions
    const timer = setTimeout(() => setIsVisible(false), 2200);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  // Generate deterministic splatters for each letter
  const splatters = useMemo(() => {
    return letters.map((_, letterIdx) => {
      const count = 6; // Splatters per letter
      return Array.from({ length: count }).map((_, i) => {
        const seed = letterIdx * count + i;
        return {
          id: seed,
          x: (seededRandom(seed + 0.1) - 0.5) * 140, // Increased splatter range
          y: (seededRandom(seed + 0.2) - 0.5) * 140,
          size: 1.5 + seededRandom(seed + 0.3) * 4, // Slightly larger splatters
          opacity: 0.15 + seededRandom(seed + 0.4) * 0.45,
        };
      });
    });
  }, [letters]);



  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0A0510] overflow-hidden"
          style={{ willChange: "opacity" }}
        >
          {/* Static Ambient Nebula - No pulse for performance */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
             <div className="absolute top-[10%] left-[5%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.2)_0%,transparent_60%)] rounded-full" />
             <div className="absolute bottom-[10%] right-[5%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(49,46,129,0.2)_0%,transparent_60%)] rounded-full" />
          </div>

          {/* DESKTOP SINGLE-LINE TYPOGRAPHY (MD AND UP) */}
          <div className="hidden md:flex relative w-full max-w-[1200px] mx-auto justify-center items-center h-[300px] px-8">
            <div className="flex flex-row items-center justify-center origin-center md:scale-75 lg:scale-90 xl:scale-100">
              {letters.map((char, i) => (
                <motion.div
                  key={`letter-dt-${i}`}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: i * 0.05, 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  className="relative flex items-center justify-center w-[110px] h-[200px]"
                >
                  {/* Splatters */}
                  <div className="absolute inset-0 pointer-events-none">
                    {splatters[i].map((s) => (
                      <div
                        key={s.id}
                        className="absolute rounded-full bg-purple-400"
                        style={{
                          width: `${s.size * 2}px`,
                          height: `${s.size * 2}px`,
                          left: `calc(50% + ${s.x}px)`,
                          top: `calc(50% + ${s.y}px)`,
                          opacity: s.opacity * 0.8,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </div>

                  {/* Outline and Glow */}
                  <span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent"
                    style={{ 
                      fontSize: '165px',
                      fontFamily: 'var(--font-outfit), sans-serif',
                      letterSpacing: '-0.03em',
                      WebkitTextStroke: '1px rgba(167,139,250,0.3)',
                      textShadow: '0 0 40px rgba(167,139,250,0.15)',
                    }}
                  >
                    {char}
                  </span>

                  {/* Textured Fill */}
                  <span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent"
                    style={{ 
                      fontSize: '165px',
                      fontFamily: 'var(--font-outfit), sans-serif',
                      letterSpacing: '-0.03em',
                      backgroundImage: `url(/assets/texture-${(i % 5) + 1}.png)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                    }}
                  >
                    {char}
                  </span>

                  {/* Shimmer */}
                  <motion.span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent pointer-events-none"
                    style={{ 
                      fontSize: '165px',
                      fontFamily: 'var(--font-outfit), sans-serif',
                      letterSpacing: '-0.03em',
                      backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      backgroundRepeat: 'no-repeat',
                    }}
                    initial={{ backgroundPosition: '200% 0', opacity: 0 }}
                    animate={{ backgroundPosition: ['200% 0', '-200% 0'], opacity: 1 }}
                    transition={{ 
                      opacity: { duration: 0.5, delay: 0.8 },
                      backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 2, delay: 0.8 + i * 0.1 }
                    }}
                  >
                    {char}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* MOBILE DUAL-LINE TYPOGRAPHY (BELOW MD) */}
          <div className="flex md:hidden flex-col items-center justify-center gap-0 w-full px-4">
            {/* Row 1: MOON */}
            <div className="flex flex-row items-center justify-center scale-[0.42] min-[380px]:scale-[0.5] min-[480px]:scale-[0.6] origin-center h-[120px]">
              {letters.slice(0, 4).map((char, i) => {
                const idx = i;
                return (
                  <motion.div
                    key={`letter-mob1-${idx}`}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: idx * 0.05, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="relative flex items-center justify-center w-[90px] h-[160px]"
                  >
                    {/* Splatters */}
                    <div className="absolute inset-0 pointer-events-none">
                      {splatters[idx].map((s) => (
                        <div
                          key={s.id}
                          className="absolute rounded-full bg-purple-400"
                          style={{
                            width: `${s.size * 2}px`,
                            height: `${s.size * 2}px`,
                            left: `calc(50% + ${s.x * 0.8}px)`,
                            top: `calc(50% + ${s.y * 0.8}px)`,
                            opacity: s.opacity * 0.8,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      ))}
                    </div>

                    {/* Outline and Glow */}
                    <span 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent"
                      style={{ 
                        fontSize: '135px',
                        fontFamily: 'var(--font-outfit), sans-serif',
                        letterSpacing: '-0.03em',
                        WebkitTextStroke: '1px rgba(167,139,250,0.3)',
                        textShadow: '0 0 30px rgba(167,139,250,0.15)',
                      }}
                    >
                      {char}
                    </span>

                    {/* Textured Fill */}
                    <span 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent"
                      style={{ 
                        fontSize: '135px',
                        fontFamily: 'var(--font-outfit), sans-serif',
                        letterSpacing: '-0.03em',
                        backgroundImage: `url(/assets/texture-${(idx % 5) + 1}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                      }}
                    >
                      {char}
                    </span>

                    {/* Shimmer */}
                    <motion.span 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent pointer-events-none"
                      style={{ 
                        fontSize: '135px',
                        fontFamily: 'var(--font-outfit), sans-serif',
                        letterSpacing: '-0.03em',
                        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        backgroundRepeat: 'no-repeat',
                      }}
                      initial={{ backgroundPosition: '200% 0', opacity: 0 }}
                      animate={{ backgroundPosition: ['200% 0', '-200% 0'], opacity: 1 }}
                      transition={{ 
                        opacity: { duration: 0.5, delay: 0.8 },
                        backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 2, delay: 0.8 + idx * 0.1 }
                      }}
                    >
                      {char}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>

            {/* Row 2: CHAERY */}
            <div className="flex flex-row items-center justify-center scale-[0.38] min-[380px]:scale-[0.45] min-[480px]:scale-[0.55] origin-center h-[120px] -mt-2">
              {letters.slice(4, 10).map((char, i) => {
                const idx = i + 4;
                return (
                  <motion.div
                    key={`letter-mob2-${idx}`}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: idx * 0.05, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="relative flex items-center justify-center w-[90px] h-[160px]"
                  >
                    {/* Splatters */}
                    <div className="absolute inset-0 pointer-events-none">
                      {splatters[idx].map((s) => (
                        <div
                          key={s.id}
                          className="absolute rounded-full bg-purple-400"
                          style={{
                            width: `${s.size * 2}px`,
                            height: `${s.size * 2}px`,
                            left: `calc(50% + ${s.x * 0.8}px)`,
                            top: `calc(50% + ${s.y * 0.8}px)`,
                            opacity: s.opacity * 0.8,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      ))}
                    </div>

                    {/* Outline and Glow */}
                    <span 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent"
                      style={{ 
                        fontSize: '135px',
                        fontFamily: 'var(--font-outfit), sans-serif',
                        letterSpacing: '-0.03em',
                        WebkitTextStroke: '1px rgba(167,139,250,0.3)',
                        textShadow: '0 0 30px rgba(167,139,250,0.15)',
                      }}
                    >
                      {char}
                    </span>

                    {/* Textured Fill */}
                    <span 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent"
                      style={{ 
                        fontSize: '135px',
                        fontFamily: 'var(--font-outfit), sans-serif',
                        letterSpacing: '-0.03em',
                        backgroundImage: `url(/assets/texture-${(idx % 5) + 1}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                      }}
                    >
                      {char}
                    </span>

                    {/* Shimmer */}
                    <motion.span 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black select-none text-transparent pointer-events-none"
                      style={{ 
                        fontSize: '135px',
                        fontFamily: 'var(--font-outfit), sans-serif',
                        letterSpacing: '-0.03em',
                        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        backgroundRepeat: 'no-repeat',
                      }}
                      initial={{ backgroundPosition: '200% 0', opacity: 0 }}
                      animate={{ backgroundPosition: ['200% 0', '-200% 0'], opacity: 1 }}
                      transition={{ 
                        opacity: { duration: 0.5, delay: 0.8 },
                        backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 2, delay: 0.8 + idx * 0.1 }
                      }}
                    >
                      {char}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Cinematic Footer */}
          <div className="absolute bottom-12 md:bottom-16 left-0 w-full flex flex-col items-center gap-4">
             <div className="flex gap-3">
                {[0,1,2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.6, 0.2] 
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400"
                  />
                ))}
             </div>
             <div className="flex flex-col items-center gap-1.5 opacity-40">
                <span className="text-[10px] tracking-[0.8em] text-white uppercase font-black">Moonchaery Studio</span>
                <span className="text-[8px] tracking-[0.4em] text-white/60 uppercase font-medium">Curating Artistic Essence</span>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
