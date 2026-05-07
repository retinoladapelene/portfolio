"use client";

import Footer from "@/components/ui/Footer";
import GlassCard from "@/components/ui/GlassCard";
import { fadeUp, staggerContainer, viewportSettings } from "@/lib/animations";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowLeft,
  Layers3,
  MapPin,
  Monitor,
  Palette,
  Quote,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import type { CSSProperties, MouseEvent, ReactNode, TouchEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const personalData = {
  name: "AURA CLARISSA",
  role: "Digital Artist & Character Designer",
  tagline: "Crafting visual emotions through digital strokes.",
  bio: "Seorang digital artist berbasis di Indonesia dengan spesialisasi pada character design dan ilustrasi high-fidelity. Setiap karya lahir dari ruang antara imajinasi dan presisi teknis.",
  location: "Indonesia",
  yearsActive: "6",
  completedWorks: "400+",
  clients: "150+",
  skills: [
    "Character Design",
    "Digital Illustration",
    "Concept Art",
    "Commission Art",
  ],
  tools: ["Procreate", "Photoshop", "Clip Studio", "Blender"],
  quote: "Art is not what you see, but what you make others see.",
};

const heroFadeUp: Variants = {
  initial: fadeUp.initial,
  animate: fadeUp.whileInView,
};

const heroStaggerContainer: Variants = {
  initial: staggerContainer.initial,
  animate: staggerContainer.whileInView,
};

const glassSurfaceStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMatch = () => setIsMobile(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);

    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  return isMobile;
}

