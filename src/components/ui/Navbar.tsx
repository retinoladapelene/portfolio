"use client";

import { motion, useScroll, AnimatePresence, useTransform, useMotionValueEvent } from "framer-motion";
import { useState, useEffect, memo, Suspense, lazy } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Commission } from "@/types/admin";
import { MessageSquare, Home, Palette, Box, Search, Zap, ArrowRight, LayoutDashboard, LogOut, LucideIcon } from "lucide-react";
import { useConfirm } from "./ConfirmProvider";

// ─── OPTIMIZATION: LAZY LOAD HEAVY MODALS ──────────────────────────────────
const LoginModal = lazy(() => import("./LoginModal"));
const MessageModal = lazy(() => import("./MessageModal"));

// ─── OPTIMIZED NAV LINK COMPONENT ──────────────────────────────────────────
const NavItem = memo(({ name, href }: { name: string, href: string, icon?: LucideIcon }) => (
  <Link href={href} className="group relative py-2 will-change-transform">
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900/60 group-hover:text-purple-600 transition-all duration-300">
      {name}
    </span>
  </Link>
));
NavItem.displayName = "NavItem";

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();
  const { confirm } = useConfirm();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // ─── CONSOLIDATED SCROLL TRANSFORMATIONS (120FPS FRIENDLY) ───────────────
  const navY = useTransform(scrollY, [0, 100], [0, 12]);
  const navWidth = useTransform(scrollY, [0, 150], ["100%", "90%"]);
  const navMaxWidth = useTransform(scrollY, [0, 150], ["1800px", "1200px"]);
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
  );
  const navBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(20px)"]);
  const navBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255, 255, 255, 0)", "rgba(168, 85, 247, 0.15)"]
  );
  const navRadius = useTransform(scrollY, [0, 150], ["0px", "32px"]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50 && !isScrolled) setIsScrolled(true);
    if (latest <= 50 && isScrolled) setIsScrolled(false);
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      
      if (u) fetchUnreadCount(u.email!);
    };
    checkUser();

    const fetchUnreadCount = async (email: string) => {
      try {
        const res = await fetch(`/api/commissions/check-active?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.orders) {
          const unread = data.orders.filter((o: Commission) => o.status === 'pending');
          setUnreadCount(unread.length);
        }
      } catch {}
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={
          isHome
            ? { opacity: isScrolled || isMobileMenuOpen ? 1 : 0, y: isScrolled || isMobileMenuOpen ? 0 : -100 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-[100] flex justify-center px-4 md:px-0 pointer-events-none"
      >
        <motion.div 
          style={{ 
            y: navY,
            width: navWidth,
            maxWidth: navMaxWidth,
            backgroundColor: navBg,
            borderColor: navBorder,
            borderRadius: navRadius,
            backdropFilter: navBlur,
            WebkitBackdropFilter: navBlur,
          }}
          className={cn(
            "relative flex items-center justify-between px-6 md:px-8 py-3 md:py-4 transition-shadow duration-500 ease-out border overflow-hidden pointer-events-auto will-change-transform shadow-none",
            isScrolled ? "shadow-2xl shadow-purple-600/10" : "",
            isMobileMenuOpen ? "bg-white/95 border-purple-100" : ""
          )}
        >
          {/* Logo Section */}
          <Link href="/" className="relative z-50 flex items-center gap-3 group will-change-transform">
            <div className="relative w-12 h-12 md:w-16 md:h-16">
              <Image src="/moonchaerylogo.png" alt="Logo" fill className="object-contain scale-110" priority />
            </div>
          </Link>

          {/* DESKTOP NAV LINKS (MEMOIZED) */}
          <div className="hidden md:flex items-center gap-10">
            <NavItem name="Home" href="/" icon={Home} />
            <NavItem name="Project" href="/portfolio" icon={Palette} />
            <NavItem name="Personal" href="/personal" icon={Search} />
            <NavItem name="Gallery" href="/gallery" icon={Box} />
            <NavItem name="Track" href="/track" icon={Search} />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4 relative z-50">
            {user && (
              <div className="hidden md:flex items-center gap-2">
                {user.email === 'pbsn290704@gmail.com' && (
                  <Link href="/admin" className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black text-[9px] uppercase tracking-widest hover:bg-purple-600 transition-colors flex items-center gap-2">
                    <LayoutDashboard size={12} />
                    Admin
                  </Link>
                )}
                <button 
                  onClick={async () => {
                    const ok = await confirm({ title: "Sign Out?", message: "Stay a while?", confirmText: "Sign Out", cancelText: "Stay", variant: "danger" });
                    if (ok) { await supabase.auth.signOut(); window.location.reload(); }
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  aria-label="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {user ? (
              <button 
                onClick={() => setIsMessageModalOpen(true)} 
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 relative hover:bg-purple-100 transition-colors"
                aria-label="Open Message Hub"
              >
                <MessageSquare size={16} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
              </button>
            ) : (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent("openLoginModal"))}
                className="hidden md:block px-6 py-2.5 rounded-xl bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-600/20 active:scale-95 transition-transform"
              >
                Sign In
              </button>
            )}

            {/* HAMBURGER TRIGGER */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className={cn(
                "md:hidden w-10 h-10 flex flex-col items-center justify-center rounded-xl transition-all active:scale-90",
                isMobileMenuOpen ? "bg-slate-950 text-white" : "bg-purple-600 text-white"
              )}
              aria-label="Toggle navigation menu"
            >
              <div className="flex flex-col gap-1 w-5">
                <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-full h-0.5 bg-current rounded-full" />
                <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-full h-0.5 bg-current rounded-full" />
                <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-full h-0.5 bg-current rounded-full" />
              </div>
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY (GPU OPTIMIZED) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] md:hidden bg-white/95 backdrop-blur-3xl pt-32 px-6 overflow-y-auto pb-10 will-change-contents"
          >
            {/* Mobile Menu Content... */}
            <div className="flex flex-col h-full">
              <div className="space-y-1 mb-12">
                <p className="text-[10px] font-black text-purple-600/40 uppercase tracking-[0.5em] mb-4">Neural Command</p>
                {[
                  { name: "Home", href: "/", icon: Home },
                  { name: "Project", href: "/portfolio", icon: Palette },
                  { name: "Personal", href: "/personal", icon: Search },
                  { name: "Gallery", href: "/gallery", icon: Box },
                  { name: "Track", href: "/track", icon: Search },
                ].map((item, i) => (
                  <motion.a
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-5 rounded-2xl hover:bg-purple-50 active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className="text-purple-300 group-hover:text-purple-600" />
                      <span className="text-2xl font-black tracking-tighter text-slate-900">{item.name}</span>
                    </div>
                    <ArrowRight size={18} className="text-slate-200 group-hover:text-purple-500" />
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto space-y-6">
                <div className="h-px bg-slate-100" />
                <div className="flex flex-col gap-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black">
                          {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active User</p>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{user.email}</p>
                        </div>
                        {user.email === 'pbsn290704@gmail.com' && (
                          <button onClick={() => window.location.href = "/admin"} className="px-4 py-2 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Admin</button>
                        )}
                      </div>
                      <button onClick={async () => {
                        setIsMobileMenuOpen(false);
                        const ok = await confirm({ title: "Sign Out?", message: "Stay a while?", confirmText: "Sign Out", cancelText: "Stay", variant: "danger" });
                        if (ok) { await supabase.auth.signOut(); window.location.reload(); }
                      }} className="w-full py-4 text-red-500 font-black text-xs uppercase tracking-[0.3em]">Sign Out</button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new CustomEvent("openLoginModal")); }}
                      className="w-full py-5 bg-purple-600 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <Zap size={14} />
                      Initialize Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <LoginModal />
        <MessageModal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} />
      </Suspense>
    </>
  );
};

export default Navbar;
