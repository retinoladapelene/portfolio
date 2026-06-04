"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ImageIcon, 
  Save, 
  Loader2,
  CheckCircle2,
  Image as ImageIconAlt,
  Move
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import { compressImage } from "@/utils/imageCompression";

interface PersonalSettings {
  hero_photo_url: string;
  hero_mask_photo_url: string;
  hero_mask_position_x: number;
  hero_mask_position_y: number;
}

export default function PersonalManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PersonalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/personal-settings');
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
      } else {
        toast("Failed to load settings", "error");
      }
    } catch (error) {
      toast("Error loading settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero_photo_url' | 'hero_mask_photo_url') => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    const allowedTypes = ['image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast("Hanya format .webp yang diperbolehkan", "error");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast("Ukuran file maksimal 2MB", "error");
      return;
    }

    setIsUploading(field);
    try {
      const compressedBlob = await compressImage(file, 1920, 1920, 0.8);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `personal-${field}-${Date.now()}.${fileExt}`;
      const filePath = `personal/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, compressedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      setSettings({ ...settings, [field]: publicUrl });
      toast("Image uploaded!", "success");
    } catch (error: any) {
      toast("Upload failed: " + error.message, "error");
    } finally {
      setIsUploading(null);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/personal-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const result = await res.json();
      if (result.success) {
        toast("Settings saved successfully!", "success");
      } else {
        toast("Failed to save settings", "error");
      }
    } catch (error) {
      toast("Error saving settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 font-outfit">Loading Personal Settings...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
        <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] font-outfit">Personal Hero Section Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Main Photo */}
        <div className="space-y-6">
          <label className="block">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 block font-outfit">Main Photo (Base Layer)</span>
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-white/5 border border-white/10 group cursor-pointer">
              {settings.hero_photo_url ? (
                <Image src={settings.hero_photo_url} alt="Main Photo" fill unoptimized className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/10">
                  <ImageIcon size={48} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload Main Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <input 
                  type="file" 
                  accept="image/webp"
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleImageUpload(e, 'hero_photo_url')} 
                />
                {isUploading === 'hero_photo_url' ? <Loader2 className="animate-spin text-purple-400" size={32} /> : <ImageIconAlt className="text-white" />}
              </div>
            </div>
          </label>
        </div>

        {/* Mask Photo and Position */}
        <div className="space-y-10">
          <label className="block">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 block font-outfit">Mask Reveal Photo (Overlay Layer)</span>
            <div className="relative aspect-[60/53] rounded-[32px] overflow-hidden bg-white/5 border border-white/10 group cursor-pointer max-w-[500px] mx-auto">
              {/* Alignment Preview: Main Photo as Reference Background */}
              {settings.hero_photo_url && (
                <Image 
                  src={settings.hero_photo_url} 
                  alt="Main Photo Reference" 
                  fill 
                  unoptimized 
                  className="opacity-30 filter brightness-75 contrast-125 grayscale-[0.3]" 
                  style={{ 
                    objectFit: 'cover',
                    objectPosition: '50% 15%' 
                  }}
                />
              )}

              {settings.hero_mask_photo_url ? (
                <div className="absolute inset-0 z-10">
                  <Image 
                    src={settings.hero_mask_photo_url} 
                    alt="Mask Photo" 
                    fill 
                    unoptimized 
                    className="opacity-50" 
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: `${settings.hero_mask_position_x}% ${settings.hero_mask_position_y}%` 
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-purple-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white">
                    Alignment Preview (50% Opacity)
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/10">
                  <ImageIcon size={48} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload Mask Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <input 
                  type="file" 
                  accept="image/webp"
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleImageUpload(e, 'hero_mask_photo_url')} 
                />
                {isUploading === 'hero_mask_photo_url' ? <Loader2 className="animate-spin text-purple-400" size={32} /> : <ImageIconAlt className="text-white" />}
              </div>
            </div>
          </label>

          {/* Position Controls */}
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-8">
            <div className="flex items-center gap-3">
              <Move className="text-purple-400" size={18} />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Mask Alignment Controls</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Horizontal Offset (X)</span>
                  <span className="text-[10px] font-bold text-purple-400">{settings.hero_mask_position_x}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.hero_mask_position_x}
                  onChange={(e) => setSettings({ ...settings, hero_mask_position_x: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Vertical Offset (Y)</span>
                  <span className="text-[10px] font-bold text-purple-400">{settings.hero_mask_position_y}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.hero_mask_position_y}
                  onChange={(e) => setSettings({ ...settings, hero_mask_position_y: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[9px] text-white/20 italic leading-relaxed">
                * Adjust these sliders to align the revealed photo with the base photo. 
                Usually 50% X and 15% Y matches the default framing.
              </p>
              <p className="text-[9px] text-purple-400/40 italic leading-relaxed">
                Tip: If Vertical Offset (Y) doesn&apos;t seem to move, your image might be too wide (Landscape). 
                For best results, use Portrait images (taller than wide).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={handleSave}
          disabled={isSaving || !!isUploading}
          className={cn(
            "flex items-center gap-4 px-12 py-4 bg-purple-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-purple-900/40",
            (isSaving || !!isUploading) ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
          )}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? "Saving Settings..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
