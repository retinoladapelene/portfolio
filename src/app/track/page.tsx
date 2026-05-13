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
  X,
  Download,
  FolderDown,
  ExternalLink,
  RefreshCcw
} from "lucide-react";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import { cn } from "@/lib/utils";
import { archiveCommission } from "@/utils/archive";

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
  // New Fields
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
  client_note?: string; // Existing sketch note
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
        // Queue info is now embedded in active orders
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
          icon: <Clock3 className="text-blue-500" size={14} />, 
          label: "In Queue", 
          desc: "Your order is waiting in the artist's queue. I'll review it soon!",
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          step: 1
        };
      case 'accepted':
        return { 
          icon: <ShieldCheck className="text-purple-500" size={14} />, 
          label: "Sketch & DP", 
          desc: "I've started your sketch! Please check below for the draft and DP 50% info.",
          color: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          step: 2
        };
      case 'in_progress':
        return { 
          icon: <Palette className="text-amber-500 animate-pulse" size={14} />, 
          label: "Mid Production", 
          desc: "Working on lineart and coloring. Check your WIP and 75% gate.",
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
          step: 3
        };
      case 'done':
        return { 
          icon: <CheckCircle2 className="text-emerald-500" size={14} />, 
          label: "Final & Delivered", 
          desc: "Artwork is 100% finished and delivered! Download below.",
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 font-outfit"
          >
            <Package size={14} className="text-purple-400" />
            Commission Tracking
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-normal text-[#1A1F2B] mb-6 tracking-tight font-dancing-script">
            Track Your <span className="text-purple-600">Artwork.</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed font-outfit">
            Enter your order ID to check the current status, queue position, and details of your commissions.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-purple-100 shadow-[0_20px_50px_rgba(168,85,247,0.1)] rounded-[32px] p-6 md:p-8 mb-12 relative overflow-hidden"
        >
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="relative group flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 group-focus-within:bg-purple-100 transition-colors">
                <Search size={16} className="text-purple-400 group-focus-within:text-purple-600 transition-colors" />
              </div>
              <input 
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Paste your 36-character Order ID..."
                className="w-full bg-slate-50/80 border border-slate-100 rounded-[24px] py-5 pl-16 pr-6 text-[15px] text-[#1A1F2B] placeholder:text-slate-400 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all font-outfit font-medium tracking-wide"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="md:w-auto w-full bg-[#1A1F2B] hover:bg-purple-600 text-white font-black px-10 py-5 rounded-[24px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-purple-900/10 hover:shadow-purple-600/20 text-[10px] uppercase tracking-[0.3em] font-outfit shrink-0"
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
                className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-center gap-4 text-rose-600 font-outfit text-center justify-center"
              >
                <AlertCircle size={20} className="text-rose-400" />
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
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-purple-400 shadow-[0_4px_12px_rgba(147,51,234,0.3)] flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              QUEUE #{queueInfo.pos} OF {queueInfo.total}
                            </motion.div>
                          )}
                        </div>
                        <h3 className="text-4xl font-normal text-[#1A1F2B] font-dancing-script">{order.commission_type}</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] font-outfit">
                          {order.art_style} Style • <span className="text-purple-500">${order.price}</span>
                        </p>
                      </div>
                      
                      <motion.div 
                        animate={order.status.toLowerCase() === 'pending' ? { y: [0, -4, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={cn(
                          "px-6 py-4 rounded-[20px] border flex items-center gap-3 shadow-md transition-all",
                          order.status.toLowerCase() === 'pending' 
                            ? "bg-purple-600 border-purple-500 text-white shadow-purple-200" 
                            : cn(statusInfo.bg, statusInfo.border)
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-full shadow-inner",
                          order.status.toLowerCase() === 'pending' ? "bg-white/20" : "bg-white"
                        )}>
                          {order.status.toLowerCase() === 'pending' 
                            ? <Clock3 className="text-white" size={14} /> 
                            : statusInfo.icon
                          }
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] font-outfit",
                          order.status.toLowerCase() === 'pending' ? "text-white" : statusInfo.color
                        )}>
                          {statusInfo.label}
                        </span>
                      </motion.div>
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
                                {step === 1 ? "Queue" : step === 2 ? "Sketch" : step === 3 ? "WIP" : "Done"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-12">
                      {/* Interactive Gates Section */}
                      {order.status !== 'pending' && (
                        <div className="space-y-12">
                          
                          {/* STAGE 1: SKETCH & DP 50% */}
                          <div className={cn(
                            "p-8 rounded-[32px] border transition-all duration-500",
                            order.sketch_status === 'approved' && order.dp_status === 'approved' ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50 border-slate-100"
                          )}>
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white border border-purple-100 flex items-center justify-center text-purple-500 shadow-sm">
                                  <Palette size={18} />
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Stage 1: Sketch & Deposit</h4>
                                  <p className="text-[10px] text-slate-400 font-medium">50% Initial Payment Required</p>
                                </div>
                              </div>
                              {order.sketch_status === 'approved' && order.dp_status === 'approved' && (
                                <span className="bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200">Completed</span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Sketch Review */}
                              <div className="space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">1. Sketch Review</p>
                                {order.rough_sketch_url ? (
                                  <div className="space-y-4">
                                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white">
                                      <img src={order.rough_sketch_url} alt="Rough Sketch" className="w-full aspect-square object-cover" />
                                      <button 
                                        onClick={() => window.open(order.rough_sketch_url, '_blank')}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs"
                                      >
                                        <ExternalLink size={14} /> View Large
                                      </button>
                                    </div>

                                    {order.client_note && (
                                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Your Revision Notes</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">{order.client_note}</p>
                                      </div>
                                    )}

                                    {order.sketch_status !== 'approved' && (
                                      <div className="space-y-3">
                                        <textarea 
                                          placeholder="Type revision notes if any..."
                                          value={feedbackTexts[`${order.id}-sketch`] || ""}
                                          onChange={(e) => setFeedbackTexts(prev => ({ ...prev, [`${order.id}-sketch`]: e.target.value }))}
                                          className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 focus:outline-none focus:border-purple-200 h-24"
                                        />
                                        <div className="flex gap-2">
                                          <button 
                                            onClick={() => handleSubmitFeedback(order.id, 'sketch', feedbackTexts[`${order.id}-sketch`] || "Approved", 'approved')}
                                            disabled={isSubmittingFeedback === `${order.id}-sketch`}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all"
                                          >
                                            {isSubmittingFeedback === `${order.id}-sketch` ? "..." : "Approve Sketch"}
                                          </button>
                                          <button 
                                            onClick={() => handleSubmitFeedback(order.id, 'sketch', feedbackTexts[`${order.id}-sketch`], 'revision')}
                                            disabled={!feedbackTexts[`${order.id}-sketch`] || isSubmittingFeedback === `${order.id}-sketch`}
                                            className="flex-1 bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all"
                                          >
                                            Revision
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                    <Clock size={24} className="mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Sketch</p>
                                  </div>
                                )}
                              </div>

                              {/* DP Payment */}
                              <div className="space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">2. DP 50% Status</p>
                                <div className="p-6 bg-white border border-slate-100 rounded-2xl space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Deposit 50%</span>
                                    <span className="text-[10px] font-black text-purple-600">${(order.price || 0) * 0.5}</span>
                                  </div>
                                  <div className="h-px bg-slate-50" />
                                  <div className="flex flex-col items-center justify-center py-4">
                                    {order.dp_status === 'approved' ? (
                                      <div className="flex flex-col items-center gap-2 text-emerald-500">
                                        <ShieldCheck size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Payment Confirmed</span>
                                      </div>
                                    ) : order.dp_proof_url ? (
                                      <div className="flex flex-col items-center gap-2 text-amber-500">
                                        <Clock size={24} className="animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Verification</span>
                                      </div>
                                    ) : (
                                      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                                        Please contact the artist via social media to arrange the 50% deposit payment.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* STAGE 2: WIP & MID-PAYMENT 75% */}
                          {(order.status === 'in_progress' || order.status === 'done') && (
                            <div className={cn(
                              "p-8 rounded-[32px] border transition-all duration-500",
                              order.wip_status === 'approved' && order.payment_75_status === 'approved' ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50 border-slate-100"
                            )}>
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-white border border-purple-100 flex items-center justify-center text-purple-500 shadow-sm">
                                    <Sparkles size={18} />
                                  </div>
                                  <div>
                                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Stage 2: Lineart/Color WIP</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">75% Milestone Payment Required</p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* WIP Review */}
                                <div className="space-y-4">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">1. WIP Feedback</p>
                                  {order.wip_artwork_url ? (
                                    <div className="space-y-4">
                                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white">
                                        <img src={order.wip_artwork_url} alt="WIP Progress" className="w-full aspect-square object-cover" />
                                        <button onClick={() => window.open(order.wip_artwork_url, '_blank')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs"><ExternalLink size={14} /> View Large</button>
                                      </div>
                                      {order.wip_status !== 'approved' && (
                                        <div className="space-y-3">
                                          <textarea 
                                            placeholder="Notes for lineart/coloring..."
                                            value={feedbackTexts[`${order.id}-wip`] || ""}
                                            onChange={(e) => setFeedbackTexts(prev => ({ ...prev, [`${order.id}-wip`]: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 focus:outline-none focus:border-purple-200 h-24"
                                          />
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => handleSubmitFeedback(order.id, 'wip', feedbackTexts[`${order.id}-wip`] || "Approved", 'approved')}
                                              disabled={isSubmittingFeedback === `${order.id}-wip`}
                                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all"
                                            >
                                              {isSubmittingFeedback === `${order.id}-wip` ? "..." : "Approve WIP"}
                                            </button>
                                            <button 
                                              onClick={() => handleSubmitFeedback(order.id, 'wip', feedbackTexts[`${order.id}-wip`], 'revision')}
                                              disabled={!feedbackTexts[`${order.id}-wip`] || isSubmittingFeedback === `${order.id}-wip`}
                                              className="flex-1 bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all"
                                            >
                                              Revision
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                      <Clock size={24} className="mb-2" />
                                      <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting WIP</p>
                                    </div>
                                  )}
                                </div>

                                {/* 75% Payment */}
                                <div className="space-y-4">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">2. 75% Payment Gate</p>
                                  <div className="p-6 bg-white border border-slate-100 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-500">Mid Payment (75% total)</span>
                                      <span className="text-[10px] font-black text-purple-600">${(order.price || 0) * 0.25} addition</span>
                                    </div>
                                    {order.payment_75_status === 'approved' ? (
                                      <div className="flex flex-col items-center gap-2 py-4 text-emerald-500">
                                        <CheckCircle2 size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Payment Approved</span>
                                      </div>
                                    ) : (
                                      <label className={cn(
                                        "w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
                                        order.payment_75_proof_url ? "border-amber-200 bg-amber-50/50" : "border-slate-100 hover:border-purple-200 bg-slate-50/30"
                                      )}>
                                        {isUploadingProof === `${order.id}-75` ? (
                                          <RefreshCcw size={20} className="animate-spin text-purple-500" />
                                        ) : order.payment_75_proof_url ? (
                                          <>
                                            <Clock size={20} className="text-amber-500 mb-1" />
                                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Proof Uploaded - Waiting</span>
                                          </>
                                        ) : (
                                          <>
                                            <Send size={18} className="text-slate-300 mb-1" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload 75% Proof</span>
                                          </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadProof(order.id, '75', e)} disabled={!!order.payment_75_proof_url} />
                                      </label>
                                    )}
                                    <p className="text-[8px] text-slate-400 text-center">Required to proceed to final detailing.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STAGE 3: FINAL PREVIEW & PELUNASAN 100% */}
                          {(order.status === 'in_progress' || order.status === 'done') && (
                            <div className={cn(
                              "p-8 rounded-[32px] border transition-all duration-500",
                              order.final_status === 'approved' && order.payment_100_status === 'approved' ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50 border-slate-100"
                            )}>
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-white border border-purple-100 flex items-center justify-center text-purple-500 shadow-sm">
                                    <ShieldCheck size={18} />
                                  </div>
                                  <div>
                                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Stage 3: Final Render & Pelunasan</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">100% Full Payment Required for High-Res</p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Final Preview Review */}
                                <div className="space-y-4">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">1. Watermarked Preview</p>
                                  {order.final_preview_url ? (
                                    <div className="space-y-4">
                                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white">
                                        <img src={order.final_preview_url} alt="Final Preview" className="w-full aspect-square object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                          <span className="text-[20px] font-black text-white/40 uppercase rotate-45 border-4 border-white/40 px-4 py-2">PREVIEW</span>
                                        </div>
                                      </div>
                                      {order.final_status !== 'approved' && (
                                        <div className="space-y-3">
                                          <textarea 
                                            placeholder="Last minute minor adjustments..."
                                            value={feedbackTexts[`${order.id}-final`] || ""}
                                            onChange={(e) => setFeedbackTexts(prev => ({ ...prev, [`${order.id}-final`]: e.target.value }))}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 focus:outline-none focus:border-purple-200 h-24"
                                          />
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => handleSubmitFeedback(order.id, 'final', feedbackTexts[`${order.id}-final`] || "Approved", 'approved')}
                                              disabled={isSubmittingFeedback === `${order.id}-final`}
                                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all"
                                            >
                                              Approve Final
                                            </button>
                                            <button 
                                              onClick={() => handleSubmitFeedback(order.id, 'final', feedbackTexts[`${order.id}-final`], 'revision')}
                                              disabled={!feedbackTexts[`${order.id}-final`] || isSubmittingFeedback === `${order.id}-final`}
                                              className="flex-1 bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest transition-all"
                                            >
                                              Revision
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                      <Clock size={24} className="mb-2" />
                                      <p className="text-[10px] font-bold uppercase tracking-widest">Processing Render</p>
                                    </div>
                                  )}
                                </div>

                                {/* 100% Payment */}
                                <div className="space-y-4">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">2. Final Payment Gate</p>
                                  <div className="p-6 bg-white border border-slate-100 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-500">Pelunasan (Sisa 25%)</span>
                                      <span className="text-[10px] font-black text-purple-600">${(order.price || 0) * 0.25}</span>
                                    </div>
                                    {order.payment_100_status === 'approved' ? (
                                      <div className="flex flex-col items-center gap-2 py-4 text-emerald-500">
                                        <CheckCircle2 size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Fully Paid</span>
                                      </div>
                                    ) : (
                                      <label className={cn(
                                        "w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
                                        order.payment_100_proof_url ? "border-amber-200 bg-amber-50/50" : "border-slate-100 hover:border-purple-200 bg-slate-50/30"
                                      )}>
                                        {isUploadingProof === `${order.id}-100` ? (
                                          <RefreshCcw size={20} className="animate-spin text-purple-500" />
                                        ) : order.payment_100_proof_url ? (
                                          <>
                                            <Clock size={20} className="text-amber-500 mb-1" />
                                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Proof Sent</span>
                                          </>
                                        ) : (
                                          <>
                                            <Send size={18} className="text-slate-300 mb-1" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Pelunasan Proof</span>
                                          </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadProof(order.id, '100', e)} disabled={!!order.payment_100_proof_url} />
                                      </label>
                                    )}
                                    <p className="text-[8px] text-slate-400 text-center uppercase tracking-widest">Upload proof to unlock High-Res file.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

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

                          {/* Download Actions - Only unlocked after 100% payment approval */}
                          {order.final_artwork_url && (
                            <div className="space-y-4 pt-4">
                              <div className="flex items-center gap-2 px-2">
                                <Sparkles className="text-emerald-500" size={14} />
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-outfit">
                                  {order.payment_100_status === 'approved' ? "Your Masterpiece is Ready" : "Artwork Finished - Locked"}
                                </h4>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.payment_100_status === 'approved' ? (
                                  <button
                                    onClick={() => window.open(order.final_artwork_url, '_blank')}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                                      <span className="text-[11px] uppercase tracking-[0.2em]">Download Artwork</span>
                                    </div>
                                    <span className="text-[8px] opacity-60 uppercase tracking-widest">High-Resolution PNG/JPG</span>
                                  </button>
                                ) : (
                                  <div className="w-full bg-slate-100 text-slate-400 font-black py-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                      <ShieldCheck size={18} className="opacity-40" />
                                      <span className="text-[11px] uppercase tracking-[0.2em]">Locked</span>
                                    </div>
                                    <span className="text-[8px] uppercase tracking-widest">Pending Full Payment Approval</span>
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => archiveCommission(order)}
                                  className="w-full bg-white border border-slate-100 hover:border-purple-200 text-slate-600 font-black py-6 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 shadow-sm group"
                                >
                                  <div className="flex items-center gap-3">
                                    <FolderDown size={18} className="text-purple-400 group-hover:translate-y-0.5 transition-transform" />
                                    <span className="text-[11px] uppercase tracking-[0.2em]">Project Archive</span>
                                  </div>
                                  <span className="text-[8px] text-slate-400 uppercase tracking-widest">ZIP (Includes References & Sketches)</span>
                                </button>
                              </div>
                            </div>
                          )}
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
