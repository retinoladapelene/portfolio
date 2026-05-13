"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  LayoutDashboard, 
  ShoppingBag, 
  Trash2, 
  BarChart3, 
  Settings, 
  Info, 
  Image as ImageIcon, 
  Briefcase, 
  Milestone, 
  PenTool, 
  Tag, 
  Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GUIDE_CONTENT = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    icon: <LayoutDashboard size={18} />,
    color: 'purple',
    steps: [
      'Pantau statistik utama: Total Revenue, Pesanan Selesai, dan Antrean Aktif.',
      'Gunakan kartu ringkasan untuk melihat performa bisnis secara cepat.',
      'Tab ini adalah pusat informasi status operasional Moonchaery Studio.'
    ]
  },
  {
    id: 'orders',
    title: 'Managing Orders',
    icon: <ShoppingBag size={18} />,
    color: 'emerald',
    steps: [
      'Pesanan Baru: Muncul di "Waiting List". Klik "Accept" untuk memulai.',
      'WIP & Progress: Upload sketsa kasar dan WIP di sini untuk persetujuan klien.',
      'Final Artwork: Setelah lunas, upload file resolusi tinggi untuk diunduh klien.',
      'Selesai: Pesanan akan berpindah ke status "Completed".'
    ]
  },
  {
    id: 'gallery',
    title: 'Gallery (3D Exhibition)',
    icon: <ImageIcon size={18} />,
    color: 'indigo',
    steps: [
      'Kelola karya yang muncul di pameran 3D interaktif.',
      'Tambahkan artwork baru dengan judul, deskripsi, dan kategori.',
      'Hapus artwork yang sudah tidak ingin ditampilkan di pameran.'
    ]
  },
  {
    id: 'portfolio',
    title: 'Portfolio (Projects)',
    icon: <Briefcase size={18} />,
    color: 'purple',
    steps: [
      'Kelola daftar proyek utama di halaman "Project".',
      'Upload thumbnail dan detail proyek untuk menarik perhatian klien.',
      'Atur urutan tampilan karya terbaik kamu di sini.'
    ]
  },
  {
    id: 'journey',
    title: 'Personal Journey',
    icon: <Milestone size={18} />,
    color: 'amber',
    steps: [
      'Update timeline perjalanan karir kamu di halaman About.',
      'Tambahkan pencapaian, event, atau milestone penting.',
      'Ceritakan kisah di balik studio kamu kepada pengunjung.'
    ]
  },
  {
    id: 'sketchbook',
    title: 'Digital Sketchbook',
    icon: <PenTool size={18} />,
    color: 'pink',
    steps: [
      'Tempat untuk memamerkan coretan dan sketsa non-proyek.',
      'Memberikan kesan "behind the scene" kepada pengunjung.',
      'Upload sketsa harian atau latihan kamu di sini.'
    ]
  },
  {
    id: 'pricing',
    title: 'Pricing & Packages',
    icon: <Tag size={18} />,
    color: 'emerald',
    steps: [
      'Atur daftar harga dan paket komisi yang tersedia.',
      'Perubahan di sini akan langsung update di halaman depan.',
      'Pastikan harga selalu kompetitif dan deskripsi paket jelas.'
    ]
  },
  {
    id: 'health',
    title: 'System Health (Storage)',
    icon: <Activity size={18} />,
    color: 'rose',
    steps: [
      'Pantau penggunaan kuota penyimpanan (Supabase Storage).',
      'Pastikan sistem berjalan lancar tanpa kendala database.',
      'Lakukan pembersihan berkala jika kuota hampir penuh.'
    ]
  },
  {
    id: 'recycle-bin',
    title: 'Recycle Bin (Archive)',
    icon: <Trash2 size={18} />,
    color: 'rose',
    steps: [
      'Tempat sampah sementara untuk pesanan yang sudah selesai.',
      'Data akan terhapus otomatis setelah 10 hari.',
      'Klik "Restore" untuk membatalkan penghapusan data.'
    ]
  },
  {
    id: 'stats',
    title: 'Engagement Analytics',
    icon: <BarChart3 size={18} />,
    color: 'indigo',
    steps: [
      'Analisis trafik pengunjung dan interaksi klien secara real-time.',
      'Lihat trend kunjungan harian dan halaman terpopuler.',
      'Gunakan data ini untuk strategi promosi selanjutnya.'
    ]
  }
];

export const AdminGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.4)] flex items-center justify-center z-[100] group overflow-hidden border border-white/20"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <HelpCircle size={28} className="relative z-10" />
      </motion.button>

      {/* Guide Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#05070A]/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-dark w-full max-w-4xl max-h-[85vh] rounded-[40px] border border-white/10 relative z-10 flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tighter">Moonchaery Guidebook</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Panduan Penggunaan Dashboard Admin</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation - SCROLLABLE */}
                <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar shrink-0 bg-black/10">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 px-3">Semua Tab</span>
                  {GUIDE_CONTENT.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group shrink-0",
                        activeTab === item.id 
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                          : "text-white/40 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg shrink-0",
                        activeTab === item.id ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider truncate">{item.id.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {GUIDE_CONTENT.filter(c => c.id === activeTab).map((content) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center gap-4">
                           <h3 className="text-3xl font-black text-white tracking-tighter">{content.title}</h3>
                        </div>
                        
                        <div className="space-y-6">
                          {content.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-5 group">
                              <div className="mt-1 shrink-0">
                                <div className="w-6 h-6 rounded-full border border-purple-500/30 flex items-center justify-center text-[11px] font-black text-purple-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all">
                                  {idx + 1}
                                </div>
                              </div>
                              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white transition-colors">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-12 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-start gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                              <Info size={24} />
                           </div>
                           <div>
                              <p className="text-[12px] font-black uppercase tracking-widest text-amber-500/80 mb-2">Pro Tip</p>
                              <p className="text-xs text-white/30 leading-relaxed italic">
                                Selalu pastikan status pembayaran (DP/Lunas) sebelum melanjutkan ke tahap berikutnya untuk menjaga keamanan transaksi studio kamu.
                              </p>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center shrink-0">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Moonchaery Studio &copy; 2026 • Design by Antigravity</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
