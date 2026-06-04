"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0A0D14] flex flex-col items-center justify-center font-outfit">
      {/* --- BACKGROUND ELEMENTS --- */}
      
      {/* Nebula Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-purple-900/30 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Star Field */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: Math.random(), scale: Math.random() }}
            animate={{ 
              opacity: [null, Math.random(), Math.random()],
              scale: [null, Math.random() + 0.5, Math.random()]
            }}
            transition={{ 
              duration: 3 + Math.random() * 7, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
            }}
          />
        ))}
      </div>

      {/* Floating Debris/Stardust */}
      <AnimatePresence>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: "110%", 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              y: "-10%", 
              opacity: [0, 0.5, 0],
              rotate: 360 
            }}
            transition={{ 
              duration: 15 + Math.random() * 20, 
              repeat: Infinity, 
              delay: i * 3,
              ease: "linear" 
            }}
            className="absolute text-purple-400/20 pointer-events-none"
          >
            <Sparkles size={12 + Math.random() * 24} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* --- CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Large Glitchy 404 */}
          <div className="relative">
            <h1 className="font-syne text-[clamp(8rem,20vw,16rem)] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-purple-500/50">
              404
            </h1>
            {/* Ethereal shadow/glow */}
            <div className="absolute inset-0 blur-3xl bg-purple-600/20 -z-10 scale-110" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-4 space-y-6"
          >
            <h2 className="font-dancing-script text-4xl md:text-6xl text-purple-300 mb-2">
              Lost in the Nebula
            </h2>
            <p className="font-outfit text-white/50 text-sm md:text-lg max-w-md mx-auto uppercase tracking-[0.3em] font-light">
              This canvas is empty. The coordinates you followed have dissolved into stardust.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 flex flex-col md:flex-row items-center gap-6 justify-center"
          >
            <Link 
              href="/"
              className="group relative px-10 py-5 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              {/* Button Background */}
              <div className="absolute inset-0 bg-white transition-colors group-hover:bg-purple-50" />
              
              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-200/50 via-transparent to-indigo-200/50" />
              
              <span className="relative flex items-center gap-3 font-black text-[#0A0D14] uppercase tracking-[0.2em] text-xs">
                <Home size={16} className="transition-transform group-hover:-translate-y-0.5" />
                Return to Earth
              </span>
            </Link>

            <button 
              onClick={() => window.history.back()}
              className="group flex items-center gap-3 px-8 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all text-white/60 hover:text-white"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Go Back</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Corner Details */}
      <div className="absolute bottom-10 left-10 hidden md:block text-left">
        <div className="flex flex-col gap-2 border-l border-white/10 pl-4 py-2">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Sector</span>
          <span className="text-[10px] font-bold text-purple-400/40 uppercase tracking-[0.1em]">Empty_Canvas_01</span>
        </div>
      </div>

      <div className="absolute top-10 right-10 hidden md:block text-right">
        <div className="flex flex-col gap-2 border-r border-white/10 pr-4 py-2">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Status</span>
          <span className="text-[10px] font-bold text-purple-400/40 uppercase tracking-[0.1em]">Signal_Lost</span>
        </div>
      </div>
      
      {/* Grain Overlay for that premium texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] grain-overlay mix-blend-overlay" />
    </main>
  );
}
