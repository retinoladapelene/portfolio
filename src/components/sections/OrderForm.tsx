"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Send, Upload, X, Palette, Sparkles, Wand2, Mail, MessageCircle, User, CreditCard, AlignLeft, Info, ShieldCheck, Clock, ShieldAlert, Image, Link as LinkIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import TermsModal from "../ui/TermsModal";

const BASE_PRICES: Record<string, number> = {
  "Headshot": 80,
  "Bust Up": 100,
  "Halfbody": 130,
  "Knee Up": 180
};
const ART_STYLES = ["Manga", "Full Render", "Line Art"];

const OrderForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    paymentMethod: "",
    background: "",
    description: "",
    references: "",
    socialMedia: "",
    showPaymentDropdown: false
  });
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");

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
      if (file.size > 500 * 1024) {
        setUploadError(`File ${file.name} is too large. Max 500KB.`);
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
  }, []);

  useEffect(() => {
    let price = BASE_PRICES[selectedType] || 0;
    if (isCouple) price *= 2;
    if (hasBackground) price += 50;
    setCalculatedPrice(price);
  }, [selectedType, isCouple, hasBackground]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.socialMedia || !selectedStyle || !formData.paymentMethod) {
      alert("Please fill in all mandatory fields: Name, Email, Social Media, Art Style, and Payment Method.");
      return;
    }

    const socialMediaPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    if (!socialMediaPattern.test(formData.socialMedia)) {
      alert("Please provide a valid social media link (e.g., https://instagram.com/yourname).");
      return;
    }

    const isStillAllowed = await checkAuthAndActiveCommission();
    if (!isStillAllowed) {
      alert("System detected an active commission. Submission cancelled.");
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
          referenceImages: base64Files // Send as array of base64
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        setReferenceFiles([]); // Reset files
      } else {
        console.error("Database save failed:", result.error);
        alert(`Warning: Order could not be saved to Dashboard: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDMMessage = () => {
    const text = `Halo! Saya baru saja kirim commission request via website.

Detail:
- Nama: ${formData.name}
- Tipe: ${selectedType}
- Total: ${calculatedPrice}K IDR

Mohon bantu cek detailnya di Dashboard ya! Terima kasih.`;
    return encodeURIComponent(text);
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
            className="absolute inset-0 bg-white/60 backdrop-blur-xl"
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
              className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-400/10 blur-[120px] rounded-full" 
            />
            <motion.div 
              animate={{ 
                x: [0, -80, 0], 
                y: [0, 100, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-200/5 blur-[150px] rounded-full" 
            />
          </div>

          {/* Modal Content */}
          <motion.div
            key="order-form-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-[440px] relative z-10"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-4 md:right-0 group flex items-center gap-3"
            >
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-600/60 group-hover:text-purple-600 transition-colors font-outfit">Discard Draft</span>
              <div className="w-7 h-7 rounded-full border border-purple-100 bg-white flex items-center justify-center text-purple-600 shadow-sm group-hover:rotate-90 transition-transform duration-500">
                <X size={12} />
              </div>
            </button>

            <div className="bg-white border border-purple-100 shadow-[0_20px_50px_rgba(168,85,247,0.1)] rounded-[24px] relative flex flex-col max-h-[85vh]">
              {/* Header Section - More Compact */}
              <div className="p-5 pb-4 border-b border-purple-50 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Palette size={10} className="text-purple-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400 font-outfit">Studio</span>
                  </div>
                  <h2 className="text-3xl font-normal text-[#1A1F2B] leading-none font-dancing-script">
                    Start Your <span className="text-purple-500">Vision.</span>
                  </h2>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1 h-1 rounded-full", step >= 1 ? "bg-purple-500" : "bg-slate-200")} />
                    <div className="w-6 h-px bg-slate-100" />
                    <div className={cn("w-1 h-1 rounded-full", step >= 2 ? "bg-purple-500" : "bg-slate-200")} />
                  </div>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest font-outfit">Step {step}/2</span>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar space-y-4">

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6 border border-purple-100"
                    >
                      <Sparkles size={32} />
                    </motion.div>
                    <h3 className="text-4xl font-normal text-[#1A1F2B] mb-4 font-dancing-script">Canvas Received!</h3>
                    <p className="text-slate-400 font-outfit max-w-xs mx-auto mb-6 text-[13px] leading-relaxed">
                      Your vision has been sent to my studio. I will check the details and contact you very soon!
                    </p>

                    {/* Social Discussion Section */}
                    <div className="w-full space-y-3 mb-8">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-px w-8 bg-purple-50" />
                        <span className="text-[8px] font-black text-purple-300 uppercase tracking-[0.2em] font-outfit">Quick Discussion</span>
                        <div className="h-px w-8 bg-purple-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <a 
                          href={`https://ig.me/m/cuancapital.id?text=${getDMMessage()}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 bg-white border border-purple-100 text-purple-600 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-purple-50 transition-all shadow-sm font-outfit group"
                        >
                          <Camera size={12} className="group-hover:scale-110 transition-transform" /> Instagram DM
                        </a>
                        <a 
                          href="https://x.com/Zarry_linilo" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-100 text-slate-600 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm font-outfit group"
                        >
                          <X size={12} className="group-hover:scale-110 transition-transform" /> Twitter
                        </a>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsOpen(false)}
                      className="px-10 py-3.5 bg-[#1A1F2B] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-purple-600 transition-all shadow-lg font-outfit"
                    >
                      Back to Gallery
                    </button>
                  </motion.div>
                ) : hasActiveCommission ? (
                  <motion.div
                    key="active-limit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6 border border-purple-100">
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-4xl font-normal text-[#1A1F2B] mb-4 font-dancing-script">
                      Ongoing <span className="text-purple-500">Masterpiece.</span>
                    </h3>
                    <p className="text-slate-400 font-outfit max-w-xs mx-auto mb-10 text-[13px] leading-relaxed">
                      Please stay tuned! You currently have a commission in progress. 
                      To ensure the highest quality for every piece, I only accept one active project per client. 
                      Please wait until your current vision is <span className="text-purple-500 font-bold">Completed</span> or <span className="text-red-400 font-bold">Cancelled</span> before starting a new one.
                    </p>

                    {/* Social Discussion Section */}
                    <div className="w-full space-y-3 mb-8">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-px w-8 bg-purple-50" />
                        <span className="text-[8px] font-black text-purple-300 uppercase tracking-[0.2em] font-outfit">Need to discuss?</span>
                        <div className="h-px w-8 bg-purple-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <a 
                          href="https://ig.me/m/cuancapital.id" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 bg-white border border-purple-100 text-purple-600 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-purple-50 transition-all shadow-sm font-outfit group"
                        >
                          <Camera size={12} className="group-hover:scale-110 transition-transform" /> Instagram DM
                        </a>
                        <a 
                          href="https://x.com/Zarry_linilo" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-100 text-slate-600 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm font-outfit group"
                        >
                          <X size={12} className="group-hover:scale-110 transition-transform" /> Twitter
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-10 py-3.5 bg-[#1A1F2B] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-purple-600 transition-all shadow-lg font-outfit"
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
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 ml-1">
                        <Info size={12} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-outfit">Select Package Type</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.keys(BASE_PRICES).map((type) => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={cn(
                              "relative group h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden font-outfit",
                              selectedType === type 
                                ? "bg-white border-purple-500 shadow-[0_8px_20px_rgba(168,85,247,0.12)] scale-[1.02]" 
                                : "bg-slate-50/50 border-slate-100 text-slate-400 hover:border-purple-200 hover:bg-white"
                            )}
                          >
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Type</span>
                            <span className={cn("text-xs font-bold tracking-tight transition-colors", selectedType === type ? "text-purple-600" : "text-slate-500")}>{type}</span>
                            {selectedType === type && <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-purple-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Terms of Service Agreement */}
                    <div className="pt-2">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 group hover:border-purple-200 transition-all cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
                        <div className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0",
                          termsAccepted 
                            ? "bg-purple-600 border-purple-600 text-white" 
                            : "bg-white border-slate-200"
                        )}>
                          {termsAccepted && <Check size={12} strokeWidth={4} />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-600 leading-tight">I have read and agree to the Protocol Guidelines</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTerms(true);
                            }}
                            className="text-[9px] font-black text-purple-500 uppercase tracking-widest hover:text-purple-700 transition-colors font-outfit"
                          >
                            Read Terms of Service →
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        disabled={!selectedType || !termsAccepted}
                        onClick={() => setStep(2)}
                        className={cn(
                          "w-full py-4.5 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-lg font-outfit",
                          selectedType && termsAccepted
                            ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-50" 
                            : "bg-slate-100 text-slate-300 cursor-not-allowed"
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
                    className="space-y-5"
                  >
                    {/* Contact Info Row */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                          <User size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                          <input 
                            type="text" 
                            name="name"
                            placeholder="Name / Artist (Required)" 
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-purple-200 transition-all font-outfit" 
                          />
                        </div>
                        <div className="relative">
                          <Mail size={12} className={cn("absolute left-4 top-1/2 -translate-y-1/2", user ? "text-purple-500" : "text-purple-300")} />
                          <input 
                            type="text" 
                            name="email"
                            placeholder="Email Address (Required)" 
                            value={formData.email}
                            readOnly
                            className="w-full bg-purple-50/30 border border-purple-100 rounded-xl pl-10 pr-20 py-3.5 text-[13px] text-slate-500 cursor-not-allowed font-outfit truncate" 
                          />
                          {user && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-black text-purple-500 uppercase tracking-tighter">
                              <ShieldCheck size={10} />
                              Verified
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <MessageCircle size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input 
                          type="text" 
                          name="socialMedia"
                          placeholder="Social Media Handle Link (Required)" 
                          value={formData.socialMedia}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-purple-200 transition-all font-outfit" 
                        />
                      </div>
                    </div>

                    {/* Advanced Directives Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 ml-1">
                        <Sparkles size={12} className="text-purple-300" />
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">Advanced Directives</label>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => setIsCouple(!isCouple)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                            isCouple 
                              ? "bg-purple-50 border-purple-200" 
                              : "bg-slate-50/50 border-slate-100 hover:border-purple-100"
                          )}
                        >
                          <div className="text-left">
                            <span className={cn("text-[11px] font-bold block transition-colors", isCouple ? "text-purple-700" : "text-slate-500")}>Couple 2x price</span>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-outfit">Dual Subject Synergy</span>
                          </div>
                          <div className={cn(
                            "w-8 h-4.5 rounded-full relative transition-colors",
                            isCouple ? "bg-purple-500" : "bg-slate-200"
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
                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                            hasBackground 
                              ? "bg-purple-50 border-purple-200" 
                              : "bg-slate-50/50 border-slate-100 hover:border-purple-100"
                          )}
                        >
                          <div className="text-left">
                            <span className={cn("text-[11px] font-bold block transition-colors", hasBackground ? "text-purple-700" : "text-slate-500")}>Background Complexity</span>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-outfit">+50K IDR Premium</span>
                          </div>
                          <div className={cn(
                            "w-8 h-4.5 rounded-full relative transition-colors",
                            hasBackground ? "bg-purple-500" : "bg-slate-200"
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
                    <div className="space-y-2.5">
                       <div className="flex items-center gap-2 ml-1">
                        <Palette size={12} className="text-purple-300" />
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">Art Style (Required)</label>
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                          {ART_STYLES.map((style) => (
                            <button
                              key={style}
                              onClick={() => setSelectedStyle(style)}
                              className={cn(
                                "py-3 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all font-outfit",
                                selectedStyle === style 
                                  ? "bg-purple-600 border-purple-600 text-white shadow-md" 
                                  : "bg-white border-slate-100 text-slate-400 hover:border-purple-200"
                              )}
                            >
                              {style}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative group">
                        <CreditCard size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 z-10" />
                        <div 
                          onClick={() => setFormData(prev => ({ ...prev, showPaymentDropdown: !prev.showPaymentDropdown }))}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-8 py-3.5 text-[13px] text-slate-700 cursor-pointer flex items-center justify-between group-hover:border-purple-200 transition-all font-outfit"
                        >
                          <span className={cn(formData.paymentMethod ? "text-slate-700" : "text-slate-300")}>
                            {formData.paymentMethod || "Payment Method (Required)"}
                          </span>
                          <motion.div animate={{ rotate: formData.showPaymentDropdown ? 180 : 0 }} className="text-slate-300">
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {formData.showPaymentDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                              className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-purple-100 rounded-2xl shadow-2xl z-[150] overflow-hidden p-1.5"
                            >
                              {[
                                { id: "BCA", name: "BCA", color: "bg-blue-600" },
                                { id: "Shopeepay", name: "ShopeePay", color: "bg-orange-500" },
                                { id: "OVO", name: "OVO", color: "bg-purple-800" },
                                { id: "DANA", name: "DANA", color: "bg-blue-400" },
                                { id: "QRIS", name: "QRIS", color: "bg-red-600" }
                              ].map((item) => (
                                <button key={item.id} onClick={() => setFormData(prev => ({ ...prev, paymentMethod: item.id, showPaymentDropdown: false }))}
                                  className="w-full flex items-center gap-3 p-2.5 hover:bg-purple-50 rounded-lg transition-colors group/item"
                                >
                                  <div className={cn("w-7 h-4.5 rounded flex items-center justify-center text-[7px] font-black text-white shrink-0", item.color)}>
                                    {item.id.substring(0, 3)}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-600 group-hover/item:text-purple-700 font-outfit">{item.name}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="relative">
                        <Wand2 size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input 
                          type="text" 
                          name="background"
                          placeholder="Background Request" 
                          value={formData.background}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-slate-700 focus:outline-none focus:border-purple-200 transition-all font-outfit" 
                        />
                      </div>
                    </div>

                    {/* References Category */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 ml-1">
                        <LinkIcon size={12} className="text-purple-300" />
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">Reference Category (Optional)</label>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <LinkIcon size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                          <input 
                            type="text" 
                            name="references"
                            placeholder="Reference Links (Drive, Pinterest, etc.)" 
                            value={formData.references}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-slate-700 focus:outline-none focus:border-purple-200 transition-all font-outfit" 
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 px-4 py-3 bg-white border border-dashed border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-all group">
                            <Upload size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-500">Upload Image Reference (Max 500KB)</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>

                          {uploadError && (
                            <p className="text-[9px] text-red-500 font-bold ml-1 flex items-center gap-1">
                              <ShieldAlert size={10} /> {uploadError}
                            </p>
                          )}

                          {referenceFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {referenceFiles.map((file, i) => (
                                <div key={i} className="relative group">
                                  <div className="w-12 h-12 rounded-lg border border-purple-100 bg-slate-50 overflow-hidden">
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt="preview" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button 
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 ml-1">
                        <AlignLeft size={12} className="text-purple-300" />
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">Project Specifications (Optional)</label>
                      </div>
                      <div className="relative">
                        <AlignLeft size={12} className="absolute left-4 top-4.5 text-purple-300" />
                        <textarea 
                          name="description"
                          rows={2} 
                          placeholder="Description (character[s], poses, expression, etc.)" 
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-4 py-3.5 text-[13px] text-slate-700 focus:outline-none focus:border-purple-200 transition-all resize-none font-outfit" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Fixed Footer Section - Always Visible */}
              {step === 2 && !isSuccess && (
                <div className="p-5 border-t border-purple-50 bg-slate-50/30 rounded-b-[24px]">
                  <div className="flex items-center justify-between gap-4">
                    <button onClick={() => setStep(1)} className="text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-purple-600 transition-colors font-outfit">
                      ← Back
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-[7px] font-black text-slate-300 uppercase tracking-widest font-outfit leading-none mb-1">Estimated Total</span>
                        <span className="text-xl font-black text-[#1A1F2B] font-syne italic leading-none">
                          {calculatedPrice}K <span className="text-[9px] not-italic text-purple-500 uppercase">IDR</span>
                        </span>
                      </div>

                      <button 
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className={cn(
                          "px-7 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all shadow-lg font-outfit",
                          isSubmitting 
                            ? "bg-purple-100 text-purple-300 cursor-wait" 
                            : "bg-[#1A1F2B] text-white hover:bg-purple-600 hover:-translate-y-0.5"
                        )}
                      >
                        {isSubmitting ? "Wait..." : "Submit"} <Send size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[7px] text-slate-300 font-bold uppercase tracking-tighter mt-2 text-right">
                    *More details may incur extra costs
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
};

export default OrderForm;
