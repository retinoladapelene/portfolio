"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from "framer-motion";
import { Brush } from "lucide-react";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Position for the main tip - RAW values for instant response
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Velocity tracking for dynamic tilting
  const xVelocity = useVelocity(cursorX);
  
  // Tilt the brush based on horizontal speed - reduced range for stability
  const rotate = useTransform(xVelocity, [-1500, 1500], [-20, 20]);

  // ULTRA SNAPPY springs for the "Fluid Ring" to reduce perceived delay
  const springX = useSpring(cursorX, { stiffness: 800, damping: 50 });
  const springY = useSpring(cursorY, { stiffness: 800, damping: 50 });

  useEffect(() => {
    setMounted(true);
    
    const moveCursor = (e: MouseEvent) => {
      // Use requestAnimationFrame for the smoothest possible updates
      requestAnimationFrame(() => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      });
      
      const target = e.target as HTMLElement;
      
      // OPTIMIZATION: Removed getComputedStyle on every mousemove as it causes severe style recalculation frame drops
      const isClickable = 
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") !== null ||
        target.closest("a") !== null ||
        target.closest("[role='button']") !== null;
      
      // Only update state if it actually changed to avoid unnecessary re-renders
      if (isClickable !== isPointer) {
        setIsPointer(isClickable);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none hidden md:block overflow-hidden">
      {/* 1. The Fluid Outer Ring - Snappier & Smaller */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isPointer ? 42 : 24,
          height: isPointer ? 42 : 24,
          scale: isClicked ? 0.8 : 1,
          borderColor: isPointer ? "rgba(168, 85, 247, 0.4)" : "rgba(168, 85, 247, 0.15)",
          backgroundColor: isPointer ? "rgba(168, 85, 247, 0.05)" : "transparent",
        }}
        className="absolute rounded-full border border-purple-500/20"
      />

      {/* 2. The Brush Icon - Instant response */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-15%", 
          translateY: "-85%",
          rotate: rotate,
        }}
        animate={{
          scale: isPointer ? 0.7 : 1,
          opacity: isPointer ? 0.5 : 1,
          color: "#7c3aed",
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 60 }} // Faster property transitions
        className="absolute flex items-center justify-center"
      >
        <Brush 
          size={24} 
          className="drop-shadow-[0_2px_4px_rgba(124,58,237,0.2)]"
        />
        
        {/* Click Feedback */}
        <motion.div
          animate={{
            scale: isClicked ? [0, 1.2, 0] : 0,
            opacity: isClicked ? [0, 0.5, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-500 rounded-full blur-[1px]"
        />
      </motion.div>

      {/* 3. Center Dot (Precise) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isPointer ? 1 : 0,
          opacity: isPointer ? 0.8 : 0,
        }}
        className="absolute w-1 h-1 bg-purple-600 rounded-full"
      />
    </div>
  );
}
