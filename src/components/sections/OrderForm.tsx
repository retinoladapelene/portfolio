"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Send, Upload, X, Palette, Sparkles, Wand2, Mail, MessageCircle, User, CreditCard, AlignLeft, Info, ShieldCheck, Clock, ShieldAlert, Image, Link as LinkIcon, Camera, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import TermsModal from "../ui/TermsModal";
import { useToast } from "@/components/ui/Toast";

const ART_STYLES = ["Manga", "Full Render", "Line Art"];
const BASE_PRICES = {
  "Headshot": 80,
  "Bust Up": 100,
  "Halfbody": 130,
  "Knee Up": 180
};

const OrderForm = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState("");
  const [hasActiveCommission, setHasActiveCommission] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isCouple, setIsCouple] = useState(false);
  const [hasBackground, setHasBackground] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    socialHandle: "",
    paymentMethod: "",
    background: "",
    description: "",
    references: "",
    showPaymentDropdown: false
  });
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [pricingConfigs, setPricingConfigs] = useState<any[]>([]);
  const [commissionsOpen, setCommissionsOpen] = useState(true);
  const [closedReason, setClosedReason] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, settingsRes] = await Promise.all([
          fetch('/api/pricing'),
          fetch(`/api/admin/settings?t=${Date.now()}`)
        ]);
        
        if (!pricingRes.ok || !settingsRes.ok) {
          throw new Error('HTTP error when fetching pricing or settings');
        }

        const pricingData = await pricingRes.json();
        const settingsData = await settingsRes.json();

        if (pricingData.success) setPricingConfigs(pricingData.data);
        if (settingsData.success && settingsData.data) {
          setCommissionsOpen(settingsData.data.commissions_open);
          setClosedReason(settingsData.data.closed_reason || "");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const supabase = createClient();

  const checkAuthAndActiveCommission = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
      return null;
    }

    setUser(session.user);
    const userEmail = session.user.email?.toLowerCase().trim() || "";
    setFormData(prev => ({ ...prev, email: userEmail }));

    // Check for active commissions via SERVER-SIDE API to bypass RLS
    try {
      const statusRes = await fetch(`/api/commissions/check-active?email=${encodeURIComponent(userEmail)}`);
      const statusData = await statusRes.json();

      if (statusData.active) {
        setHasActiveCommission(true);
        return false;
      }
    } catch (err) {
      console.error("Failed to check commission status:", err);
    }

    setHasActiveCommission(false);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError("");

    const validFiles = files.filter(file => {
      if (file.size > 1024 * 1024) {
        setUploadError(`File ${file.name} is too large. Max 1MB.`);
        return false;
      }
      return true;
    });

    setReferenceFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setReferenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const handlePrefill = async (e: any) => {
      if (!commissionsOpen) {
        toast(closedReason || "Sorry, commissions are currently closed to maintain quality.", "info");
        return;
      }
      const isAllowed = await checkAuthAndActiveCommission();
      if (!isAllowed && isAllowed !== null) {
        setIsOpen(true);
        return;
      }
      if (isAllowed === null) return;

      const { type, isCouple: couple, hasBackground: bg } = e.detail;
      if (type) setSelectedType(type);
      setIsCouple(!!couple);
      setHasBackground(!!bg);
      
      let desc = "";
      if (couple) desc += "Couple Commission (2x Price). ";
      if (bg) desc += "With detailed background. ";
      
      setFormData(prev => ({ ...prev, description: desc }));
      setIsOpen(true);
      setStep(2);
    };

    window.addEventListener("prefillOrder", handlePrefill);
    
    const handleOpen = async () => {
      if (!commissionsOpen) {
        toast(closedReason || "Sorry, commissions are currently closed to maintain quality.", "info");
        return;
      }
      const isAllowed = await checkAuthAndActiveCommission();
      if (isAllowed === null) return;
      
      setIsSuccess(false);
      setStep(1);
      setIsOpen(true);
    };
    window.addEventListener("openOrderForm", handleOpen);

    return () => {
      window.removeEventListener("prefillOrder", handlePrefill);
      window.removeEventListener("openOrderForm", handleOpen);
    };
  }, [commissionsOpen]);

  useEffect(() => {
    const pkg = pricingConfigs.find(c => c.category === 'package' && c.label === selectedType);
    const coupleMult = pricingConfigs.find(c => c.category === 'multiplier' && c.key === 'couple_multiplier')?.value || 2;
    const extraBg = pricingConfigs.find(c => c.category === 'extra' && c.key === 'background_premium')?.value || 50;

    let price = pkg?.value || 0;
    if (isCouple) price *= coupleMult;
    if (hasBackground) price += extraBg;
    setCalculatedPrice(price);
  }, [selectedType, isCouple, hasBackground, pricingConfigs]);

  const handleSubmit = async () => {
    const errors: string[] = [];
    if (!formData.name) errors.push("name");
    if (!formData.email) errors.push("email");
    if (!formData.socialHandle) errors.push("social");
    if (!formData.description) errors.push("description");
    if (!selectedStyle) errors.push("style");
    if (!formData.paymentMethod) errors.push("payment");

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast("Some required fields are missing! We've highlighted them for you.", "error");
      
      // Scroll to the first error
      const firstError = errors[0];
      const element = document.getElementById(`field-${firstError}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: Focus the input if it's a text input
        const input = element.querySelector('input, select, textarea') as HTMLElement;
        if (input) input.focus();
      }
      return;
    }

    setValidationErrors([]);

    const isStillAllowed = await checkAuthAndActiveCommission();
    if (!isStillAllowed) {
      toast("Our system shows you already have an active commission. One at a time, please!", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert files to base64
      const filePromises = referenceFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      const base64Files = await Promise.all(filePromises);

      const response = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          commissionType: selectedType,
          artStyle: selectedStyle,
          price: calculatedPrice,
          isCouple,
          hasBackground,
          socialHandle: formData.socialHandle,
          referenceImages: base64Files // Send as array of base64
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        setSubmittedOrderId(result.id || "");
        setReferenceFiles([]); // Reset files
        window.dispatchEvent(new CustomEvent("refreshOrderData"));
      } else {
        console.error("Database save failed:", result.error);
        toast(`Submission failed: ${result.error || 'Technical issue detected'}`, "error");
      }
    } catch (error) {
      console.error(error);
      toast("An error occurred during submission. Please try again!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderTemplate = () => {
    const addons = [
      isCouple ? 'Couple Synergy' : '',
      hasBackground ? 'Detailed BG' : ''
    ].filter(Boolean).join(', ') || 'None';

    return `Hello! I have just submitted a commission request via the website.

--- ORDER SUMMARY ---
Tracking ID: ${submittedOrderId || 'Pending'}
Name: ${formData.name}
Email: ${formData.email}
Social Handle: ${formData.socialHandle}

Package: ${selectedType}
Art Style: ${selectedStyle}
Add-ons: ${addons}
Price: ${calculatedPrice}K IDR

Vision: ${formData.description || 'No description provided.'}
References: ${formData.references || 'None'}

Please check the details in the Dashboard! Thank you.`;
  };

  const getDMMessage = () => {
    return encodeURIComponent(getOrderTemplate());
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <div key="order-form-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Artistic Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Animated Art Blobs (Lilac Accents) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                x: [0, 100, 0], 
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" 
            />
            <motion.div 
              animate={{ 
                x: [0, -80, 0], 
                y: [0, 100, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full" 
            />
          </div>

          {/* Modal Content */}
          <motion.div
            key="order-form-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-[460px] relative z-10"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-4 md:right-0 group flex items-center gap-3 z-50 cursor-pointer"
            >
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400 group-hover:text-purple-300 transition-colors font-outfit">Discard Draft</span>
              <div className="w-8 h-8 rounded-full border border-purple-500/30 bg-purple-950/60 backdrop-blur-md flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:border-purple-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500">
                <X size={14} />
              </div>
            </button>

            <div className="bg-[#0D0A1C]/95 backdrop-blur-2xl border border-purple-500/20 shadow-[0_30px_70px_rgba(139,92,246,0.25)] rounded-[32px] relative flex flex-col max-h-[85vh] text-slate-100 overflow-hidden">
              {/* Header Section - Premium Glass */}
              <div className="p-6 pb-5 border-b border-purple-500/10 flex justify-between items-end bg-purple-950/20 backdrop-blur-md">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Palette size={12} className="text-purple-400 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-300 font-outfit">Studio Atelier</span>
                  </div>
                  <h2 className="text-3xl font-normal text-white leading-none font-dancing-script">
                    Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 font-bold drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">Vision.</span>
                  </h2>
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-500 shadow-sm", step >= 1 ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] scale-110" : "bg-purple-950/60 border border-purple-500/30")} />
                    <div className={cn("w-6 h-[1.5px] transition-colors duration-500", step >= 2 ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-purple-950/40")} />
                    <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-500 shadow-sm", step >= 2 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] scale-110" : "bg-purple-950/60 border border-purple-500/30")} />
                  </div>
                  <span className="text-[8px] font-black text-purple-300 uppercase tracking-widest font-outfit">Step {step} of 2</span>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar space-y-5 bg-purple-950/5">

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center text-slate-100"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-16 h-16 bg-purple-950/40 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      <Sparkles size={32} />
                    </motion.div>
                    
                    <h3 className="text-4xl font-normal text-white mb-4 font-dancing-script">Canvas Received!</h3>
                    
                    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 p-5 rounded-2xl mb-6 shadow-xl backdrop-blur-md">
                      <p className="text-purple-200 font-bold text-[13px] leading-relaxed font-outfit">
                        Your vision has been sent to my studio!
                      </p>
                      <p className="text-purple-300/80 text-[11px] font-medium font-outfit mt-2 leading-relaxed">
                        I will review your request shortly. You'll receive an <span className="text-white font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">email notification</span> once it's accepted.
                        <br/>
                        <span className="opacity-75 mt-2 block italic text-[10px]">Track your progress anytime in the <span className="text-white font-bold">Dashboard</span> (inbox icon).</span>
                      </p>
                    </div>

                    {/* NEW: Order ID Display */}
                    <div className="mb-6 p-4 bg-purple-950/40 border border-purple-500/20 rounded-2xl w-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                      <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1 font-outfit">Your Tracking ID</p>
                      <p className="text-[13px] font-black text-white font-syne select-all break-all drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">{submittedOrderId}</p>
                      <p className="text-[8px] text-purple-400/60 font-medium mt-1.5 uppercase tracking-tighter font-outfit">*Save this ID to track your order</p>
                    </div>

                    {/* Social Discussion Section */}
                    <div className="w-full space-y-4 mb-8">
                      {/* Copy Template Section */}
                      <div className="w-full p-4 bg-purple-950/20 border border-purple-500/10 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-purple-300/60 uppercase tracking-widest font-outfit">Message Template</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(getOrderTemplate());
                              toast("Order template successfully copied!", "success");
                            }}
                            className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                          >
                            <Check size={10} /> <span className="text-[9px] font-black uppercase tracking-widest font-outfit">Copy Text</span>
                          </button>
                        </div>
                        <div className="text-left text-[10px] text-purple-200/70 leading-relaxed font-outfit whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar bg-purple-950/40 p-3.5 rounded-xl border border-purple-500/10 italic">
                          {getOrderTemplate()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-px w-8 bg-purple-500/10" />
                        <span className="text-[8px] font-black text-purple-400/60 uppercase tracking-[0.2em] font-outfit">Quick Discussion</span>
                        <div className="h-px w-8 bg-purple-500/10" />
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <a 
                          href="https://x.com/Zarry_linilo?s=20" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 bg-purple-950/30 border border-purple-500/20 text-purple-300 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.15)] font-outfit group cursor-pointer"
                        >
                          <X size={12} className="group-hover:scale-110 transition-transform" /> Twitter
                        </a>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all shadow-lg shadow-purple-950/40 font-outfit cursor-pointer"
                    >
                      Back to Gallery
                    </button>
                  </motion.div>
                ) : hasActiveCommission ? (
                  <motion.div
                    key="active-limit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center text-slate-100"
                  >
                    <div className="w-16 h-16 bg-purple-950/40 border border-purple-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                      <Clock className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-4xl font-normal text-white mb-4 font-dancing-script">
                      Ongoing <span className="text-purple-400 font-bold drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">Masterpiece.</span>
                    </h3>
                    <p className="text-purple-200/70 font-outfit max-w-xs mx-auto mb-10 text-[13px] leading-relaxed">
                      Please stay tuned! You currently have a commission in progress. 
                      To ensure the highest quality for every piece, I only accept one active project per client. 
                      Please wait until your current vision is <span className="text-purple-400 font-bold">Completed</span> or <span className="text-rose-400 font-bold">Cancelled</span> before starting a new one.
                    </p>

                    {/* Social Discussion Section */}
                    <div className="w-full space-y-3 mb-8">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-px w-8 bg-purple-500/10" />
                        <span className="text-[8px] font-black text-purple-400/60 uppercase tracking-[0.2em] font-outfit">Need to discuss?</span>
                        <div className="h-px w-8 bg-purple-500/10" />
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <a 
                          href="https://x.com/Zarry_linilo?s=20" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 bg-purple-950/30 border border-purple-500/20 text-purple-300 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.15)] font-outfit group cursor-pointer"
                        >
                          <X size={12} className="group-hover:scale-110 transition-transform" /> Twitter
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all shadow-lg shadow-purple-950/40 font-outfit cursor-pointer"
                    >
                      Back to Gallery
                    </button>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6 text-slate-100"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 ml-1">
                        <Info size={12} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-300/70 font-outfit">Select Package Type</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {(pricingConfigs.length > 0 
                          ? pricingConfigs.filter(c => c.category === 'package').map(c => c.label)
                          : Object.keys(BASE_PRICES)
                        ).map((type) => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={cn(
                              "relative group h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden font-outfit cursor-pointer",
                              selectedType === type 
                                ? "bg-purple-950/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-[1.02]" 
                                : "bg-purple-950/10 border-purple-500/10 text-purple-300/60 hover:border-purple-500/30 hover:bg-purple-950/20"
                            )}
                          >
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Type</span>
                            <span className={cn("text-xs font-bold tracking-tight transition-colors", selectedType === type ? "text-white drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]" : "text-purple-300/70")}>{type}</span>
                            {selectedType === type && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Terms of Service Agreement */}
                    <div className="pt-2">
                      <div 
                        className={cn(
                          "p-4 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer group",
                          termsAccepted 
                            ? "bg-purple-950/30 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                            : "bg-purple-950/10 border-purple-500/10 hover:border-purple-500/30"
                        )}
                        onClick={() => setShowTerms(true)}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0",
                          termsAccepted 
                            ? "bg-purple-600 border-purple-500 text-white" 
                            : "bg-purple-950/40 border-purple-500/20 group-hover:border-purple-400"
                        )}>
                          {termsAccepted ? <Check size={12} strokeWidth={4} /> : <ScrollText size={10} className="text-purple-400/60" />}
                        </div>
                        <div className="space-y-1">
                          <p className={cn("text-[11px] font-bold leading-tight transition-colors", termsAccepted ? "text-purple-300" : "text-purple-200/70")}>
                            {termsAccepted ? "Terms Accepted" : "Terms & Guidelines Agreement"}
                          </p>
                          <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors font-outfit">
                            {termsAccepted ? "Read again →" : "Read & Accept Terms of Service →"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        disabled={!selectedType || !termsAccepted}
                        onClick={() => setStep(2)}
                        className={cn(
                          "w-full py-4.5 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-lg font-outfit cursor-pointer",
                          selectedType && termsAccepted
                            ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-950/40" 
                            : "bg-purple-950/20 border border-purple-500/10 text-purple-500/35 cursor-not-allowed"
                        )}
                      >
                        Continue to Details <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5 text-slate-100"
                  >
                    {/* Contact Info Row */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div id="field-name" className={cn(
                          "relative transition-all duration-300 rounded-xl",
                          validationErrors.includes("name") && "ring-1 ring-red-500/50"
                        )}>
                          <User size={12} className={cn("absolute left-4 top-1/2 -translate-y-1/2", validationErrors.includes("name") ? "text-red-400" : "text-purple-400")} />
                          <input 
                            type="text" 
                            name="name"
                            placeholder="Name / Artist (Required)" 
                            value={formData.name}
                            onChange={(e) => {
                              handleInputChange(e);
                              if (validationErrors.includes("name")) {
                                setValidationErrors(prev => prev.filter(err => err !== "name"));
                              }
                            }}
                            className={cn(
                              "w-full bg-purple-950/20 border rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 font-outfit",
                              validationErrors.includes("name") ? "border-red-500/30 bg-red-950/10" : "border-purple-500/10"
                            )} 
                          />
                          {validationErrors.includes("name") && (
                            <span className="absolute -top-5 left-0 text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse font-outfit">Required</span>
                          )}
                        </div>
                        <div id="field-email" className="relative">
                          <Mail size={12} className={cn("absolute left-4 top-1/2 -translate-y-1/2", user ? "text-purple-400 animate-pulse" : "text-purple-400")} />
                          <input 
                            type="text" 
                            name="email"
                            placeholder="Email Address (Required)" 
                            value={formData.email}
                            readOnly
                            className="w-full bg-purple-950/40 border border-purple-500/20 rounded-xl pl-10 pr-20 py-3.5 text-[13px] text-purple-300/80 cursor-not-allowed font-outfit truncate" 
                          />
                          {user && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[8px] font-black text-purple-400 uppercase tracking-tighter font-outfit">
                              <ShieldCheck size={11} className="text-purple-400" />
                              Verified
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Social Media Handle */}
                      <div id="field-social" className={cn(
                        "relative transition-all duration-300 rounded-xl",
                        validationErrors.includes("social") && "ring-1 ring-red-500/50"
                      )}>
                        <MessageCircle size={12} className={cn("absolute left-4 top-1/2 -translate-y-1/2", validationErrors.includes("social") ? "text-red-400" : "text-purple-400")} />
                        <input 
                          type="text" 
                          name="socialHandle"
                          placeholder="@zarry_linilo (Instagram/X)" 
                          value={formData.socialHandle}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (validationErrors.includes("social")) {
                              setValidationErrors(prev => prev.filter(err => err !== "social"));
                            }
                          }}
                          className={cn(
                            "w-full bg-purple-950/20 border rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 font-outfit",
                            validationErrors.includes("social") ? "border-red-500/30 bg-red-950/10" : "border-purple-500/10"
                          )} 
                        />
                        {validationErrors.includes("social") && (
                          <span className="absolute -top-5 left-0 text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse font-outfit">Required</span>
                        )}
                      </div>
                    </div>

                    {/* Advanced Directives Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 ml-1">
                        <Sparkles size={12} className="text-purple-400" />
                        <label className="text-[9px] font-black text-purple-300/70 uppercase tracking-widest font-outfit">Advanced Directives</label>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => setIsCouple(!isCouple)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                            isCouple 
                              ? "bg-purple-950/40 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.1)]" 
                              : "bg-purple-950/10 border-purple-500/10 hover:border-purple-500/20"
                          )}
                        >
                          <div className="text-left font-outfit">
                            <span className={cn("text-[11px] font-bold block transition-colors", isCouple ? "text-white" : "text-purple-300/70")}>Couple 2x price</span>
                            <span className="text-[8px] text-purple-400/50 uppercase tracking-widest">Dual Subject Synergy</span>
                          </div>
                          <div className={cn(
                            "w-8 h-4.5 rounded-full relative transition-colors",
                            isCouple ? "bg-purple-600" : "bg-purple-950"
                          )}>
                            <motion.div 
                              animate={{ x: isCouple ? 14 : 3 }}
                              className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm" 
                            />
                          </div>
                        </button>

                        <button 
                          onClick={() => setHasBackground(!hasBackground)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                            hasBackground 
                              ? "bg-purple-950/40 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.1)]" 
                              : "bg-purple-950/10 border-purple-500/10 hover:border-purple-500/20"
                          )}
                        >
                          <div className="text-left font-outfit">
                            <span className={cn("text-[11px] font-bold block transition-colors", hasBackground ? "text-white" : "text-purple-300/70")}>Background Complexity</span>
                            <span className="text-[8px] text-purple-400/50 uppercase tracking-widest">+50K IDR Premium</span>
                          </div>
                          <div className={cn(
                            "w-8 h-4.5 rounded-full relative transition-colors",
                            hasBackground ? "bg-purple-600" : "bg-purple-950"
                          )}>
                            <motion.div 
                              animate={{ x: hasBackground ? 14 : 3 }}
                              className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm" 
                            />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Art Style Section */}
                    <div id="field-style" className={cn(
                      "space-y-2.5 p-3 rounded-2xl transition-all duration-300 border border-transparent",
                      validationErrors.includes("style") && "bg-red-950/10 border-red-500/30 ring-1 ring-red-500/20"
                    )}>
                       <div className="flex items-center justify-between ml-1">
                        <div className="flex items-center gap-2">
                          <Palette size={12} className={cn(validationErrors.includes("style") ? "text-red-400 animate-pulse" : "text-purple-400")} />
                          <label className={cn("text-[9px] font-black uppercase tracking-widest font-outfit", validationErrors.includes("style") ? "text-red-400" : "text-purple-300/70")}>
                            Art Style (Required)
                          </label>
                        </div>
                        {validationErrors.includes("style") && (
                          <span className="text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse font-outfit">Select one</span>
                        )}
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                          {ART_STYLES.map((style) => (
                            <button
                              key={style}
                              onClick={() => {
                                setSelectedStyle(style);
                                if (validationErrors.includes("style")) {
                                  setValidationErrors(prev => prev.filter(err => err !== "style"));
                                }
                              }}
                              className={cn(
                                "py-3 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all font-outfit cursor-pointer",
                                selectedStyle === style 
                                  ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-950/50" 
                                  : validationErrors.includes("style")
                                    ? "bg-purple-950/10 border-red-500/20 text-red-400/50"
                                    : "bg-purple-950/20 border-purple-500/10 text-purple-300/60 hover:border-purple-500/30 hover:text-purple-200"
                              )}
                            >
                              {style}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div id="field-payment" className={cn(
                        "relative group transition-all duration-300 rounded-xl",
                        validationErrors.includes("payment") && "ring-1 ring-red-500/50"
                      )}>
                        <CreditCard size={12} className={cn("absolute left-4 top-1/2 -translate-y-1/2 z-10", validationErrors.includes("payment") ? "text-red-400" : "text-purple-400")} />
                        <div 
                          onClick={() => setFormData(prev => ({ ...prev, showPaymentDropdown: !prev.showPaymentDropdown }))}
                          className={cn(
                            "w-full bg-purple-950/20 border rounded-xl pl-10 pr-8 py-3.5 text-[13px] text-purple-100 placeholder:text-purple-300/40 cursor-pointer flex items-center justify-between transition-all font-outfit",
                            validationErrors.includes("payment") ? "border-red-500/30 bg-red-950/10" : "border-purple-500/10 hover:border-purple-500/30"
                          )}
                        >
                          <span className={cn(
                            formData.paymentMethod ? "text-purple-100 font-medium" : validationErrors.includes("payment") ? "text-red-400/50" : "text-purple-300/40"
                          )}>
                            {formData.paymentMethod || "Payment Method (Required)"}
                          </span>
                          <motion.div animate={{ rotate: formData.showPaymentDropdown ? 180 : 0 }} className={cn(validationErrors.includes("payment") ? "text-red-400" : "text-purple-400")}>
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </motion.div>
                        </div>
                        {validationErrors.includes("payment") && (
                          <span className="absolute -top-5 left-0 text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse font-outfit">Required</span>
                        )}
                        <AnimatePresence>
                          {formData.showPaymentDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                              className="absolute bottom-full left-0 right-0 mb-2 bg-[#0D0A1C] border border-purple-500/20 rounded-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-[150] overflow-hidden p-1.5 backdrop-blur-xl"
                            >
                              {[
                                { id: "BCA", name: "BCA", color: "bg-blue-900/60 border border-blue-500/30" },
                                { id: "Shopeepay", name: "ShopeePay", color: "bg-orange-950/60 border border-orange-500/30" },
                                { id: "DANA", name: "DANA", color: "bg-blue-950/60 border border-blue-400/30" },
                                { id: "QRIS", name: "QRIS", color: "bg-red-950/60 border border-red-500/30" }
                              ].map((item) => (
                                <button key={item.id} onClick={() => {
                                  setFormData(prev => ({ ...prev, paymentMethod: item.id, showPaymentDropdown: false }));
                                  if (validationErrors.includes("payment")) {
                                    setValidationErrors(prev => prev.filter(err => err !== "payment"));
                                  }
                                }}
                                  className="w-full flex items-center gap-3 p-2.5 hover:bg-purple-950/40 rounded-lg transition-colors group/item cursor-pointer text-left"
                                >
                                  <div className={cn("w-7 h-4.5 rounded flex items-center justify-center text-[7px] font-black text-purple-200 shrink-0", item.color)}>
                                    {item.id.substring(0, 3)}
                                  </div>
                                  <span className="text-[11px] font-bold text-purple-300 group-hover/item:text-white font-outfit">{item.name}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="relative">
                        <Wand2 size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                        <input 
                          type="text" 
                          name="background"
                          placeholder="Background Request" 
                          value={formData.background}
                          onChange={handleInputChange}
                          className="w-full bg-purple-950/20 border border-purple-500/10 rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 font-outfit" 
                        />
                      </div>
                    </div>

                    {/* References Category */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 ml-1">
                        <LinkIcon size={12} className="text-purple-400" />
                        <label className="text-[9px] font-black text-purple-300/70 uppercase tracking-widest font-outfit">Reference Category (Optional)</label>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <LinkIcon size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                          <input 
                            type="text" 
                            name="references"
                            placeholder="Reference Links (Drive, Pinterest, etc.)" 
                            value={formData.references}
                            onChange={handleInputChange}
                            className="w-full bg-purple-950/20 border border-purple-500/10 rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 font-outfit" 
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 px-4 py-3 bg-purple-950/20 border border-dashed border-purple-500/20 rounded-xl cursor-pointer hover:bg-purple-950/40 hover:border-purple-500/40 transition-all group">
                            <Upload size={14} className="text-purple-400 group-hover:scale-115 transition-all" />
                            <span className="text-[11px] font-bold text-purple-300">Upload Image Reference (Max 1MB)</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>

                          {uploadError && (
                            <p className="text-[9px] text-red-400 font-bold ml-1 flex items-center gap-1 font-outfit">
                              <ShieldAlert size={10} /> {uploadError}
                            </p>
                          )}

                          {referenceFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {referenceFiles.map((file, i) => (
                                <div key={i} className="relative group">
                                  <div className="w-12 h-12 rounded-lg border border-purple-500/20 bg-purple-950/30 overflow-hidden shadow-sm">
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt="preview" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button 
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                                  >
                                    <X size={8} strokeWidth={4} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Final Specification Section */}
                    <div id="field-description" className={cn(
                      "space-y-3 pt-2 p-2 rounded-2xl transition-all duration-300 border border-transparent",
                      validationErrors.includes("description") && "bg-red-950/10 border-red-500/30 ring-1 ring-red-500/20"
                    )}>
                      <div className="flex items-center justify-between ml-1">
                        <div className="flex items-center gap-2">
                          <AlignLeft size={12} className={cn(validationErrors.includes("description") ? "text-red-400 animate-pulse" : "text-purple-400")} />
                          <label className={cn("text-[9px] font-black uppercase tracking-widest font-outfit", validationErrors.includes("description") ? "text-red-400" : "text-purple-300/70")}>
                            Project Specifications (Required)
                          </label>
                        </div>
                        {validationErrors.includes("description") && (
                          <span className="text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse font-outfit">Brief required</span>
                        )}
                      </div>
                      <div className="relative">
                        <AlignLeft size={12} className={cn("absolute left-4 top-4.5", validationErrors.includes("description") ? "text-red-400" : "text-purple-400")} />
                        <textarea 
                          name="description"
                          rows={2} 
                          placeholder="Description (character[s], poses, expression, etc.)" 
                          value={formData.description}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (validationErrors.includes("description")) {
                              setValidationErrors(prev => prev.filter(err => err !== "description"));
                            }
                          }}
                          className={cn(
                            "w-full bg-purple-950/20 border rounded-xl pl-10 pr-4 py-3 text-[13px] text-purple-100 placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none font-outfit",
                            validationErrors.includes("description") ? "border-red-500/30 bg-red-950/10" : "border-purple-500/10"
                          )} 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Fixed Footer Section - Always Visible */}
              {step === 2 && !isSuccess && (
                <div className="p-5 border-t border-purple-500/10 bg-purple-950/20 backdrop-blur-md rounded-b-[32px] font-outfit">
                  <div className="flex items-center justify-between gap-4">
                    <button onClick={() => setStep(1)} className="text-[8px] font-black text-purple-400 uppercase tracking-[0.25em] hover:text-white transition-colors cursor-pointer">
                      ← Back
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-[7px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">Estimated Total</span>
                        <span className="text-xl font-black text-white font-syne italic leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                          {calculatedPrice}K <span className="text-[9px] not-italic text-purple-400 uppercase font-bold">IDR</span>
                        </span>
                      </div>

                      <button 
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className={cn(
                          "px-7 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all shadow-lg cursor-pointer",
                          isSubmitting 
                            ? "bg-purple-950/40 border border-purple-500/20 text-purple-500/50 cursor-wait" 
                            : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-950/50 hover:-translate-y-0.5"
                        )}
                      >
                        {isSubmitting ? "Wait..." : "Submit"} <Send size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[7px] text-purple-400/55 font-bold uppercase tracking-tighter mt-2 text-right">
                    *More details may incur extra costs
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        isAccepted={termsAccepted}
        onAcceptChange={setTermsAccepted}
      />
    </>
  );
};

export default OrderForm;
