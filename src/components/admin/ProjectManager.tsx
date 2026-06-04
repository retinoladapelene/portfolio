"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  X, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import Image from "next/image";
import { compressImage } from "@/utils/imageCompression";

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  long_description: string;
  objective: string;
  art_direction: string;
  image_url: string;
  order_index: number;
  transition_type: "glass" | "sword" | "glitch";
  title_color?: string;
  accent_color?: string;
  font_family?: string;
};

export default function ProjectManager() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      toast("Failed to load projects: " + error.message, "error");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, project: Project | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit original size to 5MB before compression
    const MAX_ORIGINAL_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_ORIGINAL_SIZE) {
      toast("Original image too large! Maximum size is 5MB.", "error");
      return;
    }

    setIsUploading(true);
    try {
      // Compress Image
      const compressedBlob = await compressImage(file, 1920, 1920, 0.8);
      
      // Check if compressed size is within 1MB
      if (compressedBlob.size > 1024 * 1024) {
        toast("Even after compression, the image is still over 1MB. Please use a smaller image.", "error");
        setIsUploading(false);
        return;
      }

      // Create local preview immediately for instant feedback
      const localUrl = URL.createObjectURL(compressedBlob);
      if (isEditing) {
        setIsEditing({ ...isEditing, image_url: localUrl });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, compressedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      if (isEditing) {
        // Cleanup old preview if it was a local blob
        if (isEditing.image_url.startsWith('blob:')) {
          URL.revokeObjectURL(isEditing.image_url);
        }
        setIsEditing({ ...isEditing, image_url: publicUrl });
        toast("Image uploaded successfully!", "success");
      }
      
      // Cleanup the current localUrl after setting publicUrl
      URL.revokeObjectURL(localUrl);
    } catch (error: any) {
      toast("Upload failed: " + error.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const initializeSampleData = async () => {
    const ok = await confirm({
      title: "Initialize Sample Data?",
      message: "This will add 4 sample projects to your database. Continue?",
      variant: "primary"
    });
    if (!ok) return;

    setLoading(true);
    const sampleProjects = [
      { 
        title: "Cyberpunk Oni", 
        category: "Character Concept",
        description: "A fusion of traditional Japanese folklore and futuristic neon aesthetics.",
        image_url: "/art1.jpg",
        order_index: 0,
        transition_type: "glass"
      },
      { 
        title: "Ethereal Landscape", 
        category: "Environment",
        description: "Floating islands and bioluminescent flora in a dream-like realm.",
        image_url: "/art2.jpg",
        order_index: 1,
        transition_type: "sword"
      },
      { 
        title: "The Guardian", 
        category: "Portrait",
        description: "Detailed close-up focusing on the emotional depth and mechanical textures.",
        image_url: "/art3.jpg",
        order_index: 2,
        transition_type: "glitch"
      },
    ];

    const { error } = await supabase
      .from('projects')
      .insert(sampleProjects);

    if (error) {
      toast("Failed to initialize: " + error.message, "error");
    } else {
      toast("Sample data initialized!", "success");
      fetchProjects();
    }
    setLoading(false);
  };

  const addNewSlot = async () => {
    if (projects.length >= 4) {
      toast("Maximum 4 slots allowed for the immersive portfolio.", "error");
      return;
    }

    const newProject = {
      title: "New Project",
      category: "Artwork",
      description: "Short description here...",
      order_index: projects.length,
      transition_type: "glass"
    };

    setLoading(true);
    const { error } = await supabase
      .from('projects')
      .insert([newProject]);

    if (error) {
      toast("Failed to add slot: " + error.message, "error");
    } else {
      toast("New slot added!", "success");
      fetchProjects();
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!isEditing) return;

    setLoading(true);
    const { error } = await supabase
      .from('projects')
      .upsert(isEditing);

    if (error) {
      toast("Failed to save: " + error.message, "error");
    } else {
      toast("Project updated successfully!", "success");
      setIsEditing(null);
      fetchProjects();
    }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    const ok = await confirm({
      title: "Delete Project?",
      message: "This project data will be permanently deleted. Are you sure?",
      variant: "danger"
    });
    
    if (!ok) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .match({ id });

    if (error) {
      toast("Failed to delete: " + error.message, "error");
    } else {
      toast("Project deleted successfully!", "success");
      fetchProjects();
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 font-outfit">Connecting Data...</p>
      </div>
    );
  }


  return (
    <div className="space-y-12">

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
          <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] font-outfit">Active Portfolio Slots</h2>
        </div>

        <div className="flex gap-4">
          {projects.length === 0 && (
            <button 
              onClick={initializeSampleData}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              Initialize Sample Data
            </button>
          )}
          <button 
            onClick={addNewSlot}
            disabled={projects.length >= 4 || loading}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              projects.length >= 4 
                ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5" 
                : "bg-purple-600 text-white shadow-lg shadow-purple-900/20 hover:scale-105 active:scale-95"
            )}
          >
            <Plus size={14} /> {projects.length >= 4 ? "Slots Full (Max 4)" : "Add New Slot"}
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {projects.map((project) => (
          <motion.div 
            key={project.id}
            layoutId={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.01] border border-white/10 rounded-[48px] overflow-hidden group hover:border-purple-500/30 transition-all duration-700 backdrop-blur-3xl shadow-3xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative h-80 bg-white/[0.02] overflow-hidden">
              {project.image_url ? (
                <Image 
                  src={project.image_url} 
                  alt={project.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0" 
                />
              ) : (
                <div className="flex items-center justify-center h-full opacity-10">
                  <ImageIcon size={64} strokeWidth={1} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                <button 
                  onClick={() => setIsEditing(project)}
                  className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-[20px] hover:scale-105 active:scale-95 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  <Pencil size={14} /> Update Project Archive
                </button>

              </div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-white/60 uppercase tracking-widest">
                  Slot 0{projects.indexOf(project) + 1}
                </span>
              </div>
            </div>
            
            <div className="p-12 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] font-outfit">
                  {project.category || "Visual Artwork"}
                </span>

                <div className="h-px flex-1 bg-white/5 mx-6 mt-2" />
              </div>
              <h3 className="text-4xl font-normal text-white mb-6 font-dancing-script tracking-tight">{project.title || "Untitled Artwork"}</h3>

              <p className="text-[14px] text-white/30 font-outfit font-medium leading-relaxed line-clamp-3 group-hover:text-white/50 transition-colors duration-500">
                {project.description || "No narrative available for this project."}
              </p>

              
              <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Archive</span>
                </div>
                <button 
                  onClick={() => deleteProject(project.id)}
                  className="p-3 bg-red-500/5 hover:bg-red-500 hover:text-white border border-red-500/10 rounded-xl text-red-500/40 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0D121F] border border-white/10 rounded-[32px] overflow-hidden shadow-3xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h2 className="text-2xl font-normal text-white font-dancing-script">
                  Edit <span className="text-purple-400">Slot Project</span>
                </h2>

                <button onClick={() => setIsEditing(null)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column: Media */}
                  <div className="space-y-8">
                    <label className="block">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 block font-outfit">Visual Narrative</span>

                      <div className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer shadow-inner">
                        {isEditing?.image_url ? (
                          <Image src={isEditing.image_url} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-4 text-white/10">
                            <ImageIcon size={48} />
                            <span className="text-[10px] font-black uppercase tracking-widest font-outfit">Click to upload artwork</span>
                          </div>

                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => handleImageUpload(e, isEditing)}
                          />
                          {isUploading ? <Loader2 className="animate-spin text-purple-400" size={32} /> : <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md"><ImageIcon className="text-white" /></div>}
                        </div>
                      </div>
                    </label>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Project Title</label>

                        <input 
                          type="text" 
                          value={isEditing.title || ""}
                          onChange={(e) => setIsEditing({...isEditing, title: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                          placeholder="e.g. Celestial Wanderer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Category</label>

                        <input 
                          type="text" 
                          value={isEditing.category || ""}
                          onChange={(e) => setIsEditing({...isEditing, category: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                          placeholder="e.g. Concept Illustration"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 block font-outfit">Cinematic Transition</label>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'glass', label: 'Glass', icon: '💎' },
                            { id: 'sword', label: 'Sword', icon: '⚔️' },
                            { id: 'glitch', label: 'Glitch', icon: '👾' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => isEditing && setIsEditing({...isEditing, transition_type: opt.id as any})}
                              className={cn(
                                "flex items-center justify-between px-5 py-4 rounded-2xl border transition-all font-outfit",
                                isEditing?.transition_type === opt.id 
                                  ? "bg-purple-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
                                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"
                              )}
                            >
                              <span className="text-[11px] font-black uppercase tracking-widest">{opt.label}</span>
                              <span className="text-lg">{opt.icon}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Title Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={isEditing.title_color || "#FFFFFF"}
                              onChange={(e) => setIsEditing({...isEditing, title_color: e.target.value})}
                              className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                            />
                            <input 
                              type="text" 
                              value={isEditing.title_color || "#FFFFFF"}
                              onChange={(e) => setIsEditing({...isEditing, title_color: e.target.value})}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/60 font-outfit"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Accent Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={isEditing.accent_color || "#A855F7"}
                              onChange={(e) => setIsEditing({...isEditing, accent_color: e.target.value})}
                              className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                            />
                            <input 
                              type="text" 
                              value={isEditing.accent_color || "#A855F7"}
                              onChange={(e) => setIsEditing({...isEditing, accent_color: e.target.value})}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/60 font-outfit"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Artistic Typography</label>

                        <select 
                          value={isEditing?.font_family || "font-syne"}
                          onChange={(e) => isEditing && setIsEditing({...isEditing, font_family: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit appearance-none"
                        >
                          <option value="font-syne" className="bg-[#0B0F1A] font-syne">Syne (Geometric & Bold)</option>
                          <option value="font-outfit" className="bg-[#0B0F1A] font-outfit">Outfit (Modern & Clean)</option>
                          <option value="font-dancing-script" className="bg-[#0B0F1A] font-dancing-script">Dancing Script (Elegant Script)</option>
                          <option value="font-playfair" className="bg-[#0B0F1A] font-playfair">Playfair Display (High-Contrast Serif)</option>
                          <option value="font-cormorant" className="bg-[#0B0F1A] font-cormorant">Cormorant Garamond (Classical Serif)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Descriptions */}
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Brief Summary</label>

                      <textarea 
                        value={isEditing.description || ""}
                        onChange={(e) => setIsEditing({...isEditing, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit leading-relaxed"
                        placeholder="The essence of this project..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Project Narrative</label>

                      <textarea 
                        value={isEditing.long_description || ""}
                        onChange={(e) => setIsEditing({...isEditing, long_description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-48 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit leading-relaxed"
                        placeholder="Tell us more about the process..."
                      />
                    </div>

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Project Objective</label>

                    <textarea 
                      value={isEditing.objective || ""}
                      onChange={(e) => setIsEditing({...isEditing, objective: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-36 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit leading-relaxed"
                      placeholder="Target of this artistic exploration..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Visual Direction</label>

                    <textarea 
                      value={isEditing.art_direction || ""}
                      onChange={(e) => setIsEditing({...isEditing, art_direction: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-36 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit leading-relaxed"
                      placeholder="Color, lighting, and style choices..."
                    />
                  </div>

                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4 items-center">
                <button 
                  onClick={() => setIsEditing(null)}
                  className="px-6 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors font-outfit"
                >
                  Cancel
                </button>

                <button 
                  onClick={handleSave}
                  disabled={isUploading || loading}
                  className={cn(
                    "flex items-center gap-3 px-8 py-3 bg-purple-600 text-white rounded-[16px] text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-purple-900/40 font-outfit",
                    (isUploading || loading) ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {isUploading ? "Uploading..." : "Save Changes"}
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
