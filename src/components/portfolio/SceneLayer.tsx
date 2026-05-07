"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { Project } from "@/config/projects";

interface SceneLayerProps {
  project: Project;
  index: number;
  total: number;
  scrollProgress: MotionValue<number>;
}

export default function SceneLayer({ project, index, total, scrollProgress }: SceneLayerProps) {
  // Each scene occupies an equal portion of the scroll range
  const sceneStart = index / total;
  const sceneMid = (index + 0.5) / total;
  const sceneEnd = (index + 1) / total;

  // --- ENTER phase: scene fades in with blur + zoom ---
  const enterOpacity = useTransform(
    scrollProgress,
    [sceneStart, sceneStart + 0.08 / total * total * 0.15, sceneMid - 0.05],
    index === 0 ? [1, 1, 1] : [0, 0.5, 1]
  );

  const enterScale = useTransform(
    scrollProgress,
    [sceneStart, sceneMid],
    index === 0 ? [1, 1] : [1.15, 1]
  );

  const enterBlur = useTransform(
    scrollProgress,
    [sceneStart, sceneMid],
    index === 0 ? [0, 0] : [20, 0]
  );

  // --- EXIT phase: scene blurs out + zooms ---
  const exitOpacity = useTransform(
    scrollProgress,
    [sceneMid + 0.05, sceneEnd],
    index === total - 1 ? [1, 1] : [1, 0]
  );

  const exitScale = useTransform(
    scrollProgress,
    [sceneMid, sceneEnd],
    index === total - 1 ? [1, 1] : [1, 0.92]
  );

  const exitBlur = useTransform(
    scrollProgress,
    [sceneMid + 0.05, sceneEnd],
    index === total - 1 ? [0, 0] : [0, 15]
  );

  // --- TEXT CONTENT animations ---
  const textY = useTransform(
    scrollProgress,
    [sceneStart, sceneMid, sceneEnd],
    index === 0 ? [0, 0, -60] : [60, 0, -60]
  );

  const textOpacity = useTransform(
    scrollProgress,
    [sceneStart, sceneStart + 0.06, sceneMid - 0.02, sceneMid + 0.02, sceneEnd - 0.06, sceneEnd],
    index === 0
      ? [1, 1, 1, 1, 1, 0]
      : index === total - 1
        ? [0, 0.3, 1, 1, 1, 1]
        : [0, 0.3, 1, 1, 1, 0]
  );

  // --- DISTORT (perspective tilt for liquid feel) ---
  const distort = useTransform(
    scrollProgress,
    [sceneStart, sceneMid, sceneEnd],
    index === 0 ? [0, 0, -3] : index === total - 1 ? [3, 0, 0] : [3, 0, -3]
  );

  // Category badge delay
  const badgeX = useTransform(
    scrollProgress,
    [sceneStart, sceneMid],
    index === 0 ? [0, 0] : [-30, 0]
  );

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        opacity: enterOpacity,
        zIndex: index,
      }}
    >
      {/* ARTWORK BACKGROUND with morph */}
      <motion.div
        className="absolute inset-0"
        style={{
          scale: enterScale,
          filter: enterBlur.get() > 0 || exitBlur.get() > 0
            ? undefined
            : undefined,
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            scale: exitScale,
          }}
        >
          <motion.div
            className="w-full h-full"
            style={{
              filter: useTransform(
                scrollProgress,
                [sceneStart, sceneMid, sceneEnd],
                index === 0
                  ? [`blur(0px)`, `blur(0px)`, `blur(15px)`]
                  : index === total - 1
                    ? [`blur(20px)`, `blur(0px)`, `blur(0px)`]
                    : [`blur(20px)`, `blur(0px)`, `blur(15px)`]
              ),
            }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* VIGNETTE */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50 z-10" />

      {/* LIQUID GRADIENT OVERLAY */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        animate={{
          background: [
            "radial-gradient(circle at 30% 30%, rgba(127,90,240,0.12), transparent 60%)",
            "radial-gradient(circle at 70% 60%, rgba(44,182,125,0.10), transparent 60%)",
            "radial-gradient(circle at 30% 70%, rgba(127,90,240,0.08), transparent 60%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* CONTENT LAYER */}
      <motion.div
        className="absolute inset-0 z-20 flex items-end pb-24 md:pb-32 px-10 md:px-20"
        style={{
          y: textY,
          opacity: textOpacity,
        }}
      >
        <div className="max-w-2xl space-y-6">
          {/* Slide counter */}
          <motion.div
            className="flex items-center gap-4 text-white/30"
            style={{ x: badgeX }}
          >
            <span className="text-[10px] font-black tracking-[0.5em] uppercase">
              0{index + 1} / 0{total}
            </span>
            <div className="w-12 h-[1px] bg-white/20" />
          </motion.div>

          {/* Category */}
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-brand-primary text-[10px] font-black tracking-[0.2em] uppercase border border-white/10"
            style={{ x: badgeX }}
          >
            {project.category}
          </motion.span>

          {/* Title */}
          <motion.h2
            className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.95]"
            style={{
              transform: distort.get()
                ? undefined
                : undefined,
            }}
          >
            {project.title.split(" ").map((word, wi) => (
              <span key={wi} className={wi === 1 ? "text-brand-primary" : ""}>
                {wi > 0 && <br />}
                {word}
              </span>
            ))}
          </motion.h2>

          {/* Description */}
          <p className="text-white/50 text-sm md:text-base font-medium leading-relaxed max-w-md">
            {project.desc}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`/portfolio/${project.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all duration-300"
            >
              Deep Dive
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
