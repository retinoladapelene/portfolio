"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LivingInkGarden = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 400 620" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="bloom-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="ink-mist" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="stem-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Soft Background Mist */}
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={`mist-${i}`}
            cx={100 + (i % 2 === 0 ? 40 : -40)}
            cy={150 + (i % 2 === 0 ? -100 : 100)}
            r={60 + i * 15}
            fill="url(#ink-mist)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: i * 2 }}
          />
        ))}

        {/* The Stem System */}
        <motion.path
          d="M60 540 Q 65 480 85 430 T 110 320 Q 125 220 100 80"
          stroke="url(#stem-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 5, ease: "easeInOut" }}
        />
        {/* Branch 1 */}
        <motion.path
          d="M110 320 Q 160 300 180 250"
          stroke="url(#stem-gradient)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 4, delay: 2.5, ease: "easeInOut" }}
        />
        {/* Branch 2 */}
        <motion.path
          d="M85 430 Q 60 410 75 380"
          stroke="url(#stem-gradient)"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 3, delay: 1.5, ease: "easeInOut" }}
        />

        {/* Flower 1: The Main Bloom (Top) */}
        <motion.g transform="translate(100, 80)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.path
              key={`f1-outer-${i}`}
              d="M 0 0 C -20 -30, -25 -55, 0 -75 C 25 -55, 20 -30, 0 0"
              fill="#C4B5FD"
              fillOpacity="0.15"
              stroke="#A78BFA"
              strokeWidth="0.5"
              strokeOpacity="0.4"
              initial={{ rotate: angle + 10, scale: 0, opacity: 0 }}
              animate={{ rotate: angle, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 45, damping: 12, delay: 4 + i * 0.1 }}
              style={{ originX: "0px", originY: "0px" }}
            />
          ))}
          {[30, 90, 150, 210, 270, 330].map((angle, i) => (
            <motion.path
              key={`f1-inner-${i}`}
              d="M 0 0 C -15 -20, -18 -40, 0 -55 C 18 -40, 15 -20, 0 0"
              fill="#8B5CF6"
              fillOpacity="0.2"
              stroke="#8B5CF6"
              strokeWidth="0.4"
              strokeOpacity="0.5"
              initial={{ rotate: angle - 15, scale: 0, opacity: 0 }}
              animate={{ rotate: angle, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 55, damping: 15, delay: 5.5 + i * 0.15 }}
              style={{ originX: "0px", originY: "0px" }}
            />
          ))}
        </motion.g>

        {/* Flower 2: The Side Bloom (Middle-Right) */}
        <motion.g transform="translate(180, 250) scale(0.75)">
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <motion.path
              key={`f2-outer-${i}`}
              d="M 0 0 C -18 -25, -22 -45, 0 -60 C 22 -45, 18 -25, 0 0"
              fill="#C4B5FD"
              fillOpacity="0.12"
              stroke="#A78BFA"
              strokeWidth="0.6"
              strokeOpacity="0.3"
              initial={{ rotate: angle + 20, scale: 0, opacity: 0 }}
              animate={{ rotate: angle, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 40, damping: 10, delay: 6 + i * 0.2 }}
              style={{ originX: "0px", originY: "0px" }}
            />
          ))}
          <circle cx="0" cy="0" r="3" fill="#A78BFA" fillOpacity="0.4" className="blur-[2px]" />
        </motion.g>

        {/* Flower 3: The Small Bud (Lower-Left) */}
        <motion.g transform="translate(75, 380) scale(0.5)">
          {[0, 120, 240].map((angle, i) => (
            <motion.path
              key={`f3-outer-${i}`}
              d="M 0 0 C -15 -20, -20 -40, 0 -50 C 20 -40, 15 -20, 0 0"
              fill="#8B5CF6"
              fillOpacity="0.18"
              stroke="#8B5CF6"
              strokeWidth="0.8"
              strokeOpacity="0.4"
              initial={{ rotate: angle, scale: 0, opacity: 0 }}
              animate={{ rotate: angle, scale: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 3.5 + i * 0.3 }}
              style={{ originX: "0px", originY: "0px" }}
            />
          ))}
        </motion.g>

        {/* Delicate Ink Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={`p-${i}`}
            cx={50 + Math.random() * 300}
            cy={100 + Math.random() * 400}
            r={0.6 + Math.random() * 1}
            fill="#A78BFA"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: [0, 0.5, 0], 
              y: -100 - Math.random() * 80,
              x: (Math.random() - 0.5) * 50
            }}
            transition={{ duration: 12 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 10, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
};

const LoginModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openLoginModal", handleOpen);

    return () => window.removeEventListener("openLoginModal", handleOpen);
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <style jsx global>{`
            @keyframes auroraReveal {
              0% {
                opacity: 0;
                transform: translateY(20px) scale(0.98);
                filter: blur(12px);
              }
              60% {
                opacity: 1;
                filter: blur(0px);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0px);
              }
            }

            @keyframes lightSweep {
              0% { transform: translateX(-100%) skewX(-15deg); }
              100% { transform: translateX(250%) skewX(-15deg); }
            }

            .login-title-reveal {
              animation: auroraReveal 1.4s cubic-bezier(.19,1,.22,1) forwards;
            }

            .light-sweep::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 40%;
              height: 100%;
              background: linear-gradient(
                to right,
                transparent,
                rgba(255, 255, 255, 0.5),
                transparent
              );
              animation: lightSweep 6s infinite linear;
              pointer-events: none;
              mix-blend-mode: overlay;
            }

            .ambient-fog {
               background: radial-gradient(circle at 30% 70%, rgba(196,181,253,0.15), transparent 50%),
                           radial-gradient(circle at 70% 30%, rgba(167,139,250,0.1), transparent 50%);
               filter: blur(40px);
               animation: fogMove 20s ease-in-out infinite alternate;
            }

            @keyframes fogMove {
               from { transform: scale(1) translate(0, 0); }
               to { transform: scale(1.2) translate(5%, 5%); }
            }
          `}</style>

          {/* Outer Overlay / Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 backdrop-blur-[18px]"
            style={{
              background: `
                radial-gradient(circle at top left, rgba(196,181,253,0.18), transparent 40%),
                radial-gradient(circle at bottom right, rgba(167,139,250,0.22), transparent 35%),
                rgba(255,255,255,0.55)
              `
            }}
          />

          {/* Modal Container - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="relative w-full max-w-[588px] h-[372px] hidden md:flex z-10 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: "28px",
              boxShadow: "0 20px 80px rgba(139,92,246,0.12), 0 8px 32px rgba(0,0,0,0.08)"
            }}
          >
             {/* LEFT PANEL - Artistic Side (Living Ink Garden) */}
             <div className="w-[40%] relative overflow-hidden border-r border-white/40 flex flex-col items-center justify-center p-6 bg-white/5">
                {/* Ambient Fog */}
                <div className="ambient-fog absolute inset-0 pointer-events-none" />

                {/* The Living Ink Garden Component */}
                <LivingInkGarden />

                {/* Quote */}
                <div className="absolute bottom-10 left-0 right-0 text-center z-20 px-6">
                   <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.45 }}
                      transition={{ delay: 10, duration: 2 }}
                      className="font-syne text-[8px] tracking-[0.4em] uppercase text-slate-500 leading-[2.5] font-medium"
                   >
                      Art is where emotion<br/>becomes visible.
                   </motion.p>
                </div>

                {/* Subtle Editorial Frame */}
                <div className="absolute inset-4 border border-white/10 pointer-events-none z-10" />
             </div>

             {/* RIGHT PANEL - Login Form */}
             <div className="flex-1 relative flex flex-col justify-center p-12 bg-white/20">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-all duration-300 z-20 group"
                >
                  <X size={20} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>

                <div className="max-w-[320px] w-full">
                   <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mb-8"
                   >
                      <h2 className="login-title-reveal light-sweep relative font-syne text-[38px] font-extrabold leading-[1] mb-3 tracking-tighter inline-block">
                         <span style={{
                            background: "linear-gradient(135deg, #8B5CF6, #C4B5FD, #6D28D9)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                         }}>
                            Welcome Back
                         </span>
                      </h2>
                      <p className="font-outfit text-slate-400 text-sm font-light opacity-0 animate-[auroraReveal_1.2s_cubic-bezier(.19,1,.22,1)_0.6s_forwards]">
                         Continue your creative journey.
                      </p>
                   </motion.div>

                   <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 1 }}
                      className="space-y-6"
                   >
                      <button
                        onClick={handleLogin}
                        className="w-full group relative overflow-hidden rounded-[16px] transition-all duration-700 active:scale-[0.97] hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)] shadow-xl"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-transform duration-700 group-hover:scale-[1.1]" />
                         <div className="relative py-4 px-8 flex items-center justify-between gap-3 text-white font-outfit font-bold text-[10px] tracking-[0.2em] uppercase">
                            <span>Connect with Google</span>
                            <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-2 transition-transform duration-500" />
                         </div>
                      </button>

                      <div className="flex items-center gap-4">
                         <div className="h-[1px] flex-1 bg-slate-100/50" />
                         <span className="font-outfit text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Gallery Panel Entry</span>
                         <div className="h-[1px] flex-1 bg-slate-100/50" />
                      </div>
                   </motion.div>
                </div>
             </div>
          </motion.div>

          {/* Mobile Version */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            className="relative w-[92%] z-10 md:hidden overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "28px",
              boxShadow: "0 20px 80px rgba(139,92,246,0.15)",
              border: "1px solid rgba(255,255,255,0.5)"
            }}
          >
             <div className="p-10 pb-16">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-8 right-8 p-2 text-slate-300"
                >
                  <X size={24} />
                </button>

                <div className="mt-12 text-center">
                   <h2 className="font-syne text-[42px] font-extrabold mb-4 tracking-tighter leading-[1.1]">
                      <span style={{
                         background: "linear-gradient(135deg, #8B5CF6, #C4B5FD, #6D28D9)",
                         WebkitBackgroundClip: "text",
                         WebkitTextFillColor: "transparent"
                      }}>
                         Welcome Back
                      </span>
                   </h2>
                   <p className="font-outfit text-slate-400 text-base mb-12 font-light">
                      Continue your creative journey.
                   </p>

                   <button
                     onClick={handleLogin}
                     className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] py-6 px-8 rounded-2xl text-white font-outfit font-bold text-xs tracking-[0.15em] uppercase flex items-center justify-center gap-4 shadow-lg shadow-purple-200"
                   >
                      <span>Connect with Google</span>
                      <ArrowRight size={18} />
                   </button>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
