import * as React from 'react';
import { 
  TrendingUp, 
  Target, 
  Zap
} from 'lucide-react';
import { DashboardStats } from '../types';
import { DashboardManagement } from './dashboard/DashboardManagement';
import { DashboardMarketing } from './dashboard/DashboardMarketing';
import { DashboardFrontline } from './dashboard/DashboardFrontline';

interface DashboardProps {
  stats: DashboardStats;
  reservations: any[];
  onViewProjection: () => void;
  period: string;
  onPeriodChange: (period: string) => void;
}

export function Dashboard({ stats, reservations, onViewProjection, period, onPeriodChange }: DashboardProps) {
  const [activeView, setActiveView] = React.useState<'management' | 'marketing' | 'frontline'>('management');
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const isScrollingRef = React.useRef(false);

  React.useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (isScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveView(entry.target.id as any);
        }
      });
    }, options);

    const sections = ['management', 'marketing', 'frontline'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    isScrollingRef.current = true;
    setActiveView(id as any);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  const periodLabel = React.useMemo(() => {
    switch (period) {
      case '30': return '過去30日間';
      case '90': return '過去90日間';
      case '365': return '過去1年間';
      case '1095': return '過去3年間';
      case 'all': default: return 'すべての期間';
    }
  }, [period]);

  return (
    <div className="space-y-12 pb-20">
      {/* View Switcher - Sticky */}
      <div className="sticky top-0 z-30 py-6 bg-zinc-50/80 backdrop-blur-md -mx-8 px-8 border-b border-zinc-200/50 flex items-center justify-between">
        <div className="flex p-1.5 bg-zinc-200/50 rounded-2xl w-fit shadow-inner border border-zinc-200">
          {[
            { id: 'management', label: '経営サマリー', icon: TrendingUp },
            { id: 'marketing', label: 'マーケティング分析', icon: Target },
            { id: 'frontline', label: 'アクションアイテム', icon: Zap },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => scrollToSection(view.id)}
              className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeView === view.id 
                  ? 'bg-white text-brand-600 shadow-xl shadow-zinc-200 ring-1 ring-zinc-200' 
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <view.icon size={16} />
              {view.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          >
            <option value="all">すべての期間</option>
            <option value="30">過去30日間</option>
            <option value="90">過去90日間</option>
            <option value="365">過去1年間</option>
            <option value="1095">過去3年間</option>
          </select>
        </div>
      </div>

      <div className="space-y-32">
        <DashboardManagement stats={stats} onViewProjection={onViewProjection} periodLabel={periodLabel} />
        <DashboardMarketing stats={stats} periodLabel={periodLabel} />
        <DashboardFrontline stats={stats} periodLabel={periodLabel} />
      </div>
    </div>
  );
}
