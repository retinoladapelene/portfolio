"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Share2, Heart, Palette, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Project } from "@/config/projects";

export default function ProjectDetail() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProject() {
      if (!params.id) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        console.error("Error fetching project:", error);
        setLoading(false);
        return;
      }

      // Map DB fields to Project interface
      const mappedProject: Project = {
        id: data.id,
        title: data.title,
        category: data.category,
        desc: data.description,
        longDesc: data.long_description,
        objective: data.objective,
        artDirection: data.art_direction,
        image: data.image_url,
      };

      setProject(mappedProject);
      setLoading(false);
    }

    fetchProject();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-t-2 border-brand-primary rounded-full"
        />
      </div>
    );
  }

  if (!project) return notFound();

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white selection:bg-brand-primary/30">
      
      {/* Header / Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 p-8 flex justify-between items-center pointer-events-none">
        <Link 
          href="/portfolio" 
          className="pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Gallery</span>
        </Link>
        <div className="flex gap-3 pointer-events-auto">
          <button 
            aria-label="Add to Favorites"
            className="p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-brand-primary transition-all"
          >
            <Heart size={18} />
          </button>
          <button 
            aria-label="Share Project"
            className="p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-brand-primary transition-all"
          >
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/20 to-transparent" />
        
        <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-black tracking-[0.3em] uppercase border border-brand-primary/30">
              {project.category}
            </span>
            <h1 className="text-6xl md:text-9xl font-black text-white mt-6 tracking-tighter uppercase italic leading-[0.9]">
              {project.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container mx-auto px-6 grid lg:grid-cols-12 gap-16">
        
        {/* Deep Dive Content */}
        <div className="lg:col-span-10 lg:col-start-2 space-y-16">
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic border-l-4 border-brand-primary pl-6">
              The Creative Process
            </h2>
            <p className="text-xl text-white/60 leading-relaxed font-medium italic">
              {project.longDesc || project.desc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tighter">Objective</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {project.objective || "To push the boundaries of digital textures while maintaining a strong focus on character silhouette and emotional resonance."}
              </p>
            </div>
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                <Palette size={24} />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tighter">Art Direction</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {project.artDirection || "Utilizing high-contrast lighting (Chiaroscuro) and a complementary color palette to create depth and visual tension."}
              </p>
            </div>
          </div>

          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="relative aspect-video rounded-[40px] overflow-hidden border border-white/10 cursor-pointer group"
          >
            <Image src={project.image} alt="High res detail" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="btn-liquid-secondary !py-3 !px-6">High Resolution View</div>
            </div>
          </motion.div>
        </div>

      </section>

    </main>
  );
}
