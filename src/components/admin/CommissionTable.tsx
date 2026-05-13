"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  RefreshCcw, 
  AlertCircle, 
  Check, 
  Play, 
  CheckCircle2, 
  MessageSquare, 
  Eye, 
  Archive,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Commission, StudioSettings } from "@/types/admin";

interface CommissionTableProps {
  commissions: Commission[];
  loading: boolean;
  processingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteOrder: (id: string) => void;
  onSelectCommission: (commission: Commission) => void;
  onOpenMessageHub: (commission: Commission) => void;
  settings: StudioSettings;
  isUpdatingSettings: boolean;
  onToggleStatus: () => void;
}

const CommissionTable = ({
  commissions,
  loading,
  processingId,
  onUpdateStatus,
  onDeleteOrder,
  onSelectCommission,
  onOpenMessageHub,
  settings,
  isUpdatingSettings,
  onToggleStatus
}: CommissionTableProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <div className="bg-white/[0.01] border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.02] to-transparent pointer-events-none" />

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01] relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <Users size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/70">
                Order List
              </h2>
              <p className="text-[10px] text-white/20 mt-1 font-medium tracking-widest">Active Creative Contracts</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleStatus}
              disabled={isUpdatingSettings}
              className={cn(
                "px-6 py-3 rounded-full border transition-all duration-500 flex items-center gap-3 group/status relative overflow-hidden backdrop-blur-xl",
                settings.commissions_open
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]",
                settings.commissions_open ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              )} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                Commission: {settings.commissions_open ? 'Open' : 'Closed'}
              </span>
              {isUpdatingSettings && <RefreshCcw size={10} className="animate-spin opacity-50 ml-1" />}
            </button>

            <div className="px-6 py-3 rounded-full bg-white/[0.03] border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
              {commissions.length} Orders Registered
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Order Time</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Client Name</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Harga</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center">
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative">
                        <RefreshCcw className="text-purple-500 animate-spin" size={48} />
                        <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Just a moment, fetching data...</p>
                    </div>
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30 group-hover:opacity-50 transition-opacity duration-1000">
                      <AlertCircle size={80} strokeWidth={1} className="text-white" />
                      <p className="text-2xl font-normal font-dancing-script text-white mt-4">It's quiet here, no orders yet...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                commissions.map((order, index) => (
                  <tr
                    key={order.id || index}
                    onClick={() => onSelectCommission(order)}
                    className="hover:bg-purple-500/[0.02] transition-all duration-500 group/row cursor-pointer"
                  >
                    <td className="px-10 py-10">
                      <div className="flex flex-col">
                        <p className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">
                          {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-white/20 font-medium">
                          {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex flex-col">
                        <p className="text-xl font-bold text-white group-hover/row:text-purple-400 transition-colors tracking-tight leading-none mb-2">
                          {order.client_name || "Nexus Entity"}
                        </p>
                        <p className="text-[11px] text-white/30 font-medium uppercase tracking-[0.2em] group-hover/row:text-white/50 transition-colors">
                          {order.client_email}
                        </p>
                        <p className="text-[10px] text-purple-400/60 font-bold uppercase tracking-widest mt-1">
                          {order.social_media || "No Handle"}
                        </p>
                      </div>
                    </td>

                    <td className="px-10 py-10">
                      <div className="relative inline-flex items-center">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full border shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all duration-700",
                          order.status === 'pending' ? "bg-white/5 text-white/30 border-white/10" :
                            order.status === 'accepted' ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/5" :
                              order.status === 'in_progress' ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/5" :
                                order.status === 'done' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/5" :
                                  "bg-white/5 text-white/30 border-white/10"
                        )}>
                          {order.status.replace('_', ' ')}
                        </span>
                        {order.status === 'in_progress' && (
                          <span className="absolute -right-1 -top-1 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-20" />
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white tracking-tighter group-hover/row:scale-110 origin-left transition-transform duration-700">{order.price}K</span>
                          <span className="text-[10px] text-purple-400/40 font-black">IDR</span>
                        </div>
                        <span className="text-[9px] text-white/10 font-black uppercase tracking-widest mt-1">Transaction Node</span>
                      </div>
                    </td>
                    <td className="px-10 py-10" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-4">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(order.id, 'accepted')}
                            disabled={!!processingId}
                            className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-900/20 hover:scale-110 active:scale-95 transition-all group/btn"
                          >
                            {processingId === `${order.id}-accepted` ? <RefreshCcw size={18} className="animate-spin" /> : <Check size={20} />}
                          </button>
                        )}

                        {order.status === 'accepted' && (
                          <button
                            onClick={() => onUpdateStatus(order.id, 'in_progress')}
                            disabled={!!processingId}
                            className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center border border-amber-400/20 shadow-lg shadow-amber-900/20 hover:scale-110 active:scale-95 transition-all"
                          >
                            {processingId === `${order.id}-in_progress` ? <RefreshCcw size={18} className="animate-spin" /> : <Play size={20} />}
                          </button>
                        )}

                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => onUpdateStatus(order.id, 'done')}
                            disabled={!!processingId}
                            className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center border border-emerald-400/20 shadow-lg shadow-emerald-900/20 hover:scale-110 active:scale-95 transition-all"
                          >
                            {processingId === `${order.id}-done` ? <RefreshCcw size={18} className="animate-spin" /> : <CheckCircle2 size={20} />}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMessageHub(order);
                          }}
                          className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all shadow-xl group/msg relative"
                        >
                          <MessageSquare size={18} />
                          {(order.client_note || order.wip_feedback || order.final_feedback || (order.sketch_revision_images && order.sketch_revision_images.length > 0)) && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#05070A] animate-pulse" />
                          )}
                        </button>

                        <button
                          onClick={() => onSelectCommission(order)}
                          className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-xl"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          disabled={!!processingId}
                          className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500/50 flex items-center justify-center border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                          title="Move to Recycle Bin"
                        >
                          {processingId === `${order.id}-delete` ? <RefreshCcw size={18} className="animate-spin" /> : <Archive size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default CommissionTable;
