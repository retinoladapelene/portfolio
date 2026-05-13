"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calculator, ArrowRight, Sparkles, Diamond, PenTool, Layers, Clock } from "lucide-react";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { fadeUp, viewportSettings } from "@/lib/animations";

const FACTORS = [
  { label: "Neural Detail", icon: <Sparkles size={16} /> },
  { label: "Environmental Depth", icon: <Layers size={16} /> },
  { label: "Character Complexity", icon: <PenTool size={16} /> },
  { label: "Commercial Licensing", icon: <Diamond size={16} /> },
];

const Pricing = () => {
  const [baseType, setBaseType] = useState(80);
  const [isCouple, setIsCouple] = useState(false);
  const [bgDetail, setBgDetail] = useState(0);
  const [toasts, setToasts] = useState<{ id: number; message: string; exiting?: boolean }[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionsOpen, setCommissionsOpen] = useState(true);
  const [closedReason, setClosedReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, settingsRes] = await Promise.all([
          fetch('/api/pricing'),
          fetch('/api/admin/settings')
        ]);
        
        const pricingData = await pricingRes.json();
        const settingsData = await settingsRes.json();

        if (pricingData.success && pricingData.data.length > 0) {
          setConfigs(pricingData.data);
          const firstPackage = pricingData.data.find((c: any) => c.category === 'package');
          if (firstPackage) setBaseType(firstPackage.value);
        }

        if (settingsData.success && settingsData.data) {
          setCommissionsOpen(settingsData.data.commissions_open);
          setClosedReason(settingsData.data.closed_reason || "");
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const baseTypes = configs.length > 0 
    ? configs.filter(c => c.category === 'package').map(c => ({ label: c.label, val: c.value, desc: c.description }))
    : [
        { label: "Headshot", val: 80, desc: "Focus on portrait & emotion" },
        { label: "Bust Up", val: 100, desc: "Dynamic posing & torso" },
        { label: "Halfbody", val: 130, desc: "Sophisticated character silhouette" },
        { label: "Knee Up", val: 180, desc: "Complete world-building" }
      ];

  const extraBg = configs.find(c => c.category === 'extra' && c.key === 'background_premium')?.value || 50;
  const coupleMult = configs.find(c => c.category === 'multiplier' && c.key === 'couple_multiplier')?.value || 2;

  const estimatedTotal = useMemo(() => {
    let total = baseType + bgDetail;
    if (isCouple) total *= coupleMult;
    return total;
  }, [baseType, bgDetail, isCouple, coupleMult]);

  const handleOrder = () => {
    if (!commissionsOpen) {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message: closedReason || "Commissions are currently closed. Please check back later!" }]);
      setTimeout(() => setToasts((prev) => prev.map(t => t.id === id ? { ...t, exiting: true } : t)), 3000);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
      return;
    }

    const selectedTypeLabel = baseTypes.find(t => t.val === baseType)?.label || "";
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
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full" 
        />
      </div>

      <div className="fixed bottom-10 left-10 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div 
              key={toast.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="px-6 py-4 bg-white/40 backdrop-blur-xl border border-black/5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black/70 shadow-xl"
            >
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center">
          <div className="w-full lg:max-w-xl space-y-12">
            <motion.div variants={fadeUp} initial="initial" whileInView="whileInView" viewport={viewportSettings} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-purple-500/50" />
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.5em]">Valuation Protocol</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-normal text-black font-dancing-script leading-[0.8]">
                Artistic <br />
                <span className="text-purple-600 font-bold italic">Investment.</span>
              </h2>
              <p className="text-black/60 font-outfit text-lg max-w-lg leading-relaxed uppercase tracking-wider">
                Every stroke is an investment in quality. Our pricing adjusts dynamically to the <span className="text-black">complexity of your vision.</span>
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {FACTORS.map((f, i) => (
                <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-[24px] bg-black/[0.03] backdrop-blur-md border border-black/5 hover:border-purple-600/50 transition-all group">
                  <div className="text-purple-600 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black/60">{f.label}</h4>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] block mb-6">Standard Benchmarks</label>
              <div className="grid gap-3">
                {baseTypes.slice(0, 4).map((ex, i) => (
                  <motion.div key={ex.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex justify-between items-center p-6 rounded-3xl bg-black/[0.02] backdrop-blur-sm border border-black/5 hover:bg-black/[0.04] transition-all group">
                    <div>
                      <h4 className="text-lg font-bold text-black font-outfit">{ex.label}</h4>
                      <p className="text-[9px] text-black/40 uppercase tracking-widest mt-1 font-medium">{ex.desc}</p>
                    </div>
                    <span className="text-2xl font-black text-black font-syne italic tracking-tighter">
                      {ex.val}K
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[480px]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative">
              <div className="relative p-6 md:p-10 lg:px-10 rounded-[32px] md:rounded-[40px] bg-white/[0.6] backdrop-blur-xl border border-black/5 shadow-xl overflow-hidden">
                <div className="relative z-10 space-y-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/10">
                        {commissionsOpen ? (
                          <Calculator size={18} className="text-purple-600" />
                        ) : (
                          <Clock size={18} className="text-black/40" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-black/40 block">Configurator</span>
                          {!commissionsOpen && (
                            <span className="px-2 py-0.5 rounded-full bg-black/5 border border-black/10 text-[7px] font-black uppercase tracking-widest text-black/40">
                              Status: Resting
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-black font-outfit">Project Estimator</h3>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto min-w-fit shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-black/5">
                      <div className="text-[9px] text-black/30 uppercase tracking-wider mb-1">Total Valuation</div>
                      <div className="flex items-baseline gap-1 justify-start sm:justify-end">
                        <span className="text-4xl md:text-5xl font-black text-black font-syne italic tracking-tight">
                          {estimatedTotal}K
                        </span>
                        <span className="text-xs font-bold text-purple-600">IDR</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] ml-1">Anatomical Scope</label>
                      <div className="grid grid-cols-2 gap-3">
                        {baseTypes.map((t) => (
                          <button
                            key={t.label}
                            onClick={() => setBaseType(t.val)}
                            className={cn(
                              "py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border font-outfit",
                              baseType === t.val ? "bg-purple-600 border-purple-400 text-white" : "bg-black/[0.03] border-black/5 text-black/40"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] ml-1">Advanced Directives</label>
                      <div className="space-y-3">
                        <button onClick={() => setIsCouple(!isCouple)} className={cn("w-full flex items-center justify-between p-5 rounded-2xl border transition-all", isCouple ? "bg-purple-500/10 border-purple-500/20" : "bg-black/[0.02] border-black/5")}>
                          <div className="text-left">
                            <span className={cn("text-xs font-bold block", isCouple ? "text-black" : "text-black/40")}>Couple {coupleMult}x price</span>
                            <span className="text-[9px] text-black/20 uppercase tracking-widest">Dual Subject Synergy</span>
                          </div>
                          <div className={cn("w-10 h-6 rounded-full relative transition-colors", isCouple ? "bg-purple-600" : "bg-black/10")}>
                            <motion.div animate={{ x: isCouple ? 18 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </button>

                        <button onClick={() => setBgDetail(bgDetail === 0 ? extraBg : 0)} className={cn("w-full flex items-center justify-between p-5 rounded-2xl border transition-all", bgDetail > 0 ? "bg-purple-500/10 border-purple-500/20" : "bg-black/[0.02] border-black/5")}>
                          <div className="text-left">
                            <span className={cn("text-xs font-bold block", bgDetail > 0 ? "text-black" : "text-black/40")}>Background Complexity</span>
                            <span className="text-[9px] text-black/20 uppercase tracking-widest">+{extraBg}K IDR Premium</span>
                          </div>
                          <div className={cn("w-10 h-6 rounded-full relative transition-colors", bgDetail > 0 ? "bg-purple-600" : "bg-black/10")}>
                            <motion.div animate={{ x: bgDetail > 0 ? 18 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {!commissionsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                        <Clock size={18} />
                      </div>
                      <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-wider leading-relaxed">
                        {closedReason || "Sorry, commissions are currently closed to maintain quality. Please check back later!"}
                      </p>
                    </motion.div>
                  )}

                  <div className="pt-6 border-t border-black/5">
                    <button 
                      onClick={handleOrder} 
                      className={cn(
                        "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3",
                        commissionsOpen 
                          ? "bg-purple-600 hover:bg-purple-500 text-white" 
                          : "bg-black/10 text-black/30 cursor-not-allowed"
                      )}
                    >
                      <span>{commissionsOpen ? 'Request Your Commission' : 'Commissions Currently Closed'}</span>
                      {commissionsOpen ? <ArrowRight size={14} /> : <Clock size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
    </Section>
  );
};

export default Pricing;
