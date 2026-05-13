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
  CheckCircle2,
  Star
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import Image from "next/image";

type GalleryArt = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_centerpiece: boolean;
};

const MAX_SLOTS = 8;

export default function GalleryManager() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [artworks, setArtworks] = useState<GalleryArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<GalleryArt | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_art')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      toast("Failed to load gallery: " + error.message, "error");
    } else {
      setArtworks(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, art: GalleryArt | null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate File Type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast("Invalid file type. Please upload PNG, JPG, or WEBP.", "error");
      return;
    }

    // 2. Validate File Size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast("File is too large! Maximum size allowed is 2MB.", "error");
      return;
    }

    // Create local preview immediately for instant feedback
    const localUrl = URL.createObjectURL(file);
    if (isEditing) {
      setIsEditing((prev: any) => prev ? ({ ...prev, image_url: localUrl }) : null);
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      if (isEditing) {
        setIsEditing((prev: any) => prev ? ({ ...prev, image_url: publicUrl }) : null);
        toast("Image uploaded successfully!", "success");
      }
    } catch (error: any) {
      toast("Upload failed: " + error.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!isEditing) return;

    if (!isEditing.image_url) {
      toast("Please upload an image first", "error");
      return;
    }

    if (!isEditing.title.trim()) {
      toast("Title is required", "error");
      return;
    }

    setLoading(true);
    try {
      // Omit empty ID so Supabase generates a new one on insert
      const payload: any = { ...isEditing };
      if (!payload.id || payload.id === "") {
        delete payload.id;
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast("Gallery updated successfully!", "success");
        setIsEditing(null);
        fetchArtworks();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast("Failed to save: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteArt = async (id: string) => {
    const ok = await confirm({
      title: "Delete Artwork?",
      message: "This artwork will be removed from the 3D gallery. Are you sure?",
      variant: "danger"
    });
    
    if (!ok) return;

    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast("Artwork deleted!", "success");
        fetchArtworks();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast("Delete failed: " + error.message, "error");
    }
  };

  const addNewArt = () => {
    if (artworks.length >= MAX_SLOTS) {
      toast(`You have reached the maximum of ${MAX_SLOTS} wall slots!`, "error");
      return;
    }
    const nextOrder = artworks.length > 0 ? Math.max(...artworks.map(a => a.display_order)) + 1 : 0;
    setIsEditing({
      id: "", // Supabase will generate if missing on insert
      title: "New Masterpiece",
      description: "A description of this artwork...",
      image_url: "",
      display_order: nextOrder,
      is_centerpiece: false
    } as any);
  };

  const wallArt = artworks.sort((a, b) => a.display_order - b.display_order);

  if (loading && artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 font-outfit">Loading Gallery Archive...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* --- WALL EXHIBITION GRID --- */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
          <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] font-outfit">Wall Exhibition (8 Fixed Slots)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: MAX_SLOTS }).map((_, index) => {
            const art = wallArt[index];
            return (
              <div key={index} className="relative aspect-[4/5]">
                {art ? (
                  <motion.div 
                    layoutId={art.id}
                    className="h-full bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden group hover:border-purple-500/40 transition-all relative"
                  >
                    <Image src={art.image_url} alt={art.title} fill unoptimized className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Slot {index + 1}</span>
                      <h3 className="text-sm font-bold text-white font-syne uppercase italic tracking-tighter truncate">{art.title}</h3>
                    </div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button onClick={() => setIsEditing(art)} className="p-3 bg-white text-black rounded-xl hover:scale-110 transition-all"><Pencil size={16} /></button>
                      <button onClick={() => deleteArt(art.id)} className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setIsEditing({ id: "", title: "", description: "", image_url: "", display_order: index, is_centerpiece: false } as any)}
                    className="w-full h-full border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center gap-4 text-white/5 hover:border-purple-500/20 hover:text-purple-500/40 hover:bg-purple-500/[0.02] transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Slot {index + 1} Empty</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0D121F] border border-white/10 rounded-[40px] overflow-hidden shadow-3xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white font-syne uppercase italic tracking-tighter">
                  Artwork <span className="text-purple-400">Settings</span>
                </h2>
                <button onClick={() => setIsEditing(null)} className="p-2 bg-white/5 rounded-2xl text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <label className="block">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 block font-outfit">Visual Asset</span>
                      <div className="relative aspect-square rounded-[32px] overflow-hidden bg-white/5 border border-white/10 group cursor-pointer">
                        {isEditing.image_url ? (
                          <Image src={isEditing.image_url} alt="Preview" fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-4 text-white/10">
                            <ImageIcon size={48} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Click to upload</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => handleImageUpload(e, isEditing)} 
                          />
                          {isUploading ? <Loader2 className="animate-spin text-purple-400" size={32} /> : <ImageIcon className="text-white" />}
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Artwork Title</label>
                      <input 
                        type="text" 
                        placeholder="Masterpiece Name"
                        value={isEditing.title}
                        onChange={(e) => setIsEditing({...isEditing, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-outfit italic"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Slot Number (Index)</label>
                      <input 
                        type="number" 
                        disabled
                        value={isEditing.display_order + 1}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white/40 font-outfit"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 block font-outfit">Artwork Description</label>
                      <textarea 
                        placeholder="Tell the story of this art..."
                        value={isEditing.description}
                        onChange={(e) => setIsEditing({...isEditing, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-outfit italic leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => setIsEditing(null)}
                  className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isUploading || loading}
                  className={cn(
                    "flex items-center gap-3 px-10 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-purple-900/40",
                    (isUploading || loading) ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {isUploading ? "Uploading..." : "Save Masterpiece"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
