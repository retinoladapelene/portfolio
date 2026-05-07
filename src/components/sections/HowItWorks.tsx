"use client";

import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import { staggerContainer, fadeUp, viewportSettings } from "@/lib/animations";

const STEPS = [
  { id: "01", title: "DM Request", desc: "Send your request via DM using the form with clear references, pose, and description." },
  { id: "02", title: "Discussion", desc: "I will reply once received to acknowledge your commission and discuss further details." },
  { id: "03", title: "Draft Sketch", desc: "I'll start the sketch. You are allowed up to 3 major revisions (poses, expressions, etc.)" },
  { id: "04", title: "Finalizing", desc: "After sketch approval, I move to lineart/color. Major adjustments will not be accepted." },
  { id: "05", title: "Updates", desc: "I'll send regular progress updates. You can also see my recent art on Instagram!" },
];

const HowItWorks = () => {
  return (
    <Section id="process" className="bg-transparent">
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={viewportSettings}
        className="text-center mb-20"
      >
        <motion.h2 variants={fadeUp} className="text-[44px] md:text-[64px] font-normal text-white font-dancing-script">
          Procedure.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-white/70 font-outfit mt-2">A clear workflow to bring your vision to life.</motion.p>
      </motion.div>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 relative"
      >
        {/* Connector Line (Desktop) */}
        <div className="hidden lg:block absolute top-8 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0" />

        {STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            variants={fadeUp}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-[22px] bg-white/10 backdrop-blur-md shadow-sm border border-white/10 flex items-center justify-center text-xl font-black text-purple-600 mb-8 relative font-outfit">
               <div className="absolute inset-0 bg-purple-500/5 rounded-[22px]" />
               {step.id}
               
               {/* Glowing dot */}
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border-2 border-white shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white font-outfit tracking-tight">{step.title}</h3>
            <p className="text-[13px] leading-relaxed px-2 text-white/60 font-outfit font-medium">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

export default HowItWorks;
