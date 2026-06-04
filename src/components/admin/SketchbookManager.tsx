"use client";

import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Palette,
  Layout,
  Upload,
  ChevronUp,
  ChevronDown,
  RefreshCcw,
  Layers,
  Clock,
  Hash
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import Image from "next/image";
import { compressImage } from "@/utils/imageCompression";

type SketchbookItem = {
  id: string;
  ref_id: string;
  title: string;
  tag: string;
  status: string;
  year: string;
  caption: string;
  type: string;
  collection: string;
  image_url: string | null;
  order_index: number;
};

const STATUS_OPTIONS = [
  "Rough_Draft",
  "Initial_Ink",
  "Refined_Sketch",
  "Exploration",
  "Study"
];

const COLLECTION_OPTIONS = [
  "PH_COLL",
  "AN_ARCH",
  "ST_CORE",
  "ME_VAL"
];

export default function SketchbookManager() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<SketchbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<SketchbookItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isMounted = useRef(true);
  
  const supabase = createClient();

  const fetchItems = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('sketchbook_archive')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (!isMounted.current) return;
    
    if (error) {
      toast("Failed to load sketchbook: " + error.message, "error");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    isMounted.current = true;
    fetchItems();
    return () => { isMounted.current = false; };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isEditing) return;

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

      const fileExt = file.name.split('.').pop();
      const fileName = `sketch-${Date.now()}.${fileExt}`;
      const filePath = `sketchbook/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, compressedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      if (isMounted.current) {
        setIsEditing({ ...isEditing, image_url: publicUrl });
      }
    } catch (error: any) {
      if (isMounted.current) {
        toast("Upload failed: " + error.message, "error");
      }
    } finally {
      if (isMounted.current) setIsUploading(false);
    }

  };

  const seedCollection = async () => {
    const ok = await confirm({
      title: "Reset Collection?",
      message: "Reset collection to 9 standard items? This will delete existing sketches.",
      variant: "danger"
    });
    
    if (!ok) return;
    
    setLoading(true);
    const standardItems = [
      { ref_id: "REF_ETH", title: "Ethereal Guard", tag: "Ethereal", status: "Rough_Draft", year: "2024", caption: "Ethereal Guard", type: "Character Study", collection: "PH_COLL" },
      { ref_id: "REF_FLO", title: "Floating Echo", tag: "Floating", status: "Rough_Draft", year: "2023", caption: "Floating Echo", type: "Concept Art", collection: "PH_COLL" },
      { ref_id: "REF_NEO", title: "Neon Pulse", tag: "Neon", status: "Rough_Draft", year: "2024", caption: "Neon Pulse", type: "Hi-Fi Portrait", collection: "PH_COLL" },
      { ref_id: "REF_SIL", title: "Silken Blade", tag: "Silken", status: "Rough_Draft", year: "2024", caption: "Silken Blade", type: "Full Body Design", collection: "PH_COLL" },
      { ref_id: "REF_SCI", title: "Sci-Fi Rogue", tag: "Sci-Fi", status: "Rough_Draft", year: "2024", caption: "Sci-Fi Rogue", type: "Action Pose", collection: "PH_COLL" },
      { ref_id: "REF_FOR", title: "Forest Spirit", tag: "Forest", status: "Rough_Draft", year: "2023", caption: "Forest Spirit", type: "Digital Painting", collection: "PH_COLL" },
      { ref_id: "REF_CYB", title: "Cyber City", tag: "Cyber", status: "Rough_Draft", year: "2024", caption: "Cyber City", type: "Concept Art", collection: "PH_COLL" },
      { ref_id: "REF_WAR", title: "Warrior Priestess", tag: "Warrior", status: "Rough_Draft", year: "2024", caption: "Warrior Priestess", type: "Hi-Fi Portrait", collection: "PH_COLL" },
      { ref_id: "REF_TEC", title: "Tech Fashion", tag: "Tech", status: "Rough_Draft", year: "2023", caption: "Tech Fashion", type: "Fashion Design", collection: "PH_COLL" }
    ].map((item, i) => ({ ...item, order_index: i, image_url: null }));

    // Delete existing
    await supabase.from('sketchbook_archive').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert standard
    const { error } = await supabase.from('sketchbook_archive').insert(standardItems);
    
    if (error) {
      toast('Failed to seed collection: ' + error.message, "error");
    } else {
      toast("Seed collection successful! 9 standard slots are ready.", "success");
      fetchItems();
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!isEditing) return;

    setLoading(true);
    const { error } = await supabase
      .from('sketchbook_archive')
      .upsert(isEditing);

    if (!isMounted.current) return;

    if (error) {
      toast("Failed to save: " + error.message, "error");
    } else {
      toast("Sketch updated successfully!", "success");
      setIsEditing(null);
      fetchItems();
    }
    setLoading(false);
  };


  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Sketch?",
      message: "This sketch will be removed from the archive. Are you sure?",
      variant: "danger"
    });
    
    if (!ok) return;


    const { error } = await supabase
      .from('sketchbook_archive')
      .delete()
      .match({ id });

    if (!isMounted.current) return;

    if (error) {
      toast("Failed to delete: " + error.message, "error");
    } else {
      toast("Sketch deleted successfully!", "success");
      fetchItems();
    }
  };


  const addNew = () => {
    const newItem: Partial<SketchbookItem> = {
      ref_id: `REF_${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      title: "New Exploration",
      tag: "General",
      status: "Rough_Draft",
      year: new Date().getFullYear().toString(),
      caption: "Sketch Study",
      type: "Character Design",
      collection: "PH_COLL",
      image_url: null,
      order_index: items.length
    };
    setIsEditing(newItem as SketchbookItem);
  };


  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    const updates = newItems.map((m, i) => ({ ...m, order_index: i }));
    setItems(updates);
    
    const { error } = await supabase.from('sketchbook_archive').upsert(updates);
    if (error) toast('Failed to change order: ' + error.message, "error");
  };


  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 font-outfit">Preparing Sketchbook...</p>
      </div>
    );
  }


  return (
    <div className="space-y-12">

      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
            <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] font-outfit">RAW STROKES.</h2>
          </div>
          <p className="text-[9px] text-white/20 max-w-lg font-medium leading-relaxed font-outfit tracking-wider">
            A collection of raw strokes and sketches. Showcasing the early creative process and raw energy of every stroke before it becomes a masterpiece.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {items.length === 0 && (
            <button 
              onClick={seedCollection}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-[16px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all font-outfit"
            >
              <RefreshCcw size={14} /> Seed 9 Standard Collections
            </button>
          )}
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={addNew}
              disabled={items.length >= 9}
              className={cn(
                "flex items-center gap-3 px-8 py-3 rounded-[16px] text-[9px] font-black uppercase tracking-[0.3em] transition-all font-outfit shadow-xl",
                items.length >= 9 
                  ? "bg-white/5 text-white/20 cursor-not-allowed shadow-none" 
                  : "bg-purple-600 text-white hover:scale-105 active:scale-95 shadow-purple-900/40"
              )}
            >
              <Plus size={14} /> {items.length >= 9 ? "Slot Full (9/9)" : "Add Sketch"}
            </button>
            {items.length >= 9 && (
              <span className="text-[8px] font-black text-purple-400/40 uppercase tracking-widest mr-2">Collection Complete & Locked</span>
            )}
          </div>
        </div>

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((m, i) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-white/[0.02] border border-white/5 hover:border-purple-500/20 rounded-[32px] p-6 flex items-center gap-6 transition-all duration-500"
          >
             <div className="flex flex-col gap-2">
                <button onClick={() => moveOrder(i, 'up')} className="p-1 text-white/10 hover:text-purple-400 transition-colors">
                    <ChevronUp size={20} />
                </button>
                <button onClick={() => moveOrder(i, 'down')} className="p-1 text-white/10 hover:text-purple-400 transition-colors">
                    <ChevronDown size={20} />
                </button>
             </div>

             <label className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 relative group/thumb cursor-pointer">
                {m.image_url ? (
                  <Image 
                    src={m.image_url} 
                    alt="" 
                    fill 
                    unoptimized
                    className="object-cover group-hover/thumb:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <Sparkles size={24} className="text-white/20 group-hover/thumb:text-purple-400 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <Upload size={16} className="text-white" />
                  <span className="text-[7px] font-black text-white uppercase tracking-widest">Update</span>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    // Limit original size to 5MB before compression
                    const MAX_ORIGINAL_SIZE = 5 * 1024 * 1024;
                    if (file.size > MAX_ORIGINAL_SIZE) {
                      toast('Original image too large! Maximum size is 5MB.', "error");
                      return;
                    }

                    setLoading(true);
                    try {
                      // Compress Image
                      const compressedBlob = await compressImage(file, 1920, 1920, 0.8);
                      
                      // Check if compressed size is within 1MB
                      if (compressedBlob.size > 1024 * 1024) {
                        toast("Even after compression, the image is still over 1MB. Please use a smaller image.", "error");
                        setLoading(false);
                        return;
                      }

                      const fileExt = file.name.split('.').pop();
                      const fileName = `sketch-${Date.now()}.${fileExt}`;
                      const filePath = `sketchbook/${fileName}`;

                      const { error: uploadError } = await supabase.storage
                        .from('portfolio')
                        .upload(filePath, compressedBlob);

                      if (uploadError) throw uploadError;

                      const { data: { publicUrl } } = supabase.storage
                        .from('portfolio')
                        .getPublicUrl(filePath);

                      const { error: updateError } = await supabase
                        .from('sketchbook_archive')
                        .update({ image_url: publicUrl })
                        .eq('id', m.id);

                      if (updateError) throw updateError;
                      
                      fetchItems();
                      toast('Image updated successfully!', "success");
                    } catch (error: any) {
                      toast('Update failed: ' + error.message, "error");
                    } finally {
                      setLoading(false);
                    }
                  }} 
                />
             </label>


             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{m.ref_id}</span>
                    <h3 className="text-sm font-bold text-white truncate">{m.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                   <span className="text-[8px] px-2 py-0.5 bg-white/5 text-white/40 rounded uppercase font-black">{m.status}</span>
                   <span className="text-[8px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded uppercase font-black">{m.year}</span>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(m)}
                  className="p-3 bg-white/5 text-white/30 hover:text-white rounded-xl transition-all"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(m.id)}
                  disabled={items.length <= 9}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    items.length <= 9 
                      ? "bg-white/5 text-white/5 cursor-not-allowed" 
                      : "bg-red-500/5 text-red-500/30 hover:bg-red-500 hover:text-white"
                  )}
                >
                  <Trash2 size={16} />
                </button>

             </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-[#0D121F] border border-white/10 rounded-[40px] overflow-hidden shadow-3xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar border-r border-white/5">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-normal text-white font-dancing-script">
                      Edit <span className="text-purple-400">Sketch</span>
                   </h2>

                   <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-[10px] font-black uppercase tracking-widest">
                      <Hash size={12} /> {isEditing.ref_id}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Reference ID</label>

                    <input 
                      type="text" 
                      value={isEditing.ref_id}
                      onChange={(e) => setIsEditing({...isEditing, ref_id: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Production Year</label>

                    <input 
                      type="text" 
                      value={isEditing.year}
                      onChange={(e) => setIsEditing({...isEditing, year: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Exploration Title</label>

                  <input 
                    type="text" 
                    value={isEditing.title}
                    onChange={(e) => setIsEditing({...isEditing, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Archive Tag</label>

                    <input 
                      type="text" 
                      value={isEditing.tag}
                      onChange={(e) => setIsEditing({...isEditing, tag: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Project Type</label>

                    <input 
                      type="text" 
                      value={isEditing.type}
                      onChange={(e) => setIsEditing({...isEditing, type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white/40">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest font-outfit">Production Status</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {STATUS_OPTIONS.map((opt) => (
                           <button 
                             key={opt}
                             onClick={() => setIsEditing({...isEditing, status: opt})}
                             className={cn(
                               "px-4 py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all",
                               isEditing.status === opt ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                             )}
                           >
                              {opt.replace('_', ' ')}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white/40">
                        <Layout size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest font-outfit">Vault Collection</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {COLLECTION_OPTIONS.map((opt) => (
                           <button 
                             key={opt}
                             onClick={() => setIsEditing({...isEditing, collection: opt})}
                             className={cn(
                               "px-4 py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all",
                               isEditing.collection === opt ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                             )}
                           >
                              {opt}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="w-full md:w-[420px] bg-black/40 flex flex-col relative max-h-[90vh] min-h-0 border-l border-white/5">
                <div className="p-8 pb-4 flex items-center justify-between sticky top-0 z-20 bg-[#0D121F]/60 backdrop-blur-md border-b border-white/5">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] font-outfit">Final Result Preview</span>

                  <button onClick={() => setIsEditing(null)} className="p-2 text-white/20 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                   <div className="relative group/canvas max-w-sm mx-auto">
                      <div className="absolute -inset-4 bg-purple-500/10 blur-3xl rounded-full opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-1000" />
                      
                      <div className="relative bg-[#0F1422] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <span className="text-[8px] font-black text-purple-400/60 uppercase tracking-widest">{isEditing.ref_id}</span>
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{isEditing.collection}</span>
                         </div>
                         
                         <label className="block cursor-pointer relative group/img">
                            <div className="aspect-[4/5] bg-white/[0.02] flex items-center justify-center overflow-hidden relative">
                               {isEditing.image_url ? (
                                 <Image 
                                   src={isEditing.image_url} 
                                   alt="" 
                                   fill 
                                   unoptimized
                                   className="object-cover" 
                                 />
                               ) : (
                                 <Sparkles size={40} className="text-white/5" />
                               )}
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                  <Upload size={24} className="text-white" />
                                  <p className="text-[9px] font-black text-white uppercase tracking-widest">Insert Image</p>
                                  <p className="text-[7px] text-white/40 uppercase">Max 1MB</p>
                               </div>
                            </div>
                            <input type="file" className="hidden" onChange={handleImageUpload} />
                         </label>

                         <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h4 className="text-lg font-bold text-white tracking-tight leading-none mb-1">{isEditing.title}</h4>
                                  <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">{isEditing.tag}</p>
                               </div>
                               <span className="text-sm font-black text-white/10">{isEditing.year}</span>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                               <div className="flex flex-col">
                                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Status</span>
                                  <span className="text-[9px] font-black text-white/60 uppercase">{isEditing.status.replace('_', ' ')}</span>
                               </div>
                               <div className="w-px h-6 bg-white/5" />
                               <div className="flex flex-col">
                                  <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Medium</span>
                                  <span className="text-[9px] font-black text-white/60 uppercase">{isEditing.type}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-12 space-y-4">
                      <button 
                        onClick={handleSave}
                        disabled={loading || isUploading}
                        className="w-full bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-[20px] hover:bg-purple-400 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Sketch
                      </button>

                      <button 
                        onClick={() => setIsEditing(null)}
                        className="w-full py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-colors"
                      >
                        Cancel
                      </button>

                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
