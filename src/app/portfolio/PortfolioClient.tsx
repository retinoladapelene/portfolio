"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { projects as staticProjects, Project } from "@/config/projects";
import GlassShatterTransition, { Direction } from "@/components/portfolio/GlassShatterTransition";
import SwordSliceTransition from "@/components/portfolio/SwordSliceTransition";
import GlitchSliceTransition from "@/components/portfolio/GlitchSliceTransition";
import PortfolioScene from "@/components/portfolio/PortfolioScene";
import { createClient } from "@/utils/supabase/client";

export default function PortfolioPage() {
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const supabase = createClient();
  const currentProjects = dbProjects.length > 0 ? dbProjects : staticProjects;
  const totalProjects = currentProjects.length;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });

      if (data && data.length > 0) {
        const mapped = data
          .map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            desc: p.description,
            image: p.image_url || "/placeholder.jpg",
            longDesc: p.long_description,
            objective: p.objective,
            artDirection: p.art_direction,
            transition_type: p.transition_type || "glass",
            title_color: p.title_color || "#FFFFFF",
            accent_color: p.accent_color || "#A855F7",
            font_family: p.font_family || "font-syne"
          }))
          .filter(p => p.image && !p.image.startsWith("blob:"));
        setDbProjects(mapped);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const [activeIdx, setActiveIdx] = useState(0);
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState<Direction>("next");
  const [newArtworkVisible, setNewArtworkVisible] = useState(false);
  const [transitionImage, setTransitionImage] = useState<string | undefined>(undefined);
  const [transitionProject, setTransitionProject] = useState<Project | null>(null);
  const [transitionType, setTransitionType] = useState<"glass" | "sword" | "glitch">("glass");

  const triggerTransition = useCallback(
    (newIdx: number, dir: Direction) => {
      if (isTransitioning) return;
      
      // Use the transition type defined for the CURRENT project (outgoing)
      const type = currentProjects[activeIdx].transition_type || "glass";
      
      setTransitionType(type);
      
      setTransitionImage(currentProjects[activeIdx].image);
      setTransitionProject(currentProjects[activeIdx]);
      setPendingIdx(newIdx);
      setTransitionDir(dir);
      setNewArtworkVisible(false);
      setIsTransitioning(true);
    },
    [isTransitioning, activeIdx, currentProjects]
  );

  const handleNext = () => triggerTransition((activeIdx + 1) % totalProjects, "next");
  const handlePrev = () => triggerTransition((activeIdx - 1 + totalProjects) % totalProjects, "prev");
  const handleDotClick = (i: number) => {
    if (i === activeIdx || isTransitioning) return;
    triggerTransition(i, i > activeIdx ? "next" : "prev");
  };

  const handleReveal = useCallback(() => {
    if (pendingIdx !== null) setActiveIdx(pendingIdx);
    setNewArtworkVisible(true);
  }, [pendingIdx]);

  const handleComplete = useCallback(() => {
    setPendingIdx(null);
    setIsTransitioning(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-6">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-2 border-brand-primary/30 border-t-brand-primary rounded-full"
        />
        <motion.p 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary"
        >
          Initializing Portfolio...
        </motion.p>
      </div>
    );
  }

  return (
    <main className="relative bg-black text-white selection:bg-brand-primary/30 h-screen overflow-hidden">
      <nav className="fixed top-8 left-8 z-50 flex gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Home</span>
        </Link>

      </nav>

      <div className="fixed bottom-10 right-10 z-50 flex gap-4">
        <button
          onClick={handlePrev}
          disabled={isTransitioning}
          className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-primary hover:bg-white/10 hover:border-brand-primary/50 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={handleNext}
          disabled={isTransitioning}
          className="w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 hover:scale-110 active:scale-95 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6">
        {currentProjects.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            disabled={isTransitioning}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeIdx === i
                ? "bg-brand-primary scale-150 shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]"
                : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      <div className="relative h-screen w-full overflow-hidden">
        <motion.div
          key={activeIdx}
          initial={isTransitioning ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
          animate={
            newArtworkVisible || !isTransitioning
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.96 }
          }
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <PortfolioScene
            project={currentProjects[activeIdx]}
            index={activeIdx}
            isActive={true}
            onSelect={setSelectedProject}
          />
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-10 z-30 hidden md:flex items-center gap-4 opacity-30 uppercase tracking-[0.3em] text-[10px] font-bold pointer-events-none">
        <span className="text-white">Project 0{activeIdx + 1}</span>
        <div className="w-12 h-[1px] bg-white" />
        <span className="text-white/50">{currentProjects[activeIdx].category}</span>
      </div>

      {/* Conditional Transitions */}
      {transitionType === "sword" ? (
        <SwordSliceTransition
          isActive={isTransitioning}
          direction={transitionDir}
          onReveal={handleReveal}
          onComplete={handleComplete}
        >
          {transitionProject && (
            <PortfolioScene
              project={transitionProject}
              index={-1}
              isActive={true}
              isSnapshot={true}
            />
          )}
        </SwordSliceTransition>
      ) : transitionType === "glitch" ? (
        <GlitchSliceTransition
          isActive={isTransitioning}
          onReveal={handleReveal}
          onComplete={handleComplete}
          direction={transitionDir}
        >
          {transitionProject && (
            <PortfolioScene
              project={transitionProject}
              index={-1}
              isActive={true}
              isSnapshot={true}
            />
          )}
        </GlitchSliceTransition>
      ) : (
        <GlassShatterTransition
          isActive={isTransitioning}
          direction={transitionDir}
          imageUrl={transitionImage}
          onReveal={handleReveal}
          onComplete={handleComplete}
        >
          {transitionProject && (
            <PortfolioScene
              project={transitionProject}
              index={-1}
              isActive={true}
              isSnapshot={true}
            />
          )}
        </GlassShatterTransition>
      )}

      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] cursor-zoom-out"
            />
            <motion.div
              layoutId={`card-${selectedProject.id}`}
              className="fixed inset-4 md:inset-20 z-[101] flex flex-col md:flex-row bg-[#0B0F1A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="relative flex-1 min-h-[300px]">
                <Image src={selectedProject.image} alt={selectedProject.title} fill className="object-cover" />
              </div>
              <div className="w-full md:w-[400px] p-8 md:p-10 flex flex-col justify-center gap-6 md:gap-8 bg-[#0B0F1A] relative">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <div>
                  <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em]">
                    {selectedProject.category}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-black text-white mt-2 uppercase tracking-tighter italic">
                    {selectedProject.title}
                  </h3>
                </div>
                <p className="text-white/60 leading-relaxed italic text-sm md:text-base">
                  &quot;{selectedProject.desc}&quot;
                </p>
                <div className="space-y-4 pt-4">
                  <Link href={`/portfolio/${selectedProject.id}`} className="w-full btn-liquid-primary !py-4 block text-center">
                    View Project Case Study
                  </Link>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

