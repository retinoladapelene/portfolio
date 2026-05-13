"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  XCircle, 
  LayoutDashboard, 
  Clock, 
  Sparkles as SparklesIcon, 
  Users, 
  Image as ImageIcon, 
  RefreshCcw, 
  ExternalLink, 
  CreditCard as CardIcon,
  Check,
  Edit2,
  Save,
  Ban,
  Tag,
  Upload
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Commission } from "@/types/admin";

interface MessageHubModalProps {
  show: boolean;
  commission: Commission | null;
  onClose: () => void;
  activeStageTab: 'dp' | 'wip' | 'final' | 'delivery';
  setActiveStageTab: (tab: 'dp' | 'wip' | 'final' | 'delivery') => void;
  isUploadingSketch: boolean;
  isUploadingWIP: boolean;
  isUploadingFinalPreview: boolean;
  isUploadingFinalArtwork: boolean;
  handleSketchUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWIPUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFinalPreviewUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFinalArtworkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirmPayment: (id: string, stage: 'dp' | '75' | '100', isApproved: boolean) => void;
  resolveFeedback: (id: string, stage: 'sketch' | 'wip' | 'final' | 'delivery') => void;
  updatePrice: (id: string, newPrice: number) => void;
  isProcessingPayment: string | null;
}

const MessageHubModal = ({
  show,
  commission,
  onClose,
  activeStageTab,
  setActiveStageTab,
  isUploadingSketch,
  isUploadingWIP,
  isUploadingFinalPreview,
  isUploadingFinalArtwork,
  handleSketchUpload,
  handleWIPUpload,
  handleFinalPreviewUpload,
  handleFinalArtworkUpload,
  isProcessingPayment,
  confirmPayment,
  resolveFeedback,
  updatePrice
}: MessageHubModalProps) => {
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  useEffect(() => {
    if (commission) {
      setEditingPrice(commission.price.toString());
    }
  }, [commission]);

  if (!show || !commission) return null;

  const handleSavePrice = () => {
    const numPrice = parseFloat(editingPrice);
    if (!isNaN(numPrice)) {
      updatePrice(commission.id, numPrice);
      setIsEditingPrice(false);
    }
  };

  const stages = [
    { id: 'dp', title: 'Stage 1: Sketch & DP', msg: commission.client_note, status: commission.dp_status, icon: <LayoutDashboard size={18} /> },
    { id: 'wip', title: 'Stage 2: Mid-Production', msg: commission.wip_feedback, status: commission.payment_75_status, icon: <Clock size={18} /> },
    { id: 'final', title: 'Stage 3: Finalization', msg: commission.final_feedback, status: commission.payment_100_status, icon: <SparklesIcon size={18} /> },
    { id: 'delivery', title: 'Stage 4: Delivery', msg: null, status: 'approved', icon: <Check size={18} /> }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md z-[900]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl h-[85vh] bg-[#0A0C10] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row z-[1000]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-[#0D1117]/50">
          <div className="p-6 border-b border-white/10 bg-[#0D1117]">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <MessageSquare className="text-purple-400" size={24} />
              Production Hub
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Manage Project Stages</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStageTab(stage.id as any)}
                className={cn(
                  "w-full p-4 rounded-[24px] transition-all flex items-start gap-4 text-left group relative",
                  activeStageTab === stage.id ? "bg-purple-500/10 border border-purple-500/20" : "hover:bg-white/[0.03] border border-transparent"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                  activeStageTab === stage.id ? "bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-white/5 text-white/20 border-white/5"
                )}>
                  {stage.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-[11px] font-bold tracking-tight truncate", activeStageTab === stage.id ? "text-white" : "text-white/60")}>
                      {stage.title}
                    </span>
                    {stage.msg && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/30 truncate italic">
                    {stage.msg ? `"${stage.msg}"` : (stage.id === 'dp' && commission.sketch_revision_images?.length) ? "Images attached" : "No feedback yet"}
                  </p>
                </div>
                {activeStageTab === stage.id && (
                  <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[2px_0_10px_rgba(168,85,247,0.5)]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-white/10 bg-[#0D1117]/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Users size={16} className="text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-white truncate">{commission.client_name}</p>
                <p className="text-[8px] text-white/40 uppercase tracking-widest">{commission.commission_type}</p>
              </div>
            </div>

            {/* Price Management Section */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-purple-400" />
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total Price</span>
                </div>
                {!isEditingPrice && (
                  <button 
                    onClick={() => setIsEditingPrice(true)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>

              {isEditingPrice ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">Rp</span>
                    <input 
                      type="number"
                      value={editingPrice}
                      onChange={(e) => setEditingPrice(e.target.value)}
                      className="w-full bg-white/5 border border-purple-500/30 rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={handleSavePrice}
                      className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <Save size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingPrice(false);
                        setEditingPrice(commission.price.toString());
                      }}
                      className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Ban size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white font-mono tracking-tighter">
                    {commission.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-bold text-white/20">IDR</span>
                </div>
              )}
              <p className="text-[8px] text-white/20 mt-1 uppercase tracking-widest">Fixed Negotiated Price</p>
            </div>
          </div>
        </div>

        {/* Chat View / Form Area */}
        <div className="flex-1 flex flex-col bg-[#05070A]">
          {/* Header Area */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0D1117]/30">
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                {activeStageTab === 'dp' ? 'Sketch & Initial Payment' : activeStageTab === 'wip' ? 'Mid-Production Workflow' : 'Final Delivery & Completion'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Stage Active</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <XCircle size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStageTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  {/* Stage 1-3 Specific Content */}
                  {activeStageTab !== 'delivery' && (
                    <div className="space-y-10">
                      {/* 1. REVISION DESCRIPTION */}
                      {((activeStageTab === 'dp' && (commission.client_note || (commission.sketch_revision_images && commission.sketch_revision_images.length > 0))) ||
                        (activeStageTab === 'wip' && commission.wip_feedback) ||
                        (activeStageTab === 'final' && commission.final_feedback)) ? (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] bg-purple-500/10 border border-purple-500/20 p-5 rounded-[24px] rounded-tl-none shadow-xl space-y-4">
                            {((activeStageTab === 'dp' && commission.client_note) ||
                              (activeStageTab === 'wip' && commission.wip_feedback) ||
                              (activeStageTab === 'final' && commission.final_feedback)) && (
                              <p className="text-xs text-white/80 leading-relaxed italic">
                                "{activeStageTab === 'dp' ? commission.client_note : activeStageTab === 'wip' ? commission.wip_feedback : commission.final_feedback}"
                              </p>
                            )}

                            {activeStageTab === 'dp' && commission.sketch_revision_images && commission.sketch_revision_images.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[10px] font-black text-purple-400/60 uppercase tracking-widest">Reference Images:</p>
                                <div className="flex flex-wrap gap-2">
                                  {commission.sketch_revision_images.map((img, idx) => (
                                    <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 relative group cursor-pointer"
                                      onClick={() => window.open(img, '_blank')}
                                    >
                                      <img src={img} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ExternalLink size={14} className="text-white" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[8px] font-bold text-purple-400/60 uppercase tracking-widest">Client Feedback Received</span>
                              <button 
                                onClick={() => resolveFeedback(commission.id, activeStageTab === 'dp' ? 'sketch' : activeStageTab === 'wip' ? 'wip' : 'final')}
                                className="text-[8px] font-black text-purple-400 hover:text-white uppercase tracking-widest px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30 transition-all"
                              >
                                Mark as Resolved
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-20">
                          <MessageSquare size={32} className="mb-3" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">No active feedback</p>
                        </div>
                      )}

                      {/* 2. ARTWORK MANAGEMENT */}
                      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
                        <div className="flex items-center gap-3 text-purple-400">
                          <ImageIcon size={18} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Artwork Delivery</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                          {((activeStageTab === 'dp' && commission.rough_sketch_url) ||
                            (activeStageTab === 'wip' && commission.wip_artwork_url) ||
                            (activeStageTab === 'final' && commission.final_preview_url)) ? (
                            <div className="w-full sm:w-48 aspect-[3/4] relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                              <img
                                src={activeStageTab === 'dp' ? commission.rough_sketch_url : activeStageTab === 'wip' ? commission.wip_artwork_url : commission.final_preview_url}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
                                <label className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest text-center rounded-xl cursor-pointer hover:bg-purple-400 hover:text-white transition-all">
                                  Replace File
                                  <input type="file" accept="image/*" className="hidden"
                                    onChange={activeStageTab === 'dp' ? handleSketchUpload : activeStageTab === 'wip' ? handleWIPUpload : handleFinalPreviewUpload}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className={cn(
                              "w-full sm:w-48 aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center hover:bg-white/[0.05] transition-all cursor-pointer group",
                              (isUploadingSketch || isUploadingWIP || isUploadingFinalPreview) ? "opacity-50 pointer-events-none" : ""
                            )}>
                              {(isUploadingSketch || isUploadingWIP || isUploadingFinalPreview) ? (
                                <RefreshCcw size={32} className="text-purple-400 animate-spin" />
                              ) : (
                                <ImageIcon size={32} className="text-white/10 group-hover:text-purple-500/50 transition-colors mb-3" />
                              )}
                              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] text-center px-6 leading-relaxed">
                                {activeStageTab === 'dp' ? "Upload Rough Sketch" : activeStageTab === 'wip' ? "Upload WIP Preview" : "Upload Final Preview"}
                              </span>
                              <input type="file" accept="image/*" className="hidden"
                                onChange={activeStageTab === 'dp' ? handleSketchUpload : activeStageTab === 'wip' ? handleWIPUpload : handleFinalPreviewUpload}
                              />
                            </label>
                          )}

                          <div className="flex-1 space-y-4">
                            <div className="p-5 bg-[#0D1117] border border-white/5 rounded-2xl">
                              <p className="text-[10px] text-white/40 leading-relaxed italic">
                                {activeStageTab === 'dp' ?
                                  "Submit your rough sketch to the client. This will trigger a notification and allow them to request a revision or proceed to mid-payment." :
                                  activeStageTab === 'wip' ?
                                    "Submit mid-production WIP. Ensure all major details are correct before moving to the final stage." :
                                    "Submit the final version for review. Client will unlock high-res download once the 100% payment is verified."
                                }
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                  {activeStageTab === 'dp' ? (commission.sketch_status || 'Waiting') :
                                    activeStageTab === 'wip' ? (commission.wip_status || 'Waiting') :
                                      (commission.final_preview_url ? 'Sent' : 'Waiting')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. PAYMENT VERIFICATION */}
                      <div className="p-8 bg-purple-500/[0.03] border border-purple-500/10 rounded-[32px] space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-purple-400">
                            <CardIcon size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Payment Verification</span>
                          </div>
                          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                              {activeStageTab === 'dp' ? '50% Deposit' : activeStageTab === 'wip' ? '75% Progress' : '100% Final'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 items-center">
                          {((activeStageTab === 'dp' && commission.dp_proof_url) ||
                            (activeStageTab === 'wip' && commission.payment_75_proof_url) ||
                            (activeStageTab === 'final' && commission.payment_100_proof_url)) ? (
                            <div className="w-full sm:w-48 aspect-[3/4] relative group rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl">
                              <img
                                src={activeStageTab === 'dp' ? commission.dp_proof_url : activeStageTab === 'wip' ? commission.payment_75_proof_url : commission.payment_100_proof_url}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => window.open(activeStageTab === 'dp' ? commission.dp_proof_url : activeStageTab === 'wip' ? commission.payment_75_proof_url : commission.payment_100_proof_url, '_blank')}
                                  className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2"
                                >
                                  <ExternalLink size={14} />
                                  View Full
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full sm:w-48 aspect-[3/4] rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center opacity-30">
                              <Clock size={32} className="mb-3" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Awaiting Proof</span>
                            </div>
                          )}

                          <div className="flex-1 space-y-6">
                            <div className="p-5 bg-[#0D1117] border border-white/5 rounded-2xl">
                              <p className="text-[10px] text-white/40 leading-relaxed italic">
                                Verify the payment receipt before proceeding.
                              </p>
                            </div>

                            {((activeStageTab === 'dp' && commission.dp_proof_url) ||
                              (activeStageTab === 'wip' && commission.payment_75_proof_url) ||
                              (activeStageTab === 'final' && commission.payment_100_proof_url)) ? (
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between px-2">
                                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Current Status:</span>
                                  <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest",
                                    (activeStageTab === 'dp' ? commission.dp_status : activeStageTab === 'wip' ? commission.payment_75_status : commission.payment_100_status)?.toString().toUpperCase() === 'APPROVED' 
                                      ? "text-emerald-400" 
                                      : "text-purple-400"
                                  )}>
                                    {activeStageTab === 'dp' ? (commission.dp_status || 'Pending') :
                                      activeStageTab === 'wip' ? (commission.payment_75_status || 'Pending') :
                                        (commission.payment_100_status || 'Pending')}
                                  </span>
                                </div>
                                {(activeStageTab === 'dp' ? commission.dp_status : activeStageTab === 'wip' ? commission.payment_75_status : commission.payment_100_status)?.toString().toUpperCase() === 'APPROVED' ? (
                                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                      <Check size={16} />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Payment Verified</p>
                                      <p className="text-[8px] text-emerald-400/60 uppercase tracking-tight">Funds confirmed, proceed to next task</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => confirmPayment(commission.id, activeStageTab === 'dp' ? 'dp' : activeStageTab === 'wip' ? '75' : '100', true)}
                                      disabled={isProcessingPayment !== null}
                                      className="flex-1 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                      {isProcessingPayment ? "..." : "Approve Payment"}
                                    </button>
                                    <button
                                      onClick={() => confirmPayment(commission.id, activeStageTab === 'dp' ? 'dp' : activeStageTab === 'wip' ? '75' : '100', false)}
                                      disabled={isProcessingPayment !== null}
                                      className="px-6 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="py-4 border border-white/5 rounded-xl flex items-center justify-center">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Waiting for Client Action</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 4: Final Delivery Content */}
                  {activeStageTab === 'delivery' && (
                    <div className="space-y-10">
                      <div className="flex items-center gap-4 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px]">
                        <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Check size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">Stage 4: Final Delivery</h3>
                          <p className="text-sm text-white/40 italic">Client has completed all payments. Upload the master file here.</p>
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6">
                        <div className="flex items-center gap-3 text-emerald-400">
                          <Upload size={18} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master File Upload</span>
                        </div>

                        {commission.final_artwork_url ? (
                          <div className="space-y-6">
                            <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 group relative shadow-2xl">
                              <img src={commission.final_artwork_url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                <label className="cursor-pointer bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                  {isUploadingFinalArtwork ? <RefreshCcw size={20} className="animate-spin" /> : "Replace Master File"}
                                  <input type="file" className="hidden" accept="image/*" onChange={handleFinalArtworkUpload} disabled={isUploadingFinalArtwork} />
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <Check size={16} className="text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Artwork Delivered</span>
                              </div>
                              <span className="text-[10px] text-white/20 font-mono italic">Client can now download from their inbox</span>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center aspect-video rounded-[32px] border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                            {isUploadingFinalArtwork ? (
                              <RefreshCcw size={48} className="text-emerald-400 animate-spin" />
                            ) : (
                              <>
                                <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                  <Upload size={32} className="text-emerald-400" />
                                </div>
                                <span className="text-lg font-black text-white mb-2 uppercase tracking-tight">Upload Final Artwork</span>
                                <span className="text-xs text-white/40 uppercase tracking-[0.2em]">High-Resolution PNG / JPG</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFinalArtworkUpload} disabled={isUploadingFinalArtwork} />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-[#0D1117]/80 border-t border-white/10 flex items-center gap-4">
            <div className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-6 text-white/40 italic text-xs">
              Managing {activeStageTab === 'dp' ? 'Stage 1' : activeStageTab === 'wip' ? 'Stage 2' : 'Stage 3'} Controls
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Check size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MessageHubModal;
