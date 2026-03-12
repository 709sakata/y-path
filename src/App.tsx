import * as React from 'react';
import { useState, useEffect } from 'react';
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
  Plus, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Globe,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

// Types
import { User, Parent, Program, Reservation, DashboardStats } from './types';

// Services
import { api } from './services/api';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useAdminData } from './hooks/useAdminData';

// Dummy Data
import { DUMMY_STATS, DUMMY_CUSTOMERS, DUMMY_RESERVATIONS, DUMMY_PROGRAMS, DUMMY_MARKET_INSIGHTS } from './constants/dummyData';

// Components
import { StatsCard, SidebarItem } from './components/UI';
import { AdminLayout } from './components/layouts/AdminLayout';
import { AdminLoginPage } from './features/AdminLoginPage';
import { ProgramsManager } from './features/ProgramsManager';
import { ReservationsManager } from './features/ReservationsManager';
import { CustomersManager } from './features/CustomersManager';
import { PublicBookingPage } from './features/PublicBookingPage';
import { CustomerMyPage } from './features/CustomerMyPage';
import { Dashboard } from './features/Dashboard';
import { MarketIntelligence } from './features/MarketIntelligence';
import { LTVProjection } from './features/LTVProjection';
import { ProgramStrategyAgent } from './features/ProgramStrategyAgent';
import { SurveysManager } from './features/SurveysManager';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function App() {
  const [viewMode, setViewMode] = useState<'admin' | 'public' | 'mypage'>('public');
  const { user, parentProfile, loading, login, logout, isAdmin, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'reservations' | 'programs' | 'market' | 'projection' | 'strategy' | 'surveys'>('dashboard');
  
  const { stats, customers, reservations, programs, refreshData } = useAdminData(isAdmin, user);

  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [isAdmin, activeTab, refreshData]);

  useEffect(() => {
    if (viewMode === 'admin' && user && user.role !== 'admin') {
      setViewMode('public');
    }
  }, [viewMode, user]);

  const handleLogout = async () => {
    await logout();
    setViewMode('public');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (viewMode === 'public') {
    return (
      <PublicBookingPage 
        user={user} 
        parentProfile={parentProfile}
        onLogin={(u, p, shouldRedirect = true) => { 
          login(u, p || null);
          if (shouldRedirect) {
            if (u.role === 'admin') {
              setViewMode('admin');
            } else {
              setViewMode('mypage');
            }
          }
        }}
        onLogout={handleLogout}
        onSwitchToAdmin={() => setViewMode('admin')} 
        onSwitchToMyPage={() => setViewMode('mypage')}
      />
    );
  }

  if (viewMode === 'mypage') {
    return (
      <CustomerMyPage 
        user={user}
        parentProfile={parentProfile}
        onLogout={handleLogout}
        onSwitchToBooking={() => setViewMode('public')}
      />
    );
  }

  if (viewMode === 'admin' && (!user || user.role !== 'admin')) {
    return <AdminLoginPage onLogin={(u) => { 
      login(u, null);
      refreshAuth();
    }} />;
  }

  return (
    <AdminLayout
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      onSwitchToPublic={() => setViewMode('public')}
      pendingReservationsCount={reservations.filter(r => r.status === 'pending').length}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && stats && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Dashboard 
              stats={stats} 
              reservations={reservations} 
              onViewProjection={() => setActiveTab('projection')} 
            />
          </motion.div>
        )}

        {activeTab === 'reservations' && (
          <motion.div 
            key="reservations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ReservationsManager reservations={reservations} onRefresh={refreshData} onUnauthorized={() => login({ id: '', role: 'customer' }, null)} />
          </motion.div>
        )}

        {activeTab === 'programs' && (
          <motion.div 
            key="programs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <ProgramsManager user={user} programs={programs} reservations={reservations} onRefresh={refreshData} onUnauthorized={() => login({ id: '', role: 'customer' }, null)} />
          </motion.div>
        )}

        {activeTab === 'crm' && (
          <motion.div 
            key="crm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <CustomersManager customers={customers} onRefresh={refreshData} />
          </motion.div>
        )}

        {activeTab === 'surveys' && (
          <motion.div 
            key="surveys"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <SurveysManager />
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div 
            key="market"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MarketIntelligence />
          </motion.div>
        )}

        {activeTab === 'projection' && (
          <motion.div 
            key="projection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <LTVProjection />
          </motion.div>
        )}

        {activeTab === 'strategy' && stats && (
          <motion.div 
            key="strategy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ProgramStrategyAgent 
              stats={stats}
              marketInsights={DUMMY_MARKET_INSIGHTS}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
