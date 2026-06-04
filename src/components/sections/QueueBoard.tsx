"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QueueItem {
  id: string;
  maskedName: string;
  queueNumber: string;
  type: string;
  phase: string;
  progress: number;
  status: 'pending' | 'active';
}

interface CompletedItem {
  id: string;
  maskedName: string;
  type: string;
  phase: string;
  progress: number;
}

interface QueueData {
  commissionsOpen: boolean;
  maxSlots: number;
  activeSlotsTaken: number;
  slotsAvailable: number;
  queue: QueueItem[];
  completed: CompletedItem[];
}

export default function QueueBoard() {
  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'completed'>('queue');

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/commissions/queue');
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        console.error("Failed to load queue data:", result.error);
      }
    } catch (err) {
      console.error("Error fetching queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-slate-50/50 relative overflow-hidden flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="font-outfit text-sm text-slate-500 tracking-wider uppercase font-medium">Loading Studio Status...</p>
        </div>
      </section>
    );
  }

  const queue = data?.queue || [];
  const completed = data?.completed || [];
  const maxSlots = data?.maxSlots || 5;
  const activeSlotsTaken = data?.activeSlotsTaken || 0;
  const slotsAvailable = data?.slotsAvailable ?? 5;
  const commissionsOpen = data?.commissionsOpen ?? true;

  // Frame animations
  const cardVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <section id="queue" className="py-24 bg-gradient-to-b from-white to-slate-50/60 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100/50 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${commissionsOpen ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${commissionsOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-outfit text-[11px] font-bold uppercase tracking-widest text-purple-700">
              {commissionsOpen ? "Commissions Open" : "Commissions Full / Paused"}
            </span>
          </div>
          <h2 className="font-outfit text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Studio Status & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600">Live Queue</span>
          </h2>
          <p className="font-outfit max-w-xl mx-auto text-base text-slate-500">
            Real-time status of current active commissions. Transparency at every brush stroke.
          </p>
        </div>

        {/* Live Slot Occupancy & General Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Active Slots Tracker */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white/60 border border-purple-100/50 backdrop-blur-md shadow-[0_8px_30px_rgb(120,119,198,0.03)] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-outfit font-extrabold text-lg text-slate-900">Active Work Slots</h3>
                <span className="font-outfit text-xs font-semibold text-slate-500">
                  {activeSlotsTaken} of {maxSlots} occupied
                </span>
              </div>
              <p className="font-outfit text-xs text-slate-500 mb-6">
                To guarantee high-fidelity details, only {maxSlots} commission projects are crafted simultaneously.
              </p>
            </div>

            {/* Premium Slot Circles Visualizer */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {Array.from({ length: maxSlots }).map((_, idx) => {
                  const isTaken = idx < activeSlotsTaken;
                  return (
                    <motion.div 
                      key={idx}
                      className={`w-5 h-5 rounded-full border-2 ${
                        isTaken 
                          ? 'bg-purple-600 border-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.4)]' 
                          : 'border-slate-300 bg-transparent'
                      }`}
                      animate={isTaken ? { scale: [1, 1.05, 1] } : {}}
                      transition={isTaken ? { repeat: Infinity, duration: 3, delay: idx * 0.2 } : {}}
                    />
                  );
                })}
              </div>
              <div className="text-xs font-semibold text-purple-700 font-outfit uppercase tracking-widest pl-2">
                {slotsAvailable > 0 ? `${slotsAvailable} slots vacant` : 'Full Queue'}
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="p-8 rounded-3xl bg-purple-900 text-white shadow-[0_8px_30px_rgba(88,28,135,0.15)] flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-outfit font-extrabold text-lg">Next Batch Delivery</h3>
              <p className="font-outfit text-xs text-purple-200/90">
                Average production turnaround time per batch is 7 to 14 business days.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-purple-800 flex justify-between items-end">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-300 font-outfit">Estimated Wait</span>
                <span className="font-outfit font-black text-2xl tracking-tight">~ 10 Days</span>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent("openOrderForm"))}
                className="px-4 py-2 bg-white text-purple-950 font-outfit font-bold text-xs rounded-xl shadow hover:bg-purple-50 transition-all duration-300"
              >
                Secure Slot
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Queue Grid / List Board */}
        <div className="bg-white/60 border border-purple-100/50 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(120,119,198,0.03)] overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-3 px-4 font-outfit font-bold text-sm tracking-wide uppercase rounded-2xl transition-all duration-300 ${
                activeTab === 'queue'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active Queue ({queue.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-3 px-4 font-outfit font-bold text-sm tracking-wide uppercase rounded-2xl transition-all duration-300 ${
                activeTab === 'completed'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recently Completed ({completed.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'queue' ? (
                <motion.div
                  key="queue-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {queue.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-outfit text-sm">
                      No active commissions in the queue. Commissions are currently open!
                    </div>
                  ) : (
                    queue.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        custom={idx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-100/80 hover:shadow-md hover:border-purple-100 transition-all duration-300 gap-4"
                      >
                        {/* Client details & Type */}
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 font-outfit font-bold text-sm flex items-center justify-center border border-purple-100">
                            {item.queueNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-outfit font-black text-slate-800">{item.maskedName}</span>
                              {item.status === 'active' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 font-outfit uppercase tracking-wider animate-pulse">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <span className="block font-outfit text-xs text-slate-400 mt-0.5">{item.type}</span>
                          </div>
                        </div>

                        {/* Progress and Phase status */}
                        <div className="sm:text-right flex flex-col justify-center sm:items-end space-y-1">
                          <div className="flex justify-between sm:justify-end items-center gap-3">
                            <span className="font-outfit font-semibold text-xs text-slate-700">{item.phase}</span>
                            <span className="font-outfit font-black text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">{item.progress}%</span>
                          </div>
                          {/* Visual progress bar */}
                          <div className="w-full sm:w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="completed-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {completed.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-outfit text-sm">
                      No recently completed commissions to display.
                    </div>
                  ) : (
                    completed.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        custom={idx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50 gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-outfit font-bold text-sm flex items-center justify-center border border-emerald-100">
                            ✓
                          </div>
                          <div>
                            <span className="font-outfit font-black text-slate-700">{item.maskedName}</span>
                            <span className="block font-outfit text-xs text-slate-400 mt-0.5">{item.type}</span>
                          </div>
                        </div>

                        <div className="sm:text-right flex items-center gap-3">
                          <span className="font-outfit font-bold text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Delivered
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
