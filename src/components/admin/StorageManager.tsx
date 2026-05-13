"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Trash2, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  Check,
  HardDrive,
  Activity,
  Copy
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { cn } from "@/lib/utils";

interface AuditSummary {
  totalFiles: number;
  orphanCount: number;
  orphanSizeFormatted: string;
}

interface IntegritySummary {
  totalCommissions: number;
  totalFilesChecked: number;
  brokenCount: number;
}

interface BrokenFile {
  id: string;
  client: string;
  field: string;
  path: string;
}

export default function StorageManager() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [orphans, setOrphans] = useState<string[]>([]);
  const [integritySummary, setIntegritySummary] = useState<IntegritySummary | null>(null);
  const [brokenFiles, setBrokenFiles] = useState<BrokenFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/storage-audit');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setOrphans(data.orphans);
        if (data.summary.orphanCount === 0) {
          toast("Storage is clean! No orphan files found.", "success");
        } else {
          toast(`Found ${data.summary.orphanCount} orphan files.`, "info");
        }
      } else {
        toast(data.error || "Failed to audit storage", "error");
      }
    } catch (error) {
      toast("An error occurred during audit", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const runIntegrityCheck = async () => {
    setIsCheckingIntegrity(true);
    try {
      const res = await fetch('/api/admin/integrity-check');
      const data = await res.json();
      if (data.success) {
        setIntegritySummary(data.summary);
        setBrokenFiles(data.brokenFiles);
        if (data.summary.brokenCount === 0) {
          toast("Integrity check passed! All links are valid.", "success");
        } else {
          toast(`Found ${data.summary.brokenCount} broken references.`, "info");
        }
      } else {
        toast(data.error || "Failed to check integrity", "error");
      }
    } catch (error) {
      toast("An error occurred during integrity check", "error");
    } finally {
      setIsCheckingIntegrity(false);
    }
  };

  const handleCleanup = async () => {
    if (orphans.length === 0) return;

    const confirmed = await confirm({
      title: "Clean Up Storage?",
      message: `You are about to permanently delete ${orphans.length} files (${summary?.orphanSizeFormatted}) that are not referenced in the database. This action cannot be undone.`,
      confirmText: "Purge Orphan Files",
      cancelText: "Cancel",
      variant: "danger"
    });

    if (!confirmed) return;

    setIsCleaning(true);
    try {
      const res = await fetch('/api/admin/storage-audit', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: orphans })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Successfully cleaned up ${data.deletedCount} files.`, "success");
        setSummary(null);
        setOrphans([]);
      } else {
        toast(data.error || "Cleanup failed", "error");
      }
    } catch (error) {
      toast("An error occurred during cleanup", "error");
    } finally {
      setIsCleaning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Path copied to clipboard", "success");
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-normal text-white font-dancing-script mb-2">Storage <span className="text-purple-400">Guardian.</span></h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Cloud Health & Asset Management</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={runAudit}
            disabled={isLoading || isCleaning || isCheckingIntegrity}
            className="px-6 py-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isLoading ? <RefreshCcw size={14} className="animate-spin" /> : <Activity size={14} />}
            {isLoading ? "Auditing..." : "Run Storage Audit"}
          </button>
          <button 
            onClick={runIntegrityCheck}
            disabled={isLoading || isCleaning || isCheckingIntegrity}
            className="px-6 py-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isCheckingIntegrity ? <RefreshCcw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {isCheckingIntegrity ? "Checking..." : "Cross-Check Integrity"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-8 border-white/5 space-y-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
            <p className="text-xl font-bold text-white">{summary ? "Audit Complete" : "Standby"}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/5 space-y-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
            <Database size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Files Scanned</p>
            <p className="text-xl font-bold text-white">{summary?.totalFiles || 0}</p>
          </div>
        </GlassCard>

        <GlassCard className={cn(
          "p-8 border-white/5 space-y-4",
          summary && summary.orphanCount > 0 ? "border-amber-500/20 bg-amber-500/[0.02]" : ""
        )}>
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            summary && summary.orphanCount > 0 ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40"
          )}>
            <Trash2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Orphan Assets</p>
            <p className="text-xl font-bold text-white">
              {summary?.orphanCount || 0} <span className="text-xs text-white/40 font-normal">({summary?.orphanSizeFormatted || "0 MB"})</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {summary && summary.orphanCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 bg-amber-500/[0.03] border border-amber-500/10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-[24px] flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">System Cleanup Recommended</h3>
              <p className="text-sm text-white/40 max-w-md">
                We found {summary.orphanCount} files in storage that have no matching records in your database. 
                Cleaning these will reduce storage costs and keep your bucket organized.
              </p>
            </div>
          </div>
          <button 
            onClick={handleCleanup}
            disabled={isCleaning}
            className="w-full md:w-auto px-10 py-5 bg-amber-500 text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isCleaning ? <RefreshCcw size={18} className="animate-spin" /> : <Trash2 size={18} />}
            {isCleaning ? "Purging..." : "Purge All Orphans"}
          </button>
        </motion.div>
      )}

      {summary && summary.orphanCount === 0 && !isCheckingIntegrity && !integritySummary && (
        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-normal text-white font-dancing-script mb-2">Everything is <span className="text-emerald-400">Clean.</span></h3>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">No redundant files detected in cloud storage.</p>
        </div>
      )}

      {/* Integrity Check Results */}
      <AnimatePresence mode="wait">
        {integritySummary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 pt-6 border-t border-white/5"
          >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="text-lg font-bold text-white">Integrity Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Assets Validated</p>
              <p className="text-2xl font-bold text-white">{integritySummary.totalFilesChecked}</p>
            </div>
            <div className={cn(
              "p-6 border rounded-2xl",
              integritySummary.brokenCount > 0 ? "border-rose-500/20 bg-rose-500/[0.02]" : "border-emerald-500/20 bg-emerald-500/[0.02]"
            )}>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Broken Links Found</p>
              <p className={cn(
                "text-2xl font-bold",
                integritySummary.brokenCount > 0 ? "text-rose-400" : "text-emerald-400"
              )}>{integritySummary.brokenCount}</p>
            </div>
          </div>

          {brokenFiles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden border border-rose-500/20 rounded-[32px] bg-rose-500/[0.02]"
            >
              <div className="p-6 border-b border-rose-500/10 bg-rose-500/5 flex items-center gap-3">
                <AlertCircle className="text-rose-400" size={20} />
                <h4 className="font-bold text-white">Broken File References Detected</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-white/40">Client / Order</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-white/40">Field</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-white/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {brokenFiles.map((file, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{file.client}</p>
                          <p className="text-[10px] text-white/20 font-mono mt-1">{file.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-md uppercase">
                            {file.field}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-white/40">
                          {file.path}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => copyToClipboard(file.path)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all group"
                            title="Copy Path"
                          >
                            <Copy size={14} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {integritySummary.brokenCount === 0 && (
            <div className="p-8 text-center bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[32px]">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <Check size={24} />
              </div>
              <p className="text-white font-bold mb-1">Database Integrity 100% Verified</p>
              <p className="text-white/30 text-[10px] uppercase tracking-widest">No missing files found for existing records.</p>
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
