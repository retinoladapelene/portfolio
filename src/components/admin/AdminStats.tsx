"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Commission } from "@/types/admin";

interface AdminStatsProps {
  commissions: Commission[];
}

const AdminStats = ({ commissions }: AdminStatsProps) => {
  const stats = [
    {
      label: "Active Orders",
      value: commissions.filter(c => c.status !== 'complete' && c.status !== 'done').length,
      icon: <Clock size={28} />,
      color: "purple",
      description: "Orders currently in progress"
    },
    {
      label: "Completed",
      value: commissions.filter(c => c.status === 'complete' || c.status === 'done').length,
      icon: <CheckCircle2 size={28} />,
      color: "emerald",
      description: "Projects that are finished"
    },
    {
      label: "Total Revenue",
      value: commissions.reduce((acc, c) => acc + (c.price || 0), 0) + "K",
      icon: <TrendingUp size={28} />,
      color: "purple",
      description: "Revenue inflow (IDR)"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, duration: 0.8 }}
        >
          <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10 group hover:border-purple-500/30 transition-all duration-700 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-[80px] rounded-full -mr-16 -mt-16 transition-all group-hover:bg-purple-500/10 group-hover:scale-125 duration-1000" />
            <div className="flex flex-col relative z-10">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all group-hover:scale-110 duration-700",
                stat.color === 'purple' ? "bg-purple-500/10 border border-purple-500/20 text-purple-400" :
                  "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              )}>
                {stat.icon}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-purple-400/50 transition-colors">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black text-white tracking-tighter group-hover:scale-[1.02] origin-left transition-transform duration-700">
                    {stat.value}
                  </span>
                </div>
                <p className="text-[11px] text-white/20 pt-4 font-medium border-t border-white/5 group-hover:border-purple-500/20 transition-colors">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminStats;
