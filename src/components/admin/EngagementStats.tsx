"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  MousePointer2, 
  BarChart3, 
  Clock, 
  RefreshCcw, 
  TrendingUp,
  MapPin,
  Laptop
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/Toast";

interface AnalyticsData {
  id: string;
  event_type: string;
  page_path: string;
  created_at: string;
  metadata: any;
}

export default function EngagementStats() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      toast("Failed to load analytics", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // --- DATA PROCESSING ---
  // 1. Filter out Admin Traffic from general stats
  const publicData = data.filter(d => !d.page_path?.startsWith('/admin'));
  const loginAttempts = data.filter(d => d.page_path?.includes('login=true')).length;

  const totalViews = publicData.filter(d => d.event_type === 'view').length;
  const totalClicks = publicData.filter(d => d.event_type === 'click').length;
  
  // Group by day for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Use local timezone date string (YYYY-MM-DD format)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }).reverse();

  const chartData = last7Days.map(dateStr => {
    const count = publicData.filter(d => {
      if (!d.created_at) return false;
      const eventDate = new Date(d.created_at);
      const eYear = eventDate.getFullYear();
      const eMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
      const eDay = String(eventDate.getDate()).padStart(2, '0');
      const eventDateStr = `${eYear}-${eMonth}-${eDay}`;
      return eventDateStr === dateStr;
    }).length;
    return { date: dateStr, count };
  });

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // --- TOP SECTIONS (CLEAN NAMES) ---
  const pathMap: Record<string, string> = {
    '/': 'Homepage',
    '/portfolio': 'Project',
    '/gallery': '3D Gallery',
    '/personal': 'Personal Journey',
    '/commission': 'Commission Form',
    '/track': 'Track Order',
    '/terms': 'Terms of Service',
  };

  const pageStats = publicData.reduce((acc: any, d) => {
    // Strip query params for grouping
    const path = d.page_path?.split('?')[0] || '/';
    if (path.startsWith('/admin')) return acc; // Double safety
    
    const name = pathMap[path] || path;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const topPages = Object.entries(pageStats)
    .map(([path, count]) => ({ path, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- VISITOR LOG PROCESSING ---
  const visitorsMap: Record<string, { ip: string, userAgent: string, pages: Set<string>, lastVisit: Date }> = {};
  
  data.forEach(d => {
    if (d.page_path?.startsWith('/admin')) return;
    
    const ip = d.metadata?.ip || 'Unknown IP';
    let userAgent = d.metadata?.userAgent || 'Unknown Device';
    const rawUa = userAgent;
    const visitorKey = `${ip}-${rawUa}`;
    
    // Coba deteksi brand laptop/HP jika tersedia di string User-Agent
    const brands = ['ASUS', 'HP', 'Dell', 'Lenovo', 'Acer', 'MSI', 'MacBook', 'ThinkPad', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Infinix'];
    let brandDetected = '';
    for (const b of brands) {
      if (rawUa.toLowerCase().includes(b.toLowerCase())) {
        brandDetected = b;
        break;
      }
    }

    // Coba deteksi Browser secara dinamis dari User-Agent
    let browser = 'Unknown Browser';
    if (rawUa.includes('Edg/')) browser = 'Microsoft Edge';
    else if (rawUa.includes('OPR/') || rawUa.includes('Opera')) browser = 'Opera';
    else if (rawUa.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (rawUa.includes('Vivaldi')) browser = 'Vivaldi';
    else if (rawUa.includes('YaBrowser')) browser = 'Yandex Browser';
    else if (rawUa.includes('UCBrowser')) browser = 'UC Browser';
    else if (rawUa.includes('SamsungBrowser')) browser = 'Samsung Internet';
    else if (rawUa.includes('Brave')) browser = 'Brave'; // Walau Brave sering menyembunyikan diri
    else if (rawUa.includes('Chrome')) browser = 'Google Chrome';
    else if (rawUa.includes('Safari') && !rawUa.includes('Chrome')) browser = 'Apple Safari';

    if (userAgent.includes('Windows')) userAgent = brandDetected ? `Windows PC (${brandDetected}) - ${browser}` : `Windows PC - ${browser}`;
    else if (userAgent.includes('Mac OS') && !userAgent.includes('iPhone') && !userAgent.includes('iPad')) userAgent = brandDetected ? `Mac (${brandDetected}) - ${browser}` : `Apple Mac - ${browser}`;
    else if (userAgent.includes('Android')) userAgent = brandDetected ? `Android (${brandDetected}) - ${browser}` : `Android Device - ${browser}`;
    else if (userAgent.includes('iPhone')) userAgent = `Apple iPhone - ${browser}`;
    else if (userAgent.includes('iPad')) userAgent = `Apple iPad - ${browser}`;
    else if (userAgent.includes('Linux')) userAgent = brandDetected ? `Linux (${brandDetected}) - ${browser}` : `Linux PC - ${browser}`;
    else if (userAgent !== 'Unknown Device') userAgent = `${userAgent.split(' ')[0]} - ${browser}`;
    
    if (!visitorsMap[visitorKey]) {
      visitorsMap[visitorKey] = {
        ip,
        userAgent,
        pages: new Set(),
        lastVisit: new Date(d.created_at)
      };
    }
    
    if (d.page_path) {
      const pageName = pathMap[d.page_path.split('?')[0]] || d.page_path.split('?')[0];
      visitorsMap[visitorKey].pages.add(pageName);
    }

    const currentVisit = new Date(d.created_at);
    if (currentVisit > visitorsMap[visitorKey].lastVisit) {
      visitorsMap[visitorKey].lastVisit = currentVisit;
    }
  });

  const visitorsList = Object.values(visitorsMap)
    .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime())
    .slice(0, 50);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <RefreshCcw size={48} className="text-purple-500/40 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Analyzing Engagement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-[1px] bg-purple-500/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-purple-400/60 font-outfit">Real-time Analytics</span>
          </div>
          <h2 className="text-6xl font-normal text-white font-dancing-script mb-2">Web <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Engagement.</span></h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Traffic Analysis & User Behavior</p>
        </motion.div>
        <button 
          onClick={fetchAnalytics}
          className="p-5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-[24px] text-purple-400/60 hover:text-purple-400 transition-all backdrop-blur-xl group shadow-inner"
        >
          <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard icon={<Users size={24} />} label="Total Views" value={totalViews} color="purple" delay={0.1} />
        <OverviewCard icon={<MousePointer2 size={24} />} label="Client Clicks" value={totalClicks} color="emerald" delay={0.2} />
        <OverviewCard icon={<Laptop size={24} />} label="Login Attempts" value={loginAttempts} color="pink" delay={0.3} />
        <OverviewCard icon={<TrendingUp size={24} />} label="Daily Avg" value={Math.ceil(totalViews / 7)} color="purple" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* TRAFFIC CHART */}
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="glass-dark p-10 relative z-10 h-full overflow-visible rounded-[32px]">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BarChart3 size={16} className="text-purple-400" />
                </div>
                Traffic Trend
              </h3>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Last 7 Days</span>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-3 px-2">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-6 group/bar">
                  <div className="w-full relative flex items-end justify-center h-full">
                    {/* Shadow Cast */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxCount) * 100}%` }}
                      className="absolute bottom-0 w-full max-w-[12px] bg-purple-500/20 blur-xl translate-y-2 opacity-50"
                    />
                    {/* Main Bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxCount) * 100}%` }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                      className="w-full max-w-[16px] bg-gradient-to-t from-purple-600 to-purple-400 rounded-full relative group-hover/bar:from-purple-500 group-hover/bar:to-pink-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      {/* Glow tip */}
                      <div className="absolute -top-1 left-0 right-0 h-2 bg-white/40 blur-sm rounded-full" />
                      
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all translate-y-2 group-hover/bar:translate-y-0 shadow-2xl z-50">
                        {d.count}
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter">
                    {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP PAGES */}
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="glass-dark p-10 relative z-10 h-full rounded-[32px]">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 mb-12 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Clock size={16} className="text-emerald-400" />
              </div>
              Top Visited Sections
            </h3>
            <div className="space-y-8">
              {topPages.map((page, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="group/item"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-white/20 font-black">{i + 1}</span>
                      <span className="text-[11px] text-white/70 font-bold tracking-wider truncate max-w-[200px] group-hover/item:text-white transition-colors">{page.path}</span>
                    </div>
                    <span className="text-[10px] text-purple-400 font-black tracking-widest">{page.count} <span className="text-white/20 ml-1">VIEWS</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(page.count / (topPages[0]?.count || 1)) * 100}%` }}
                      className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                    />
                  </div>
                </motion.div>
              ))}
              {topPages.length === 0 && (
                <div className="py-24 text-center">
                  <BarChart3 size={32} className="mx-auto text-white/5 mb-4" />
                  <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Waiting for data influx...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VISITOR LOG TABLE */}
      <div className="relative group mt-10">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="glass-dark p-10 relative z-10 rounded-[32px] overflow-hidden">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 mb-8 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={16} className="text-blue-400" />
            </div>
            Recent Visitors Log
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">IP Address</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Device & Browser</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Pages Accessed</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visitorsList.map((v, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-xs text-white/80 font-mono bg-white/5 px-2 py-1 rounded">{v.ip}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-white/70 font-medium">{v.userAgent}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(v.pages).map((page, j) => (
                          <span key={j} className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-300 rounded-md whitespace-nowrap">
                            {page}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="text-xs text-white/50">
                        {v.lastVisit.toLocaleDateString()} {v.lastVisit.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                  </tr>
                ))}
                {visitorsList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                      No visitors recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon, label, value, color, delay }: any) {
  const gradients: any = {
    purple: "from-purple-600 to-indigo-600",
    emerald: "from-emerald-600 to-teal-600",
    pink: "from-pink-600 to-rose-600"
  };

  const shadows: any = {
    purple: "shadow-purple-500/20",
    emerald: "shadow-emerald-500/20",
    pink: "shadow-pink-500/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="glass-dark p-8 border-white/5 group hover:border-purple-500/20 transition-all relative overflow-hidden rounded-[32px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-purple-500/5 transition-all" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className={cn(
            "w-16 h-16 rounded-[20px] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 duration-500 bg-gradient-to-br",
            gradients[color],
            shadows[color]
          )}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1.5 group-hover:text-white/50 transition-colors">{label}</p>
            <p className="text-4xl font-black text-white tracking-tighter tabular-nums group-hover:scale-105 transition-transform origin-left">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
