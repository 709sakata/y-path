import * as React from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard,
  Sparkles,
  Globe,
  ChevronRight
} from 'lucide-react';
import { User as AppUser, Parent as AppParent, Program as AppProgram } from '../types';
import { api as appApi } from '../services/api';
import { DUMMY_PROGRAMS } from '../constants/dummyData';
import { BookingProgramList } from './booking/BookingProgramList';
import { BookingDetailsForm } from './booking/BookingDetailsForm';
import { BookingConfirmStep } from './booking/BookingConfirmStep';
import { BookingSuccessStep } from './booking/BookingSuccessStep';
import { BookingAuthModal } from './booking/BookingAuthModal';
import { BookingRegisterForm } from './booking/BookingRegisterForm';

import { MEMBERSHIP_TYPE } from '../constants';

interface PublicBookingPageProps {
  user: AppUser | null;
  parentProfile: AppParent | null;
  onLogin: (user: AppUser, parent: AppParent | null, shouldRedirect?: boolean) => void;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
  onSwitchToMyPage: () => void;
}

export function PublicBookingPage({ 
  user, 
  parentProfile, 
  onLogin, 
  onLogout, 
  onSwitchToAdmin,
  onSwitchToMyPage
}: PublicBookingPageProps) {
  const [programs, setPrograms] = useState<AppProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<AppProgram | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [step, setStep] = useState<'selection' | 'details' | 'confirm' | 'success' | 'register'>('selection');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    parentName: '',
    phone: '',
    children: [] as { name: string; birthday: string; notes: string }[]
  });
  const [loginError, setLoginError] = useState('');
  const [bookingData, setBookingData] = useState({
    selectedChildIds: [] as string[],
    isParentAttending: false,
    notes: '',
    agreedToTerms: false
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await appApi.programs.list();
      setPrograms(data.length > 0 ? data : DUMMY_PROGRAMS);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      setPrograms(DUMMY_PROGRAMS);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthLoading(true);

    if (step === 'register') {
      if (registerForm.password.length < 6) {
        setLoginError('パスワードは6文字以上で入力してください');
        setIsAuthLoading(false);
        return;
      }
      if (registerForm.children.length === 0) {
        setLoginError('お子様を1人以上登録してください');
        setIsAuthLoading(false);
        return;
      }
    } else {
      if (loginForm.password.length < 6) {
        setLoginError('パスワードは6文字以上です');
        setIsAuthLoading(false);
        return;
      }
    }

    const endpoint = step === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = step === 'register'
      ? { ...registerForm, role: 'customer', organizationId: selectedProgram?.organization_id }
      : loginForm;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        if (step === 'register') {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' });
          const meData = await meRes.json();
          onLogin(meData.user, meData.parent, false);
          setStep('details');
        } else {
          onLogin(data.user, data.parent || null, false);
        }
        setIsLoginModalOpen(false);
      } else {
        setLoginError(data.error);
      }
    } catch (err) {
      setLoginError('通信エラーが発生しました');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user || !parentProfile || !selectedProgram || !selectedScheduleId) return;
    
    const schedule = selectedProgram.schedules?.find(s => s.id === selectedScheduleId);
    if (schedule && (schedule.current_participants || 0) >= schedule.capacity) {
      alert('申し訳ありませんが、この日程は満員になりました。');
      return;
    }

    try {
      const participantCount = bookingData.selectedChildIds.length + (bookingData.isParentAttending ? 1 : 0);
      if (participantCount === 0) {
        alert('参加者を選択してください');
        return;
      }

      const isMember = parentProfile?.parent_organizations?.some(
        org => org.organization_id === selectedProgram.organization_id && org.membership_type === 'member'
      );

      let pricePerPerson = 0;
      if (selectedProgram.pricing && selectedProgram.pricing.length > 0) {
        const memberPricing = isMember ? selectedProgram.pricing.find(p => p.tier_label.includes('会員')) : null;
        if (memberPricing) {
          pricePerPerson = memberPricing.amount;
        } else {
          pricePerPerson = selectedProgram.pricing[0].amount;
        }
      }

      const totalPrice = pricePerPerson * participantCount;

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: parentProfile.id,
          program_schedule_id: selectedScheduleId,
          total_price: totalPrice,
          child_ids: bookingData.selectedChildIds,
          is_parent_attending: bookingData.isParentAttending,
          notes: bookingData.notes
        })
      });
      
      if (res.ok) {
        setStep('success');
      } else {
        const data = await res.json();
        alert(data.error || '予約に失敗しました');
      }
    } catch (error) {
      alert('通信エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
            <Globe size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-zinc-900 leading-tight">ASOBO</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">太子遊びと冒険の森</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'customer' && (
                <button 
                  onClick={onSwitchToMyPage}
                  className="btn-secondary !py-1.5 !px-3 flex items-center gap-2 text-xs"
                >
                  <UserIcon size={14} />
                  マイページ
                </button>
              )}
              {user.role === 'admin' && (
                <button 
                  onClick={onSwitchToAdmin}
                  className="btn-primary !bg-zinc-900 !py-1.5 !px-3 flex items-center gap-2 text-xs"
                >
                  <LayoutDashboard size={14} />
                  管理画面
                </button>
              )}
              <div className="h-8 w-px bg-zinc-200 mx-1" />
              <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <UserIcon size={16} />
              ログイン / 新規登録
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {step === 'selection' && (
            <BookingProgramList 
              programs={programs} 
              onSelect={(program) => {
                setSelectedProgram(program);
                if (program.schedules && program.schedules.length > 0) {
                  setSelectedScheduleId(program.schedules[0].id);
                }
                setStep('details');
              }} 
            />
          )}

          {step === 'details' && selectedProgram && (
            <BookingDetailsForm
              program={selectedProgram}
              user={user}
              parentProfile={parentProfile}
              selectedScheduleId={selectedScheduleId}
              onScheduleSelect={setSelectedScheduleId}
              bookingData={bookingData}
              onBookingDataChange={setBookingData}
              onBack={() => setStep('selection')}
              onConfirm={() => setStep('confirm')}
              onLoginClick={() => setIsLoginModalOpen(true)}
              onRegisterClick={() => setStep('register')}
            />
          )}

          {step === 'confirm' && selectedProgram && (
            <BookingConfirmStep
              program={selectedProgram}
              parentProfile={parentProfile}
              selectedScheduleId={selectedScheduleId}
              bookingData={bookingData}
              onBack={() => setStep('details')}
              onConfirm={handleBooking}
            />
          )}

          {step === 'register' && (
            <BookingRegisterForm
              isLoading={isAuthLoading}
              error={loginError}
              registerForm={registerForm}
              onRegisterFormChange={setRegisterForm}
              onSubmit={handleAuthSubmit}
              onBack={() => setStep('details')}
              onSwitchToLogin={() => {
                setStep('details');
                setIsLoginModalOpen(true);
              }}
            />
          )}

          {step === 'success' && (
            <BookingSuccessStep
              onViewMyPage={onSwitchToMyPage}
              onBookAnother={() => {
                setStep('selection');
                setSelectedProgram(null);
                setBookingData({
                  selectedChildIds: [],
                  isParentAttending: false,
                  notes: '',
                  agreedToTerms: false
                });
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <BookingAuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isLoading={isAuthLoading}
        error={loginError}
        loginForm={loginForm}
        onLoginFormChange={setLoginForm}
        onSubmit={handleAuthSubmit}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setStep('register');
        }}
      />
    </div>
  );
}
