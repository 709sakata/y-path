import * as React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-2xl hover:shadow-zinc-200/50 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-zinc-50 text-zinc-400 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all">
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-3xl font-display font-bold text-zinc-900 tracking-tight">{value}</p>
    </div>
  );
}

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}

export function SidebarItem({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all group ${
        active 
          ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' 
          : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-white' : 'text-zinc-600 group-hover:text-brand-400'} />
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${active ? 'bg-white text-brand-600' : 'bg-brand-600 text-white'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
