"use client";

import { useState, useEffect } from "react";
import { Cpu, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Blokir jika lebar layar kurang dari 768px
      if (window.innerWidth < 768) {
        setShow(true);
        document.body.style.overflow = "hidden"; // Kunci scroll
      } else {
        setShow(false);
        document.body.style.overflow = "auto";
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#05070A] flex flex-col items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-900/20 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm glass-dark p-8 rounded-[32px] border border-white/10 text-center flex flex-col items-center shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-purple-500/5 rounded-[32px] pointer-events-none" />
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
          <div className="w-20 h-20 rounded-2xl bg-zinc-900/80 flex items-center justify-center border border-white/10 shadow-xl relative z-10">
            <Cpu className="text-white" size={40} />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center border-2 border-[#05070A] shadow-lg">
              <AlertCircle className="text-white" size={14} />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-syne font-bold text-white tracking-tight mb-3">
          Performa Terbatas
        </h2>
        
        <p className="text-zinc-400 text-sm leading-relaxed font-outfit mb-6">
          Sistem mendeteksi spesifikasi perangkat saat ini kurang memadai untuk merender aset 3D resolusi tinggi dan efek visual secara real-time.
        </p>

        <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
            Gunakan PC / Laptop
          </p>
          <p className="text-xs text-white/40">
            Untuk menghindari crash dan kinerja yang lambat, mohon akses ulang website ini menggunakan komputer Anda.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
