"use client";

import { motion } from "framer-motion";
import { 
  XCircle, 
  Users, 
  Mail, 
  CreditCard as CardIcon, 
  Clock, 
  Image as ImageIcon, 
  MessageSquare, 
  Sparkles as SparklesIcon, 
  Link as LinkIcon,
  Eye,
  Zap,
  Archive,
  RefreshCcw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Commission } from "@/types/admin";

interface CommissionDetailModalProps {
  commission: Commission | null;
  onClose: () => void;
  onOpenMessageHub: () => void;
  onArchive: () => void;
  isArchiving: boolean;
}

const CommissionDetailModal = ({
  commission,
  onClose,
  onOpenMessageHub,
  onArchive,
  isArchiving
}: CommissionDetailModalProps) => {
  if (!commission) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-[#0D1117] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Sidebar Info */}
        <div className="w-full md:w-80 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <div className="w-20 h-20 bg-purple-500/10 rounded-[32px] border border-purple-500/30 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/10">
                <Users className="text-purple-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                {commission.client_name}
              </h3>
              <p className="text-xs text-purple-400/60 font-black uppercase tracking-widest mt-2">
                {commission.social_media || "Anonymous Client"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-purple-400 transition-colors">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Email Data</span>
                  <span className="text-xs text-white/70 font-medium truncate max-w-[160px]">{commission.client_email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-purple-400 transition-colors">
                  <CardIcon size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Payment Method</span>
                  <span className="text-xs text-white/70 font-medium uppercase tracking-wider">{commission.payment_method || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-purple-400 transition-colors">
                  <Clock size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Order Time</span>
                  <span className="text-xs text-white/70 font-medium">
                    {new Date(commission.created_at).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white">{commission.price}K</span>
              <span className="text-[10px] text-purple-400/40 font-black uppercase">IDR</span>
            </div>
            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Total Price</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all z-20"
          >
            <XCircle size={24} />
          </button>

          <div className="max-w-2xl">
            {/* Status & Header */}
            <div className="flex items-center gap-4 mb-10">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full border shadow-xl",
                commission.status === 'pending' ? "bg-white/5 text-white/30 border-white/10" :
                  commission.status === 'accepted' ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                    commission.status === 'in_progress' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                      commission.status === 'done' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                        "bg-white/5 text-white/30 border-white/10"
              )}>
                {commission.status.replace('_', ' ')}
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Order Type</span>
                <p className="text-xl font-bold text-white tracking-tight">{commission.commission_type}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Art Style</span>
                <p className="text-xl font-bold text-purple-400 tracking-tight">{commission.art_style}</p>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-8">
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4">
                <div className="flex items-center gap-3 text-white/40">
                  <MessageSquare size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Project Brief</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-medium">
                  {commission.description || "No specific instructions from the client."}
                </p>
              </div>

              {commission.client_note && commission.sketch_status === 'revision' && (
                <div className="p-8 bg-orange-500/[0.05] border border-orange-500/20 rounded-[32px] space-y-4">
                  <div className="flex items-center gap-3 text-orange-400">
                    <MessageSquare size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Client Revision Note</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed font-bold italic">
                    "{commission.client_note}"
                  </p>
                </div>
              )}

              {commission.background_req && (
                <div className="p-8 bg-purple-500/[0.02] border border-purple-500/10 rounded-[32px] space-y-4">
                  <div className="flex items-center gap-3 text-purple-400/40">
                    <SparklesIcon size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Background Request</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-medium italic">
                    "{commission.background_req}"
                  </p>
                </div>
              )}

              {(commission.references || commission.is_couple || commission.has_background || (commission.reference_images && commission.reference_images.length > 0)) && (
                <div className="space-y-4">
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] ml-4">Technical Parameters</span>

                  <div className="flex flex-wrap gap-3">
                    {commission.is_couple && (
                      <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                        <Users size={14} className="text-purple-400" />
                        Couple / Duo
                      </div>
                    )}
                    {commission.has_background && (
                      <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon size={14} className="text-purple-400" />
                        With Background
                      </div>
                    )}

                    {commission.references && (
                      <a
                        href={commission.references.startsWith('http') ? commission.references : `https://${commission.references}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2 hover:bg-purple-500/20 transition-all"
                      >
                        <LinkIcon size={14} />
                        Reference Link
                      </a>
                    )}
                  </div>

                  {/* Image Preview Grid */}
                  {commission.reference_images && commission.reference_images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {commission.reference_images.map((url: string, idx: number) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl">
                          <img
                            src={url}
                            alt={`Ref ${idx}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                            onClick={() => window.open(url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <Eye size={20} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Simplified Production Access */}
              {(commission.status === 'accepted' || commission.status === 'in_progress' || commission.status === 'done') && (
                <div className="mt-12 p-10 bg-purple-500/5 border border-purple-500/10 rounded-[40px] flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-900/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />

                  <div className="w-20 h-20 bg-purple-500/10 rounded-[28px] flex items-center justify-center border border-purple-500/20 shadow-2xl shadow-purple-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <MessageSquare size={32} className="text-purple-400" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white tracking-tight">Production Management</h4>
                    <p className="text-[11px] text-white/40 max-w-sm mx-auto leading-relaxed">
                      Upload sketches, verify payments, and review client feedback in the centralized Production Hub.
                    </p>
                  </div>

                  <button
                    onClick={onOpenMessageHub}
                    className="px-10 py-4 bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-500/30 hover:bg-purple-400 hover:shadow-purple-400/20 active:scale-95 transition-all flex items-center gap-3"
                  >
                    <Zap size={16} fill="currentColor" />
                    Launch Message Hub
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-16 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => window.open(`mailto:${commission.client_email}`)}
                className="w-full sm:flex-1 bg-white text-black font-black text-[10px] uppercase tracking-widest py-5 rounded-[20px] hover:bg-purple-400 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <Mail size={18} />
                Contact Client
              </button>

              {commission.status === 'done' && (
                <button
                  onClick={onArchive}
                  disabled={isArchiving}
                  className="w-full sm:w-auto px-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-[10px] uppercase tracking-widest py-5 rounded-[20px] hover:bg-purple-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  {isArchiving ? <RefreshCcw size={18} className="animate-spin" /> : <Archive size={18} />}
                  {isArchiving ? "Archiving..." : "Archive & Purge"}
                </button>
              )}

              {commission.social_media && (
                <button
                  onClick={() => {
                    const socialMedia = commission.social_media!;
                    const handle = socialMedia.replace('@', '');
                    if (socialMedia.includes('IG') || socialMedia.includes('Instagram')) {
                      window.open(`https://instagram.com/${handle.split(' ').pop()}`);
                    } else {
                      window.open(`https://twitter.com/${handle.split(' ').pop()}`);
                    }
                  }}
                  className="w-16 h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] flex items-center justify-center text-white/40 hover:text-purple-400 transition-all shadow-xl"
                >
                  <ExternalLink size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommissionDetailModal;
