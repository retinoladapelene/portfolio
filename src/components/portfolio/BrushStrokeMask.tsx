"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { buildBrushPath } from "@/lib/buildBrushPath";

interface BrushStrokeMaskProps {
  progress: number; // 0 to 1
  id: string;
}

export default function BrushStrokeMask({ progress, id }: BrushStrokeMaskProps) {
  // Generate the path based on progress
  // We use a fixed viewBox of 1000x1000 for internal coordinate consistency
  const pathData = useMemo(() => buildBrushPath(progress, 1000, 1000), [progress]);

  const maskId = `brush-mask-${id}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* SVG Definition for the Mask */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <mask id={maskId} maskUnits="objectBoundingBox">
            {/* The area to reveal (White = Visible, Black = Hidden) */}
            <rect width="1" height="1" fill="black" />
            <path d={pathData} fill="white" transform="scale(0.001)" />
          </mask>
        </defs>
      </svg>

      {/* Leading Edge Glow (Edge Improvement) */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(127, 90, 240, 0.4), rgba(127, 90, 240, 0.2), transparent)",
          width: "20%",
          left: `${progress * 100 - 10}%`,
          opacity: progress > 0 && progress < 1 ? 1 : 0,
        }}
      />

      {/* Brush Texture Overlay (Mental Model Part 5) */}
      <motion.div
        className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url('/brush-texture.png')",
          backgroundSize: "cover",
          maskImage: `url(#${maskId})`,
          WebkitMaskImage: `url(#${maskId})`,
        }}
      />
    </div>
  );
}
