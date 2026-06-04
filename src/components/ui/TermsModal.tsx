"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ScrollText, CheckCircle2, AlertCircle, Ban, CreditCard, Copyright, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAccepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

const TermsModal = ({ isOpen, onClose, isAccepted, onAcceptChange }: TermsModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasReadToBottom, setHasReadToBottom] = useState(false);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset scroll state when opened
      setHasReadToBottom(isAccepted);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isAccepted]);

  const handleScroll = () => {
    if (!contentRef.current || hasReadToBottom) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    // Check if user has scrolled near the bottom (within 20px)
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setHasReadToBottom(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0D0A1C]/95 backdrop-blur-2xl border border-purple-500/20 shadow-[0_30px_70px_rgba(139,92,246,0.25)] rounded-[32px] flex flex-col max-h-[85vh] text-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-purple-500/10 flex items-center justify-between bg-purple-950/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <ScrollText size={20} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white font-outfit uppercase tracking-[0.05em] leading-tight">
                    Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 italic">Service.</span>
                  </h2>
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] font-outfit">Rules & Guidelines</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-purple-950/40 border border-purple-500/15 flex items-center justify-center text-purple-400 hover:text-white transition-all duration-300 hover:rotate-90 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 font-sans custom-scrollbar bg-purple-950/5"
            >
              
              <div className="bg-purple-950/30 p-5 rounded-2xl border border-purple-500/25 flex gap-4 items-start shadow-[0_4px_20px_rgba(168,85,247,0.05)]">
                <AlertCircle className="text-purple-400 shrink-0 mt-1" size={18} />
                <p className="text-xs font-semibold text-purple-200 leading-relaxed font-sans">
                  First come first served! Everyone after that will be put on a waiting list.
                </p>
              </div>

              {/* Do's & Don'ts */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-[0_4px_25px_rgba(16,185,129,0.02)]">
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 font-outfit">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Do's
                  </h3>
                  <ul className="space-y-3 text-[12px] text-emerald-200/80 font-medium font-sans">
                    {["Idols", "Fanart", "OC / Persona", "BL / GL", "NSFW (ask through DMs)"].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-5 space-y-4 shadow-[0_4px_25px_rgba(244,63,94,0.02)]">
                  <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] flex items-center gap-2 font-outfit">
                    <Ban size={14} className="text-rose-400" /> Don'ts
                  </h3>
                  <ul className="space-y-3 text-[12px] text-rose-200/80 font-medium font-sans">
                    {["Furry (ears & tail are OK)", "Full Mecha", "Complex Background", "Heavy Gore"].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* General Rules */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-purple-400/80 uppercase tracking-[0.3em] font-outfit">General Rules</h3>
                <div className="grid gap-3">
                  {[
                    "I have the right to refuse any commission for any reason.",
                    "DP 50% required after rough sketch.",
                    "Turnaround time: 3–7 days (depends on complexity).",
                    "Please be patient during the creative process.",
                    "Feel free to DM me (@Zarry_linilo) on Twitter or Instagram!"
                  ].map((text, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-purple-950/15 border border-purple-500/10 text-[12px] text-purple-200/90 font-medium leading-relaxed font-sans shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-purple-400/80 uppercase tracking-[0.3em] font-outfit">Workflow Procedure</h3>
                <div className="space-y-4">
                  {[
                    "Send request via DM using the commission form with clear references.",
                    "I will reply to acknowledge and discuss further details.",
                    "I'll start the sketch (up to 3 major revisions allowed).",
                    "After sketch approval, I move to lineart/color (No major adjustments).",
                    "Regular progress updates will be sent to your inbox."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start bg-purple-950/10 p-3.5 rounded-2xl border border-purple-500/5">
                      <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 border border-purple-500/30 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-syne shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        {i + 1}
                      </span>
                      <p className="text-[12px] text-purple-200/85 font-medium leading-relaxed font-sans pt-0.5">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-purple-400/80 uppercase tracking-[0.3em] flex items-center gap-2 font-outfit">
                  <CreditCard size={14} className="text-purple-400" /> Payments & Refunds
                </h3>
                <div className="p-5 rounded-2xl border border-dashed border-purple-500/25 bg-purple-950/20 space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                  <p className="text-[12px] text-purple-200/90 font-bold font-sans flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Full payment before final touch-up.
                  </p>
                  <p className="text-[11px] text-rose-400 font-black tracking-widest uppercase font-outfit flex items-center gap-2 bg-rose-950/20 border border-rose-500/10 px-3 py-1.5 rounded-xl w-fit">
                    <AlertCircle size={12} className="text-rose-400 animate-pulse" />
                    Strictly NO REFUNDS!
                  </p>
                  <div className="pt-4 border-t border-purple-500/10">
                    <p className="text-[8px] font-black text-purple-400 uppercase tracking-[0.2em] mb-3 font-outfit">Accepted Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {["BCA", "Shopeepay", "OVO", "DANA", "QRIS"].map(m => (
                        <span key={m} className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/10 text-[9px] font-black text-purple-300 font-outfit shadow-sm">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="space-y-4 pb-10">
                <h3 className="text-[10px] font-black text-purple-400/80 uppercase tracking-[0.3em] flex items-center gap-2 font-outfit">
                  <Copyright size={14} className="text-purple-400" /> Copyright & Use
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[12px] text-purple-200 font-medium leading-relaxed font-sans">
                    Commercial use is prohibited. For commercial purposes, the price is <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">3x normal price</span>.
                  </div>
                  <ul className="space-y-3 text-[12px] text-purple-200/70 font-medium font-sans">
                    <li className="flex gap-3 items-start bg-purple-950/10 p-3 rounded-xl border border-purple-500/5">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Reposting is allowed with proper credit (tagging or linking).</span>
                    </li>
                    <li className="flex gap-3 items-start bg-rose-950/10 p-3 rounded-xl border border-rose-500/10">
                      <span className="text-rose-400 mt-1">•</span>
                      <span className="font-bold text-rose-200/90">Tracing or plagiarizing is strictly prohibited.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Checkbox Acceptance - ONLY visible after reading to bottom */}
              {hasReadToBottom && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 border-t border-purple-500/10"
                >
                  <button 
                    onClick={() => onAcceptChange(!isAccepted)}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-purple-950/20 border border-purple-500/10 hover:border-purple-500/30 hover:bg-purple-950/30 transition-all text-left w-full group cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.05)]"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0 cursor-pointer",
                      isAccepted 
                        ? "bg-purple-500 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                        : "bg-[#0D0A1C] border-purple-500/30 group-hover:border-purple-400"
                    )}>
                      {isAccepted && <Check size={12} strokeWidth={4} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-purple-100 leading-tight">I have read and agree to all terms and conditions above.</p>
                      <p className="text-[11px] text-purple-400/80 font-medium font-sans">By checking this, you acknowledge that you understand the terms and guidelines for the commission.</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-purple-500/10 bg-[#0D0A1C]/90 backdrop-blur-md flex justify-between items-center gap-3">
              {!hasReadToBottom ? (
                <div className="flex items-center gap-2 text-purple-400 font-black text-[8px] uppercase tracking-[0.3em] animate-pulse font-outfit">
                  <ScrollText size={12} /> Scroll to bottom to accept
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[8px] uppercase tracking-[0.3em] font-outfit">
                  <CheckCircle2 size={12} /> Ready to accept
                </div>
              )}
              <button
                onClick={onClose}
                className={cn(
                  "px-10 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg font-outfit cursor-pointer",
                  isAccepted 
                    ? "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                    : "bg-purple-950/20 text-purple-400/30 border border-purple-500/5 cursor-not-allowed"
                )}
                disabled={!isAccepted}
              >
                Accept & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;
