"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

export function InteractivePhoto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskX = useMotionValue(0);
  const maskY = useMotionValue(0);
  const springX = useSpring(maskX, { stiffness: 400, damping: 60 });
  const springY = useSpring(maskY, { stiffness: 400, damping: 60 });
  const [blooms, setBlooms] = useState<{ id: number; x: number; y: number }[]>([]);
  const bloomCounter = useRef(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    maskX.set(x);
    maskY.set(y);
    setIsInteracting(true);
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => setIsInteracting(false), 2000);
  };

  useEffect(() => {
    const spawnBloom = () => {
      const currentX = maskX.get();
      const currentY = maskY.get();
      setBlooms((prev) => [
        ...prev.slice(-8),
        { id: bloomCounter.current++, x: currentX, y: currentY },
      ]);
    };
    const interval = setInterval(spawnBloom, 1200);
    return () => clearInterval(interval);
  }, [maskX, maskY]);

  useAnimationFrame((time) => {
    if (isInteracting) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const amplitudeX = rect.width * 0.25;
    const amplitudeY = rect.height * 0.15;
    const targetX = centerX + Math.cos(time / 1500) * amplitudeX;
    const targetY = centerY + Math.sin(time / 3000) * amplitudeY;
    maskX.set(targetX);
    maskY.set(targetY);
  });

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative mx-auto h-full w-full select-none overflow-hidden touch-none pointer-events-auto"
    >
      <svg style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }}>
        <defs>
          <filter id="ink-spread-personal">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="80" />
          </filter>
          <mask id="ink-mask-personal-v3" maskUnits="userSpaceOnUse">
            <g filter="url(#ink-spread-personal)">
              <motion.ellipse cx={springX} cy={springY} rx="280" ry="160" fill="white" />
              <AnimatePresence>
                {blooms.map((bloom) => (
                  <motion.ellipse
                    key={bloom.id}
                    initial={{ rx: 10, ry: 5, opacity: 0, cx: bloom.x, cy: bloom.y }}
                    animate={{ rx: [10, 260, 340], ry: [5, 140, 200], opacity: [0, 1, 0.5, 0], cy: bloom.y + 60 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 5.5, ease: "easeOut" }}
                    fill="white"
                  />
                ))}
              </AnimatePresence>
            </g>
          </mask>
        </defs>
      </svg>

      <div id="base-photo-layer" className="absolute inset-0 z-10 select-none overflow-hidden will-change-transform">
        <Image
          src="/personalfoto.webp"
          alt="Personal Photo"
          fill
          priority
          unoptimized
          className="object-cover object-[50%_15%] scale-[1.0] filter brightness-75 contrast-125 grayscale-[0.3]"
        />
      </div>

      <div
        id="mask-photo-layer"
        className="absolute inset-0 z-20 select-none overflow-hidden will-change-transform"
        style={{
          maskImage: "url(#ink-mask-personal-v3)",
          WebkitMaskImage: "url(#ink-mask-personal-v3)",
        }}
      >
        <Image
          src="/gambarcursorinteraktif.webp"
          alt="Personal Photo Masked"
          fill
          priority
          unoptimized
          className="object-cover object-[50%_15%] scale-[1.0]"
        />
      </div>
    </div>
  );
}