function InteractivePhoto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for mask coordinates
  const maskX = useMotionValue(0);
  const maskY = useMotionValue(0);

  // Responsive yet smooth movement (Higher stiffness = faster response)
  const springX = useSpring(maskX, { stiffness: 500, damping: 50 });
  const springY = useSpring(maskY, { stiffness: 500, damping: 50 });

  // Parallax effects - Slightly softer than the mask for depth
  const mouseXParallax = useMotionValue(0);
  const mouseYParallax = useMotionValue(0);
  const springXParallax = useSpring(mouseXParallax, { stiffness: 300, damping: 35 });
  const springYParallax = useSpring(mouseYParallax, { stiffness: 300, damping: 35 });
  
  const artworkX = useTransform(springXParallax, [-1, 1], [-10, 10]);
  const artworkY = useTransform(springYParallax, [-1, 1], [-10, 10]);

  // Ink Injection System State
  const [blooms, setBlooms] = useState<{ id: number; x: number; y: number }[]>([]);
  const bloomCounter = useRef(0);

  // Spawn new ink blooms periodically
  useEffect(() => {
    const spawnBloom = () => {
      const currentX = maskX.get();
      const currentY = maskY.get();
      
      setBlooms((prev) => [
        ...prev.slice(-8), // Keep only the most recent blooms
        { id: bloomCounter.current++, x: currentX, y: currentY }
      ]);
    };

    const interval = setInterval(spawnBloom, 1200);
    return () => clearInterval(interval);
  }, [maskX, maskY]);

  const updatePosition = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Mask positions in pixels relative to container
    maskX.set(clientX - rect.left);
    maskY.set(clientY - rect.top);

    // Parallax positions normalized (-1 to 1)
    const px = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((clientY - rect.top) / rect.height - 0.5) * 2;
    mouseXParallax.set(px);
    mouseYParallax.set(py);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    updatePosition(event.clientX, event.clientY);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    updatePosition(event.clientX, event.clientY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseXParallax.set(0);
    mouseYParallax.set(0);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (touch) {
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  // Idle Animation Logic
  useAnimationFrame((time) => {
    if (isHovered) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Movement pattern: Infinity / Figure-eight
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const amplitudeX = rect.width * 0.25;
    const amplitudeY = rect.height * 0.15;
    
    // Calculate idle positions
    const targetX = centerX + Math.cos(time / 1500) * amplitudeX;
    const targetY = centerY + Math.sin(time / 3000) * amplitudeY;

    maskX.set(targetX);
    maskY.set(targetY);
    
    // Subtle idle parallax
    mouseXParallax.set(Math.cos(time / 1500) * 0.1);
    mouseYParallax.set(Math.sin(time / 3000) * 0.1);
  });

  // Mask value for SVG
  const maskImage = useTransform(
    [springX, springY],
    ([x, y]) => `radial-gradient(ellipse 220px 120px at ${x}px ${y}px, white 0%, white 120px, transparent 240px)`
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-screen w-screen cursor-none select-none overflow-hidden touch-manipulation"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={(e) => { setIsHovered(true); handleTouchMove(e); }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* SVG Definitions for Masking */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 30 }}>
        <defs>
          <filter id="ink-spread">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="60" />
          </filter>
          
          <mask id="ink-mask-v2" maskUnits="userSpaceOnUse">
            <g filter="url(#ink-spread)">
              {/* Main spotlight following cursor - Changed to Horizontal Ellipse */}
              <motion.ellipse 
                cx={springX} 
                cy={springY} 
                rx="240" 
                ry="140" 
                fill="white" 
              />
              
              {/* Dynamic ink blooms */}
              <AnimatePresence>
                {blooms.map((bloom) => (
                  <motion.ellipse
                    key={bloom.id}
                    initial={{ rx: 10, ry: 5, opacity: 0, cx: bloom.x, cy: bloom.y }}
                    animate={{ 
                      rx: [10, 240, 320], 
                      ry: [5, 120, 180],
                      opacity: [0, 1, 0.6, 0],
                      cy: bloom.y + 60 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 5, ease: "easeOut" }}
                    fill="white"
                  />
                ))}
              </AnimatePresence>
            </g>
          </mask>
        </defs>
      </svg>

      {/* Base Image (Professional Photo) - Darkens slightly when hovered for better reveal contrast */}
      <motion.div 
        animate={{ 
          filter: isHovered ? "brightness(0.6)" : "brightness(1)",
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 z-10"
      >
        <Image
          src="/personalfoto.png"
          alt="Personal Photo"
          width={1536}
          height={1024}
          priority
          unoptimized
          sizes="100vw"
          draggable={false}
          className="absolute left-1/2 top-[3vh] h-[118vh] w-auto max-w-none -translate-x-1/2 object-contain md:top-[5vh] md:h-[128vh]"
          style={{ objectFit: "contain", objectPosition: "top center" }}
        />
      </motion.div>

      {/* Reveal Image (Anime Artwork) - Masked by the custom SVG mask */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ 
          mask: "url(#ink-mask-v2)",
          WebkitMask: "url(#ink-mask-v2)"
        }}
      >
        <motion.div
          style={{ 
            x: artworkX, 
            y: artworkY 
          }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
        >
          <Image
            src="/gambarcursorinteraktif.png"
            alt="Artwork Reveal"
            width={1536}
            height={1024}
            priority
            unoptimized
            sizes="100vw"
            draggable={false}
            className="absolute left-1/2 top-[3vh] h-[118vh] w-auto max-w-none -translate-x-1/2 object-contain drop-shadow-[0_45px_90px_rgba(127,90,240,0.28)] md:top-[5vh] md:h-[128vh]"
            style={{ objectFit: "contain", objectPosition: "top center" }}
          />
        </motion.div>
      </div>

      {/* Custom Cursor Indicator - Always visible and following mask center */}
      <motion.div
        style={{ x: springX, y: springY }}
        animate={{ 
          scale: 1, 
          opacity: isHovered ? 1 : 0.4 
        }}
        className="pointer-events-none absolute left-0 top-0 z-50 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-purple-400/50 bg-purple-500/10 backdrop-blur-sm"
      >
        <div className="h-1 w-1 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
      </motion.div>
    </div>
  );
}

function StatsRow() {
  const stats = [
    { val: personalData.completedWorks, label: "Karya Selesai" },
    { val: personalData.clients, label: "Klien Puas" },
    { val: `${personalData.yearsActive} Tahun`, label: "Pengalaman" },
  ];

  return (
    <motion.div
      variants={heroFadeUp}
      className="grid grid-cols-3 gap-4 mt-12 pt-10 border-t border-purple-500/20"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center lg:text-left transition-opacity duration-700"
        >
          <div className="text-2xl font-black text-white font-outfit tracking-normal drop-shadow-[0_2px_10px_rgba(127,90,240,0.5)]">
            {stat.val}
          </div>
          <div className="mt-1 text-[9px] font-bold text-white/80 uppercase tracking-[0.2em] font-outfit drop-shadow-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function ProfileSection() {
  return (
    <section className="relative px-6 py-28 md:px-12 md:py-32">
      <motion.div
        variants={heroStaggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={viewportSettings}
        className="container mx-auto max-w-5xl text-center"
      >
        <motion.div
          variants={heroFadeUp}
          className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-white shadow-2xl backdrop-blur-xl"
        >
          <Sparkles size={14} className="text-purple-300" />
          <span className="font-outfit text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-sm">
            Personal Archive
          </span>
        </motion.div>

        <motion.p
          variants={heroFadeUp}
          className="mb-5 inline-flex items-center justify-center gap-2 font-syne text-xs font-bold uppercase tracking-[0.3em] text-white/60 drop-shadow-sm"
        >
          <MapPin size={14} className="text-purple-500/70" />
          {personalData.location}
        </motion.p>

        <motion.h1
          variants={heroFadeUp}
          className="font-outfit text-6xl font-black leading-[0.9] tracking-normal text-white md:text-8xl drop-shadow-[0_10px_30px_rgba(127,90,240,0.3)]"
        >
          {personalData.name}
        </motion.h1>

        <motion.p
          variants={heroFadeUp}
          className="mx-auto mt-6 max-w-3xl font-dancing-script text-4xl leading-tight text-white md:text-5xl drop-shadow-[0_4px_12px_rgba(127,90,240,0.4)]"
        >
          {personalData.tagline}
        </motion.p>

        <motion.div
          variants={heroFadeUp}
          className="mx-auto mt-10 max-w-3xl"
        >
          <p className="font-outfit text-base font-medium leading-8 text-white/80 md:text-lg drop-shadow-md">
            {personalData.bio}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 drop-shadow-sm">
              {personalData.role}
            </span>
            <span className="rounded-full border border-purple-500/40 bg-purple-500/30 px-4 py-2 font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-md shadow-purple-500/20">
              Commission Ready
            </span>
          </div>
        </motion.div>

        <div className="mx-auto max-w-2xl">
          <StatsRow />
        </div>
      </motion.div>
    </section>
  );
}

function PersonalInfoCard({
  icon,
  label,
  title,
  items,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  items: string[];
}) {
  return (
    <GlassCard
      level={1}
      glowOnHover
      style={glassSurfaceStyle}
      className="h-full rounded-[24px] p-6 md:p-8 shadow-[0_24px_80px_rgba(127,90,240,0.15)] border border-purple-500/20 bg-purple-500/5 backdrop-blur-md"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportSettings}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-200">
          {icon}
        </div>
        <span className="font-syne text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 drop-shadow-sm">
          {label}
        </span>
      </div>

      <h2 className="font-outfit text-2xl font-black tracking-normal text-white drop-shadow-md">
        {title}
      </h2>

      <div className="mt-6 flex flex-wrap gap-3">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-outfit text-[11px] font-bold uppercase tracking-[0.16em] text-white drop-shadow-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

function SkillsSection() {
  return (
    <section className="relative px-6 py-28 md:px-12 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-syne text-xs font-bold uppercase tracking-[0.3em] text-white/20">
              Personal Index
            </p>
            <h2 className="mt-4 font-outfit text-4xl font-black tracking-normal text-white/90 md:text-5xl">
              Tools, taste, and tempo.
            </h2>
          </div>
          <p className="max-w-md font-outfit text-sm leading-7 text-white/40">
            Detail kecil, gesture karakter, dan mood warna diperlakukan seperti
            bahasa visual yang perlu terasa personal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PersonalInfoCard
            icon={<Palette size={20} />}
            label="Skills"
            title="Keahlian"
            items={personalData.skills}
          />
          <PersonalInfoCard
            icon={<Monitor size={20} />}
            label="Tools"
            title="Studio Kit"
            items={personalData.tools}
          />
          <PersonalInfoCard
            icon={<Layers3 size={20} />}
            label="Process"
            title="Creative Flow"
            items={["Moodboard", "Sketch Pass", "Color Polish", "Final Render"]}
          />
        </div>
      </div>
    </section>
  );
}

export default function PersonalPage() {
  const [mounted, setMounted] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      // Scroll-Linked Scaling Animation
      gsap.to(imageRef.current, {
        scale: 0.45,
        ease: "none",
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        }
      });
    }, trackRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <div className="relative min-h-screen">
      {/* Scroll Track - 300vh height to define the scroll distance for scaling */}
      <section ref={trackRef} className="scroll-track relative h-[300vh] w-full">
        {/* Sticky Container - 100vh height to keep the image centered during scale down */}
        <div className="sticky-container sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-transparent">
          
          {/* Floating Atmospheric Particles - Client Side Only */}
          {mounted && (
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-purple-300/30 blur-[1px]"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: Math.random() * 0.5
                }}
                animate={{ 
                  y: ["-10%", "110%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 15 + Math.random() * 20, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 10
                }}
              />
            ))}
          </div>
        )}

        {/* Ethereal Light Blooms */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/5 blur-[120px] rounded-full" />
        </div>

        {/* Back Button */}
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute right-6 top-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/5 text-white/40 shadow-2xl backdrop-blur-md transition-all hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white md:right-10 md:top-10"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Branding Logo - Top Left (Matching Navbar style) */}
        <Link
          href="/"
          className="absolute left-6 top-6 z-40 flex items-center gap-2 group cursor-pointer font-dancing-script text-2xl text-white md:left-10 md:top-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
        >
          <div className="w-5 h-5 bg-purple-500 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] rotate-12 group-hover:rotate-0 transition-transform" />
          <span>
            Moon<span className="text-purple-500 font-bold">chaery.</span>
          </span>
        </Link>

        {/* Side Editorial Markers */}
        <div className="absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-12 md:flex md:left-10">
          <div className="flex flex-col gap-2">
            <span className="font-outfit text-[8px] font-black uppercase tracking-[0.5em] text-white/20 [writing-mode:vertical-lr]">
              Personal Archive
            </span>
            <div className="mx-auto h-8 w-[1px] bg-white/10" />
          </div>
          <span className="font-outfit text-[8px] font-bold text-white/10 [writing-mode:vertical-lr]">
            © 2024 EDITION
          </span>
        </div>

        {/* Background Name (Bottom Left but behind photo) */}
        <div className="absolute bottom-40 left-6 z-0 max-w-[90vw] pointer-events-none select-none md:bottom-48 md:left-20">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-syne text-[12vw] font-black uppercase leading-[0.8] tracking-tighter text-white/90 drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] md:text-[15vw]"
          >
            {personalData.name}
          </motion.h1>
        </div>

        {/* Hero Content Layer (Foreground Elements) */}
        <div className="absolute bottom-12 left-6 z-50 max-w-[80vw] md:bottom-20 md:left-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-8 bg-purple-500" />
              <p className="font-dancing-script text-3xl font-bold text-white md:text-5xl drop-shadow-[0_4px_12px_rgba(127,90,240,0.5)]">
                Creative Director & Illustrator
              </p>
            </div>
          </motion.div>
        </div>

        {/* Coordinates / Meta Data Bottom Right */}
        <div className="absolute bottom-12 right-6 z-50 flex flex-col items-end gap-2 md:bottom-20 md:right-20">
          <span className="font-outfit text-[10px] font-black uppercase tracking-[0.4em] text-white/80 drop-shadow-sm">
            {personalData.location} / 07.28" N
          </span>
          <p className="rounded-full border border-purple-500/40 bg-purple-500/20 px-5 py-2 font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-xl drop-shadow-md">
            Available for Projects
          </p>
        </div>

        {/* Scalable Image Element - Focused in the center of the sticky container */}
        <div 
          ref={imageRef} 
          className="scale-image pointer-events-auto relative z-10 flex h-full w-full items-center justify-center will-change-transform"
        >
          <div className="relative h-fit w-fit">
            <InteractivePhoto />
          </div>
        </div>

        {/* Elegant Scroll Guide */}
        <div className="absolute bottom-10 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-4">
          <span className="font-outfit text-[8px] font-black uppercase tracking-[0.4em] text-white/40">
            Scroll
          </span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-12 w-[1px] bg-gradient-to-b from-purple-500/50 to-transparent" 
          />
        </div>
      </div>
    </section>

      <ProfileSection />

      <SkillsSection />

      <section className="relative px-6 py-28 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-5xl"
        >
          <Quote className="mx-auto mb-8 text-purple-500/40" size={44} />
          <p className="font-dancing-script text-4xl leading-tight text-white md:text-6xl drop-shadow-xl">
            &quot;{personalData.quote}&quot;
          </p>
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-4">
            {["visual emotion", "high-fidelity render", "character soul"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-sm"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
