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
}

export function Dashboard({ stats, reservations, onViewProjection }: DashboardProps) {
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

  return (
    <div className="space-y-12 pb-20">
      {/* View Switcher - Sticky */}
      <div className="sticky top-0 z-30 py-6 bg-zinc-50/80 backdrop-blur-md -mx-8 px-8 border-b border-zinc-200/50">
        <div className="flex p-1.5 bg-zinc-200/50 rounded-2xl w-fit shadow-inner border border-zinc-200">
          {[
            { id: 'management', label: 'Management Summary', icon: TrendingUp },
            { id: 'marketing', label: 'Marketing Analytics', icon: Target },
            { id: 'frontline', label: 'Action Items', icon: Zap },
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
      </div>

      <div className="space-y-32">
        <DashboardManagement stats={stats} onViewProjection={onViewProjection} />
        <DashboardMarketing stats={stats} />
        <DashboardFrontline stats={stats} />
      </div>
    </div>
  );
}
