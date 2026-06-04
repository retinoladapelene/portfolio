"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from "lucide-react";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "neural";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-10 left-10 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ x: -100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -100, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="pointer-events-auto"
            >
              <div className={cn(
                "group relative px-6 py-4 rounded-[24px] border backdrop-blur-xl shadow-2xl flex items-center gap-4 min-w-[300px] overflow-hidden",
                t.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                t.type === "error" && "bg-red-500/10 border-red-500/20 text-red-400",
                t.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                t.type === "neural" && "bg-purple-500/10 border-purple-500/20 text-purple-400"
              )}>
                {/* Background Glow */}
                <div className={cn(
                  "absolute inset-0 opacity-10 blur-xl -z-10",
                  t.type === "success" && "bg-emerald-500",
                  t.type === "error" && "bg-red-500",
                  t.type === "info" && "bg-blue-500",
                  t.type === "neural" && "bg-purple-500"
                )} />

                <div className="shrink-0">
                  {t.type === "success" && <CheckCircle2 size={18} />}
                  {t.type === "error" && <AlertCircle size={18} />}
                  {t.type === "info" && <Info size={18} />}
                  {t.type === "neural" && <Sparkles size={18} className="animate-pulse" />}
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">
                    {t.type === "neural" ? "Studio Update" : "Notification"}
                  </p>
                  <p className="text-[11px] font-bold tracking-wide leading-tight text-white/90">
                    {t.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(t.id)}
                  className="p-1 hover:bg-white/5 rounded-full transition-colors opacity-40 hover:opacity-100"
                >
                  <X size={14} />
                </button>

                {/* Progress Bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={cn(
                    "absolute bottom-0 left-0 h-[2px]",
                    t.type === "success" && "bg-emerald-500",
                    t.type === "error" && "bg-red-500",
                    t.type === "info" && "bg-blue-500",
                    t.type === "neural" && "bg-purple-500"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
