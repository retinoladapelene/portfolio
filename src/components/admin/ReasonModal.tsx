"use client";

import { motion } from "framer-motion";
import { AlertCircle, Clock, Users, CheckCircle2, Palette, X } from "lucide-react";
import { StudioSettings } from "@/types/admin";

interface ReasonModalProps {
  show: boolean;
  onClose: () => void;
  onUpdateStatus: (isOpen: boolean, reason?: string) => void;
}

const ReasonModal = ({ show, onClose, onUpdateStatus }: ReasonModalProps) => {
  if (!show) return null;

  const reasons = [
    { label: "Taking a short break", icon: <Clock size={16} /> },
    { label: "Currently busy with active orders", icon: <Users size={16} /> },
    { label: "Commission slots are full", icon: <CheckCircle2 size={16} /> },
    { label: "Currently experiencing artblock", icon: <Palette size={16} /> },
    { label: "Personal matters", icon: <AlertCircle size={16} /> }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[#0D1117] border border-white/10 rounded-[32px] p-8 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Closing Commissions</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Select a Reason</p>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          {reasons.map((reason) => (
            <button
              key={reason.label}
              onClick={() => onUpdateStatus(false, reason.label)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all text-left group"
            >
              <div className="text-white/20 group-hover:text-purple-400 transition-colors">
                {reason.icon}
              </div>
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                {reason.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
        >
          Cancel Action
        </button>
      </motion.div>
    </div>
  );
};

export default ReasonModal;
