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
  Palette,
  Info,
  ShieldCheck,
  Send,
  User,
  Clock3,
  Camera,
  X,
  ExternalLink,
  RefreshCcw,
  LayoutDashboard,
  Cpu
} from "lucide-react";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
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
  totalQueue?: number;
  final_artwork_url?: string;
  rough_sketch_url?: string;
  dp_proof_url?: string;
  reference_images?: string[];
  reference_link?: string;
  wip_artwork_url?: string;
  final_preview_url?: string;
  payment_75_proof_url?: string;
  payment_100_proof_url?: string;
  wip_feedback?: string;
  final_feedback?: string;
  wip_status?: string;
  final_status?: string;
  payment_75_status?: string;
  payment_100_status?: string;
  client_note?: string; 
  sketch_status?: string;
  dp_status?: string;
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [results, setResults] = useState<Commission[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueInfo, setQueueInfo] = useState<{pos: number, total: number} | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<string | null>(null);
  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>({});

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setQueueInfo(null);

    try {
      const res = await fetch(`/api/commissions/check-active?orderId=${encodeURIComponent(orderId.trim())}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to track order. Please try again later.");
        return;
      }

      if (data.orders && data.orders.length > 0) {
        setResults(data.orders);
        const activeOrder = data.orders.find((o: any) => o.status !== 'done');
        if (activeOrder) {
          setQueueInfo({ pos: activeOrder.queuePosition, total: activeOrder.totalQueue });
        }
      } else {
        setError("No commission found with this Order ID. Please check your confirmation email.");
      }
    } catch (err) {
      setError("Failed to track order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (id: string, stage: '75' | '100', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }
    setIsUploadingProof(`${id}-${stage}`);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/commissions/update-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, [`payment${stage}Base64`]: base64 })
        });
        const data = await res.json();
        if (data.success) {
          setResults(prev => prev ? prev.map(o => o.id === id ? data.data : o) : null);
        } else {
          alert(data.error || "Failed to upload proof");
        }
        setIsUploadingProof(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Error uploading proof");
      setIsUploadingProof(null);
    }
  };

  const handleSubmitFeedback = async (id: string, stage: 'sketch' | 'wip' | 'final', feedback: string, status: 'approved' | 'revision') => {
    setIsSubmittingFeedback(`${id}-${stage}`);
    try {
      const field = stage === 'sketch' ? 'client_note' : `${stage}_feedback`;
      const statusField = stage === 'sketch' ? 'sketch_status' : `${stage}_status`;

      const res = await fetch('/api/commissions/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          [field]: feedback,
          [statusField]: status
        })
      });
      const data = await res.json();
      if (data.success) {
        setResults(prev => prev ? prev.map(o => o.id === id ? data.data : o) : null);
      } else {
        alert(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      alert("Error submitting feedback");
    } finally {
      setIsSubmittingFeedback(null);
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending':
        return { 
          icon: <Clock3 className="text-purple-500" size={14} />, 
          label: "In Queue", 
          desc: "Your order is waiting in the artist's queue.",
          color: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          step: 1
        };
      case 'accepted':
        return { 
          icon: <ShieldCheck className="text-purple-500" size={14} />, 
          label: "Draft Stage", 
          desc: "Initial sketch and deposit phase.",
          color: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          step: 2
        };
      case 'in_progress':
        return { 
          icon: <Palette className="text-purple-500" size={14} />, 
          label: "Production", 
          desc: "Mid-production coloring and detailing.",
          color: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          step: 3
        };
      case 'done':
        return { 
          icon: <CheckCircle2 className="text-emerald-500" size={14} />, 
          label: "Delivered", 
          desc: "Artwork is finished and delivered.",
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
    <div className="min-h-screen bg-white font-outfit">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-50 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10 pt-40 pb-24 px-4 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-12 bg-purple-600" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.5em] font-mono">Archive Access</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85] will-change-transform">
            Commission<br />
            <span className="text-purple-600 italic">Tracking.</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-xl font-medium leading-relaxed">
            Enter your 36-character Order ID to retrieve current status, queue position, and project archives.
          </p>
        </div>

        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] border border-slate-100 p-2 shadow-2xl shadow-purple-500/5 mb-20 group transition-all duration-500 hover:border-purple-200"
        >
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Paste Order ID..."
                className="w-full bg-slate-50 group-focus-within:bg-white rounded-[32px] py-6 pl-16 pr-6 text-base font-bold text-slate-950 placeholder:text-slate-300 focus:outline-none transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="md:w-auto w-full bg-slate-950 hover:bg-purple-600 text-white font-black px-12 py-6 rounded-[32px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-[10px] uppercase tracking-[0.4em]"
            >
              {loading ? "SEARCHING..." : "TRACK STATUS"}
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8 rounded-[32px] bg-red-50 border border-red-100 text-red-600 flex items-center gap-4 justify-center"
            >
              <AlertCircle size={20} />
              <p className="font-black text-xs uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          {results && results.map((order, i) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Main Order Card */}
                <div className="bg-white rounded-[48px] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-purple-500/5 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between gap-12">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">ID: {order.id.slice(0, 8)}...</span>
                        {queueInfo && order.status !== 'done' && (
                          <span className="px-4 py-1 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                             Queue #{queueInfo.pos}
                          </span>
                        )}
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black text-slate-950 uppercase tracking-tighter leading-none">
                        {order.commission_type}<br />
                        <span className="text-purple-600 italic">{order.art_style}.</span>
                      </h2>
                      <p className="text-slate-500 font-bold text-sm">
                        Total Valuation: <span className="text-slate-950">IDR {(order.price || 0).toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="md:w-64 space-y-4">
                      <div className={cn(
                        "p-8 rounded-[32px] border flex flex-col gap-4 transition-all duration-500",
                        statusInfo.bg, statusInfo.border
                      )}>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                          {statusInfo.icon}
                        </div>
                        <div>
                          <p className={cn("text-xs font-black uppercase tracking-widest", statusInfo.color)}>{statusInfo.label}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{statusInfo.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="mt-16 md:mt-24 relative">
                    <div className="absolute top-[1.35rem] left-2 right-2 h-[2px] bg-slate-100 rounded-full" />
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
                      className="absolute top-[1.35rem] left-2 h-[2px] bg-purple-600 rounded-full z-0" 
                    />
                    <div className="relative flex justify-between">
                      {[1, 2, 3, 4].map((step) => {
                        const isActive = statusInfo.step >= step;
                        return (
                          <div key={step} className="flex flex-col items-center gap-4">
                            <div className={cn(
                              "w-3 h-3 rounded-full border-2 transition-all duration-700 z-10 bg-white",
                              isActive ? "border-purple-600 bg-purple-600" : "border-slate-200"
                            )} />
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-[0.2em]",
                              isActive ? "text-purple-600" : "text-slate-300"
                            )}>
                              {step === 1 ? "Queue" : step === 2 ? "Draft" : step === 3 ? "WIP" : "Done"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Interaction Gates (Minimalist) */}
                {order.status !== 'pending' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Sketch Card */}
                     <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                           <h4 className="text-xs font-black uppercase tracking-widest text-slate-950">Draft Phase</h4>
                           <Palette size={16} className="text-purple-500" />
                        </div>
                        {order.rough_sketch_url ? (
                           <div className="space-y-4">
                              <div className="relative group aspect-square rounded-[32px] overflow-hidden border border-slate-100">
                                 <img src={order.rough_sketch_url} alt="Sketch" className="w-full h-full object-cover" />
                                 <button onClick={() => window.open(order.rough_sketch_url, '_blank')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs"><ExternalLink size={14} /> Open Archive</button>
                              </div>
                              {order.sketch_status !== 'approved' && (
                                <div className="flex gap-2 pt-2">
                                   <button onClick={() => handleSubmitFeedback(order.id, 'sketch', "Approved", 'approved')} className="flex-1 bg-slate-950 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-purple-600 transition-colors">Approve Draft</button>
                                </div>
                              )}
                           </div>
                        ) : (
                          <div className="aspect-square rounded-[32px] bg-slate-50 flex flex-col items-center justify-center text-slate-300 border border-slate-100">
                             <Cpu size={24} className="mb-2 animate-pulse" />
                             <p className="text-[9px] font-black uppercase tracking-widest">Generating Concept...</p>
                          </div>
                        )}
                     </div>

                     {/* Actions Card */}
                     <div className="bg-slate-950 rounded-[40px] p-8 text-white flex flex-col justify-between">
                        <div className="space-y-6">
                           <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Contact Channels</h4>
                           <div className="grid grid-cols-1 gap-3">
                              <a href="https://x.com/messages/compose?screen_name=Zarry_linilo" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                 <span className="text-xs font-bold">X Messaging</span>
                                 <X size={16} className="text-slate-500 group-hover:text-white" />
                              </a>
                              <a href="https://ig.me/m/cuancapital.id" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                 <span className="text-xs font-bold">Instagram DM</span>
                                 <Camera size={16} className="text-slate-500 group-hover:text-white" />
                              </a>
                           </div>
                        </div>
                        <div className="pt-8 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Support Access</span>
                              <span className="text-[10px] font-bold">MS-SECURE-V1</span>
                           </div>
                           <ShieldCheck size={20} className="text-purple-500" />
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
