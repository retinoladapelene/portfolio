"use client";

import { motion, useSpring, useInView } from "framer-motion";
import { useState, useMemo, useEffect, memo, useRef } from "react";
import { ShieldCheck, Cpu, Activity, Zap, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── DATA & TYPES ──────────────────────────────────────────────────────────

const BASE_PRICES = [
  { id: "headshot", label: "Headshot", price: 80000, desc: "Portrait & emotion focus" },
  { id: "bust", label: "Bust Up", price: 100000, desc: "Dynamic posing & torso" },
  { id: "halfbody", label: "Halfbody", price: 130000, desc: "Character silhouette focus" },
  { id: "kneeup", label: "Knee Up", price: 129000, desc: "World-building & full scope" },
];

const ADD_ONS = [
  { id: "couple", label: "Couple (2x Price)", multiplier: 2, desc: "Dual Subject Synergy" },
  { id: "background", label: "Complex BG", flat: 100000, desc: "+100K Premium Detail" },
];

// ─── TYPES & INTERFACES ────────────────────────────────────────────────────

type BasePriceItem = {
  id: string;
  label: string;
  price: number;
  desc: string;
};

type AddonItem = {
  id: string;
  label: string;
  desc: string;
  multiplier?: number;
  flat?: number;
};

// ─── OPTIMIZED SUB-COMPONENTS (MEMOIZED) ───────────────────────────────────

const OptionButton = memo(({ item, isSelected, onClick }: { item: BasePriceItem, isSelected: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-5 rounded-2xl border text-left transition-all duration-300 group will-change-transform",
      isSelected 
        ? "bg-white border-purple-200 shadow-xl shadow-purple-500/5 scale-[1.02]" 
        : "bg-transparent border-slate-200 hover:border-purple-200"
    )}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={cn(
        "text-sm font-black uppercase tracking-tighter transition-colors",
        isSelected ? "text-slate-950" : "text-slate-400"
      )}>{item.label}</span>
      {isSelected && <CheckCircle2 size={16} className="text-purple-500" />}
    </div>
    <p className="text-[10px] text-slate-400 font-medium leading-relaxed group-hover:text-slate-500">{item.desc}</p>
  </button>
));
OptionButton.displayName = "OptionButton";

const AddonButton = memo(({ item, isSelected, onClick }: { item: AddonItem, isSelected: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-4 will-change-transform",
      isSelected
        ? "bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-500/20 scale-[1.02]"
        : "bg-white border-slate-200 text-slate-950 hover:border-purple-200"
    )}
  >
    <div>
      <span className="text-sm font-black uppercase tracking-tighter block">{item.label}</span>
      <p className={cn("text-[10px] font-medium opacity-60", isSelected ? "text-white" : "text-slate-500")}>{item.desc}</p>
    </div>
    {isSelected && <ShieldCheck size={20} />}
  </button>
));
AddonButton.displayName = "AddonButton";

// ─── MAIN PRICING COMPONENT ────────────────────────────────────────────────

export default function Pricing() {
  const sectionRef = useRef(null);
  const isVisible = useInView(sectionRef, { margin: "-100px" });
  
  const [selectedBase, setSelectedBase] = useState(BASE_PRICES[0]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [commissionsOpen, setCommissionsOpen] = useState(false);
  const [closedReason, setClosedReason] = useState("Queue currently optimized");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/admin/settings?t=${Date.now()}`);
        const result = await res.json();
        if (result.success && result.data) {
          setCommissionsOpen(result.data.commissions_open);
          if (result.data.closed_reason) {
            setClosedReason(result.data.closed_reason);
          }
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    fetchSettings();
  }, []);

  const totalPrice = useMemo(() => {
    const base = selectedBase.price;
    let multiplier = 1;
    let flatAdd = 0;
    selectedAddons.forEach(id => {
      const addon = ADD_ONS.find(a => a.id === id);
      if (addon?.multiplier) multiplier *= addon.multiplier;
      if (addon?.flat) flatAdd += addon.flat;
    });
    return (base * multiplier) + flatAdd;
  }, [selectedBase, selectedAddons]);

  const displayPrice = useSpring(totalPrice, { stiffness: 100, damping: 30 });
  useEffect(() => { displayPrice.set(totalPrice); }, [totalPrice, displayPrice]);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  return (
    <section ref={sectionRef} id="pricing" className="relative w-full py-24 md:py-32 bg-white px-4 md:px-12 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-slate-100 hidden md:block" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-12 bg-purple-500" />
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em]">Valuation Guide</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-slate-950 font-outfit uppercase tracking-tighter leading-[0.85]">
              Artistic<br />
              <span className="text-purple-600 italic">Investment.</span>
            </h2>
          </div>

          {!commissionsOpen && isVisible && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-950 p-4 md:p-6 rounded-2xl flex items-center gap-4 md:gap-6 border border-white/10 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Commissions Closed</p>
                <p className="text-white font-medium text-sm md:text-base italic">{closedReason}</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 bg-slate-50 p-4 md:p-8 rounded-[32px] border border-slate-100">
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-purple-500" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Anatomical Scope</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BASE_PRICES.map((base) => (
                  <OptionButton key={base.id} item={base} isSelected={selectedBase.id === base.id} onClick={() => setSelectedBase(base)} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-purple-500" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced Directives</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADD_ONS.map((addon) => (
                  <AddonButton key={addon.id} item={addon} isSelected={selectedAddons.includes(addon.id)} onClick={() => toggleAddon(addon.id)} />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit will-change-transform">
            <div className="bg-slate-950 rounded-[24px] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
              {isVisible && <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-500/50 animate-pulse" />}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Project Estimator</span>
                  <Activity size={14} className="text-purple-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold italic font-serif">Total Valuation</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-black font-outfit text-white tracking-tighter">
                    {totalPrice / 1000}K
                  </span>
                  <span className="text-sm font-black text-slate-500 uppercase mb-2 tracking-widest">IDR</span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Base Scope</span>
                  <span className="text-white">{selectedBase.label}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Modifications</span>
                  <span className="text-white">{selectedAddons.length || "None"}</span>
                </div>
              </div>

               <button
                disabled={!commissionsOpen}
                onClick={() => window.dispatchEvent(new CustomEvent("prefillOrder", { 
                  detail: { 
                    type: selectedBase.label, 
                    isCouple: selectedAddons.includes("couple"), 
                    hasBackground: selectedAddons.includes("background") 
                  }
                }))}
                className={cn(
                  "w-full py-4 rounded-full font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 active:scale-95",
                  commissionsOpen 
                    ? "bg-purple-600 hover:bg-white hover:text-slate-950 text-white" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                {commissionsOpen ? "Initiate Project" : "Commissions Closed"}
                {commissionsOpen && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
