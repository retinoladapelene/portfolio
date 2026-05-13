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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <ScrollText size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-gray-900 font-dancing-script">Terms of <span className="text-purple-500">Service.</span></h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-outfit">Rules & Guidelines</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 font-outfit custom-scrollbar"
            >
              
              <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 flex gap-4 items-start">
                <AlertCircle className="text-purple-500 shrink-0 mt-1" size={18} />
                <p className="text-sm font-bold text-purple-900 leading-relaxed">
                  First come first served! Everyone after that will be put on a waiting list.
                </p>
              </div>

              {/* Do's & Don'ts */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-green-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle2 size={14} /> Do's
                  </h3>
                  <ul className="space-y-2.5 text-[13px] text-gray-600 font-medium">
                    {["Idols", "Fanart", "OC / Persona", "BL / GL", "NSFW (ask through DMs)"].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Ban size={14} /> Don'ts
                  </h3>
                  <ul className="space-y-2.5 text-[13px] text-gray-600 font-medium">
                    {["Furry (ears & tail are OK)", "Full Mecha", "Complex Background", "Heavy Gore"].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* General Rules */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">General Rules</h3>
                <div className="grid gap-3">
                  {[
                    "I have the right to refuse any commission for any reason.",
                    "DP 50% required after rough sketch.",
                    "Turnaround time: 3–7 days (depends on complexity).",
                    "Please be patient during the creative process.",
                    "Feel free to DM me (@Zarry_linilo) on Twitter or Instagram!"
                  ].map((text, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-[13px] text-gray-700 font-medium leading-relaxed">
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Workflow Procedure</h3>
                <div className="space-y-4">
                  {[
                    "Send request via DM using the commission form with clear references.",
                    "I will reply to acknowledge and discuss further details.",
                    "I'll start the sketch (up to 3 major revisions allowed).",
                    "After sketch approval, I move to lineart/color (No major adjustments).",
                    "Regular progress updates will be sent to your inbox."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-[10px] font-black text-purple-400 bg-purple-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-[13px] text-gray-600 font-medium leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CreditCard size={14} /> Payments & Refunds
                </h3>
                <div className="p-5 rounded-2xl border-2 border-dashed border-gray-100 space-y-4">
                  <p className="text-[13px] text-gray-700 font-bold">• Full payment before final touch-up.</p>
                  <p className="text-[13px] text-red-500 font-black tracking-widest uppercase">• Strictly NO REFUNDS!</p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {["BCA", "Shopeepay", "OVO", "DANA", "QRIS"].map(m => (
                        <span key={m} className="px-3 py-1 rounded-lg bg-gray-100 text-[10px] font-black text-gray-600">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="space-y-4 pb-10">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Copyright size={14} /> Copyright & Use
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-purple-500/5 text-[13px] text-purple-900 font-medium leading-relaxed">
                    Commercial use is prohibited. For commercial purposes, the price is <span className="font-bold">3x normal price</span>.
                  </div>
                  <ul className="space-y-3 text-[13px] text-gray-600 font-medium">
                    <li className="flex gap-3">
                      <span className="text-purple-400">•</span>
                      <span>Reposting is allowed with proper credit (tagging or linking).</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-400">•</span>
                      <span className="font-bold">Tracing or plagiarizing is strictly prohibited.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Checkbox Acceptance - ONLY visible after reading to bottom */}
              {hasReadToBottom && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-10 border-t border-gray-100"
                >
                  <button 
                    onClick={() => onAcceptChange(!isAccepted)}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all text-left w-full group"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0",
                      isAccepted 
                        ? "bg-purple-600 border-purple-600 text-white" 
                        : "bg-white border-slate-200 group-hover:border-purple-300"
                    )}>
                      {isAccepted && <Check size={14} strokeWidth={4} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-slate-800 leading-tight">I have read and agree to all terms and conditions above.</p>
                      <p className="text-[11px] text-slate-400 font-medium font-outfit">By checking this, you acknowledge that you understand the protocol and guidelines for the commission.</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              {!hasReadToBottom && (
                <div className="mr-auto flex items-center gap-2 text-purple-400 font-black text-[8px] uppercase tracking-widest animate-pulse">
                  <ScrollText size={12} /> Scroll to bottom to accept
                </div>
              )}
              <button
                onClick={onClose}
                className={cn(
                  "px-10 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg font-outfit",
                  isAccepted 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
