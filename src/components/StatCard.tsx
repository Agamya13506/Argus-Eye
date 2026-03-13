import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: 'pink' | 'fuchsia' | 'rose' | 'emerald' | 'amber';
  delay?: number;
}

export default function StatCard({ title, value, icon, trend, trendUp, color = 'pink', delay = 0 }: StatCardProps) {
  const colorMap = {
    pink: 'from-pink-500/20 to-pink-400/5 border-pink-500/20 text-pink-400',
    fuchsia: 'from-fuchsia-500/20 to-fuchsia-400/5 border-fuchsia-500/20 text-fuchsia-400',
    rose: 'from-rose-500/20 to-rose-400/5 border-rose-500/20 text-rose-400',
    emerald: 'from-emerald-500/20 to-emerald-400/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-400/5 border-amber-500/20 text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500 opacity-50 group-hover:opacity-100`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-2 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`inline-block mr-1 ${trendUp ? 'rotate-0' : 'rotate-180'}`}>
                ↑
              </span>
              {trend}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} border ${colorMap[color].split(' ')[2]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
