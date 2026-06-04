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
  Baby,
  Star,
  Heart,
  Palette,
  Layout,
  Upload,
  ChevronUp,
  ChevronDown,
  RefreshCcw
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import Image from "next/image";
import { compressImage } from "@/utils/imageCompression";

type JourneyMilestone = {
  id: string;
  year: string;
  title: string;
  caption: string;
  description: string;
  icon: string;
  image_url: string | null;
  sticky_bg: string;
  sticky_border: string;
  sticky_title_color: string;
  sticky_text_color: string;
  tape_bg: string;
  tape_border: string;
  rotate_card: string;
  rotate_sticky: string;
  offset_class: string;
  is_key: boolean;
  order_index: number;
};



const OFFSET_OPTIONS = [
  { label: "Level", value: "mt-0" },
  { label: "Slight Down", value: "mt-4" },
  { label: "Medium Down", value: "mt-8" },
  { label: "Deep Down", value: "mt-12" },
];

const ROTATE_OPTIONS = [
  { label: "-3°", value: "-rotate-3" },
  { label: "-2°", value: "-rotate-2" },
  { label: "-1°", value: "-rotate-1" },
  { label: "0°", value: "rotate-0" },
  { label: "1°", value: "rotate-1" },
  { label: "2°", value: "rotate-2" },
  { label: "3°", value: "rotate-3" },
];

