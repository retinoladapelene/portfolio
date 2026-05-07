"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Users,
  TrendingUp,
  RefreshCcw,
  Trash2,
  Check,
  Play,
  XCircle,
  LogOut,
  ArrowLeft,
  Bell,
  Eye,
  FileText,
  CreditCard as CardIcon,
  Image as ImageIcon,
  MessageSquare,
  Link as LinkIcon,
  Sparkles as SparklesIcon,
  Mail
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ProjectManager from "@/components/admin/ProjectManager";

type Commission = {
  id: string;
  client_name: string;
  client_email: string;
  commission_type: string;
  art_style: string;
  status: string;
  price: number;
  social_media: string;
  payment_method: string;
  background_req?: string;
  description?: string;
  references?: string;
  is_couple?: boolean;
  has_background?: boolean;
  created_at: string;
};

const AdminDashboard = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'commissions' | 'portfolio'>('commissions');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchCommissions();
  }, []);

  const router = useRouter();
  const supabase = createClient();

  const fetchCommissions = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/commissions');
      const result = await response.json();
      if (result.success) {
        setCommissions(result.data);
        // Status discovery for Enum debugging
        const uniqueStatuses = Array.from(new Set(result.data.map((c: any) => c.status)));
        console.log("Archive Discovery - Available Statuses:", JSON.stringify(uniqueStatuses));
      }
    } catch (error) {
      console.error("Error fetching:", error);
      setMessage({ type: 'error', text: "Failed to connect to Neural Archive" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setProcessingId(id + '-' + newStatus);
    try {
      const res = await fetch('/api/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      console.log(`[HTTP ${res.status}] ${res.statusText}`);
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const raw = await res.text();
        console.error("Non-JSON Response:", raw);
        data = { success: false, error: "Server returned non-JSON response", raw };
      }

      if (data.success) {
        setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        setMessage({ type: 'success', text: `Protocol updated to ${newStatus.toUpperCase()}` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        console.error("Uplink Error Details:", data);
        const errorMsg = data.error || data.message || "Unknown server error";
        setMessage({ type: 'error', text: `Protocol failure: ${errorMsg}` });
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      setMessage({ type: 'error', text: `Network interference: ${error.message}` });
    } finally {
      setProcessingId(null);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Erase this record from the archive?')) return;
    setProcessingId(id + '-delete');
    try {
      const res = await fetch(`/api/commissions?id=${id}`, {
        method: 'DELETE',
      });
      
      console.log(`[DELETE HTTP ${res.status}] ${res.statusText}`);
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const raw = await res.text();
        console.error("Non-JSON Response:", raw);
        data = { success: false, error: "Server returned non-JSON response", raw };
      }

      if (data.success) {
        setCommissions(prev => prev.filter(c => c.id !== id));
        setMessage({ type: 'success', text: "Record purged from database" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        console.error("Purge Error Details:", data);
        setMessage({ type: 'error', text: `${data.error || "Purge failed"}` });
      }
    } catch (error: any) {
      console.error('Delete failed:', error);
      setMessage({ type: 'error', text: `Cleanup failed: ${error.message}` });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCommissions = commissions.filter(c => 
    (c.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (c.client_email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const pendingCount = commissions.filter(c => c.status === 'pending').length;

  return (
    <main className="min-h-screen bg-[#05070A] pt-32 pb-20 px-4 md:px-10 selection:bg-purple-500/30 font-outfit">
      {/* Abstract Background Glows - Editorial Style */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 blur-[200px] rounded-full" />
      </div>

      {/* NEW TOP NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-6">
        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* LEFT: Branding & Navigation */}
          <div className="flex items-center gap-8">


            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.1)] group hover:bg-purple-500/20 transition-all duration-500">
                <LayoutDashboard className="text-purple-400 group-hover:scale-110 transition-transform" size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-normal text-white font-dancing-script leading-none tracking-wide">
                  Admin Dashboard
                </h1>
                <p className="text-[10px] text-purple-400/60 uppercase tracking-[0.4em] font-black mt-1.5 ml-0.5">
                  Management Suite
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/20 p-1.5 rounded-[20px] border border-white/5">
            {[
              { id: 'commissions', label: 'Commission' },
              { id: 'portfolio', label: 'Portfolio' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-10 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 relative overflow-hidden group",
                  activeTab === tab.id 
                    ? "text-white" 
                    : "text-white/30 hover:text-white/60"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchCommissions}
              className="w-12 h-12 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl text-white/40 hover:text-purple-400 transition-all relative group"
            >
              <Bell size={20} className={cn(pendingCount > 0 && "text-purple-400")} />
              {pendingCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full border border-[#05070A] animate-ping" />
              )}
              {pendingCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full border border-[#05070A]" />
              )}
            </button>
            
            <Link 
              href="/"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg group/back"
            >
              <ArrowLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" />
              <span className="hidden md:inline">Back to Site</span>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Floating Status Message */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-10 left-1/2 z-[300] px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest",
              message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <Section className="max-w-7xl mx-auto">
        {/* Content Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-purple-500/50" />
              <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.5em]">Executive Console</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-normal text-white font-dancing-script mb-4 tracking-tight">
              {activeTab === 'commissions' ? "Commission" : "Portfolio"} <span className="text-purple-400 font-bold">Archives.</span>
            </h2>
            <p className="text-white/40 text-[11px] font-medium uppercase tracking-[0.4em] max-w-lg leading-relaxed">
              Orchestrating the creative lifecycle through high-fidelity management protocols.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-[450px] group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Query database records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-[24px] pl-16 pr-8 py-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all backdrop-blur-2xl shadow-inner"
              />
            </div>
          </motion.div>
        </div>

        {activeTab === 'commissions' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              {[
                { 
                  label: "Active Pipeline", 
                  value: commissions.filter(c => c.status !== 'complete' && c.status !== 'done').length, 
                  icon: <Clock size={28} />, 
                  color: "purple",
                  description: "Current high-priority creative flows"
                },
                { 
                  label: "Archive Volume", 
                  value: commissions.filter(c => c.status === 'complete' || c.status === 'done').length, 
                  icon: <CheckCircle2 size={28} />, 
                  color: "emerald",
                  description: "Successfully finalized masterpieces"
                },
                { 
                  label: "Capital Growth", 
                  value: commissions.reduce((acc, c) => acc + (c.price || 0), 0) + "K", 
                  icon: <TrendingUp size={28} />, 
                  color: "purple",
                  description: "Total revenue valuation in IDR"
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.8 }}
                >
                  <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10 group hover:border-purple-500/30 transition-all duration-700 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-[80px] rounded-full -mr-16 -mt-16 transition-all group-hover:bg-purple-500/10 group-hover:scale-125 duration-1000" />
                    <div className="flex flex-col relative z-10">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all group-hover:scale-110 duration-700",
                        stat.color === 'purple' ? "bg-purple-500/10 border border-purple-500/20 text-purple-400" :
                        "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      )}>
                        {stat.icon}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-purple-400/50 transition-colors">
                          {stat.label}
                        </p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-6xl font-black text-white tracking-tighter group-hover:scale-[1.02] origin-left transition-transform duration-700">
                            {stat.value}
                          </span>
                          {stat.label.includes("Growth") && <span className="text-xs font-bold text-white/20 uppercase tracking-widest">IDR</span>}
                        </div>
                        <p className="text-[11px] text-white/20 pt-4 font-medium border-t border-white/5 group-hover:border-purple-500/20 transition-colors">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Orders Table Container */}
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
                        Neural Archive
                      </h2>
                      <p className="text-[10px] text-white/20 mt-1 font-medium tracking-widest">Recent Creative Contracts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-full bg-white/[0.03] border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                      {filteredCommissions.length} Registered Nodes
                    </div>
                  </div>
                </div>
            
                <div className="overflow-x-auto relative z-10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Subject Entity</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Artistic Protocol</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Sync Status</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Valuation</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5">Directives</th>
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
                              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Synchronizing Neural Grid...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredCommissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-40 text-center">
                            <div className="flex flex-col items-center gap-6 opacity-30 group-hover:opacity-50 transition-opacity duration-1000">
                              <AlertCircle size={80} strokeWidth={1} className="text-white" />
                              <p className="text-2xl font-normal font-dancing-script text-white mt-4">The archives remain silent...</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCommissions.map((order, i) => (
                          <tr 
                            key={order.id} 
                            onClick={() => setSelectedCommission(order)}
                            className="hover:bg-purple-500/[0.02] transition-all duration-500 group/row cursor-pointer"
                          >
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
                              <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-black text-white/60 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-fit uppercase tracking-[0.2em] shadow-inner">
                                  {order.commission_type}
                                </span>
                                <span className="text-[11px] text-purple-400 font-bold uppercase tracking-[0.3em] ml-1">
                                  {order.art_style}
                                </span>
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
                                {/* Accept Order */}
                                {order.status === 'pending' && (
                                  <button 
                                    onClick={() => updateStatus(order.id, 'accepted')}
                                    disabled={!!processingId}
                                    className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-900/20 hover:scale-110 active:scale-95 transition-all group/btn"
                                  >
                                    {processingId === `${order.id}-accepted` ? <RefreshCcw size={18} className="animate-spin" /> : <Check size={20} />}
                                  </button>
                                )}

                                {/* Progress Order */}
                                {order.status === 'accepted' && (
                                  <button 
                                    onClick={() => updateStatus(order.id, 'in_progress')}
                                    disabled={!!processingId}
                                    className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center border border-amber-400/20 shadow-lg shadow-amber-900/20 hover:scale-110 active:scale-95 transition-all"
                                  >
                                    {processingId === `${order.id}-in_progress` ? <RefreshCcw size={18} className="animate-spin" /> : <Play size={20} />}
                                  </button>
                                )}

                                {/* Complete Order */}
                                {order.status === 'in_progress' && (
                                  <button 
                                    onClick={() => updateStatus(order.id, 'done')}
                                    disabled={!!processingId}
                                    className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center border border-emerald-400/20 shadow-lg shadow-emerald-900/20 hover:scale-110 active:scale-95 transition-all"
                                  >
                                    {processingId === `${order.id}-done` ? <RefreshCcw size={18} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                  </button>
                                )}

                                <button 
                                  onClick={() => setSelectedCommission(order)}
                                  className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-xl"
                                >
                                  <Eye size={18} />
                                </button>

                                <button 
                                  onClick={() => deleteOrder(order.id)}
                                  disabled={!!processingId}
                                  className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500/50 flex items-center justify-center border border-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                >
                                  {processingId === `${order.id}-delete` ? <RefreshCcw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="p-10 bg-black/40 border-t border-white/5 flex justify-between items-center text-[10px] text-white/10 font-black uppercase tracking-[0.5em] relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                    <p>Studio Core <span className="text-white/30">System Active</span></p>
                  </div>
                  <div className="flex items-center gap-8">
                    <p>Archive Integrity: 100%</p>
                    <p>Chronos: {mounted ? new Date().toLocaleTimeString() : "--:--:--"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
    ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProjectManager />
          </motion.div>
        )}
      </Section>

      {/* DETAILED COMMISSION MODAL */}
      <AnimatePresence>
        {selectedCommission && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCommission(null)}
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
                      {selectedCommission.client_name}
                    </h3>
                    <p className="text-xs text-purple-400/60 font-black uppercase tracking-widest mt-2">
                      {selectedCommission.social_media || "Anonymous User"}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-purple-400 transition-colors">
                        <Mail size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Email Node</span>
                        <span className="text-xs text-white/70 font-medium truncate max-w-[160px]">{selectedCommission.client_email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-purple-400 transition-colors">
                        <CardIcon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Payment Protocol</span>
                        <span className="text-xs text-white/70 font-medium uppercase tracking-wider">{selectedCommission.payment_method || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-purple-400 transition-colors">
                        <Clock size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Timestamp</span>
                        <span className="text-xs text-white/70 font-medium">{new Date(selectedCommission.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-white">{selectedCommission.price}K</span>
                    <span className="text-[10px] text-purple-400/40 font-black uppercase">IDR</span>
                  </div>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Total Valuation</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <button 
                  onClick={() => setSelectedCommission(null)}
                  className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all z-20"
                >
                  <XCircle size={24} />
                </button>

                <div className="max-w-2xl">
                  {/* Status & Header */}
                  <div className="flex items-center gap-4 mb-10">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full border shadow-xl",
                      selectedCommission.status === 'pending' ? "bg-white/5 text-white/30 border-white/10" :
                      selectedCommission.status === 'accepted' ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                      selectedCommission.status === 'in_progress' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                      selectedCommission.status === 'done' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      "bg-white/5 text-white/30 border-white/10"
                    )}>
                      {selectedCommission.status.replace('_', ' ')}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Contract Type</span>
                      <p className="text-xl font-bold text-white tracking-tight">{selectedCommission.commission_type}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Visual Aesthetic</span>
                      <p className="text-xl font-bold text-purple-400 tracking-tight">{selectedCommission.art_style}</p>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-8">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4">
                      <div className="flex items-center gap-3 text-white/40">
                        <MessageSquare size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Commission Directive</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed font-medium">
                        {selectedCommission.description || "No specific instructions provided by the subject."}
                      </p>
                    </div>

                    {selectedCommission.background_req && (
                      <div className="p-8 bg-purple-500/[0.02] border border-purple-500/10 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3 text-purple-400/40">
                          <SparklesIcon size={16} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Environment Request</span>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed font-medium italic">
                          "{selectedCommission.background_req}"
                        </p>
                      </div>
                    )}

                    {(selectedCommission.references || selectedCommission.is_couple || selectedCommission.has_background) && (
                      <div className="space-y-4">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] ml-4">Technical Parameters</span>
                        <div className="flex flex-wrap gap-3">
                          {selectedCommission.is_couple && (
                            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                              <Users size={14} className="text-purple-400" />
                              Couple / Duo
                            </div>
                          )}
                          {selectedCommission.has_background && (
                            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                              <ImageIcon size={14} className="text-purple-400" />
                              Environment Included
                            </div>
                          )}
                          {selectedCommission.references && (
                            <a 
                              href={selectedCommission.references}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2 hover:bg-purple-500/20 transition-all"
                            >
                              <LinkIcon size={14} />
                              Reference Files
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-16 flex items-center gap-4">
                    <button 
                      onClick={() => window.open(`mailto:${selectedCommission.client_email}`)}
                      className="flex-1 bg-white text-black font-black text-[10px] uppercase tracking-widest py-5 rounded-[20px] hover:bg-purple-400 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                    >
                      <Mail size={18} />
                      Establish Contact
                    </button>
                    {selectedCommission.social_media && (
                      <button 
                        onClick={() => {
                          const handle = selectedCommission.social_media.replace('@', '');
                          if (selectedCommission.social_media.includes('IG') || selectedCommission.social_media.includes('Instagram')) {
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
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminDashboard;
