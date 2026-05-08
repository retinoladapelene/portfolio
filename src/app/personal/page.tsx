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
import type { CSSProperties, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const personalData = {
  name: "RATU BALQIS",
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

const glassSurfaceStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

function InteractivePhoto() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for mask coordinates
  const maskX = useMotionValue(0);
  const maskY = useMotionValue(0);

  // Smooth automated movement
  const springX = useSpring(maskX, { stiffness: 400, damping: 60 });
  const springY = useSpring(maskY, { stiffness: 400, damping: 60 });

  // Ink Injection System State
  const [blooms, setBlooms] = useState<{ id: number; x: number; y: number }[]>([]);
  const bloomCounter = useRef(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle cursor movement
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

  // Spawn new ink blooms periodically following the path
  useEffect(() => {
    const spawnBloom = () => {
      const currentX = maskX.get();
      const currentY = maskY.get();
      
      setBlooms((prev) => [
        ...prev.slice(-8), 
        { id: bloomCounter.current++, x: currentX, y: currentY }
      ]);
    };

    const interval = setInterval(spawnBloom, 1200);
    return () => clearInterval(interval);
  }, [maskX, maskY]);

  // Automated Idle Animation - Blends with Interactivity
  useAnimationFrame((time) => {
    if (isInteracting) return; // Prioritize cursor movement

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Movement pattern: Infinity / Figure-eight
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const amplitudeX = rect.width * 0.25;
    const amplitudeY = rect.height * 0.15;
    
    // Calculate automated positions
    const targetX = centerX + Math.cos(time / 1500) * amplitudeX;
    const targetY = centerY + Math.sin(time / 3000) * amplitudeY;

    maskX.set(targetX);
    maskY.set(targetY);
  });

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative mx-auto h-screen w-screen select-none overflow-hidden touch-none pointer-events-auto"
    >
      {/* SVG Definitions for Masking */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 30 }}>
        <defs>
          <filter id="ink-spread-personal">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="80" />
          </filter>
          
          <mask id="ink-mask-personal-v3" maskUnits="userSpaceOnUse">
            <g filter="url(#ink-spread-personal)">
              {/* Main Automated Ellipse */}
              <motion.ellipse 
                cx={springX} 
                cy={springY} 
                rx="280" 
                ry="160" 
                fill="white" 
              />
              
              {/* Dynamic ink blooms following the path */}
              <AnimatePresence>
                {blooms.map((bloom) => (
                  <motion.ellipse
                    key={bloom.id}
                    initial={{ rx: 10, ry: 5, opacity: 0, cx: bloom.x, cy: bloom.y }}
                    animate={{ 
                      rx: [10, 260, 340], 
                      ry: [5, 140, 200],
                      opacity: [0, 1, 0.5, 0],
                      cy: bloom.y + 60 
                    }}
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

      {/* Base Image (Professional Photo) */}
      <div className="absolute inset-0 z-10">
        <Image
          src="/personalfoto.png"
          alt="Personal Photo"
          width={1536}
          height={1024}
          priority
          unoptimized
          sizes="100vw"
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain scale-[1.3] origin-top brightness-[0.9]"
          style={{ 
            objectFit: "contain", 
            objectPosition: "center",
          }}
        />
      </div>

      {/* Reveal Image (Anime Artwork) - Masked by the custom automated mask */}
      <div 
        id="mask-reveal-layer"
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden will-change-transform"
        style={{ 
          mask: "url(#ink-mask-personal-v3)",
          WebkitMask: "url(#ink-mask-personal-v3)",
          backgroundColor: "rgba(255,255,255,0.01)"
        }}
      >
        <div className="absolute inset-0">
          <Image
            src="/gambarcursorinteraktif.png"
            alt="Artwork Reveal"
            width={1536}
            height={1024}
            priority
            unoptimized
            sizes="100vw"
            draggable={false}
            className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain scale-[1.3] origin-top drop-shadow-[0_45px_90px_rgba(127,90,240,0.3)]"
            style={{ 
              objectFit: "contain", 
              objectPosition: "center",
            }}
          />
        </div>
      </div>
    </div>
  );
}


function ProfileSection() {
  return (
    <section id="profile-section" className="relative px-6 py-32 md:px-12 lg:py-48 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT CONTENT: BIO & STATS */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-purple-600/30" />
                <span className="font-outfit text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">
                  Personal Archive
                </span>
              </div>
              <h1 className="font-syne text-5xl md:text-7xl font-bold text-[#1A1F2B] leading-[1.1]">
                Ratu <span className="text-purple-600">Balqis</span>
              </h1>
              <p className="font-dancing-script text-3xl text-purple-500/80 md:text-4xl">
                {personalData.tagline}
              </p>
            </div>

            <p className="font-outfit text-lg md:text-xl text-black/60 leading-relaxed max-w-2xl font-medium">
              {personalData.bio}
            </p>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-purple-100">
              {[
                { val: personalData.completedWorks, label: "Karya Selesai" },
                { val: personalData.clients, label: "Klien Puas" },
                { val: `${personalData.yearsActive} Thn`, label: "Pengalaman" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-syne text-3xl md:text-4xl font-bold text-black">{stat.val}</span>
                  <span className="font-outfit text-[9px] uppercase tracking-widest text-black/40 mt-1 font-black">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT CONTENT: BASE INFO CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="p-10 rounded-[48px] bg-white/40 backdrop-blur-md border border-white/60 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 space-y-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="font-outfit text-[10px] uppercase tracking-widest text-black/30 block mb-1 font-bold">Base Location</span>
                    <p className="font-syne text-xl text-black font-semibold">Jakarta, Indonesia</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <span className="font-outfit text-[10px] uppercase tracking-widest text-black/30 block mb-1 font-bold">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="font-syne text-xl text-black font-semibold">Commission Ready</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <Link href="/commissions" className="w-full flex items-center justify-center py-5 rounded-3xl bg-[#1A1F2B] text-white font-syne font-bold hover:bg-purple-600 transition-all active:scale-95 shadow-lg shadow-purple-900/10">
                    Inquire Project
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function SkillsSection() {
  return (
    <section className="relative px-6 py-32 md:px-12 lg:py-48 bg-transparent">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="font-outfit text-[10px] font-black uppercase tracking-[0.5em] text-black/30 mb-4 block">
            Personal Index
          </span>
          <h2 className="font-syne text-4xl md:text-6xl font-bold text-[#1A1F2B]">
            Tools, Taste, & <span className="text-purple-600">Tempo.</span>
          </h2>
          <p className="mt-6 font-outfit text-black/50 max-w-md mx-auto text-sm leading-relaxed font-medium">
            Setiap detail kecil, gesture karakter, dan mood warna diperlakukan sebagai bahasa visual yang personal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32">
          {/* Skills Card */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 rounded-[48px] bg-gradient-to-br from-purple-50/50 to-white/30 backdrop-blur-sm border border-purple-100"
          >
            <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-purple-100 text-purple-600 shadow-sm">
              <Palette size={24} />
            </div>
            <h4 className="font-syne text-3xl font-bold text-black mb-8">Keahlian</h4>
            <div className="flex flex-wrap gap-3">
              {personalData.skills.map((skill, i) => (
                <span key={i} className="px-5 py-3 rounded-2xl bg-white border border-purple-50 text-sm font-outfit font-bold text-black/60">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Tools Card */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 rounded-[48px] bg-gradient-to-br from-indigo-50/50 to-white/30 backdrop-blur-sm border border-indigo-100"
          >
            <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-indigo-100 text-indigo-600 shadow-sm">
              <Monitor size={24} />
            </div>
            <h4 className="font-syne text-3xl font-bold text-black mb-8">Studio Kit</h4>
            <div className="grid grid-cols-2 gap-4">
              {personalData.tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-indigo-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="font-outfit text-sm text-black font-bold opacity-70">{tool}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Process Section - Integrated */}
        <div className="pt-20">
          <div className="text-center mb-24">
            <span className="font-outfit text-[10px] font-black uppercase tracking-[0.5em] text-black/20 mb-4 block">Creative Flow</span>
            <h3 className="font-syne text-4xl md:text-5xl font-bold text-black">The Methodology</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Background Line (Desktop Only) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-100 to-transparent -z-10" />
            
            {[
              { step: "01", title: "Moodboard", desc: "Membangun pondasi visual melalui riset referensi karakter dan warna." },
              { step: "02", title: "Sketch Pass", desc: "Menerjemahkan ide ke dalam garis dinamis dan komposisi artistik." },
              { step: "03", title: "Final Polish", desc: "Rendering high-fidelity dengan fokus pada lighting dan jiwa karakter." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center md:text-left relative"
              >
                <div className="font-syne text-8xl font-black text-purple-100 absolute -top-16 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 select-none opacity-50 -z-10">
                  {item.step}
                </div>
                <h5 className="font-syne text-2xl font-bold text-black mb-4">{item.title}</h5>
                <p className="font-outfit text-black/40 text-sm leading-relaxed font-bold">{item.desc}</p>
                <div className="mt-8 h-1 w-10 bg-purple-600 mx-auto md:mx-0 shadow-[0_0_10px_rgba(147,51,234,0.3)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PersonalPage() {
  const [mounted, setMounted] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"]
  });

  // Removed redundant Framer Motion transforms for smoother performance

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted || !trackRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom", 
          scrub: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        }
      });


      tl.to(imageRef.current, {
        scale: 0.35,
        x: 0,
        y: 0, 
        borderRadius: "48px",
        boxShadow: "0 30px 90px rgba(88,40,240,0.3)",
        force3D: true,
        willChange: "transform",
        ease: "none" // Linear scrub is often smoother for scroll
      }, 0);

      tl.to("#mask-reveal-layer", {
        borderRadius: "48px",
        force3D: true,
        ease: "power2.inOut"
      }, 0);

      tl.to("#transition-text", {
        opacity: 1,
        y: -20,
        duration: 0.5,
        ease: "power2.out"
      }, 0.5);

      tl.to("#marquee-container", {
        opacity: 0.1,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0.2);

    }, trackRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <div className="relative min-h-screen">
      <div ref={trackRef} className="relative w-full">
        <div 
          id="sticky-transition"
          className="sticky top-0 z-30 flex h-screen w-full items-center justify-center overflow-hidden pointer-events-auto"
        >
          {/* Background Marquee Quotes (Behind Photo) */}
          <motion.div 
            id="marquee-container"
            className="absolute inset-0 z-0 flex flex-col justify-center gap-0 select-none overflow-hidden pointer-events-none opacity-0"
          >
             {/* Row 1: Moving Right to Left */}
             <motion.div 
               animate={{ x: [0, -1000] }}
               transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
               className="flex whitespace-nowrap"
             >
               {[1, 2, 3, 4].map((i) => (
                 <h2 
                   key={`mq-1-${i}`}
                   className="font-syne text-[10vw] font-black tracking-tighter text-purple-600 px-8 leading-[0.8]"
                 >
                   DIGITAL ARTISTRY • VISUAL EMOTIONS • BEYOND THE CANVAS • 
                 </h2>
               ))}
             </motion.div>

             {/* Row 2: Moving Left to Right */}
             <motion.div 
               animate={{ x: [-1000, 0] }}
               transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
               className="flex whitespace-nowrap"
             >
               {[1, 2, 3, 4].map((i) => (
                 <h2 
                   key={`mq-2-${i}`}
                   className="font-syne text-[10vw] font-black tracking-tighter text-purple-600 px-8 leading-[0.8]"
                 >
                   REDEFINING AESTHETICS • CREATIVE ARCHIVE • EST. 2018 • 
                 </h2>
               ))}
             </motion.div>
          </motion.div>

          <div 
            ref={imageRef} 
            className="pointer-events-auto relative flex w-full items-center justify-center will-change-transform"
          >
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div 
                id="transition-text"
                className="text-center opacity-0 mb-12 flex flex-col items-center"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[1px] w-6 bg-purple-200" />
                  <span className="font-outfit text-[7px] font-black uppercase tracking-[0.5em] text-purple-600/60">
                    Portfolio Index v.04
                  </span>
                  <div className="h-[1px] w-6 bg-purple-200" />
                </div>
                
                <h3 className="font-syne text-4xl font-extrabold tracking-tighter text-[#1A1F2B] md:text-5xl">
                  REDEFINING <span className="font-light italic text-purple-600/80">Aesthetics</span>
                </h3>
                
                <p className="mt-4 font-outfit text-[8px] font-bold uppercase tracking-[0.3em] text-black/30">
                  Exploration of visual emotions & digital strokes
                </p>
              </div>

              <div className="relative group">
                {/* Decorative Frame Accents */}
                <div className="absolute -inset-8 pointer-events-none">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-purple-200" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-purple-200" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-purple-200" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-purple-200" />
                </div>

                <div className="relative flex items-end justify-center rounded-[32px] overflow-hidden bg-white/5 border border-purple-100/10">
                  <InteractivePhoto />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative -mt-[100vh]">
          <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-transparent">
          {mounted && (
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-purple-900/30 blur-[1px]"
                  initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: Math.random() * 0.5 }}
                  animate={{ y: ["-10%", "110%"], opacity: [0, 1, 0] }}
                  transition={{ duration: 15 + Math.random() * 20, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
                />
              ))}
            </div>
          )}

          <Link
            href="/"
            className="absolute right-6 top-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-600 shadow-sm backdrop-blur-md transition-all hover:bg-purple-50 md:right-10 md:top-10"
          >
            <ArrowLeft size={20} />
          </Link>

          <Link
            href="/"
            className="absolute left-6 top-6 z-40 flex items-center gap-2 group cursor-pointer font-dancing-script text-2xl text-[#1A1F2B] md:left-10 md:top-10"
          >
            <div className="w-5 h-5 bg-purple-600 rounded-lg shadow-sm rotate-12 group-hover:rotate-0 transition-transform" />
            <span>Moon<span className="text-purple-600 font-bold">chaery.</span></span>
          </Link>

          <div className="absolute bottom-40 left-6 z-0 max-w-[90vw] pointer-events-none select-none md:bottom-48 md:left-20">
            <h2 className="font-outfit text-[12vw] font-black leading-[0.8] tracking-tighter text-[#1A1F2B]/40 md:text-[15vw]">
              RATU<br />
              <span className="ml-[10vw]">BALQIS</span>
            </h2>
          </div>

          <div className="absolute bottom-12 left-6 z-50 flex flex-col gap-6 md:bottom-20 md:left-20">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-8 bg-purple-600" />
              <p className="font-dancing-script text-3xl font-bold text-purple-600 md:text-5xl">
                Creative Director & Illustrator
              </p>
            </div>
          </div>

          <div className="absolute bottom-12 right-6 z-50 flex flex-col items-end gap-2 md:bottom-20 md:right-20">
            <span className="font-outfit text-[10px] font-black uppercase tracking-[0.4em] text-black/40">
              {personalData.location} / 07.28" N
            </span>
            <p className="rounded-full border border-purple-100 bg-purple-50 px-5 py-2 font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 shadow-sm">
              Available for Projects
            </p>
          </div>

          </section>

          <section className="relative h-[150vh] w-full overflow-hidden bg-transparent">
          </section>
        </div>
      </div>

      <ProfileSection />

      <div className="relative z-40 bg-transparent">
        <SkillsSection />

        <section className="relative px-6 py-40 text-center md:py-64 overflow-hidden">
          {/* Artistic Glow Background */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-200 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[100px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-5xl relative z-10"
          >
            <Quote className="mx-auto mb-10 text-purple-500/30" size={56} />
            <p className="font-syne text-4xl leading-[1.2] text-[#1A1F2B] md:text-7xl font-bold italic tracking-tight">
              &quot;{personalData.quote}&quot;
            </p>
            
            <div className="mt-20 flex flex-col items-center gap-8">
              <span className="font-dancing-script text-3xl text-purple-600">Ratu Balqis</span>
              
              <div className="flex flex-wrap justify-center gap-4">
                {["visual emotion", "high-fidelity render", "character soul"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-6 py-2.5 rounded-full border border-purple-100 bg-white/50 backdrop-blur-sm font-outfit text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 shadow-sm"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
