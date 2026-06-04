"use client";

import { motion, AnimatePresence, useMotionValue, useSpring, animate } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { buildBrushPath } from "@/lib/buildBrushPath";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayPathname, setDisplayPathname] = useState(pathname);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const progress = useMotionValue(0);
  const pathRef = useRef<SVGPathElement>(null);
  const isTransitioning = useRef(false);

  // Sync children when not animating (for normal re-renders within the same page)
  useEffect(() => {
    if (!isTransitioning.current && pathname === displayPathname) {
      setDisplayChildren(children);
    }
  }, [children, pathname, displayPathname]);

  useEffect(() => {
    if (pathname !== displayPathname && !isTransitioning.current) {
      isTransitioning.current = true;
      setIsAnimating(true);
      
      // Step 1: Animate brush to cover screen (0 -> 1)
      animate(progress, 1, {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
        onUpdate: (latest) => {
          if (pathRef.current) {
            pathRef.current.setAttribute("d", buildBrushPath(latest, 1000, 1000));
          }
        },
        onComplete: () => {
          // Step 2: Switch content while screen is covered
          setDisplayChildren(children);
          setDisplayPathname(pathname);
          
          // Step 3: Animate brush to reveal (1 -> 2)
          animate(progress, 2, {
            duration: 0.5,
            delay: 0.1,
            ease: [0.76, 0, 0.24, 1],
            onUpdate: (latest) => {
              if (pathRef.current) {
                pathRef.current.setAttribute("d", buildBrushPath(latest, 1000, 1000));
              }
            },
            onComplete: () => {
              setIsAnimating(false);
              isTransitioning.current = false;
              progress.set(0);
            }
          });
        }
      });
    }
  }, [pathname, displayPathname, children, progress]);

  return (
    <>
      <div className={isAnimating ? "pointer-events-none" : ""}>
        {displayChildren}
      </div>
      
      <AnimatePresence>
        {isAnimating && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          >
             <div className="absolute inset-0 bg-purple-600">
               <svg 
                 viewBox="0 0 1000 1000" 
                 preserveAspectRatio="none" 
                 className="absolute inset-0 w-full h-full"
                 style={{ filter: "blur(2px)" }}
               >
                 <path 
                   ref={pathRef} 
                   d={buildBrushPath(0, 1000, 1000)} 
                   fill="black" 
                 />
                 <defs>
                   <clipPath id="brush-clip">
                     <path ref={pathRef} d={buildBrushPath(0, 1000, 1000)} />
                   </clipPath>
                 </defs>
               </svg>
               
               {/* Decorative Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-black/20" />
               
               {/* Logo/Icon in center of transition */}
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 1.1, opacity: 0 }}
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
               >
                 <div className="w-12 h-12 bg-white rounded-2xl rotate-45 flex items-center justify-center shadow-2xl">
                    <div className="w-6 h-6 bg-purple-600 rounded-lg -rotate-45" />
                 </div>
               </motion.div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
