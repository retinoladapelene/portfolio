"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  level?: 1 | 2; // 1: standard, 2: strong
  glowOnHover?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, level = 1, glowOnHover = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "transition-all duration-300",
          level === 1 ? "glass-card" : "glass-strong",
          glowOnHover && "hover:neon-glow hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
