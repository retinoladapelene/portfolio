"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  showInput?: boolean;
  inputPlaceholder?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  showInput = false,
  inputPlaceholder = "Type something..."
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!isOpen) setInputValue("");
  }, [isOpen]);

  if (!mounted) return null;

  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Outer Overlay / Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-[12px]"
            style={{
              background: `
                radial-gradient(circle at top left, rgba(196,181,253,0.12), transparent 40%),
                radial-gradient(circle at bottom right, rgba(167,139,250,0.15), transparent 35%),
                rgba(255,255,255,0.4)
              `
            }}
          />
          
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ scale: 0.94, opacity: 0, y: 30, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: "32px",
              boxShadow: "0 24px 80px rgba(139,92,246,0.15), 0 8px 32px rgba(0,0,0,0.06)"
            }}
          >
            {/* Background Glows */}
            <div className={cn(
                "absolute -top-12 -right-12 w-48 h-48 blur-[80px] opacity-40 pointer-events-none",
                isDanger ? "bg-red-400" : "bg-purple-400"
            )} />

            <div className="relative z-10 p-10 flex flex-col items-center text-center">
              {/* Top Icon Section */}
              <motion.div 
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={cn(
                    "w-20 h-20 rounded-[24px] flex items-center justify-center mb-8 relative group",
                    isDanger ? "bg-red-50" : "bg-purple-50"
                )}
              >
                <div className={cn(
                    "absolute inset-0 rounded-[24px] opacity-40 blur-lg group-hover:blur-xl transition-all",
                    isDanger ? "bg-red-400" : "bg-purple-400"
                )} />
                <div className="relative z-10">
                    {isDanger ? (
                        <LogOut size={32} className="text-red-500" strokeWidth={1.5} />
                    ) : (
                        <Info size={32} className="text-purple-600" strokeWidth={1.5} />
                    )}
                </div>
              </motion.div>
              
              <div className="space-y-4 mb-8">
                <h3 className={cn(
                    "text-3xl font-syne font-extrabold tracking-tighter leading-none",
                    isDanger ? "text-[#1A1F2B]" : "text-purple-950"
                )}>
                  {title}
                </h3>
                <p className="text-sm font-outfit text-slate-500/80 leading-relaxed max-w-[280px] mx-auto">
                  {message}
                </p>
              </div>

              {showInput && (
                <div className="w-full mb-8">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={inputPlaceholder}
                    className="w-full bg-white/50 border border-purple-500/10 rounded-2xl p-5 text-sm font-outfit text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all min-h-[120px] resize-none"
                    autoFocus
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex w-full gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/40 border border-white/60 text-[#1A1F2B]/60 font-outfit font-black text-[10px] tracking-[0.2em] uppercase hover:bg-white/60 transition-all hover:text-[#1A1F2B]"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm(showInput ? inputValue : undefined);
                    onClose();
                  }}
                  className={cn(
                    "flex-1 py-4 px-6 rounded-2xl text-white font-outfit font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-lg active:scale-95",
                    isDanger 
                      ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-200"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            {/* Subtle Detail Frame */}
            <div className="absolute inset-4 border border-white/20 rounded-[24px] pointer-events-none" />
            
            {/* Corner Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-[#1A1F2B] transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
