"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, Image as ImageIcon, Upload, Download, Check, RefreshCcw, Info, MessageCircle, AlertCircle, Sparkles, Camera, X, ChevronRight, ArrowLeft, CreditCard, Shield } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageModal({ isOpen, onClose }: MessageModalProps) {
  const { toast } = useToast();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<TimelineMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null); // order ID
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [revisionImages, setRevisionImages] = useState<Record<string, string[]>>({});
  const [isSubmittingNote, setIsSubmittingNote] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isPayment75Uploading, setIsPayment75Uploading] = useState<string | null>(null);
  const [isPayment100Uploading, setIsPayment100Uploading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }

    const handleRefresh = () => fetchOrders();
    window.addEventListener("refreshOrderData", handleRefresh);
    return () => {
      window.removeEventListener("refreshOrderData", handleRefresh);
    };
  }, [isOpen]);

  const handleDownload = async (orderId: string, url: string) => {
    try {
      toast("Preparing high-res file...", "info");

      // 1. Track download in DB
      await fetch('/api/commissions/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId })
      });

      // 2. Trigger actual download via blob to force download dialog
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `artwork-${orderId.slice(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      } catch (blobError) {
        console.warn("Blob download failed, falling back to direct link:", blobError);
        // Fallback for CORS or other fetch issues
        const link = document.createElement('a');
        link.href = url;
        link.target = "_blank";
        link.download = `artwork-${orderId.slice(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast("Download started! Security timer active.", "success");
      fetchOrders(); // Refresh to show timer
    } catch (error) {
      console.error("Download handler error:", error);
      toast("Download failed", "error");
    }
  };

  const handleProgressPayment = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string, stage: '75' | '100') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast("Image size should be less than 1MB", "error");
      return;
    }

    if (stage === '75') setIsPayment75Uploading(orderId);
    else setIsPayment100Uploading(orderId);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/commissions/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId, paymentBase64: base64, stage })
        });

        if (res.ok) {
          toast("Payment proof uploaded successfully!", "success");
          fetchOrders(); // Refresh
        } else {
          toast("Failed to upload payment proof", "error");
        }
        if (stage === '75') setIsPayment75Uploading(null);
        else setIsPayment100Uploading(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast("Error uploading proof", "error");
      if (stage === '75') setIsPayment75Uploading(null);
      else setIsPayment100Uploading(null);
    }
  };

  const generateMessages = (orders: any[]) => {
    const allMessages: TimelineMessage[] = [];
    
    orders.forEach(order => {
      // Check for 24h self-destruct
      const isExpired = order.downloaded_at && 
        (new Date().getTime() - new Date(order.downloaded_at).getTime() > 24 * 60 * 60 * 1000);

      const secureOrder = { ...order };
      if (isExpired) {
        // Redact sensitive data
        secureOrder.reference_images = [];
        secureOrder.dp_proof_url = null;
        secureOrder.payment_75_proof_url = null;
        secureOrder.payment_100_proof_url = null;
        secureOrder.rough_sketch_url = null;
        secureOrder.wip_artwork_url = null;
        secureOrder.final_preview_url = null;
        secureOrder.sketch_revision_images = [];
        secureOrder.description = "[PROTECTED] Project data cleared for security.";
      }

      // 1. Submitted (Always)
      allMessages.push({
        id: `${order.id}-submitted`,
        orderId: order.id,
        type: 'SUBMITTED',
        title: "Canvas Received!",
        subtitle: `Order for ${order.commission_type}`,
        timestamp: order.created_at,
        order: secureOrder
      });

      // 2. Accepted (if status is not pending)
      if (order.status !== 'pending' && order.status !== 'rejected') {
        allMessages.push({
          id: `${order.id}-accepted`,
          orderId: order.id,
          type: 'ACCEPTED',
          title: "Request Accepted!",
          subtitle: "Your project is now in production",
          timestamp: order.updated_at || order.created_at,
          order: secureOrder
        });
      }

      // 3. Sketch Delivered
      if (order.rough_sketch_url && !isExpired) {
        allMessages.push({
          id: `${order.id}-sketch`,
          orderId: order.id,
          type: 'SKETCH',
          title: "Rough Sketch Ready!",
          subtitle: "Please review the initial draft",
          timestamp: order.updated_at,
          order: secureOrder
        });
      }

      // 4. DP Verified
      if (order.dp_status?.toLowerCase() === 'approved') {
        allMessages.push({
          id: `${order.id}-dp-verified`,
          orderId: order.id,
          type: 'DP_VERIFIED',
          title: "Payment Verified!",
          subtitle: "Deposit received, moving to rendering",
          timestamp: order.updated_at,
          order: secureOrder
        });
      }
      
      // 5. WIP Progress (Stage 2)
      if (order.wip_artwork_url && !isExpired) {
        allMessages.push({
          id: `${order.id}-wip`,
          orderId: order.id,
          type: 'WIP',
          title: "Rendering Progress!",
          subtitle: "Current WIP update from studio",
          timestamp: order.updated_at,
          order: secureOrder
        });
      }

      // 6. Final Preview (Stage 3)
      if (order.final_preview_url && !isExpired) {
        allMessages.push({
          id: `${order.id}-final`,
          orderId: order.id,
          type: 'FINAL_PREVIEW',
          title: "Final Review!",
          subtitle: "Masterpiece ready for final review",
          timestamp: order.updated_at,
          order: secureOrder
        });
      }

      // 7. Final Delivery (Stage 4)
      if (order.final_artwork_url && order.payment_100_status?.toLowerCase() === 'approved') {
        allMessages.push({
          id: `${order.id}-delivery`,
          orderId: order.id,
          type: 'FINAL_DELIVERY',
          title: "Files Delivered!",
          subtitle: isExpired ? "Project Archived (Security Purge)" : "Your high-resolution artwork is here",
          timestamp: order.updated_at,
          order: secureOrder
        });
      }
    });

    // Sort by timestamp descending
    return allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`/api/commissions/check-active?email=${encodeURIComponent(session.user.email!)}`);
      const data = await res.json();
      
      if (!res.ok) {
        toast(data.error || "Failed to fetch order data", "error");
        return;
      }

      if (data.active || (data.orders && data.orders.length > 0)) {
        const validOrders = data.orders.filter((o: any) => 
          ['pending', 'accepted', 'in_progress', 'done'].includes(o.status) && o.status !== 'archived'
        );
        setActiveOrders(validOrders);
        const generated = generateMessages(validOrders);
        setMessages(generated);
        
        // Auto-select newest message if none selected
        if (generated.length > 0 && !selectedMessageId) {
          setSelectedMessageId(generated[0].id);
        }
      } else {
        setActiveOrders([]);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDPUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    if (file.size > 1024 * 1024) {
      toast("Image size should be less than 1MB", "error");
      return;
    }

    setIsUploading(orderId);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const res = await fetch('/api/commissions/dp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: orderId, 
            dpBase64: base64String 
          })
        });

        const data = await res.json();
        if (data.success) {
          toast("DP Proof uploaded successfully!", "success");
          fetchOrders(); // Refresh data
        } else {
          toast(data.error || "Failed to upload DP proof", "error");
        }
        setIsUploading(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast("An error occurred during upload", "error");
      setIsUploading(null);
    }
  };

  const handleRevisionImageUpload = (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if ((revisionImages[orderId]?.length || 0) + files.length > 3) {
      toast("Maximum 3 reference images allowed", "error");
      return;
    }

    files.forEach(file => {
      if (file.size > 1024 * 1024) {
        toast(`${file.name} is too large (max 1MB)`, "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setRevisionImages(prev => ({
          ...prev,
          [orderId]: [...(prev[orderId] || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeRevisionImage = (orderId: string, index: number) => {
    setRevisionImages(prev => ({
      ...prev,
      [orderId]: prev[orderId].filter((_, i) => i !== index)
    }));
  };

  const handleRevisionSubmit = async (orderId: string, stage: 'sketch' | 'wip' | 'final' = 'sketch') => {
    const note = revisionNotes[orderId];
    const images = stage === 'sketch' ? (revisionImages[orderId] || []) : []; // Only sketch supports ref images for now

    if ((!note || note.trim() === "") && images.length === 0) {
      toast("Please enter a message or upload an image", "error");
      return;
    }

    setIsSubmittingNote(orderId);
    try {
      const res = await fetch('/api/commissions/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, note, images, stage })
      });

      const data = await res.json();
      if (data.success) {
        toast("Revision request sent to studio!", "success");
        setRevisionNotes(prev => ({ ...prev, [orderId]: "" }));
        setRevisionImages(prev => ({ ...prev, [orderId]: [] }));
        fetchOrders();
      } else {
        toast(data.error || "Failed to send revision", "error");
      }
    } catch (error) {
      toast("Failed to send message", "error");
    } finally {
      setIsSubmittingNote(null);
    }
  };
  const getOrderTemplate = (order: any) => {
    const addons = [
      order.is_couple ? 'Couple Synergy' : '',
      order.has_background ? 'Detailed BG' : ''
    ].filter(Boolean).join(', ') || 'None';

    return `Hello! I have just submitted a commission request via the website.

--- ORDER SUMMARY ---
Tracking ID: ${order.id}
Name: ${order.client_name}
Email: ${order.client_email}
Social Handle: ${order.social_media || 'Not provided'}

Package: ${order.commission_type}
Art Style: ${order.art_style}
Add-ons: ${addons}
Price: ${order.price}K IDR

Vision: ${order.description || 'No description provided.'}
References: ${order.references || 'None'}

Please check the details in the Dashboard! Thank you.`;
  };

  const getDMMessage = (order: any) => {
    return encodeURIComponent(getOrderTemplate(order));
  };

  const selectedMessage = messages.find(m => m.id === selectedMessageId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div key="message-modal-overlay" className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl h-full md:h-[80vh] bg-white md:border md:border-purple-100 md:shadow-[0_20px_50px_rgba(168,85,247,0.15)] md:rounded-[40px] overflow-hidden flex z-10"
          >
            {/* Sidebar - Message List */}
            <div className={cn(
              "w-full md:w-80 border-r border-purple-50 flex flex-col bg-slate-50/30 transition-all h-full",
              selectedMessageId ? "hidden md:flex" : "flex"
            )}>
              <div className="p-8 border-b border-purple-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-normal text-[#1A1F2B] font-dancing-script flex items-center gap-2">
                    My <span className="text-purple-500 font-bold">Inbox.</span>
                    {isLoading && messages.length > 0 && (
                      <RefreshCcw size={12} className="text-purple-400 animate-spin" />
                    )}
                  </h3>
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1 font-outfit font-black">Timeline Updates</p>
                </div>
                <div className="md:hidden">
                  <button onClick={onClose} className="p-2 text-slate-400"><X size={20} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {isLoading && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <RefreshCcw className="text-purple-400 animate-spin" size={24} />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-outfit">Syncing messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <Info className="text-purple-200 mx-auto mb-3" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-outfit">Inbox Empty</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMessageId(msg.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-[24px] transition-all relative group",
                        selectedMessageId === msg.id ? "bg-white shadow-lg shadow-purple-100/50 border border-purple-100" : "hover:bg-white/50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                          msg.type === 'SUBMITTED' ? "bg-purple-50 text-purple-600" :
                          msg.type === 'ACCEPTED' ? "bg-emerald-50 text-emerald-600" :
                          msg.type === 'SKETCH' ? "bg-blue-50 text-blue-600" : 
                          msg.type === 'WIP' ? "bg-indigo-50 text-indigo-600" :
                          msg.type === 'FINAL_PREVIEW' ? "bg-emerald-50 text-emerald-600" :
                          "bg-slate-50 text-slate-600"
                        )}>
                          {msg.type === 'SUBMITTED' ? <Sparkles size={14} /> :
                           msg.type === 'ACCEPTED' ? <Check size={14} /> :
                           msg.type === 'SKETCH' ? <ImageIcon size={14} /> : 
                           msg.type === 'WIP' ? <RefreshCcw size={14} /> :
                           msg.type === 'FINAL_PREVIEW' ? <Sparkles size={14} /> :
                           <Info size={14} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-bold text-[#1A1F2B] font-outfit truncate">{msg.title}</h4>
                          <p className="text-[8px] text-slate-400 font-outfit truncate">{msg.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Archive Notice */}
              <div className="p-6 border-t border-purple-50 bg-white/40">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                    <Shield size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-outfit">Archive Policy</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-medium font-outfit">
                      Completed projects are archived after 24 hours for security. Contact admin to restore.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area - Message Detail */}
            <div className={cn(
              "flex-1 flex flex-col bg-white transition-all h-full",
              !selectedMessageId ? "hidden md:flex" : "flex"
            )}>
              {selectedMessage ? (
                <>
                  {/* Detail Header */}
                  <div className="p-6 md:p-8 border-b border-purple-50 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedMessageId(null)}
                        className="md:hidden p-2 text-purple-600 hover:bg-purple-50 rounded-xl"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                        <MessageCircle className="text-purple-600" size={20} />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-[#1A1F2B] font-outfit">{selectedMessage.title}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-[8px] text-slate-400 uppercase tracking-widest font-outfit font-black">{selectedMessage.order.commission_type} Thread</p>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <p className="text-[9px] font-black text-purple-600 font-outfit">Rp {(selectedMessage.order.price * 1000).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-10 h-10 hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 transition-all border border-transparent hover:border-slate-100"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>

                  {/* Detail Content */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 custom-scrollbar bg-slate-50/20 pb-24">
                    <>
                    {selectedMessage.type === 'SUBMITTED' && (
                      <div className="max-w-xl mx-auto space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-purple-50 shadow-sm">
                          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                            <Sparkles size={24} />
                          </div>
                          <h5 className="text-lg font-bold text-[#1A1F2B] mb-4 font-outfit">Canvas Received!</h5>
                          <p className="text-sm text-slate-600 leading-relaxed font-outfit mb-8">
                            Your vision has been successfully transmitted to the studio. I'm currently reviewing the details and will get back to you shortly!
                          </p>
                          
                          <div className="space-y-6">
                            <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-3xl">
                              <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2">Tracking ID</p>
                              <p className="text-sm font-black text-[#1A1F2B] font-mono select-all break-all">{selectedMessage.orderId}</p>
                            </div>

                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DM Template</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(getOrderTemplate(selectedMessage.order));
                                    toast("Template copied!", "success");
                                  }}
                                  className="text-purple-600 hover:text-purple-700 text-[10px] font-black uppercase tracking-widest"
                                >
                                  Copy
                                </button>
                              </div>
                              <div className="text-[11px] text-slate-500 leading-relaxed font-outfit whitespace-pre-wrap bg-white p-4 rounded-2xl border border-slate-100 italic max-h-48 overflow-y-auto custom-scrollbar">
                                {getOrderTemplate(selectedMessage.order)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <a 
                                href={`https://ig.me/m/cuancapital.id?text=${getDMMessage(selectedMessage.order)}`} 
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 py-4 bg-white border border-purple-100 text-purple-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-50 transition-all font-outfit"
                              >
                                <Camera size={16} /> Instagram
                              </a>
                              <a 
                                href={`https://x.com/messages/compose?recipient_id=Zarry_linilo&text=${getDMMessage(selectedMessage.order)}`} 
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-outfit"
                              >
                                <X size={16} /> Twitter
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMessage.type === 'ACCEPTED' && (
                      <div className="max-w-xl mx-auto space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-emerald-50 shadow-sm text-center">
                          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                            <Check size={32} />
                          </div>
                          <h5 className="text-xl font-bold text-[#1A1F2B] mb-4 font-outfit">Request Accepted!</h5>
                          <p className="text-sm text-slate-600 leading-relaxed font-outfit">
                            Exciting news! I've accepted your commission request. Your project is now officially in the production queue. I'll start working on the rough sketch soon!
                          </p>
                          <div className="mt-10 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Status</p>
                            <p className="text-sm font-bold text-[#1A1F2B] font-outfit">Waiting for Rough Sketch Delivery</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMessage.type === 'SKETCH' && (
                      <div className="max-w-xl mx-auto space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-blue-50 shadow-sm">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                              <ImageIcon size={24} />
                            </div>
                            <div>
                              <h5 className="text-lg font-bold text-[#1A1F2B] font-outfit">Rough Sketch Delivery</h5>
                              <p className="text-[10px] text-slate-400 font-outfit font-black uppercase tracking-widest">Action Required</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 leading-relaxed font-outfit mb-8">
                            I've finished the initial layout! Please review the composition, pose, and details. You can request changes or proceed to the next stage.
                          </p>

                          <div className="relative group aspect-video rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 mb-8 shadow-inner">
                            <img src={selectedMessage.order.rough_sketch_url} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setFullscreenImage(selectedMessage.order.rough_sketch_url)} />
                            {/* Fine Mesh Grid Protection */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '3px 3px' }} 
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 px-6 py-3 rounded-full backdrop-blur-md">Click to Expand</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-outfit">Feedback & Revisions</p>
                            {selectedMessage.order.sketch_status === 'revision' ? (
                              <div className="p-6 bg-orange-50 border border-orange-100 rounded-3xl flex items-center gap-4">
                                <RefreshCcw size={20} className="text-orange-500 animate-spin" />
                                <p className="text-[12px] font-outfit text-orange-800/80 italic">Revision request sent. I'm updating the sketch now!</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <textarea 
                                  value={revisionNotes[selectedMessage.orderId] || ''}
                                  onChange={(e) => setRevisionNotes(prev => ({ ...prev, [selectedMessage.orderId]: e.target.value }))}
                                  placeholder="Write your feedback or request changes..."
                                  className="w-full p-5 rounded-3xl border border-slate-100 bg-slate-50/30 text-sm font-outfit focus:outline-none focus:border-purple-400 focus:bg-white transition-all resize-none h-32 custom-scrollbar shadow-sm"
                                />
                                
                                {/* Revision Images Upload */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-outfit">Reference Images (Max 3)</p>
                                    <span className="text-[9px] text-slate-300 font-bold uppercase">{revisionImages[selectedMessage.orderId]?.length || 0}/3</span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-3">
                                    {revisionImages[selectedMessage.orderId]?.map((img, idx) => (
                                      <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 group">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button 
                                          onClick={() => removeRevisionImage(selectedMessage.orderId, idx)}
                                          className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    ))}
                                    
                                    {(revisionImages[selectedMessage.orderId]?.length || 0) < 3 && (
                                      <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-purple-300 hover:text-purple-400 cursor-pointer transition-all">
                                        <Upload size={18} />
                                        <span className="text-[8px] font-bold mt-1 uppercase">Add</span>
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          multiple 
                                          className="hidden" 
                                          onChange={(e) => handleRevisionImageUpload(e, selectedMessage.orderId)} 
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                <button 
                                  onClick={() => handleRevisionSubmit(selectedMessage.orderId)}
                                  disabled={isSubmittingNote === selectedMessage.orderId}
                                  className="w-full py-4 bg-slate-900 hover:bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all font-outfit flex items-center justify-center shadow-lg shadow-purple-100"
                                >
                                  {isSubmittingNote === selectedMessage.orderId ? <RefreshCcw size={16} className="animate-spin" /> : "Submit Revision Request"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment Guidance if sketch delivered */}
                        <div className="bg-white p-8 rounded-[40px] border border-emerald-50 shadow-sm">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                              <Check size={24} />
                            </div>
                            <h5 className="text-lg font-bold text-[#1A1F2B] font-outfit">Unlock Full Rendering</h5>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed font-outfit mb-8">
                            Satisfied with the sketch? To proceed with clean lines and rendering, a 50% Down Payment is required.
                          </p>

                          {selectedMessage.order.dp_proof_url && selectedMessage.order.dp_status?.toLowerCase() !== 'rejected' ? (
                            <div className={cn(
                              "p-8 rounded-3xl border flex flex-col items-center justify-center text-center space-y-4 transition-all",
                              selectedMessage.order.dp_status?.toLowerCase() === 'approved' ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
                            )}>
                              {selectedMessage.order.dp_status?.toLowerCase() === 'approved' ? (
                                <>
                                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <Check size={24} />
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest font-outfit">Payment Verified</p>
                                    <p className="text-[9px] text-emerald-500/60 uppercase font-bold font-outfit mt-1">Rendering in progress!</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <RefreshCcw size={32} className="text-amber-500 animate-spin" />
                                  <div>
                                    <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest font-outfit">Checking Receipt</p>
                                    <p className="text-[9px] text-amber-500/60 uppercase font-bold font-outfit mt-1">Usually takes 1-2 hours</p>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {selectedMessage.order.dp_status?.toLowerCase() === 'rejected' && (
                                <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
                                  <AlertCircle className="text-rose-500 shrink-0" size={20} />
                                  <div>
                                    <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest font-outfit">Proof Rejected</p>
                                    <p className="text-[12px] font-outfit text-rose-800/80 leading-relaxed mt-1">Please re-upload a clear, valid transfer receipt.</p>
                                  </div>
                                </div>
                              )}
                              <label className={cn(
                                "flex flex-col items-center justify-center py-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer group relative overflow-hidden",
                                selectedMessage.order.dp_status === 'rejected' ? "border-rose-200 bg-rose-50/30" : "border-purple-100 bg-slate-50/50 hover:bg-white hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100/50",
                                isUploading === selectedMessage.orderId ? "opacity-50 pointer-events-none" : ""
                              )}>
                                {isUploading === selectedMessage.orderId ? (
                                  <RefreshCcw size={32} className="text-purple-500 animate-spin mb-3" />
                                ) : (
                                  <Upload size={32} className={cn("transition-all mb-3 group-hover:-translate-y-1", selectedMessage.order.dp_status === 'rejected' ? "text-rose-400" : "text-purple-400")} />
                                )}
                                <span className={cn("text-[11px] font-black uppercase tracking-widest font-outfit text-center px-6", selectedMessage.order.dp_status === 'rejected' ? "text-rose-600" : "text-[#1A1F2B]")}>
                                  {isUploading === selectedMessage.orderId ? "Processing Receipt..." : "Upload Transfer Receipt"}
                                </span>
                                <p className="text-[9px] text-slate-400 mt-2 font-medium font-outfit uppercase tracking-wider">
                                  Transfer Amount: <span className="text-purple-600 font-black">Rp {Math.round(selectedMessage.order.price * 0.5 * 1000).toLocaleString('id-ID')}</span>
                                </p>
                                <p className="text-[9px] text-slate-400 mt-0.5 font-medium font-outfit">JPG, PNG up to 1MB</p>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDPUpload(e, selectedMessage.orderId)} />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedMessage.type === 'DP_VERIFIED' && (
                      <div className="max-w-xl mx-auto space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-emerald-50 shadow-sm text-center">
                          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                            <Check size={32} />
                          </div>
                          <h5 className="text-xl font-bold text-[#1A1F2B] mb-4 font-outfit">Payment Received!</h5>
                          <p className="text-sm text-slate-600 leading-relaxed font-outfit">
                            Thank you! Your deposit has been verified. I am now proceeding with the full rendering and finishing of your commission.
                          </p>
                          <div className="mt-10 p-8 bg-slate-900 rounded-[32px] text-white overflow-hidden relative group">
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
                              transition={{ duration: 4, repeat: Infinity }}
                              className="absolute top-0 right-0 p-4 opacity-20"
                            >
                              <Sparkles size={80} />
                            </motion.div>
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 relative z-10">Production Stage</p>
                            <p className="text-lg font-bold font-outfit relative z-10">Full Rendering Phase</p>
                            <p className="text-[11px] text-slate-400 mt-2 relative z-10 leading-relaxed">Usually takes 3-7 days depending on complexity.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMessage.type === 'WIP' && (
                      <div className="max-w-xl mx-auto space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-indigo-50 shadow-sm">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                              <RefreshCcw size={24} />
                            </div>
                            <div>
                              <h5 className="text-lg font-bold text-[#1A1F2B] font-outfit">Work In Progress</h5>
                              <p className="text-[10px] text-slate-400 font-outfit font-black uppercase tracking-widest">Rendering Stage</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 leading-relaxed font-outfit mb-8">
                            Here is the current rendering progress of your artwork. We are moving into the final stages!
                          </p>

                          <div className="relative group aspect-video rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 mb-8 shadow-inner">
                            <img src={selectedMessage.order.wip_artwork_url} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setFullscreenImage(selectedMessage.order.wip_artwork_url)} />
                            {/* Fine Mesh Grid Protection */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '3px 3px' }} 
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 px-6 py-3 rounded-full backdrop-blur-md">Click to Expand</span>
                            </div>
                          </div>

                          <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 mb-8">
                             <p className="text-[11px] font-outfit text-indigo-800 font-medium">Almost there! I'm now polishing the details and adding final lighting effects.</p>
                          </div>

                          {/* WIP Feedback Section */}
                          <div className="bg-white p-8 rounded-[40px] border border-indigo-50 shadow-sm mb-8">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <MessageCircle size={24} />
                              </div>
                              <h5 className="text-lg font-bold text-[#1A1F2B] font-outfit">Feedback</h5>
                            </div>

                            {selectedMessage.order.wip_status === 'revision' ? (
                              <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                                <p className="text-[12px] font-outfit text-orange-800/80 italic">Feedback sent. I'm reviewing your notes!</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <textarea 
                                  value={revisionNotes[selectedMessage.orderId] || ''}
                                  onChange={(e) => setRevisionNotes(prev => ({ ...prev, [selectedMessage.orderId]: e.target.value }))}
                                  placeholder="Any small adjustments? (e.g., color tweaks, minor details)..."
                                  className="w-full p-5 rounded-3xl border border-slate-100 bg-slate-50/30 text-sm font-outfit focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none h-32 custom-scrollbar shadow-sm"
                                />
                                <button 
                                  onClick={() => handleRevisionSubmit(selectedMessage.orderId, 'wip')}
                                  disabled={isSubmittingNote === selectedMessage.orderId}
                                  className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all font-outfit flex items-center justify-center"
                                >
                                  {isSubmittingNote === selectedMessage.orderId ? <RefreshCcw size={16} className="animate-spin" /> : "Send Feedback"}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 75% Payment Section */}
                          <div className="bg-white p-8 rounded-[40px] border border-emerald-50 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <CreditCard size={24} />
                              </div>
                              <div>
                                <h6 className="text-sm font-bold text-[#1A1F2B] font-outfit">Mid-Production Payment</h6>
                                <p className="text-[10px] text-slate-400 font-outfit font-black uppercase tracking-widest">75% Installment</p>
                              </div>
                            </div>

                            {selectedMessage.order.payment_75_status?.toLowerCase() === 'approved' ? (
                              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <Check size={16} className="text-emerald-600" />
                                <p className="text-[11px] font-bold text-emerald-800 font-outfit uppercase tracking-wider">Payment Verified (75%)</p>
                              </div>
                            ) : selectedMessage.order.payment_75_status?.toLowerCase() === 'paid' ? (
                              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <RefreshCcw size={16} className="text-orange-600 animate-spin" />
                                <p className="text-[11px] font-bold text-orange-800 font-outfit uppercase tracking-wider">Awaiting Verification...</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className="text-xs text-slate-500 font-outfit leading-relaxed">
                                  To continue with the final rendering, a progress payment is required to reach 75% of the total price.
                                </p>
                                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-100 rounded-[32px] bg-emerald-50/20 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all cursor-pointer group">
                                  {isPayment75Uploading === selectedMessage.orderId ? (
                                    <RefreshCcw size={32} className="text-emerald-600 animate-spin" />
                                  ) : (
                                    <>
                                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                      </div>
                                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest font-outfit">Upload Payment Proof</p>
                                      <p className="text-[9px] text-slate-400 mt-1 font-bold font-outfit uppercase tracking-wider">
                                        Amount: <span className="text-emerald-600">Rp {Math.round(selectedMessage.order.price * 0.25 * 1000).toLocaleString('id-ID')}</span>
                                      </p>
                                      <p className="text-[9px] text-slate-300 mt-0.5 font-medium font-outfit uppercase tracking-tighter">Reach 75% Milestone</p>
                                      <p className="text-[9px] text-slate-400 mt-1 font-medium font-outfit">JPG, PNG up to 1MB</p>
                                    </>
                                  )}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleProgressPayment(e, selectedMessage.orderId, '75')}
                                    disabled={!!isPayment75Uploading}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMessage.type === 'FINAL_PREVIEW' && (
                      <div className="max-w-xl mx-auto space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-emerald-50 shadow-sm">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                              <Sparkles size={24} />
                            </div>
                            <div>
                              <h5 className="text-lg font-bold text-[#1A1F2B] font-outfit">Final Review</h5>
                              <p className="text-[10px] text-slate-400 font-outfit font-black uppercase tracking-widest">Last Milestone</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 leading-relaxed font-outfit mb-8">
                            The masterpiece is complete! Please review the final version below. Once the final payment is verified, I will prepare the high-resolution files for delivery.
                          </p>

                          <div className="relative group aspect-video rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 mb-8 shadow-inner select-none"
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            <img 
                              src={selectedMessage.order.final_preview_url} 
                              className="w-full h-full object-cover pointer-events-none" 
                            />
                            {/* Fine Mesh Grid Protection */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.08]" 
                                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '2px 2px' }} 
                            />
                            {/* Security Watermark Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center opacity-10 rotate-[-30deg] scale-150 overflow-hidden">
                              {Array.from({ length: 40 }).map((_, i) => (
                                <span key={i} className="text-[14px] font-black uppercase tracking-[0.5em] text-black m-8 whitespace-nowrap">
                                  MOONCHAERY STUDIO PREVIEW • NOT FOR USE •
                                </span>
                              ))}
                            </div>
                            {/* Expand Overlay */}
                            <div 
                              className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center cursor-zoom-in"
                              onClick={() => setFullscreenImage(selectedMessage.order.final_preview_url)}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-6 py-3 rounded-full backdrop-blur-md">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Click to Expand</span>
                              </div>
                            </div>
                          </div>


                          {/* 100% Final Payment Section */}
                          <div className="bg-slate-900 p-8 rounded-[32px] text-white">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                <CreditCard size={24} />
                              </div>
                              <div>
                                <h6 className="text-sm font-bold font-outfit">Final Payment</h6>
                                <p className="text-[10px] text-slate-400 font-outfit font-black uppercase tracking-widest">100% Total</p>
                              </div>
                            </div>

                            {selectedMessage.order.payment_100_status?.toLowerCase() === 'approved' ? (
                              <div className="flex items-center gap-3 p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                                <Check size={16} className="text-emerald-400" />
                                <p className="text-[11px] font-bold text-emerald-400 font-outfit uppercase tracking-wider">Final Payment Verified</p>
                              </div>
                            ) : selectedMessage.order.payment_100_status?.toLowerCase() === 'paid' ? (
                              <div className="flex items-center gap-3 p-4 bg-orange-500/20 rounded-2xl border border-orange-500/30">
                                <RefreshCcw size={16} className="text-orange-400 animate-spin" />
                                <p className="text-[11px] font-bold text-orange-400 font-outfit uppercase tracking-wider">Verifying Final Payment...</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className="text-xs text-slate-400 font-outfit leading-relaxed">
                                  Almost there! Please upload the remaining 25% payment proof to unlock the full-resolution files.
                                </p>
                                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-[32px] bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group">
                                  {isPayment100Uploading === selectedMessage.orderId ? (
                                    <RefreshCcw size={32} className="text-emerald-400 animate-spin" />
                                  ) : (
                                    <>
                                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                      </div>
                                      <p className="text-[10px] font-black text-white uppercase tracking-widest font-outfit">Upload Final Proof</p>
                                      <p className="text-[9px] text-emerald-400 mt-1 font-bold font-outfit uppercase tracking-wider">
                                        Final Balance: Rp {Math.round(selectedMessage.order.price * 0.25 * 1000).toLocaleString('id-ID')}
                                      </p>
                                      <p className="text-[9px] text-slate-500 mt-0.5 font-medium font-outfit uppercase tracking-tighter">Reach 100% Completion</p>
                                      <p className="text-[9px] text-slate-400 mt-1 font-medium font-outfit">JPG, PNG up to 1MB</p>
                                    </>
                                  )}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleProgressPayment(e, selectedMessage.orderId, '100')}
                                    disabled={!!isPayment100Uploading}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedMessage.type === 'FINAL_DELIVERY' && (
                      <div className="max-w-xl mx-auto space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-emerald-50 shadow-xl overflow-hidden relative">
                          {/* Self-Destruct Warning Header */}
                          {selectedMessage.order.downloaded_at && (
                            <div className="absolute top-0 left-0 right-0 bg-rose-500 py-2 px-4 flex items-center justify-center gap-2">
                              <AlertCircle size={14} className="text-white animate-pulse" />
                              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                Security Notice: Files will be purged in {(() => {
                                  const expiry = new Date(selectedMessage.order.downloaded_at).getTime() + (24 * 60 * 60 * 1000);
                                  const remaining = expiry - Date.now();
                                  const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
                                  const mins = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));
                                  return `${hours}h ${mins}m`;
                                })()}
                              </span>
                            </div>
                          )}

                          <div className="pt-10 flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                              <Check size={32} />
                            </div>
                            <div>
                              <h5 className="text-2xl font-bold text-[#1A1F2B] font-outfit">Project Complete!</h5>
                              <p className="text-[10px] text-slate-400 font-outfit font-black uppercase tracking-widest">High-Res Delivery</p>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed font-outfit mb-8">
                            Thank you for your trust! Below is the high-resolution final version of your artwork. 
                            <span className="block mt-2 font-bold text-rose-500">
                              ⚠️ Warning: For your security, all project data (proofs, references) will be permanently deleted 24 hours after the first download.
                            </span>
                          </p>

                          <div className="relative group aspect-video rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 mb-8 shadow-2xl">
                            <img src={selectedMessage.order.final_artwork_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => handleDownload(selectedMessage.orderId, selectedMessage.order.final_artwork_url)}
                                className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
                              >
                                <Download size={18} />
                                Download Full-Res
                              </button>
                            </div>
                          </div>

                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <ImageIcon size={20} className="text-purple-400" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filename</p>
                                <p className="text-xs font-bold text-slate-700">final-delivery-{selectedMessage.orderId.slice(0, 8)}.png</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</p>
                              <p className="text-xs font-bold text-slate-700">PNG / HQ</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center py-8">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Stay Inspired</p>
                          <h6 className="text-2xl font-normal text-[#1A1F2B] font-dancing-script">Moonchaery Studio.</h6>
                        </div>
                      </div>
                      )}
                    </>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                  <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center border border-purple-100 shadow-xl shadow-purple-100/50 mb-8">
                    <MessageCircle className="text-purple-200" size={40} />
                  </div>
                  <h3 className="text-2xl font-normal text-[#1A1F2B] mb-3 font-dancing-script">Your <span className="text-purple-500 font-bold">Inbox.</span></h3>
                  <p className="text-sm font-outfit text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Select a message from the sidebar to view production updates and artwork milestones.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        {/* Fullscreen Preview Overlay */}
        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 select-none"
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => setFullscreenImage(null)}
            >
              <div className="relative max-w-full max-h-full overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <img 
                  src={fullscreenImage} 
                  className="max-w-full max-h-[90vh] object-contain pointer-events-none"
                  alt="Preview"
                />

                {/* Advanced Fine Mesh Protection Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.12]" 
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '2px 2px' }} 
                />
                
                {/* Watermark Overlay for Fullscreen - More Dense and Bold */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-wrap content-center justify-center opacity-[0.25] rotate-[-30deg] scale-150">
                  {Array.from({ length: 150 }).map((_, i) => (
                    <span key={i} className="text-[24px] font-black uppercase tracking-[0.6em] text-white m-8 whitespace-nowrap drop-shadow-lg">
                      MOONCHAERY STUDIO PREVIEW • NOT FOR USE • {user?.email?.split('@')[0] || 'GUEST'}
                    </span>
                  ))}
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setFullscreenImage(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

// Add these types at the bottom or in a separate file
type MilestoneType = 'SUBMITTED' | 'ACCEPTED' | 'SKETCH' | 'DP_VERIFIED' | 'WIP' | 'FINAL_PREVIEW' | 'FINAL_DELIVERY' | 'COMPLETED';

interface TimelineMessage {
  id: string;
  orderId: string;
  type: MilestoneType;
  title: string;
  subtitle: string;
  timestamp: string;
  order: any;
}
