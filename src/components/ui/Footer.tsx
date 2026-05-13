"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowRight,
  Hash
} from "lucide-react";
import TermsModal from "./TermsModal";

// --- Custom Official Social Icons ---
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24h-2.19L17.61 20.644Z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState("");
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const sidebarY = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <footer 
      ref={containerRef} 
      className="relative bg-[#050505] min-h-[80vh] flex flex-col justify-end overflow-hidden selection:bg-purple-600 selection:text-white"
    >
      {/* ─── ARTISTIC BACKGROUND: LIQUID INK SPILL ─────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none filter blur-[60px] opacity-100">
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 0.8, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            x: [0, 120, -60, 40, 0],
            y: [0, -60, 120, -40, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-600/30 rounded-[40%_60%_70%_30%/40%_50%_60%_40%]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.3, 0.9, 1.2, 0.8, 1.3],
            rotate: [360, 270, 180, 90, 0],
            x: [0, -120, 60, -40, 0],
            y: [0, 120, -60, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-30%] right-[-10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-[50%_40%_30%_60%/50%_60%_40%_50%]" 
        />
        <motion.div 
          style={{ 
            x: useSpring(useTransform(mouseX, [0, 2000], [-200, 200]), { damping: 40 }),
            y: useSpring(useTransform(mouseY, [0, 1000], [-200, 200]), { damping: 40 }),
          }}
          className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-purple-400/10 rounded-full" 
        />
      </div>

      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      <div className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-white/5">
          <motion.div 
            style={{ y: sidebarY }}
            className="hidden lg:flex lg:col-span-2 border-r border-white/5 items-end justify-center py-20"
          >
            <h2 className="text-[12vh] font-black text-white/5 uppercase vertical-text tracking-[0.2em] select-none">
              MOONCHAERY
            </h2>
          </motion.div>

          <div className="lg:col-span-10 flex flex-col backdrop-blur-[2px]">
            <div className="px-8 lg:px-20 py-24 lg:py-40 border-b border-white/5">
              <motion.div 
                style={{ opacity: contentOpacity }}
                className="max-w-4xl space-y-12"
              >
                <div className="flex items-center gap-4 text-purple-500">
                  <Hash size={20} />
                  <span className="text-xs font-black uppercase tracking-[1em]">Final.Signal</span>
                </div>
                <h3 className="text-5xl md:text-[7.5vw] font-black text-white font-outfit leading-[0.9] tracking-tighter">
                  LET&apos;S SHAPE THE <br />
                  <span className="italic font-dancing-script lowercase text-purple-500 pr-4">unseen</span> 
                  TOGETHER.
                </h3>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Direct Link Section */}
              <div className="p-10 lg:p-16 border-b md:border-b-0 md:border-r border-white/5 group relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
                <div className="relative z-10 space-y-8 w-full">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] block">Direct Link</span>
                  <div className="space-y-3">
                    <Link href="mailto:hello@artist.com" className="text-xl lg:text-2xl font-bold text-white block hover:text-purple-500 transition-colors break-words">
                      hello@artist.com
                    </Link>
                    <p className="text-white/40 text-[10px] font-medium tracking-wide">Available for select narratives.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:scale-110 transition-all duration-500 mx-auto md:mx-0">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>

              {/* The Path Section */}
              <div className="p-10 lg:p-16 border-b md:border-b-0 md:border-r border-white/5 space-y-10 flex flex-col items-center md:items-start">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">The Path</span>
                <nav className="flex flex-col gap-5 w-full">
                  {["Archive", "Personal", "Pricing", "Track Order"].map((item) => (
                    <Link key={item} href="#" className="text-base lg:text-lg font-bold text-white/40 hover:text-white transition-all flex items-center justify-between group py-1">
                      {item}
                      <div className="w-0 h-px bg-purple-500 group-hover:w-12 transition-all duration-500" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Connect Section */}
              <div className="p-10 lg:p-16 space-y-10 flex flex-col items-center md:items-start">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Connect</span>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {[
                    { icon: <InstagramIcon />, label: "Instagram" },
                    { icon: <XIcon />, label: "X" },
                    { icon: <DiscordIcon />, label: "Discord" }
                  ].map((item) => (
                    <a key={item.label} href="#" title={item.label} className="w-14 h-14 md:w-12 md:h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-purple-600 hover:scale-105 active:scale-95 transition-all duration-300">
                      {item.icon}
                    </a>
                  ))}
                </div>
                <div className="w-full pt-4">
                  <div className="relative group max-w-sm mx-auto md:mx-0">
                    <input 
                      type="email" 
                      placeholder="NEWSLETTER.SIGNAL" 
                      className="w-full bg-white/[0.02] border-b border-white/10 px-0 py-5 text-[10px] font-black text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-white/5 tracking-widest text-center md:text-left"
                    />
                    <ArrowRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 px-8 lg:px-20 py-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-[#050505]/95 backdrop-blur-xl relative z-20">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10 text-[10px] font-black uppercase tracking-[0.4em]">
            <p className="text-white/40 hover:text-white/60 transition-colors duration-500">© 2024 MOONCHAERY</p>
            <button 
              onClick={() => setIsTermsOpen(true)} 
              className="text-white/60 hover:text-purple-400 transition-all duration-300 relative group"
            >
              Protocols
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-purple-500 group-hover:w-full transition-all duration-300" />
            </button>
          </div>

          <div className="flex items-center gap-4 py-2 px-4 rounded-full bg-white/[0.03] border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white/70 tabular-nums tracking-[0.2em]">{time} JAKARTA</span>
          </div>
        </div>
      </div>

      <TermsModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        isAccepted={isAccepted}
        onAcceptChange={setIsAccepted}
      />

      <style jsx global>{`
        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
      `}</style>
    </footer>
  );
}
