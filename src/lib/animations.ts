import { Variants } from "framer-motion";

// Motion Tokens
export const motionTokens = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
  ease: [0.4, 0, 0.2, 1] as const, // Custom cubic-bezier for premium feel
};

// Base Animation Presets
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 30 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: motionTokens.normal,
      ease: motionTokens.ease as any // Using any for ease to avoid complex Framer Motion union mismatches
    }
  }
};

export const staggerContainer: Variants = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: motionTokens.normal,
      ease: motionTokens.ease as any
    }
  }
};

// Interaction Presets
export const magneticHover = {
  whileHover: {
    scale: 1.05,
    y: -2,
    transition: { type: "spring", stiffness: 400, damping: 15 } as const
  },
  whileTap: { scale: 0.98 }
} as const;

export const cardHover = {
  whileHover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3, ease: motionTokens.ease as any }
  }
} as const;

// Viewport defaults for common use
export const viewportSettings = {
  once: true,
  margin: "-20% 0px -20% 0px" as const // Added margin to trigger earlier/later for better feel
};
