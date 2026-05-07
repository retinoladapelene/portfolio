"use client";

import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Auto-open modal if redirected from middleware
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('login') === 'true' && !user) {
        window.dispatchEvent(new CustomEvent("openLoginModal"));
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });

    return () => {
      unsubscribe();
      subscription.unsubscribe();
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
            ? "h-16 bg-[#1A1F2B]/40 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
            : "h-24 bg-transparent border-b border-transparent"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <Link 
            href="/"
            className={cn(
              "text-2xl font-normal flex items-center gap-2 group cursor-pointer font-dancing-script",
              isScrolled ? "text-white" : "text-white nav-text-shadow"
            )}
          >
            <div className="w-5 h-5 bg-purple-500 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] rotate-12 group-hover:rotate-0 transition-transform" />
            <span>
              Moon<span className="text-purple-500 font-bold">chaery.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
             {["Portfolio", "About", "Pricing", "Track Order"].map((item) => {
               const isPortfolio = item === "Portfolio";
               const isAbout = item === "About";
               const isTrack = item === "Track Order";
               return (
                 <a 
                   key={item} 
                   href={isPortfolio ? "/portfolio" : isAbout ? "/personal" : isTrack ? "/track" : `#${item.toLowerCase()}`} 
                   className={cn(
                     "text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group font-outfit",
                     isScrolled ? "text-white/90" : "text-white/80 hover:text-white nav-text-shadow"
                   )}
                 >
                   {item}
                   <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-purple-500 transition-all group-hover:w-full" />
                 </a>
               );
             })}
          </div>

          <div className="flex items-center gap-3">
            {user && user.email === 'pbsn290704@gmail.com' && (
              <button 
                onClick={() => window.location.href = "/admin"}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-600 hover:bg-purple-600 hover:text-white transition-all group font-outfit shadow-sm",
                  !isScrolled && "bg-white/10 text-white border-white/20 backdrop-blur-md"
                )}
              >
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-full h-full group-hover:rotate-45 transition-transform duration-500"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    <path d="M12 7l1 1M12 17l-1-1M7 12l1-1M17 12l-1 1M8.5 8.5l1 1M15.5 15.5l-1-1M8.5 15.5l1-1M15.5 8.5l-1-1" className="opacity-60" />
                  </svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
              </button>
            )}

            <button 
              onClick={async () => {
                if (user) {
                  await supabase.auth.signOut();
                  window.location.reload();
                } else {
                  window.dispatchEvent(new CustomEvent("openLoginModal"));
                }
              }}
              className={cn(
                "py-2.5 px-6 rounded-full text-[9px] font-black tracking-[0.2em] uppercase transition-all font-outfit",
                user 
                  ? (isScrolled ? "bg-gray-100 text-gray-900 hover:bg-gray-200" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm")
                  : "px-6 py-2.5 bg-purple-600 text-white rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-lg"
              )}
            >
              {user ? "Sign Out" : "Sign In"}
            </button>
          </div>
        </div>
      </motion.nav>

      <LoginModal />
    </>
  );
};



export default Navbar;
