"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Mail, MessageCircle, ArrowUpRight, Camera, X } from "lucide-react";
import TermsModal from "./TermsModal";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <footer className="relative bg-transparent pt-20 pb-12 overflow-hidden border-t border-purple-50">
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* 🧱 MAIN FOOTER CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 pb-16 border-b border-purple-50">
          
          {/* A. BRAND / ABOUT */}
          <div className="md:col-span-5 space-y-8">
            <div className="text-3xl font-normal text-[#1A1F2B] font-dancing-script">
              Moon<span className="text-purple-500 font-bold">chaery.</span>
            </div>
            <p className="text-slate-500 text-[13px] leading-relaxed max-w-sm font-outfit font-medium">
              Digital Artist specializing in high-fidelity custom artwork, character design, and immersive visual storytelling. Bringing imagination to life through a liquid glass aesthetic.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Camera size={18} />, href: "https://www.instagram.com/cuancapital.id/", label: "Instagram" },
                { icon: <X size={18} />, href: "https://x.com/Zarry_linilo", label: "Twitter" },
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-purple-100 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* B. NAVIGATION */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300 font-outfit">Navigation</h4>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Gallery", href: "/portfolio" },
                { label: "Pricing", href: "/#pricing" },
                { label: "Process", href: "/#process" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-600 hover:text-purple-600 transition-colors text-sm font-bold flex items-center gap-2 group font-outfit">
                    {link.label}
                    <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* C. CONTACT */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300 font-outfit">Get in Touch</h4>
            <div className="space-y-8">
              <div className="block group">
                <div className="text-[9px] font-black uppercase text-slate-400 mb-1 font-outfit tracking-widest">Twitter / Instagram</div>
                <div className="text-lg font-black text-[#1A1F2B] group-hover:text-purple-600 transition-colors flex items-center gap-2 font-outfit tracking-tight">
                  @Zarry_linilo <MessageCircle size={16} className="text-slate-300" />
                </div>
              </div>
              <div className="block group">
                <div className="text-[9px] font-black uppercase text-slate-400 mb-1 font-outfit tracking-widest">Business Email</div>
                <div className="text-lg font-black text-[#1A1F2B] group-hover:text-purple-600 transition-colors flex items-center gap-2 font-outfit tracking-tight">
                  hello@artist.com <Mail size={16} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* COPYRIGHT */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-outfit">
            © {currentYear} MOONCHAERY STUDIO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-outfit">
            <button 
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-purple-600 transition-colors"
            >
              Terms of Service
            </button>
            <Link href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
          </div>
        </div>
        
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </footer>
  );
}
