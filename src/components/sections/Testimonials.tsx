"use client";

import { motion } from "framer-motion";
import { Quote, Star, User, ShieldCheck } from "lucide-react";
import Section from "@/components/ui/Section";
import GlassCard from "@/components/ui/GlassCard";
import { fadeUp, viewportSettings } from "@/lib/animations";

const REVIEWS = [
  {
    name: "Aurelius V.",
    handle: "@v_aurelius",
    text: "The level of neural detail provided in my character's portrait surpassed all expectations. It's not just art; it's a digital legacy.",
    type: "Full Body Masterpiece"
  },
  {
    name: "Seraphina",
    handle: "@seraph_art",
    text: "Working with this artist is like watching a vision come to life in high fidelity. The 'Luxury Editorial' aesthetic is truly unique in the industry.",
    type: "Neural Concept Art"
  },
  {
    name: "Kaelen Drake",
    handle: "@kdrake_concept",
    text: "Absolute mastery of character silhouettes. The pricing reflects the premium quality and professionalism delivered at every step.",
    type: "Commercial Licensing"
  },
  {
    name: "Elena Rossi",
    handle: "@elena_designs",
    text: "Fast, communicative, and possesses an incredible eye for artistic lighting. My order felt like a priority from protocol initialization to delivery.",
    type: "Bust Fragment"
  }
];

const Testimonials = () => {
  return (
    <Section id="testimonials" className="relative overflow-hidden py-32 bg-transparent">
      {/* BACKGROUND AURA */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-purple-500/5 to-transparent blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
          <motion.div 
            variants={fadeUp}
            initial="initial"
            whileInView="whileInView"
            viewport={viewportSettings}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-purple-500/50" />
              <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.5em]">Social Proof</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-normal text-black font-dancing-script leading-[0.8]">
              Client <br />
              <span className="text-purple-600 font-bold italic">Chronicles.</span>
            </h2>
          </motion.div>
          
          <motion.p 
            variants={fadeUp}
            initial="initial"
            whileInView="whileInView"
            viewport={viewportSettings}
            className="text-black/40 font-outfit text-sm max-w-sm leading-relaxed uppercase tracking-widest text-right lg:mb-4"
          >
            Verified archives of artistic collaborations and <span className="text-black">neural satisfaction.</span>
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.handle}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <GlassCard 
                level={1} 
                className="h-full p-8 flex flex-col justify-between border-black/5 bg-white/40 backdrop-blur-3xl hover:bg-white/60 transition-all hover:border-purple-600/50 rounded-[32px] relative overflow-hidden shadow-xl"
              >
                {/* Subtle Glow on Hover */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/0 group-hover:bg-purple-500/30 blur-3xl rounded-full transition-all duration-700" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                      <Quote size={18} className="text-purple-600" />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className="fill-purple-600 text-purple-600" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-black/80 font-outfit text-base leading-relaxed mb-10 italic font-medium">
                    "{review.text}"
                  </p>
                </div>

                <div className="relative z-10 pt-6 border-t border-black/5 mt-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                      <User size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-black uppercase tracking-wider truncate">
                        {review.name}
                      </h4>
                      <span className="text-[10px] text-black/40 uppercase tracking-[0.2em] block mt-0.5">{review.handle}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest whitespace-nowrap">
                        PRTCL: {review.type}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Global Stats or Proof Point */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 py-12 border-y border-black/5 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-32"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-black font-syne italic tracking-tighter">98%</span>
            <div className="h-10 w-px bg-black/10" />
            <div className="text-left">
              <span className="text-[10px] font-black text-black uppercase tracking-widest block">Client Satisfaction</span>
              <span className="text-[8px] text-black/40 uppercase tracking-widest mt-1">Global Neuro-Audit // 2024</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-black font-syne italic tracking-tighter">150+</span>
            <div className="h-10 w-px bg-black/10" />
            <div className="text-left">
              <span className="text-[10px] font-black text-black uppercase tracking-widest block">Neural Entities Created</span>
              <span className="text-[8px] text-black/40 uppercase tracking-widest mt-1">High-Fidelity Archive</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

export default Testimonials;
