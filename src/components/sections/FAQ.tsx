"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "What is Moonchaery Studio?",
    answer: "Moonchaery Studio is a high-fidelity digital art and character design studio that combines ethereal aesthetics with immersive 3D technology. We specialize in bespoke character designs, digital portraits, and virtual art experiences."
  },
  {
    question: "How do I request a digital art commission?",
    answer: "You can request a commission directly through our integrated Order Form on the homepage. Our automated 5-stage workflow (Review, Sketch, WIP, Finalization, Delivery) ensures full transparency and secure file access through your personal dashboard."
  },
  {
    question: "What makes the 3D Virtual Gallery unique?",
    answer: "Our 3D Virtual Gallery is a fully immersive, interactive environment built with WebGL and Three.js. It allows collectors to explore artworks in a spatial context, offering a far more engaging experience than traditional 2D portfolios."
  },
  {
    question: "How long does a character design project typically take?",
    answer: "A standard high-fidelity character design project usually takes between 1 to 3 weeks, depending on complexity. You can track real-time progress and receive updates directly through our 'Track Order' system."
  }
];

// ─── TYPES ─────────────────────────────────────────────────────────────────

type FAQType = {
  question: string;
  answer: string;
};

// ─── ACCORDION ITEM COMPONENT (MEMOIZED) ───────────────────────────────────

const FAQItem = memo(({ faq, isOpen, onClick }: { faq: FAQType; isOpen: boolean; onClick: () => void }) => (
  <div className="border-b border-slate-100 last:border-0 overflow-hidden">
    <button
      onClick={onClick}
      className="w-full py-8 md:py-12 flex items-center justify-between text-left group transition-all duration-300"
    >
      <span className={cn(
        "text-xl md:text-3xl font-black font-outfit tracking-tighter transition-all duration-500",
        isOpen ? "text-purple-600 translate-x-2" : "text-slate-950 group-hover:text-purple-500"
      )}>
        {faq.question}
      </span>
      <div className={cn(
        "w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-500",
        isOpen ? "bg-slate-950 border-slate-950 text-white rotate-0" : "bg-white border-slate-200 text-slate-400 rotate-90"
      )}>
        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
      </div>
    </button>
    
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="will-change-[height,opacity]"
        >
          <div className="pb-12 md:pb-16 text-slate-500 text-sm md:text-xl font-medium leading-relaxed max-w-3xl">
            {faq.answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));
FAQItem.displayName = "FAQItem";

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="relative w-full py-24 md:py-40 bg-white px-4 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-6xl md:text-[10vw] font-black text-slate-950 font-outfit uppercase tracking-tighter leading-[0.85] will-change-transform">
            Inquiry &<br />
            <span className="text-purple-600 italic">Knowledge.</span>
          </h2>
        </div>

        {/* Minimalist Accordion List */}
        <div className="border-t border-slate-100">
          {FAQS.map((faq, i) => (
            <FAQItem 
              key={i} 
              faq={faq} 
              isOpen={openIdx === i} 
              onClick={() => setOpenIdx(openIdx === i ? null : i)} 
            />
          ))}
        </div>

        {/* Bottom Call to Action (Minimalist) */}
        <div className="mt-20 md:mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="space-y-1 text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Still have inquiries?</p>
              <p className="text-xs font-bold text-slate-900">Direct transmission is available via social channels.</p>
           </div>
           <button 
             onClick={() => window.location.href = "mailto:studio@moonchaery.com"}
             className="px-8 py-4 rounded-full border border-slate-200 text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all duration-500"
           >
             Contact Studio
           </button>
        </div>

      </div>
    </section>
  );
}