export default function JourneyManager() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<JourneyMilestone | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isMounted = useRef(true);
  
  const supabase = createClient();

  const fetchMilestones = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('life_journey')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (!isMounted.current) return;
    
    if (error) {
      toast("Oops, failed to load timeline: " + error.message, "error");
    } else {
      setMilestones(data || []);
    }
    setLoading(false);
  };


  useEffect(() => {
    isMounted.current = true;
    fetchMilestones();
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
      const fileName = `journey-${Date.now()}.${fileExt}`;
      const filePath = `journey/${fileName}`;

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



  const handleSave = async () => {
    if (!isEditing) return;

    setLoading(true);
    const { error } = await supabase
      .from('life_journey')
      .upsert(isEditing);

    if (!isMounted.current) return;

    if (error) {
      toast("Failed to save: " + error.message, "error");
    } else {
      toast("Moment updated successfully!", "success");
      setIsEditing(null);
      fetchMilestones();
    }
    setLoading(false);
  };


  const deleteMilestone = async (id: string) => {
    const ok = await confirm({
      title: "Delete Moment?",
      message: "This moment will be removed from your history. Are you sure?",
      variant: "danger"
    });
    
    if (!ok) return;

    const { error } = await supabase
      .from('life_journey')
      .delete()
      .match({ id });


    if (!isMounted.current) return;

    if (error) {
      toast("Failed to delete: " + error.message, "error");
    } else {
      toast("Moment deleted successfully!", "success");
      fetchMilestones();
    }
  };


  const addNew = () => {
    const newMilestone: Partial<JourneyMilestone> = {
      year: new Date().getFullYear().toString(),
      title: "New Chapter",
      caption: "moment",
      description: "Tell the story of this moment...",
      icon: "sparkles",
      image_url: null,
      sticky_bg: "#EEEDFE",
      sticky_border: "#AFA9EC",
      sticky_title_color: "#3C3489",
      sticky_text_color: "#534AB7",
      tape_bg: "#CECBF6",
      tape_border: "#7F77DD",
      rotate_card: "rotate-0",
      rotate_sticky: "rotate-0",
      offset_class: "mt-0",
      is_key: false,
      order_index: milestones.length
    };
    setIsEditing(newMilestone as JourneyMilestone);
  };


  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newMilestones = [...milestones];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newMilestones.length) return;
    
    [newMilestones[index], newMilestones[targetIndex]] = [newMilestones[targetIndex], newMilestones[index]];
    
    // Update order_index for all
    const updates = newMilestones.map((m, i) => ({ ...m, order_index: i }));
    setMilestones(updates);
    toast("Timeline order updated successfully!", "success");
    
    // Persist to DB
    const { error } = await supabase.from('life_journey').upsert(updates);
    if (error) toast("Failed to change order: " + error.message, "error");
  };


  if (loading && milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 font-outfit">Assembling Timeline...</p>
      </div>
    );
  }


  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
          <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] font-outfit">Life Journey Timeline</h2>
        </div>
        <button 
          onClick={addNew}
          className="flex items-center gap-3 px-8 py-3 bg-purple-600 text-white rounded-[16px] text-[9px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-900/40 font-outfit"
        >
          <Plus size={14} /> Add New Moment
        </button>
      </div>


      {/* Timeline List */}
      <div className="space-y-4">
        {milestones.map((m, i) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-white/[0.02] border border-white/5 hover:border-purple-500/20 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-8 transition-all duration-500"
          >
             {/* Order Controls */}
             <div className="flex flex-col gap-2">
                <button onClick={() => moveOrder(i, 'up')} className="p-1 text-white/10 hover:text-purple-400 transition-colors">
                    <ChevronUp size={20} />
                </button>
                <button onClick={() => moveOrder(i, 'down')} className="p-1 text-white/10 hover:text-purple-400 transition-colors">
                    <ChevronDown size={20} />
                </button>
             </div>

             {/* Year Badge */}
             <div className="text-4xl font-black font-syne text-white/10 group-hover:text-purple-400/20 transition-colors">
                {m.year}
             </div>

             {/* Small Preview Image/Icon */}
             <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10">
                {m.image_url ? (
                  <Image 
                    src={m.image_url} 
                    alt="" 
                    width={80} 
                    height={80} 
                    unoptimized
                    className="object-cover" 
                  />
                ) : (
                  <Sparkles size={24} className="text-white/20" />
                )}
             </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white tracking-tight">{m.title}</h3>
                    {m.is_key && <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[8px] text-purple-400 rounded font-black uppercase">Key Moment</span>}
                </div>
                <p className="text-xs text-white/30 line-clamp-1">{m.description}</p>
             </div>


             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsEditing(m)}
                  className="p-4 bg-white/5 text-white/30 hover:text-white rounded-2xl transition-all"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => deleteMilestone(m.id)}
                  className="p-4 bg-red-500/5 text-red-500/30 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
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
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-[#0D121F] border border-white/10 rounded-[40px] overflow-hidden shadow-3xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Side: Editor Form */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar border-r border-white/5">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-normal text-white font-dancing-script">
                      Edit <span className="text-purple-400">Moment</span>
                   </h2>
                   <div className="flex items-center gap-4">

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={isEditing.is_key}
                           onChange={(e) => setIsEditing({...isEditing, is_key: e.target.checked})}
                          className="w-5 h-5 rounded-lg bg-white/5 border-white/10 checked:bg-purple-500 transition-all"
                        />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Mark as Key Moment</span>
                      </label>
                   </div>

                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Year</label>
                    <input 
                      type="text" 
                      value={isEditing.year}

                      onChange={(e) => setIsEditing({...isEditing, year: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                      placeholder="e.g. 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Caption Text</label>
                    <input 
                      type="text" 
                      value={isEditing.caption}

                      onChange={(e) => setIsEditing({...isEditing, caption: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                      placeholder="e.g. sketchbook vol.1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Moment Title</label>
                  <input 
                    type="text" 
                    value={isEditing.title}

                    onChange={(e) => setIsEditing({...isEditing, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit"
                    placeholder="e.g. First Commission Art"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 font-outfit">Description Narrative</label>
                  <textarea 
                    value={isEditing.description}

                    onChange={(e) => setIsEditing({...isEditing, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-32 resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all font-outfit leading-relaxed"
                    placeholder="A historic moment that transformed hobby into profession..."
                  />
                </div>



                {/* Layout Adjustments */}
                <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-[24px] mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="text-purple-400" size={16} />
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">What is this setting for?</span>
                  </div>
                  <p className="text-[9px] text-white/40 leading-relaxed font-medium">
                    These settings adjust the "Scrapbook" layout on the <span className="text-white/60">Personal Archive</span> page. 
                    To keep it dynamic, you can adjust the vertical offset and rotation of each card to create an aesthetic, organic feel similar to a physical journal.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-10 pt-8 border-t border-white/5">
                   <div className="space-y-4">
                       <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white/40">
                          <Layout size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest font-outfit">Vertical Rhythm</span>
                        </div>
                        <p className="text-[8px] text-white/20 font-medium leading-relaxed">Adjust the vertical position of cards to create a non-linear timeline.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                         {OFFSET_OPTIONS.map((opt) => (
                           <button 
                             key={opt.value}
                             onClick={() => setIsEditing({...isEditing, offset_class: opt.value})}
                             className={cn(
                               "px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                               isEditing.offset_class === opt.value ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                             )}
                           >
                              {opt.label}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                       <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white/40">
                          <RefreshCcw size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest font-outfit">Artistic Rotation</span>
                        </div>
                        <p className="text-[8px] text-white/20 font-medium leading-relaxed">Apply rotation effects to make cards look manually pasted.</p>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                         {ROTATE_OPTIONS.map((opt) => (
                           <button 
                             key={opt.value}
                             onClick={() => setIsEditing({...isEditing, rotate_card: opt.value})}
                             className={cn(
                               "px-2 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                               isEditing.rotate_card === opt.value ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                             )}
                           >
                              {opt.label}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Side: LIVE PREVIEW & Photo Upload */}
              <div className="w-full md:w-[420px] bg-black/40 flex flex-col relative max-h-[90vh] min-h-0 border-l border-white/5">
                <div className="p-8 pb-4 flex items-center justify-between sticky top-0 z-20 bg-[#0D121F]/60 backdrop-blur-md border-b border-white/5">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] font-outfit">Preview Live Render</span>
                  <button onClick={() => setIsEditing(null)} className="p-2 text-white/20 hover:text-white transition-colors">

                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 pt-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
                  
                  <div className="pb-12">

                  {/* THE RENDERED CARD (Miniature of what will be on Personal Page) */}
                  <div className="flex flex-col items-center gap-6">
                    {/* Year stamp preview */}
                    <div className="font-syne text-5xl font-bold leading-none tracking-tighter transition-colors duration-500"
                      style={{ color: "var(--theme-dot, #E5E7EB)", opacity: 0.4 }}>
                      {isEditing.year}
                    </div>

                    {/* Polaroid Container */}
                    <div
                      className={`relative bg-white border border-gray-200 p-2.5 pb-8 w-full max-w-[240px] shadow-2xl transition-transform duration-500 ${isEditing.rotate_card}`}
                      style={{ borderColor: isEditing.is_key ? "#AFA9EC" : "#E5E5E3" }}
                    >
                      {/* Washi tape */}
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 -rotate-1 w-8 h-3 rounded-sm opacity-80"
                        style={{
                          background: `repeating-linear-gradient(90deg,var(--theme-dot, #CECBF6) 0 6px,var(--theme-primary, #7F77DD) 6px 12px)`,
                        }}
                      />

                      {/* Photo Area / Upload Trigger */}
                      <label className="block cursor-pointer group/photo">
                        <div
                          className="w-full aspect-square flex items-center justify-center rounded-sm relative overflow-hidden bg-[#F5F4F2]"
                          style={{ background: isEditing.is_key ? "#EEEDFE" : "#F5F4F2" }}
                        >
                          {isEditing.image_url ? (
                            <Image 
                              src={isEditing.image_url} 
                              alt="" 
                              fill 
                              unoptimized
                              className="object-cover" 
                            />
                          ) : (
                            <Sparkles size={32} style={{ color: isEditing.is_key ? "#7F77DD" : "#AFA9EC", opacity: 0.7 }} />
                          )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                             <Upload className="text-white" size={24} />
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">Insert Image</span>
                             <span className="text-[7px] text-white/60 font-outfit">Max 1MB</span>
                          </div>

                          
                          <input type="file" className="hidden" onChange={handleImageUpload} />
                        </div>
                      </label>

                      {/* Caption */}
                      <p className="absolute bottom-2 left-0 right-0 text-center font-outfit text-[9px] italic text-gray-400">
                        {isEditing.caption}
                      </p>
                    </div>

                    {/* Sticky Note Preview */}
                    <div
                      className={`relative w-full max-w-[240px] p-5 shadow-xl ${isEditing.rotate_sticky}`}
                      style={{
                        background: "var(--theme-light, #EEEDFE)",
                        border: `0.5px solid var(--theme-dot, #AFA9EC)`,
                      }}
                    >
                      <p className="font-outfit text-[11px] font-black uppercase tracking-wide mb-1" style={{ color: "var(--theme-primary, #3C3489)" }}>
                        {isEditing.title}
                      </p>
                      <p className="font-outfit text-[11px] leading-relaxed" style={{ color: "var(--theme-primary, #534AB7)", opacity: 0.8 }}>
                        {isEditing.description}
                      </p>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-white/20" style={{ clipPath: "polygon(100% 0,100% 100%,0 100%)" }} />
                    </div>
                  </div>
                  </div>

                  <div className="pt-12 pb-12 flex flex-col gap-4 border-t border-white/5">
                     <button 
                      onClick={handleSave}
                      disabled={loading || isUploading}
                      className="w-full bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-[20px] hover:bg-purple-400 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Changes
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
