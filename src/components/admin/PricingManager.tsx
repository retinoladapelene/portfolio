"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  RefreshCcw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  AlignLeft,
  Layout,
  Sparkles,
  Info
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type PricingConfig = {
  id?: string;
  category: 'package' | 'extra' | 'multiplier';
  key: string;
  label: string;
  value: number;
  description: string;
  order_index: number;
};

const DEFAULT_CONFIG: PricingConfig[] = [
  { category: 'package', key: 'Headshot', label: 'Headshot', value: 80, description: 'Focus on portrait & emotion', order_index: 1 },
  { category: 'package', key: 'Bust Up', label: 'Bust Up', value: 100, description: 'Dynamic posing & torso', order_index: 2 },
  { category: 'package', key: 'Halfbody', label: 'Halfbody', value: 130, description: 'Sophisticated character silhouette', order_index: 3 },
  { category: 'package', key: 'Knee Up', label: 'Knee Up', value: 180, description: 'Complete world-building', order_index: 4 },
  { category: 'extra', key: 'background_premium', label: 'Background Complexity', value: 50, description: 'Premium detailed background', order_index: 5 },
  { category: 'multiplier', key: 'couple_multiplier', label: 'Couple Multiplier', value: 2, description: 'Multiplier for additional characters', order_index: 6 },
];

export default function PricingManager() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isMounted = useRef(true);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pricing');
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setConfigs(result.data);
      } else {
        setConfigs(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setConfigs(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchConfigs();
    return () => { isMounted.current = false; };
  }, []);

  const handleUpdate = (key: string, field: keyof PricingConfig, value: any) => {
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, [field]: value } : c));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configs)
      });
      const result = await res.json();
      if (result.success) {
        toast('Pricing & menu updated successfully!', "success");
        fetchConfigs();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast('Failed to update pricing: ' + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 font-outfit">Calculating Prices...</p>
      </div>
    );
  }

  const packages = configs.filter(c => c.category === 'package');
  const extras = configs.filter(c => c.category === 'extra');
  const multipliers = configs.filter(c => c.category === 'multiplier');

  return (
    <div className="space-y-12">

      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col gap-2">
            <h3 className="text-3xl font-normal text-white font-dancing-script">
                Pricing & <span className="text-purple-400">Menu Settings</span>
            </h3>
            <p className="text-[10px] text-purple-400/60 uppercase tracking-[0.4em] font-black mt-2">
                Manage commission packages & pricing in real-time
            </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-purple-500/20"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Pricing
        </button>
      </div>

      <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-[24px] mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="text-purple-400" size={16} />
          <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Important!</span>
        </div>
        <p className="text-[9px] text-white/40 leading-relaxed font-medium">
          The menu you edit here will appear directly in the <span className="text-white/60">Artistic Investment</span> section and client <span className="text-white/60">Commission Form</span>. 
          No need to edit code to change prices or package names!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Main Packages */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 ml-2">
            <Layout size={14} className="text-purple-400" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] font-outfit">Base Packages</span>
          </div>
          
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.key} className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] space-y-4 group hover:border-purple-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest font-outfit ml-1">Package Name</label>
                    <input 
                      type="text"
                      value={pkg.label}
                      onChange={(e) => handleUpdate(pkg.key, 'label', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold font-outfit focus:border-purple-500/40 transition-all outline-none"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest font-outfit ml-1">Price (K)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={pkg.value}
                        onChange={(e) => handleUpdate(pkg.key, 'value', parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-purple-400 font-black font-outfit focus:border-purple-500/40 transition-all outline-none"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-black">$</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-widest font-outfit ml-1">Brief Description</label>
                  <input 
                    type="text"
                    value={pkg.description}
                    onChange={(e) => handleUpdate(pkg.key, 'description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white/60 font-outfit focus:border-purple-500/40 transition-all outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extras & Multipliers */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 ml-2">
              <Plus size={14} className="text-purple-400" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] font-outfit">Add-ons & Premium</span>
            </div>
            
            <div className="space-y-4">
              {extras.map((extra) => (
                <div key={extra.key} className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] space-y-4 group hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest font-outfit ml-1">Extra Name</label>
                      <input 
                        type="text"
                        value={extra.label}
                        onChange={(e) => handleUpdate(extra.key, 'label', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold font-outfit focus:border-purple-500/40 transition-all outline-none"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest font-outfit ml-1">Cost (K)</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={extra.value}
                          onChange={(e) => handleUpdate(extra.key, 'value', parseInt(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-purple-400 font-black font-outfit focus:border-purple-500/40 transition-all outline-none"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-black">+</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 ml-2">
              <RefreshCcw size={14} className="text-purple-400" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] font-outfit">Multipliers</span>
            </div>
            
            <div className="space-y-4">
              {multipliers.map((mult) => (
                <div key={mult.key} className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] space-y-4 group hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest font-outfit ml-1">Multiplier Context</label>
                      <input 
                        type="text"
                        value={mult.label}
                        onChange={(e) => handleUpdate(mult.key, 'label', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold font-outfit focus:border-purple-500/40 transition-all outline-none"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest font-outfit ml-1">Scale (x)</label>
                      <div className="relative">
                        <input 
                          type="number"
                          step="0.1"
                          value={mult.value}
                          onChange={(e) => handleUpdate(mult.key, 'value', parseFloat(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-purple-400 font-black font-outfit focus:border-purple-500/40 transition-all outline-none"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-black">x</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-purple-500/5 border border-purple-500/10 p-8 rounded-[40px] space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
               <Info size={18} />
               <span className="text-[11px] font-black uppercase tracking-widest font-outfit">Settings Note</span>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed font-outfit">
              All prices here are automatically linked to the <span className="text-white/60">Artistic Investment</span> section and <span className="text-white/60">Commission Form</span>. 
              Admin does not need to change code to update promo prices or add new packages. 
              <br/><br/>
              Use whole numbers (e.g., 80 for 80K) for consistent calculator display.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
