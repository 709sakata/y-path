import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  ExternalLink,
  Sparkles,
  Globe,
  TrendingUp,
  Building2,
  FileText
} from 'lucide-react';
import { SidebarItem } from '../UI';
import { User } from '../../types';

interface AdminLayoutProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onLogout: () => void;
  onSwitchToPublic: () => void;
  onSwitchToSettings: () => void;
  pendingReservationsCount: number;
  children: React.ReactNode;
}

export function AdminLayout({
  user,
  activeTab,
  onTabChange,
  onLogout,
  onSwitchToPublic,
  onSwitchToSettings,
  pendingReservationsCount,
  children
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 text-zinc-400 transition-transform duration-300 transform
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              <Globe size={20} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white leading-none">ASOBO</h1>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">太子遊びと冒険の森</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 space-y-1 mt-4">
          <div className="px-4 mb-4">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">運用管理</span>
          </div>
          <SidebarItem 
            icon={LayoutDashboard} label="ダッシュボード" 
            active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} 
          />
          <SidebarItem 
            icon={Calendar} label="予約管理" 
            active={activeTab === 'reservations'} onClick={() => onTabChange('reservations')}
            badge={pendingReservationsCount}
          />
          <SidebarItem 
            icon={Sparkles} label="プログラム管理" 
            active={activeTab === 'programs'} onClick={() => onTabChange('programs')}
          />
          <SidebarItem 
            icon={Users} label="顧客管理" 
            active={activeTab === 'crm'} onClick={() => onTabChange('crm')} 
          />
          <SidebarItem 
            icon={FileText} label="アンケート管理" 
            active={activeTab === 'surveys'} onClick={() => onTabChange('surveys')} 
          />

          <div className="px-4 pt-10 mb-4">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">戦略 & AI分析</span>
          </div>
          <SidebarItem 
            icon={Globe} label="市場・競合調査" 
            active={activeTab === 'market'} onClick={() => onTabChange('market')} 
          />
          <SidebarItem 
            icon={TrendingUp} label="LTV収益予測" 
            active={activeTab === 'projection'} onClick={() => onTabChange('projection')} 
          />
          <SidebarItem 
            icon={Sparkles} label="AI戦略エージェント" 
            active={activeTab === 'strategy'} onClick={() => onTabChange('strategy')} 
          />
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-zinc-800">
          <button 
            onClick={onSwitchToPublic}
            className="w-full flex items-center gap-3 px-4 py-3 text-brand-400 font-bold text-sm hover:bg-brand-500/10 rounded-xl transition-all"
          >
            <ExternalLink size={18} />
            予約サイトを表示
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-zinc-200 px-10 flex items-center justify-between shrink-0 relative z-[50]">
          <div className="flex items-center gap-8 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-zinc-400">
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <div className="flex items-center gap-3">
                {user?.organization_id && (
                  <p className="font-display text-sm font-bold text-zinc-900">
                    団体管理パネル
                  </p>
                )}
                {user?.organization_id && (
                  <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-full border border-brand-100 flex items-center gap-1.5 uppercase tracking-widest">
                    <Building2 size={10} />
                    ID: {user.organization_id.slice(0, 8)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="顧客名、予約、プログラムを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-zinc-900">{user?.email}</p>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">管理者</p>
            </div>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isUserMenuOpen ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
            >
              <Settings size={20} />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[60]" 
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[70] overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 sm:hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSwitchToSettings();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 text-sm hover:bg-slate-50 transition-all"
                    >
                      <Settings size={16} />
                      システム設定
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 text-sm hover:bg-red-50 transition-all"
                    >
                      <LogOut size={16} />
                      ログアウト
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
