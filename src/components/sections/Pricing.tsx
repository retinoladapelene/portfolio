"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, Calculator, ArrowRight, Sparkles, Diamond, PenTool, Layers } from "lucide-react";
import Section from "@/components/ui/Section";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { fadeUp, viewportSettings } from "@/lib/animations";

const FACTORS = [
  { label: "Neural Detail", icon: <Sparkles size={16} /> },
  { label: "Environmental Depth", icon: <Layers size={16} /> },
  { label: "Character Complexity", icon: <PenTool size={16} /> },
  { label: "Commercial Licensing", icon: <Diamond size={16} /> },
];

const EXAMPLES = [
  { type: "Headshot", range: "80K", desc: "Focus on portrait & emotion" },
  { type: "Bust Up", range: "100K", desc: "Dynamic posing & torso" },
  { type: "Halfbody", range: "130K", desc: "Sophisticated character silhouette" },
  { type: "Knee Up", range: "180K", desc: "Complete world-building" },
];

const BASE_TYPES = [
  { label: "Headshot", val: 80 },
  { label: "Bust Up", val: 100 },
  { label: "Halfbody", val: 130 },
  { label: "Knee Up", val: 180 }
];

const Pricing = () => {
  const [baseType, setBaseType] = useState(80);
  const [isCouple, setIsCouple] = useState(false);
  const [bgDetail, setBgDetail] = useState(0);
  const [toasts, setToasts] = useState<{ id: number; message: string; exiting?: boolean }[]>([]);

  const estimatedTotal = useMemo(() => {
    let total = baseType + bgDetail;
    if (isCouple) total *= 2;
    return total;
  }, [baseType, bgDetail, isCouple]);

  const handleOrder = () => {
    const selectedTypeLabel = BASE_TYPES.find(t => t.val === baseType)?.label || "";
    window.dispatchEvent(new CustomEvent("prefillOrder", { 
      detail: { type: selectedTypeLabel, isCouple, hasBackground: bgDetail > 0 } 
    }));

    const id = Date.now();
    setToasts((prev) => [...prev, { id, message: "Opening Neural Order Interface..." }]);
    setTimeout(() => setToasts((prev) => prev.map(t => t.id === id ? { ...t, exiting: true } : t)), 3000);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  return (
    <Section id="pricing" className="relative overflow-hidden py-32 bg-transparent">
      {/* ARTISTIC BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 -left-[10%] w-[600px] h-[600px] bg-purple-900/20 blur-[100px] rounded-full" 
        />
        
        {/* Animated Particles/Edge elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [0, 1.5, 0],
              y: [0, -100, -200],
              x: Math.sin(i) * 100
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "easeOut"
            }}
            className="absolute bottom-0 left-1/4 w-1 h-20 bg-gradient-to-t from-purple-500/0 via-purple-500/20 to-transparent blur-sm"
          />
        ))}
      </div>

      {/* TOAST SYSTEM */}
      <div className="fixed bottom-10 left-10 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div 
              key={toast.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/70 shadow-2xl"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          {/* LEFT CONTENT: EDITORIAL HEADING & FACTORS */}
          <div className="flex-1 space-y-12">
            <motion.div 
              variants={fadeUp}
              initial="initial"
              whileInView="whileInView"
              viewport={viewportSettings}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-purple-500/50" />
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.5em]">Valuation Protocol</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-normal text-white font-dancing-script leading-[0.8]">
                Artistic <br />
                <span className="text-purple-400 font-bold italic">Investment.</span>
              </h2>
              <p className="text-white/70 font-outfit text-lg max-w-lg leading-relaxed uppercase tracking-wider">
                Every stroke is an investment in quality. Our pricing scales dynamically with the <span className="text-white">complexity of your vision.</span>
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {FACTORS.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-[24px] bg-white/[0.05] backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all group"
                >
                  <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">{f.label}</h4>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] block mb-6">Standard Benchmarks</label>
              <div className="grid gap-3">
                {EXAMPLES.map((ex, i) => (
                  <motion.div
                    key={ex.type}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-center p-6 rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:bg-white/[0.06] transition-all group"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white font-outfit">{ex.type}</h4>
                      <p className="text-[9px] text-white/60 uppercase tracking-widest mt-1 font-medium">{ex.desc}</p>
                    </div>
                    <span className="text-2xl font-black text-white font-syne italic tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                      {ex.range}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: INTERACTIVE CONFIGURATOR */}
          <div className="w-full lg:w-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Animated Edges for the Card */}
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 rounded-[40px] blur-sm opacity-50" />
              
              <div className="relative p-10 rounded-[40px] bg-[#0B0F1A] border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
                
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Calculator size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 block">Configurator</span>
                        <h3 className="text-xl font-bold text-white font-outfit">Project Estimator</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Valuation</div>
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-5xl font-black text-white font-syne italic tracking-tighter drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                          {estimatedTotal}K
                        </span>
                        <span className="text-sm font-bold text-purple-400">IDR</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Base Type */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] ml-1">Anatomical Scope</label>
                      <div className="grid grid-cols-2 gap-3">
                        {BASE_TYPES.map((t) => (
                          <button
                            key={t.label}
                            onClick={() => setBaseType(t.val)}
                            className={cn(
                              "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border font-outfit",
                              baseType === t.val 
                                ? "bg-purple-600 border-purple-400 text-white shadow-[0_10px_20px_rgba(168,85,247,0.2)]" 
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Options Toggle */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] ml-1">Advanced Directives</label>
                      <div className="space-y-3">
                        <button 
                          onClick={() => setIsCouple(!isCouple)}
                          className={cn(
                            "w-full flex items-center justify-between p-5 rounded-2xl border transition-all group",
                            isCouple 
                              ? "bg-purple-500/10 border-purple-500/50" 
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                        >
                          <div className="text-left">
                            <span className={cn("text-xs font-bold block transition-colors", isCouple ? "text-white" : "text-white/60")}>Couple 2x price</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-widest">Dual Subject Synergy</span>
                          </div>
                          <div className={cn(
                            "w-10 h-6 rounded-full relative transition-colors",
                            isCouple ? "bg-purple-500" : "bg-white/10"
                          )}>
                            <motion.div 
                              animate={{ x: isCouple ? 18 : 4 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                            />
                          </div>
                        </button>

                        <button 
                          onClick={() => setBgDetail(bgDetail === 0 ? 50 : 0)}
                          className={cn(
                            "w-full flex items-center justify-between p-5 rounded-2xl border transition-all group",
                            bgDetail > 0 
                              ? "bg-purple-500/10 border-purple-500/50" 
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                        >
                          <div className="text-left">
                            <span className={cn("text-xs font-bold block transition-colors", bgDetail > 0 ? "text-white" : "text-white/60")}>Background Complexity</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-widest">+50K IDR Premium</span>
                          </div>
                          <div className={cn(
                            "w-10 h-6 rounded-full relative transition-colors",
                            bgDetail > 0 ? "bg-purple-500" : "bg-white/10"
                          )}>
                            <motion.div 
                              animate={{ x: bgDetail > 0 ? 18 : 4 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                            />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <button 
                      onClick={handleOrder}
                      className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-900/20 group overflow-hidden relative"
                    >
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      />
                      <span className="relative z-10">Initialize Commission Protocol</span>
                      <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[9px] text-white/50 text-center mt-6 uppercase tracking-widest font-medium">
                      *Subject to individual project complexity
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Pricing;

