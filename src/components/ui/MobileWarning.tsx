"use client";

import { useState, useEffect } from "react";
import { X, Monitor, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Tampilkan popup jika lebar layar kurang dari 768px (ukuran tablet/mobile)
      if (window.innerWidth < 768) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    // Jalankan pengecekan saat pertama kali render
    checkMobile();
    
    // Dengarkan perubahan ukuran layar
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop gelap */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md"
            onClick={() => setShow(false)}
          />
          
          {/* Bottom Sheet style popup untuk mobile */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 border-t border-purple-500/30 rounded-t-3xl px-6 pb-8 pt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Grab handle decoration */}
            <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full mx-auto mb-6" />

            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
            
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-5 text-zinc-400 hover:text-white transition-colors z-10 p-2 bg-zinc-800/50 rounded-full"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col space-y-6 relative z-10 pt-2">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0">
                  <Monitor className="text-purple-400" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-syne font-bold text-white tracking-tight">
                    Gunakan Desktop (PC / Laptop)
                  </h3>
                  <p className="text-purple-300/80 text-sm font-medium mt-0.5">
                    Untuk Pengalaman Terbaik
                  </p>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 flex items-start space-x-3">
                <Smartphone className="text-zinc-400 shrink-0 mt-0.5" size={20} />
                <p className="text-zinc-300 text-sm leading-relaxed font-outfit">
                  Website ini dirancang dengan berbagai interaksi visual kompleks. Beberapa fitur mungkin tidak berjalan maksimal atau terlihat terpotong di layar HP Anda.
                </p>
              </div>
              
              <button
                onClick={() => setShow(false)}
                className="w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 active:from-purple-700 active:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] font-outfit active:scale-[0.98] text-base"
              >
                Tetap Lanjutkan
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
