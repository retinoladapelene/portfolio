"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  ExternalLink,
  RefreshCcw,
  ShieldAlert
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { cn } from "@/lib/utils";

interface ArchivedCommission {
  id: string;
  client_name: string;
  client_email: string;
  commission_type: string;
  created_at: string;
  client_note?: string;
  price: number;
}

export default function RecycleBin() {
  const [archived, setArchived] = useState<ArchivedCommission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const fetchArchived = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/archive-management');
      const data = await res.json();
      if (data.success) {
        setArchived(data.data);
      }
    } catch (error) {
      toast("Failed to load archive", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id: string) => {
    setIsProcessing(id);
    try {
      const res = await fetch('/api/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'done' }) // Move back to done
      });
      const data = await res.json();
      if (data.success) {
        toast("Project restored successfully!", "success");
        setArchived(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      toast("Restoration failed", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePurge = async (id: string) => {
    const ok = await confirm({
      title: "Permanent Purge?",
      message: "This will permanently delete ALL data and images associated with this project. This action cannot be undone.",
      confirmText: "Purge Permanently",
      cancelText: "Cancel",
      variant: "danger"
    });

    if (!ok) return;

    setIsProcessing(id);
    try {
      const res = await fetch(`/api/admin/archive-management?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast("Project purged from database", "success");
        setArchived(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      toast("Purge failed", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const getDaysRemaining = (clientNote?: string) => {
    const match = clientNote?.match(/\[ARCHIVED_AT:(.+?)\]/);
    if (!match) return 10;
    
    const archivedAt = new Date(match[1]);
    const purgeDate = new Date(archivedAt.getTime() + 10 * 24 * 60 * 60 * 1000);
    const diff = purgeDate.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-normal text-white font-dancing-script mb-2">Recycle <span className="text-rose-400">Bin.</span></h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Temporary Archive & Data Recovery</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-6 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
             <ShieldAlert size={14} />
             Auto-Purge active (10 Days)
           </div>
           <button 
             onClick={fetchArchived}
             className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 transition-all"
           >
             <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 gap-6"
          >
            <RefreshCcw size={48} className="text-rose-500/40 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Scanning Archive...</p>
          </motion.div>
        ) : archived.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-normal text-white font-dancing-script mb-2">Bin is <span className="text-white/40">Empty.</span></h3>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">No projects currently in the archive.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archived.map((item, i) => {
              const daysLeft = getDaysRemaining(item.client_note);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-8 border-white/5 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Clock size={48} className={daysLeft <= 2 ? "text-rose-500 animate-pulse" : "text-white"} />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white truncate max-w-[150px]">{item.client_name}</p>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest">{item.commission_type}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[10px] text-white/40 font-medium">
                          <Calendar size={14} className="text-rose-400/40" />
                          <span>Archived: {new Date(item.client_note?.match(/\[ARCHIVED_AT:(.+?)\]/)?.[1] || item.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border",
                          daysLeft <= 2 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/5 border-white/5 text-white/40"
                        )}>
                          <AlertCircle size={14} />
                          {daysLeft === 0 ? "Purging Today" : `${daysLeft} Days until purge`}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                          onClick={() => handleRestore(item.id)}
                          disabled={!!isProcessing}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          {isProcessing === item.id ? <RefreshCcw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                          Restore
                        </button>
                        <button
                          onClick={() => handlePurge(item.id)}
                          disabled={!!isProcessing}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/0 hover:shadow-rose-900/20"
                        >
                          {isProcessing === item.id ? <RefreshCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          Purge
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
