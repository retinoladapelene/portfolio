"use client";

import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import LoginModal from "./LoginModal";
import MessageModal from "./MessageModal";
import { MessageSquare, Menu, X as XIcon, LayoutDashboard, LogOut, Compass } from "lucide-react";
import { useConfirm } from "./ConfirmProvider";
import { AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();
  const { confirm } = useConfirm();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Auto-open modal if redirected from middleware
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('login') === 'true' && !user) {
        window.dispatchEvent(new CustomEvent("openLoginModal"));
      }

      if (urlParams.get('openMessages') === 'true') {
        if (user) {
          setIsMessageModalOpen(true);
        } else {
          // If not logged in but trying to open messages, open login first
          window.dispatchEvent(new CustomEvent("openLoginModal"));
        }
      }

      if (user) {
        fetchUnreadCount(user.email!);
      }
    };
    checkUser();

    const fetchUnreadCount = async (email: string) => {
      try {
        const res = await fetch(`/api/commissions/check-active?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.active || (data.orders && data.orders.length > 0)) {
          const unread = data.orders.filter((o: any) => 
            (o.status === 'pending') || // New submission
            (['accepted', 'in_progress'].includes(o.status) && o.rough_sketch_url && o.dp_status !== 'paid') || // Sketch ready, needs payment
            (o.status === 'in_progress' && o.wip_artwork_url && o.wip_status === 'pending') || // WIP ready
            (o.status === 'in_progress' && o.final_preview_url && o.final_status === 'pending') // Final ready
          );
          setUnreadCount(unread.length);
        }
      } catch (e) {
        console.error("Failed to fetch unread count", e);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUnreadCount(session.user.email!);
      }
    });
    
    const handleRefresh = () => {
      const email = user?.email || supabase.auth.getUser().then(({data}) => {
        if (data.user) fetchUnreadCount(data.user.email!);
      });
      if (user?.email) fetchUnreadCount(user.email);
    };

    window.addEventListener("refreshOrderData", handleRefresh);

    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });

    return () => {
      unsubscribe();
      subscription.unsubscribe();
      window.removeEventListener("refreshOrderData", handleRefresh);
    };
  }, [scrollY, supabase.auth]);

  return (
    <>
      {/* Contrast Overlay for better readability on bright artworks */}
      {!isScrolled && <div className="navbar-gradient-overlay" />}

      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "fixed top-0 inset-x-0 z-[100] w-full transition-all duration-300",
          isScrolled 
            ? "h-16 bg-white/40 backdrop-blur-xl border-b border-purple-50 shadow-sm" 
            : "h-24 bg-transparent border-b border-transparent"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link 
            href="/"
            className="text-2xl font-normal flex items-center gap-3 group cursor-pointer font-dancing-script"
          >
            <div className={cn(
              "w-12 h-12 transition-all duration-500 group-hover:scale-110 relative"
            )}>
              <Image 
                src="/logomoonchaery.svg" 
                alt="Moonchaery Logo" 
                fill 
                className="object-contain"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
             {["Home", "Project", "Personal", "3D Gallery", "Track Order"].map((item) => {
               const isHome = item === "Home";
               const isProject = item === "Project";
               const isPersonal = item === "Personal";
               const isExhibition = item === "3D Gallery";
               const isTrack = item === "Track Order";
               return (
                  <a 
                    key={item} 
                    href={isHome ? "/" : isProject ? "/portfolio" : isPersonal ? "/personal" : isExhibition ? "/gallery" : isTrack ? "/track" : `#${item.toLowerCase()}`} 
                    className="text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group font-outfit text-black/80 hover:text-black"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-purple-500 transition-all group-hover:w-full" />
                  </a>
               );
             })}
          </div>

            {/* User & Admin Actions Area */}
            <div className="flex items-center gap-3">
              {user && user.email === 'pbsn290704@gmail.com' ? (
                // --- PREMIUM ADMIN BAR (Desktop Only) ---
                <div className={cn(
                  "hidden md:flex items-center gap-1.5 p-1 rounded-2xl border transition-all duration-300",
                  isScrolled 
                    ? "bg-purple-500/5 border-purple-500/20 shadow-sm" 
                    : "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-purple-500/10"
                )}>
                  <button 
                    onClick={() => window.location.href = "/admin"}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#1A1F2B] text-white hover:bg-purple-600 transition-all group font-outfit shadow-lg shadow-black/10"
                  >
                    <LayoutDashboard size={15} className="group-hover:scale-110 group-hover:rotate-6 transition-all" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMessageModalOpen(true);
                      setUnreadCount(0);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 hover:bg-white text-slate-800 transition-all relative group border border-white/40 shadow-sm"
                  >
                    <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                    )}
                  </button>

                  <div className="w-[1px] h-4 bg-slate-400/20 mx-1" />

                  <button 
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Sign Out?",
                        message: "Are you sure you want to sign out?",
                        confirmText: "Sign Out",
                        cancelText: "Stay",
                        variant: "danger"
                      });
                      if (ok) {
                        await supabase.auth.signOut();
                        window.location.reload();
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-red-500 hover:bg-red-50 transition-all border border-red-100 shadow-sm group"
                  >
                    <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ) : (
                // --- PREMIUM USER BAR (Desktop Only) ---
                <div className={cn(
                  "hidden md:flex items-center gap-2 p-1 rounded-2xl border transition-all duration-300",
                  isScrolled 
                    ? "bg-purple-500/5 border-purple-500/20" 
                    : "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-purple-500/5"
                )}>
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setIsMessageModalOpen(true);
                          setUnreadCount(0);
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all relative group shadow-lg shadow-purple-600/10"
                        title="Production Hub Inbox"
                      >
                        <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </button>

                      <div className="w-[1px] h-4 bg-slate-400/20 mx-1" />

                      <button 
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Sign Out?",
                            message: "Are you sure you want to sign out?",
                            confirmText: "Sign Out",
                            cancelText: "Stay",
                            variant: "danger"
                          });
                          if (ok) {
                            await supabase.auth.signOut();
                            window.location.reload();
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-white/50 hover:bg-white text-slate-600 hover:text-red-500 transition-all border border-white/40 text-[9px] font-black uppercase tracking-widest font-outfit"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent("openLoginModal"))}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all font-outfit text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-600/20"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}

            {/* Custom Animated Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "md:hidden w-12 h-12 flex flex-col items-center justify-center rounded-2xl transition-all relative overflow-hidden",
                isScrolled 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                  : "bg-white/10 backdrop-blur-xl border border-white/20 text-[#1A1F2B]"
              )}
            >
              {/* Notification Dot for Burger */}
              {unreadCount > 0 && !isMobileMenuOpen && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse z-20" />
              )}

              <div className="flex flex-col gap-1.5 items-center justify-center w-6 relative z-10">
                <motion.span 
                  animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-current rounded-full"
                />
                <motion.span 
                  animate={isMobileMenuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                  className="w-full h-0.5 bg-current rounded-full"
                />
                <motion.span 
                  animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-current rounded-full"
                />
              </div>
            </button>
          </div>
        </div>

        {/* PREMIUM MOBILE MENU: LIQUID ISLAND */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-24 z-[150] md:hidden bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white shadow-[0_20px_50px_rgba(139,92,246,0.15)] overflow-hidden"
            >
              <div className="p-8 flex flex-col gap-2">
                <span className="text-[10px] font-black text-purple-600/40 uppercase tracking-[0.5em] mb-4 px-2">Navigation</span>
                
                {["Home", "Project", "Personal", "3D Gallery", "Track Order"].map((item, i) => {
                  const isHome = item === "Home";
                  const isProject = item === "Project";
                  const isPersonal = item === "Personal";
                  const isExhibition = item === "3D Gallery";
                  const isTrack = item === "Track Order";
                  
                  return (
                    <motion.a
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                      href={isHome ? "/" : isProject ? "/portfolio" : isPersonal ? "/personal" : isExhibition ? "/gallery" : isTrack ? "/track" : `#${item.toLowerCase()}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-purple-500/5 active:bg-purple-500/10 transition-all group border border-transparent hover:border-purple-500/10"
                    >
                      <span className="text-2xl font-syne font-black tracking-tighter text-[#1A1F2B] group-hover:text-purple-600">
                        {item}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    </motion.a>
                  );
                })}

                <div className="h-px bg-gradient-to-r from-transparent via-purple-100 to-transparent my-6" />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-3"
                >
                  {user ? (
                    <div className="flex flex-col gap-3">
                      {/* Mobile Messages Access */}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMessageModalOpen(true);
                          setUnreadCount(0);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-purple-50 text-purple-600 rounded-2xl font-outfit font-black text-xs uppercase tracking-widest border border-purple-100"
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare size={18} />
                          <span>Messages Hub</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {unreadCount} New
                          </span>
                        )}
                      </button>

                      {user.email === 'pbsn290704@gmail.com' && (
                        <button 
                          onClick={() => window.location.href = "/admin"}
                          className="w-full flex items-center justify-center gap-3 py-4 bg-[#1A1F2B] text-white rounded-2xl font-outfit font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </button>
                      )}
                      
                      <button 
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          const ok = await confirm({
                            title: "Sign Out?",
                            message: "Are you sure you want to sign out?",
                            confirmText: "Sign Out",
                            cancelText: "Stay",
                            variant: "danger"
                          });
                          if (ok) {
                            await supabase.auth.signOut();
                            window.location.reload();
                          }
                        }}
                        className="w-full py-4 bg-white border border-red-100 text-red-500 rounded-2xl font-outfit font-black text-xs uppercase tracking-widest"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.dispatchEvent(new CustomEvent("openLoginModal"));
                      }}
                      className="w-full py-5 bg-purple-600 text-white rounded-2xl font-outfit font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-600/20"
                    >
                      Sign In Account
                    </button>
                  )}
                </motion.div>
              </div>

              {/* Decorative Bottom Tag */}
              <div className="bg-purple-50/50 p-4 text-center">
                 <p className="font-dancing-script text-lg text-purple-600/30 italic">Moonchaery Studio</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <LoginModal />
      <MessageModal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} />
    </>
  );
};



export default Navbar;
