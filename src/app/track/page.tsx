"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Package,
  Mail,
  Palette,
  Info,
  ShieldCheck,
  Send,
  User,
  Clock3,
  Camera,
  X
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { cn } from "@/lib/utils";

type Commission = {
  id: string;
  client_name: string;
  commission_type: string;
  art_style: string;
  status: string;
  created_at: string;
  price?: number;
  social_media?: string;
  description?: string;
  queuePosition?: number;
  totalQueue?: number;
};

export default function TrackOrder() {
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<Commission[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueInfo, setQueueInfo] = useState<{pos: number, total: number} | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setQueueInfo(null);

    try {
      const res = await fetch(`/api/commissions/check-active?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (data.orders && data.orders.length > 0) {
        setResults(data.orders);
        // Queue info is now embedded in active orders
        const activeOrder = data.orders.find((o: any) => o.status !== 'done');
        if (activeOrder) {
          setQueueInfo({ pos: activeOrder.queuePosition, total: activeOrder.totalQueue });
        }
      } else {
        setError("No commissions found for this email address.");
      }
    } catch (err) {
      setError("Failed to track order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending':
        return { 
          icon: <Clock3 className="text-blue-500" size={14} />, 
          label: "Pending", 
          desc: "Your order has been received and is waiting in the queue.",
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          step: 1
        };
      case 'accepted':
        return { 
          icon: <ShieldCheck className="text-purple-500" size={14} />, 
          label: "Order Accepted", 
          desc: "I have reviewed and accepted your commission request!",
          color: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          step: 2
        };
      case 'in_progress':
        return { 
          icon: <Palette className="text-amber-500 animate-pulse" size={14} />, 
          label: "Process", 
          desc: "The artist is currently working on your masterpiece!",
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
          step: 3
        };
      case 'done':
        return { 
          icon: <CheckCircle2 className="text-emerald-500" size={14} />, 
          label: "Done", 
          desc: "Your artwork is finished! Check your email for delivery.",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          step: 4
        };
      default:
        return { 
          icon: <Info className="text-slate-400" size={14} />, 
          label: "Processing", 
          desc: "Updating order status...",
          color: "text-slate-600",
          bg: "bg-slate-50",
          border: "border-slate-100",
          step: 0
        };
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-400/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 100, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-200/5 blur-[150px] rounded-full" 
        />
      </div>

      <div className="relative z-10 pt-40 pb-24 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 font-outfit"
          >
            <Package size={14} className="text-purple-400" />
            Commission Tracking
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-normal text-white mb-6 tracking-tight font-dancing-script">
            Track Your <span className="text-purple-400">Artwork.</span>
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed font-outfit">
            Enter your email address to check the current status, queue position, and details of your commissions.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-purple-100 shadow-[0_20px_50px_rgba(168,85,247,0.1)] rounded-[32px] p-6 mb-12 relative overflow-hidden"
        >
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="relative group">
              <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-300 transition-colors group-focus-within:text-purple-500" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tyo290704@gmail.com"
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-[15px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-purple-200 transition-all font-outfit"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1A1F2B] hover:bg-purple-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl text-[10px] uppercase tracking-[0.3em] font-outfit"
            >
              {loading ? "SEARCHING..." : "TRACK STATUS"}
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex items-center gap-4 text-white font-outfit text-center justify-center"
              >
                <AlertCircle size={20} className="text-red-400" />
                <p className="font-bold text-[13px] uppercase tracking-wider">{error}</p>
              </motion.div>
            )}

            {results && results.map((order, i) => {
              const statusInfo = getStatusInfo(order.status);
              const isHistory = order.status.toLowerCase() === 'done';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-purple-100 shadow-[0_30px_60px_rgba(168,85,247,0.15)] rounded-[32px] overflow-hidden"
                >
                  <div className="p-8 border-b border-purple-50">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest font-outfit">ID: {order.id.slice(0, 8)}</span>
                          {!isHistory && queueInfo && (
                            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest border border-purple-100">
                              QUEUE #{queueInfo.pos} OF {queueInfo.total}
                            </span>
                          )}
                        </div>
                        <h3 className="text-4xl font-normal text-[#1A1F2B] font-dancing-script">{order.commission_type}</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] font-outfit">
                          {order.art_style} Style • <span className="text-purple-500">${order.price}</span>
                        </p>
                      </div>
                      
                      <div className={cn(
                        "px-6 py-4 rounded-[20px] border flex items-center gap-3 shadow-sm",
                        statusInfo.bg, statusInfo.border
                      )}>
                        <div className="p-2 bg-white rounded-full shadow-inner">
                          {statusInfo.icon}
                        </div>
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] font-outfit", statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-10">
                    <div className="relative pt-4 pb-4">
                      <div className="absolute top-[1.35rem] left-2 right-2 h-[3px] bg-slate-100 rounded-full" />
                      
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="absolute top-[1.35rem] left-2 h-[3px] bg-purple-500 rounded-full z-0" 
                      />

                      <div className="relative flex justify-between">
                        {[1, 2, 3, 4].map((step) => {
                          const isActive = statusInfo.step >= step;
                          const isCurrent = statusInfo.step === step;
                          return (
                            <div key={step} className="flex flex-col items-center gap-4">
                              <div className="relative">
                                {isCurrent && (
                                  <motion.div 
                                    layoutId="pulse"
                                    className="absolute inset-0 bg-purple-400/30 rounded-full scale-[3]"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                )}
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full border-2 transition-all duration-700 z-10 relative",
                                  isActive ? "bg-purple-500 border-purple-500" : "bg-white border-slate-200",
                                  isCurrent ? "scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : ""
                                )} />
                              </div>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.2em] font-outfit",
                                isActive ? "text-purple-600" : "text-slate-300"
                              )}>
                                {step === 1 ? "Pending" : step === 2 ? "Accepted" : step === 3 ? "Process" : "Done"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="text-purple-300" size={14} />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-outfit">Current Progress</h4>
                          </div>
                          <div className={cn("p-5 rounded-2xl border font-outfit", statusInfo.bg, statusInfo.border)}>
                            <p className={cn("text-[13px] font-bold mb-2", statusInfo.color)}>{statusInfo.label}</p>
                            <p className="text-slate-500 text-[12px] leading-relaxed">{statusInfo.desc}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="text-purple-300" size={14} />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-outfit">Order Details</h4>
                          </div>
                          <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl font-outfit min-h-[100px]">
                            <p className="text-slate-600 text-[12px] leading-relaxed italic">
                              "{order.description || "No specific instructions provided."}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {!isHistory && (
                        <div className="relative pt-6">
                           <div className="absolute top-0 left-6 px-4 py-1.5 bg-white border border-purple-100 rounded-full shadow-sm z-10 flex items-center gap-2">
                             <Sparkles size={12} className="text-purple-500" />
                             <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest font-outfit">Note from Artist</span>
                           </div>
                           <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-8 pt-10 shadow-sm">
                             <p className="text-slate-600 text-[15px] leading-relaxed italic font-dancing-script">
                                {order.status === 'pending' ? "I'll review your request soon! Please make sure your references are clear." :
                                order.status === 'accepted' ? "Order accepted! I'm getting things ready to start drawing." :
                                "I'm currently focused on your artwork. I'll notify you if I need any clarification!"}
                             </p>
                           </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-4 pt-4">
                        <div className="flex items-center justify-between px-2 text-[10px] font-black text-slate-300 uppercase tracking-widest font-outfit">
                          <p>Ordered on: <span className="text-slate-400">{new Date(order.created_at).toLocaleDateString()}</span></p>
                          <p>Client: <span className="text-slate-400">{order.client_name}</span></p>
                        </div>
                        
                        <div className="h-px bg-slate-100 w-full" />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <a 
                            href="https://x.com/messages/compose?screen_name=Zarry_linilo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#1A1F2B] hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.2em] font-outfit shadow-lg group"
                          >
                            <X size={14} className="group-hover:scale-110 transition-transform" />
                            CONTACT VIA X
                          </a>
                          <a 
                            href="https://ig.me/m/cuancapital.id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#1A1F2B] hover:bg-purple-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.2em] font-outfit shadow-lg group"
                          >
                            <Camera size={14} className="group-hover:scale-110 transition-transform" />
                            CONTACT VIA IG DM
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
