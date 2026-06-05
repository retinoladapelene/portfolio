"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { SplitReveal, AnimatedCounter, MagneticCard } from "./SharedUI";

const personalData = {
  tagline: "Bridging the gap between raw imagination and high-fidelity digital art through every meticulous stroke.",
  bio: "Since 2018, I've been crafting unique visual narratives. My journey began with a pencil and a dream, evolving into a professional pursuit of digital excellence. Specializing in character design and conceptual illustration, I bring stories to life for clients worldwide.",
};

export function ProfileSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.5], ["0%", "100%"]);

  return (
    <motion.section
      ref={sectionRef}
      id="profile-section"
      className="relative overflow-hidden bg-transparent py-28 md:py-48 px-6 md:px-12"
    >
      {/* ── Parallax Ink Blob BG ── */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 select-none"
        aria-hidden
      >
        <svg
          className="absolute -left-40 top-0 w-[700px] opacity-[0.035]"
          viewBox="0 0 700 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M350 50 C500 50 650 150 650 350 S500 650 350 650 50 550 50 350 200 50 350 50Z"
            fill="#7F77DD"
            animate={{ scale: [1, 1.04, 1], rotate: [0, 3, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
        <svg
          className="absolute -right-20 bottom-0 w-[500px] opacity-[0.04]"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            cx="250"
            cy="250"
            r="200"
            fill="#534AB7"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </svg>
      </motion.div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* ── Section Header ── */}
        <div className="mb-20 md:mb-32 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="font-outfit text-[10px] font-black uppercase tracking-[0.6em] text-purple-600/60">
              EST. 2018 / ARCHIVE
            </span>
            <motion.div
              style={{ width: lineWidth }}
              className="h-px bg-gradient-to-r from-purple-400/40 to-transparent origin-left"
            />
          </motion.div>

          <div className="overflow-hidden">
            <h2 className="font-syne font-black leading-[0.82] tracking-tighter text-[#1A1F2B]">
              <SplitReveal
                text="PERSONAL"
                className="text-[15vw] md:text-[9vw] block"
                delay={0}
              />
              <SplitReveal
                text="JOURNEY."
                className="text-[12vw] md:text-[7.5vw] text-purple-600 italic font-light ml-8 md:ml-16 block"
                delay={0.15}
              />
            </h2>
          </div>

          {/* Watermark */}
          <div
            id="profile-section-title"
            className="hidden md:block absolute -top-6 right-0 font-syne text-[160px] font-black text-purple-600/[0.04] select-none leading-none watermark-morph pointer-events-none"
          >
            01
          </div>
        </div>

        {/* ── Main Grid: Bio + Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* LEFT — Tagline + Bio */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="lg:col-span-5 space-y-10"
          >
            {/* Pull quote */}
            <div className="relative">
              <div className="absolute -left-6 -top-4 font-syne text-8xl text-purple-400/20 font-black leading-none select-none">
                &ldquo;
              </div>
              <p className="font-outfit text-xl md:text-2xl text-[#1A1F2B]/80 leading-[1.3] font-medium italic pl-6 pt-2">
                {personalData.tagline}
              </p>
            </div>

            {/* Bio with drop cap */}
            <div className="relative pl-5 border-l-2 border-purple-100">
              <div
                className="absolute -left-[3px] top-0 w-[3px] bg-purple-600"
                style={{ height: "2.5rem" }}
              />
              <p className="font-outfit text-base md:text-lg text-[#1A1F2B]/55 leading-relaxed font-medium first-letter:text-4xl first-letter:font-syne first-letter:font-black first-letter:text-purple-600 first-letter:mr-2 first-letter:float-left first-letter:leading-none first-letter:mt-1">
                {personalData.bio}
              </p>
            </div>

            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <div className="relative flex items-center gap-3 px-5 py-3 rounded-full bg-purple-50 border border-purple-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600" />
                </span>
                <span className="font-outfit text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">
                  Commission Ready
                </span>
              </div>
              <Link
                href="/commissions"
                className="group flex items-center gap-2 font-outfit text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 hover:text-purple-800 transition-colors"
              >
                Inquire Project
                <ArrowRight
                  size={12}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT — Stat Bento Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-5">
            {/* HERO STAT — 400+ Works */}
            <MagneticCard className="col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="stat-card-morph relative overflow-hidden rounded-[2.5rem] bg-[#1A1F2B] p-8 md:p-10"
              >
                {/* Glow orbs */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-purple-600/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-purple-400/10 blur-2xl" />

                {/* Rotating palette icon */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute top-6 right-6 opacity-10"
                >
                  <Palette size={72} className="text-purple-300" />
                </motion.div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <span className="font-outfit text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-3 block">
                      Project Volume
                    </span>
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-syne text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                        <AnimatedCounter value="400" suffix="+" />
                      </h3>
                      <span className="font-outfit text-xs font-bold text-white/30 uppercase tracking-widest max-w-[60px] leading-tight">
                        Finished Works
                      </span>
                    </div>
                  </div>
                  {/* Mini bar chart decoration */}
                  <div className="hidden md:flex items-end gap-1 mb-2 opacity-20">
                    {[40, 60, 45, 80, 65, 90, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, margin: "0px" }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: "circOut" }}
                        style={{ height: `${h * 0.6}px` }}
                        className="w-3 rounded-t-sm bg-purple-400 origin-bottom"
                      />
                    ))}
                  </div>
                </div>

                {/* Progress line */}
                <div className="mt-8 h-px w-full bg-white/10 overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true, margin: "0px" }}
                    transition={{ duration: 2.2, ease: "circOut", delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-300"
                  />
                </div>
              </motion.div>
            </MagneticCard>

            {/* CLIENTS STAT */}
            <MagneticCard>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="stat-card-morph relative overflow-hidden rounded-[2rem] bg-purple-600 p-6 md:p-8 flex flex-col justify-between min-h-[140px]"
              >
                {/* Grid pattern */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <span className="font-outfit text-[8px] font-black uppercase tracking-widest text-white/50">
                  Network
                </span>
                <div>
                  <h4 className="font-syne text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                    <AnimatedCounter value="150" suffix="+" />
                  </h4>
                  <p className="font-outfit text-[9px] font-bold uppercase tracking-widest text-white/50 mt-2">
                    Happy Clients
                  </p>
                </div>
              </motion.div>
            </MagneticCard>

            {/* YEARS STAT */}
            <MagneticCard>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="stat-card-morph relative overflow-hidden rounded-[2rem] bg-white border border-purple-100/80 p-6 md:p-8 flex flex-col justify-between min-h-[140px] group hover:border-purple-300 transition-colors"
              >
                {/* Hover fill */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  className="pointer-events-none absolute inset-0 bg-purple-50 rounded-[2rem]"
                />
                <span className="font-outfit text-[8px] font-black uppercase tracking-widest text-[#1A1F2B]/30 relative z-10">
                  Duration
                </span>
                <div className="relative z-10">
                  <h4 className="font-syne text-4xl md:text-5xl font-black text-[#1A1F2B] tracking-tighter leading-none">
                    <AnimatedCounter value="6" />{" "}
                    <span className="text-base font-black text-purple-600">YRS</span>
                  </h4>
                  <p className="font-outfit text-[9px] font-bold uppercase tracking-widest text-[#1A1F2B]/30 mt-2">
                    Experience
                  </p>
                </div>
              </motion.div>
            </MagneticCard>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
