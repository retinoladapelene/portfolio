"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ShoppingBag,
  Image as ImageIcon,
  Briefcase,
  Milestone,
  PenTool,
  User,
  Tag,
  Activity,
  Trash2,
  LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ProjectManager from "@/components/admin/ProjectManager";
import PersonalPageManager from "@/components/admin/PersonalPageManager";
import PricingManager from "@/components/admin/PricingManager";
import StorageManager from "@/components/admin/StorageManager";
import AdminStats from "@/components/admin/AdminStats";
import CommissionTable from "@/components/admin/CommissionTable";
import CommissionDetailModal from "@/components/admin/CommissionDetailModal";
import MessageHubModal from "@/components/admin/MessageHubModal";
import ReasonModal from "@/components/admin/ReasonModal";
import GalleryManager from "@/components/admin/GalleryManager";
import RecycleBin from "@/components/admin/RecycleBin";
import EngagementStats from "@/components/admin/EngagementStats";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { archiveCommission } from "@/utils/archive";
import { Commission, StudioSettings } from "@/types/admin";
import { compressImage } from "@/utils/imageCompression";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'commissions' | 'portfolio' | 'gallery' | 'personal' | 'pricing' | 'health' | 'recycle-bin' | 'engagement'>('commissions');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [settings, setSettings] = useState<StudioSettings>({ commissions_open: true, closed_reason: "" });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUploadingSketch, setIsUploadingSketch] = useState(false);
  const [isUploadingWIP, setIsUploadingWIP] = useState(false);
  const [isUploadingFinalPreview, setIsUploadingFinalPreview] = useState(false);
  const [isUploadingFinalArtwork, setIsUploadingFinalArtwork] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [isMessageHubOpen, setIsMessageHubOpen] = useState(false);
  const [activeStageTab, setActiveStageTab] = useState<'dp' | 'wip' | 'final' | 'delivery'>('dp');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const allowedEmails = (process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com,tyo290704@gmail.com').split(',');

      if (!user || !user.email || !allowedEmails.includes(user.email)) {
        router.push("/?login=true");
        return;
      }

      fetchCommissions();
      fetchSettings();
      runArchiveMaintenance();
    };

    checkAuth();
  }, []);

  const runArchiveMaintenance = async () => {
    try {
      // 1. Auto-Archive: Move Done > 24h to Bin
      await fetch('/api/admin/archive-management', { method: 'POST' });
      // 2. Auto-Purge: Delete Archived > 10 days
      await fetch('/api/admin/archive-management?auto=true', { method: 'DELETE' });
    } catch (error) {
      console.error('Archive maintenance failed:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`);
      const result = await res.json();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
    }
  };

  const updateCommissionStatus = async (isOpen: boolean, reason?: string) => {
    setIsUpdatingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          commissions_open: isOpen,
          closed_reason: isOpen ? "" : reason
        })
      });
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
        toast(`Commission is now ${isOpen ? 'OPEN' : 'CLOSED'}`, "success");
        setShowReasonModal(false);
      }
    } catch (error) {
      toast("Failed to update commission settings", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const toggleCommissionStatus = () => {
    if (settings.commissions_open) {
      setShowReasonModal(true);
    } else {
      updateCommissionStatus(true);
    }
  };

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/commissions');
      const result = await response.json();
      if (result.success) {
        setCommissions(result.data);
      }
    } catch (error) {
      toast("Failed to connect to the archive. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const ok = await confirm({
      title: "Sign Out?",
      message: "Are you sure you want to end your session? You will need to log in again to access the dashboard.",
      confirmText: "Sign Out",
      cancelText: "Stay",
      variant: "danger"
    });

    if (ok) {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setProcessingId(id + '-' + newStatus);
    try {
      const res = await fetch('/api/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        toast(`Status changed to ${newStatus.toUpperCase()}!`, "success");
      } else {
        toast(`Failed to update status: ${data?.error || 'Technical issue'}`, "error");
      }
    } catch (error: any) {
      toast(`Network issue: ${error.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteOrder = async (id: string) => {
    const order = commissions.find(c => c.id === id);
    const isDone = order?.status === 'done';

    const res = await confirm({
      title: isDone ? "Archive Project?" : "Decline Request?",
      message: isDone 
        ? "This project will be moved to the Recycle Bin. It will be automatically deleted after 10 days." 
        : "This will remove the request and notify the client. Please provide a reason if you'd like it included in the email.",
      variant: "danger",
      confirmText: isDone ? "Move to Bin" : "Decline & Notify",
      showInput: !isDone,
      inputPlaceholder: "Reason for cancellation (optional)..."
    });

    if (res !== false) {
      const reason = typeof res === 'string' ? res : undefined;
      executeDelete(id, reason);
    }
  };

  const executeDelete = async (id: string, reason?: string) => {
    setProcessingId(id + '-delete');
    try {
      const res = await fetch(`/api/commissions?id=${id}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setCommissions(prev => prev.filter(c => c.id !== id));
        toast("Order deleted successfully!", "success");
      } else {
        toast(`${data.error || "Failed to delete data"}`, "error");
      }
    } catch (error: any) {
      toast(`Failed to clean database: ${error.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, apiPath: string, toastMsg: string, loadingSetter: (v: boolean) => void) => {
    if (!e.target.files || !e.target.files[0] || !selectedCommission) return;
    const file = e.target.files[0];
    
    // Limit original size to 5MB before compression
    const MAX_ORIGINAL_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_ORIGINAL_SIZE) {
      toast("Original image too large! Maximum size is 5MB.", "error");
      return;
    }

    loadingSetter(true);
    try {
      // Compress Image
      const compressedBlob = await compressImage(file, 1920, 1920, 0.8);
      
      // Check if compressed size is within 1MB
      if (compressedBlob.size > 1024 * 1024) {
        toast("Even after compression, the image is still over 1MB. Please use a smaller image.", "error");
        loadingSetter(false);
        return;
      }

      // Convert to Base64 (since current API expects it)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Correctly map API path to the expected field name
        let fieldName = 'previewBase64';
        if (apiPath.includes('sketch')) fieldName = 'sketchBase64';
        else if (apiPath.includes('wip')) fieldName = 'wipBase64';
        else if (apiPath.includes('upload-final')) fieldName = 'artworkBase64';
        else if (apiPath.includes('final-preview')) fieldName = 'previewBase64';

        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: selectedCommission.id, 
            [fieldName]: base64String 
          })
        });
        const data = await res.json();
        if (data.success) {
          toast(toastMsg, "success");
          const updated = data.data;
          setSelectedCommission(updated);
          setCommissions(prev => prev.map(c => c.id === updated.id ? updated : c));
        } else {
          toast(data.error || "Upload failed", "error");
        }
        loadingSetter(false);
      };
      reader.readAsDataURL(compressedBlob);
    } catch (error) {
      toast("Error during upload", "error");
      loadingSetter(false);
    }
  };

  const confirmPayment = async (id: string, stage: 'dp' | '75' | '100', isApproved: boolean) => {
    let reason = undefined;
    
    if (!isApproved) {
      const res = await confirm({
        title: "Reject Payment?",
        message: "Please provide a reason why this payment proof is being rejected. This will be sent to the client.",
        variant: "danger",
        confirmText: "Reject & Notify",
        showInput: true,
        inputPlaceholder: "Reason for rejection (e.g., Image too blurry, Wrong amount)..."
      });

      if (res === false) return; // User cancelled the modal
      if (typeof res === 'string') reason = res;
    }

    setIsProcessingPayment(`${id}-${stage}`);
    try {
      const res = await fetch('/api/admin/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage, isApproved, reason })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Payment ${stage === 'dp' ? '50%' : stage + '%'} ${isApproved ? 'Approved' : 'Rejected'}!`, "success");
        const updated = data.data;
        if (selectedCommission?.id === id) setSelectedCommission(updated);
        setCommissions(prev => prev.map(c => c.id === id ? updated : c));
      }
    } catch (error) {
      toast("Failed to confirm payment", "error");
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const resolveFeedback = async (id: string, stage: 'sketch' | 'wip' | 'final' | 'delivery') => {
    try {
      const res = await fetch('/api/admin/resolve-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage })
      });
      const data = await res.json();
      if (data.success) {
        toast("Feedback marked as resolved", "success");
        const updated = data.data;
        if (selectedCommission?.id === id) setSelectedCommission(updated);
        setCommissions(prev => prev.map(c => c.id === id ? updated : c));
      }
    } catch (error) {
      toast("Failed to resolve feedback", "error");
    }
  };

  const updatePrice = async (id: string, newPrice: number) => {
    try {
      const res = await fetch('/api/admin/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, price: newPrice })
      });
      const data = await res.json();
      if (data.success) {
        toast("Price updated successfully!", "success");
        const updated = data.data;
        if (selectedCommission?.id === id) setSelectedCommission(updated);
        setCommissions(prev => prev.map(c => c.id === id ? updated : c));
      }
    } catch (error) {
      toast("Failed to update price", "error");
    }
  };

  const handleArchiveAndPurge = async () => {
    if (!selectedCommission) return;

    const confirmed = await confirm({
      title: "Archive & Purge Project?",
      message: "This will download a ZIP folder of all project data and then PERMANENTLY DELETE the record and all associated images from Supabase. This cannot be undone.",
      confirmText: "Archiving Now",
      cancelText: "Cancel",
      variant: "danger"
    });

    if (!confirmed) return;

    setIsArchiving(true);
    try {
      await archiveCommission(selectedCommission);
      const res = await fetch(`/api/commissions?id=${selectedCommission.id}&purge=true`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast("Project archived to local drive and purged from cloud.", "success");
        setCommissions(prev => prev.filter(c => c.id !== selectedCommission.id));
        setSelectedCommission(null);
      } else {
        toast("Archive succeeded, but purge failed. Please delete manually.", "info");
      }
    } catch (error) {
      toast("An error occurred during archival", "error");
    } finally {
      setIsArchiving(false);
    }
  };

  if (!mounted) return null;

  const visibleCommissions = commissions.filter(c => 
    !c.client_note?.includes('[ARCHIVED_AT:') && 
    !c.client_note?.includes('[PURGED_AT:')
  );

  const filteredCommissions = visibleCommissions.filter(c =>
    (c.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (c.client_email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#05070A] pt-32 pb-20 px-4 md:px-10 selection:bg-purple-500/30 font-outfit">
      {/* Abstract Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 blur-[200px] rounded-full" />
      </div>

      {/* TOP NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-4 py-4 md:px-6 md:py-6">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1400px] mx-auto flex justify-between items-center px-4 md:px-10 py-4 md:py-5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[40px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <h1 className="text-xl md:text-2xl font-bold text-white font-syne tracking-tight">
                  Studio <span className="text-purple-400">Admin</span>
                </h1>
              </div>
              <p className="text-[8px] text-purple-400/40 uppercase tracking-[0.4em] font-black ml-4">
                {activeTab === 'commissions' ? 'Operations' : activeTab}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl gap-1">
            {[
              { id: 'commissions', label: 'Orders', icon: ShoppingBag },
              { id: 'gallery', label: 'Gallery', icon: ImageIcon },
              { id: 'portfolio', label: 'Project', icon: Briefcase },
              { id: 'personal', label: 'Personal', icon: User },
              { id: 'health', label: 'Health', icon: Activity },
              { id: 'recycle-bin', label: 'Bin', icon: Trash2 },
              { id: 'engagement', label: 'Stats', icon: LineChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.label}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 relative group flex items-center gap-2",
                  activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-purple-500/20 rounded-xl border border-purple-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon size={15} className={cn(
                  "relative z-10 transition-transform",
                  activeTab === tab.id ? "text-purple-400" : "text-white/30 group-hover:scale-110"
                )} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/5 p-1 rounded-xl">
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all group/back"
                title="View Site"
              >
                <ArrowLeft size={18} className="group-hover/back:-translate-x-0.5 transition-transform" />
              </Link>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button
                onClick={handleSignOut}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-all"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.div>

        {/* MOBILE MENU OVERLAY */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[-1]"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[280px] bg-[#05070A] border-l border-white/10 shadow-2xl z-50 p-8 pt-24"
              >
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black text-purple-400/40 uppercase tracking-[0.5em] mb-4">Navigation</span>
                  {[
                    { id: 'commissions', label: 'Orders', icon: ShoppingBag },
                    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                    { id: 'portfolio', label: 'Project', icon: Briefcase },
                    { id: 'personal', label: 'Personal Page', icon: User },
                    { id: 'pricing', label: 'Pricing', icon: Tag },
                    { id: 'health', label: 'Health', icon: Activity },
                    { id: 'recycle-bin', label: 'Recycle Bin', icon: Trash2 },
                    { id: 'engagement', label: 'Web Engagement', icon: LineChart }
                  ].map((tab, i) => (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                        activeTab === tab.id ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20" : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <tab.icon size={18} className={activeTab === tab.id ? "text-white" : "text-purple-400/40"} />
                        <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                      </div>
                      {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </motion.button>
                  ))}
                  <div className="h-px bg-white/5 my-8" />
                  <Link href="/" className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-white transition-all">
                    <ArrowLeft size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Site</span>
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/50 hover:bg-red-500 hover:text-white transition-all mt-4">
                    <LogOut size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <div className="max-w-7xl mx-auto pt-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-[1px] bg-purple-500/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-purple-400/60 font-outfit">Control Center</span>
            </div>
            <h1 className="text-5xl sm:text-8xl font-normal text-white leading-none tracking-tighter font-dancing-script">
              Creative <span className="text-purple-500/80">Hub</span>
            </h1>
            <p className="text-[11px] text-white/30 font-medium uppercase tracking-[0.4em] max-w-md leading-relaxed font-outfit">
              Hello Admin! Ready to create today?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-[450px]"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/5 blur-2xl rounded-full group-hover:bg-purple-500/10 transition-all duration-700" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-purple-400 transition-colors duration-500">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Search Client Orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-[24px] pl-16 pr-8 py-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all backdrop-blur-2xl shadow-inner"
              />
            </div>
          </motion.div>
        </div>

        {activeTab === 'commissions' ? (
          <>
            <AdminStats commissions={visibleCommissions} />
            <CommissionTable
              commissions={filteredCommissions}
              loading={loading}
              processingId={processingId}
              onUpdateStatus={updateStatus}
              onDeleteOrder={deleteOrder}
              onSelectCommission={setSelectedCommission}
              onOpenMessageHub={(c) => {
                setSelectedCommission(c);
                setIsMessageHubOpen(true);
              }}
              settings={settings}
              isUpdatingSettings={isUpdatingSettings}
              onToggleStatus={toggleCommissionStatus}
            />
          </>
        ) : activeTab === 'gallery' ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <GalleryManager />
          </motion.div>
        ) : activeTab === 'portfolio' ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ProjectManager />
          </motion.div>
        ) : activeTab === 'personal' ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <PersonalPageManager />
          </motion.div>
        ) : activeTab === 'pricing' ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <PricingManager />
          </motion.div>
        ) : activeTab === 'health' ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <StorageManager />
          </motion.div>
        ) : activeTab === 'recycle-bin' ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <RecycleBin />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <EngagementStats />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedCommission && !isMessageHubOpen && (
          <CommissionDetailModal
            key="detail-modal"
            commission={selectedCommission}
            onClose={() => setSelectedCommission(null)}
            onOpenMessageHub={() => setIsMessageHubOpen(true)}
            onArchive={handleArchiveAndPurge}
            isArchiving={isArchiving}
          />
        )}

        {isMessageHubOpen && selectedCommission && (
          <MessageHubModal
            key="message-hub-modal"
            show={isMessageHubOpen}
            commission={selectedCommission}
            onClose={() => setIsMessageHubOpen(false)}
            activeStageTab={activeStageTab}
            setActiveStageTab={setActiveStageTab}
            isUploadingSketch={isUploadingSketch}
            isUploadingWIP={isUploadingWIP}
            isUploadingFinalPreview={isUploadingFinalPreview}
            isUploadingFinalArtwork={isUploadingFinalArtwork}
            handleSketchUpload={(e) => handleFileUpload(e, '/api/admin/sketch', 'Rough sketch sent to client!', setIsUploadingSketch)}
            handleWIPUpload={(e) => handleFileUpload(e, '/api/admin/wip', 'WIP progress uploaded and client notified!', setIsUploadingWIP)}
            handleFinalPreviewUpload={(e) => handleFileUpload(e, '/api/admin/final-preview', 'Final Watermarked Preview uploaded!', setIsUploadingFinalPreview)}
            handleFinalArtworkUpload={(e) => handleFileUpload(e, '/api/admin/upload-final', 'Final high-res artwork delivered!', setIsUploadingFinalArtwork)}
            isProcessingPayment={isProcessingPayment}
            confirmPayment={confirmPayment}
            resolveFeedback={resolveFeedback}
            updatePrice={updatePrice}
          />
        )}

        <ReasonModal
          key="reason-modal"
          show={showReasonModal}
          onClose={() => setShowReasonModal(false)}
          onUpdateStatus={updateCommissionStatus}
        />
      </AnimatePresence>
      <AdminGuide />
    </main>
  );
};

export default AdminDashboard;
