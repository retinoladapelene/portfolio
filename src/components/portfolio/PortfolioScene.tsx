"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Maximize2, ExternalLink } from "lucide-react";
import { Project } from "@/config/projects";
import { cn } from "@/lib/utils";

export interface PortfolioSceneProps {
  project: Project;
  index: number;
  isActive: boolean;
  onSelect?: (p: Project) => void;
  isSnapshot?: boolean; // If true, disable interactions and some animations
}

export default function PortfolioScene({
  project,
  index,
  isActive,
  onSelect,
  isSnapshot = false,
}: PortfolioSceneProps) {
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center ${isSnapshot ? 'pointer-events-none' : 'pointer-events-auto'}`} 
      style={{ zIndex: 10 }}
    >
      <motion.div
        initial={isSnapshot ? { scale: 1.05 } : { scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image 
          src={project.image || "/placeholder.jpg"} 
          alt={project.title} 
          fill 
          className="object-cover" 
          priority={index === 0 || isSnapshot} 
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />

      <div className="relative z-20 w-full max-w-6xl mx-auto px-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-10">
        <motion.div
          layoutId={isSnapshot ? undefined : `card-${project.id}`}
          whileHover={isSnapshot ? {} : { scale: 1.02, rotate: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => !isSnapshot && onSelect?.(project)}
          className={`relative w-[180px] h-[240px] md:w-[260px] md:h-[360px] glass-panel p-2.5 rounded-[24px] shadow-2xl group ${isSnapshot ? '' : 'cursor-pointer'}`}
        >
          <div className="relative w-full h-full overflow-hidden rounded-2xl">
            <Image
              src={project.image || "/placeholder.jpg"}
              alt={`${project.title} focus`}
              fill
              priority={isSnapshot}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {!isSnapshot && (
              <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Maximize2 size={32} className="text-white scale-50 group-hover:scale-100 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className={cn("flex-1 space-y-8", project.font_family)}>
          <div className="space-y-4">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border"
              style={{ 
                backgroundColor: `${project.accent_color}20`, // 20 opacity
                color: project.accent_color,
                borderColor: `${project.accent_color}30`
              }}
            >
              {project.category}
            </span>
            <h2 
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]"
              style={{ color: project.title_color }}
            >
              {project.title.split(" ")[0]} <br />
              <span style={{ color: project.accent_color }}>{project.title.split(" ").slice(1).join(" ")}</span>
            </h2>
          </div>
          <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed max-w-[320px]">
            {project.desc}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link 
              href={`/portfolio/${project.id}`}
              style={{ backgroundColor: project.accent_color }}
              className={cn(
                "btn-liquid-primary !px-8 !py-3 text-[10px] flex items-center justify-center border-none",
                isSnapshot ? 'pointer-events-none' : 'cursor-pointer'
              )}
            >
              Deep Dive <ExternalLink size={14} className="ml-2" />
            </Link>
            <button 
              onClick={() => !isSnapshot && onSelect?.(project)}
              className={cn(
                "btn-liquid-secondary !px-8 !py-3 text-[10px] flex items-center justify-center",
                isSnapshot ? 'pointer-events-none' : 'cursor-pointer'
              )}
            >
              Quick View <Maximize2 size={14} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
