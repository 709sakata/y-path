import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  LogOut,
  History,
  Calendar
} from 'lucide-react';
import { User as AppUser, Parent as AppParent, Reservation as AppReservation } from '../types';
import { api as appApi } from '../services/api';
import { MyPageProfile } from './mypage/MyPageProfile';
import { MyPageReservationItem } from './mypage/MyPageReservationItem';

interface CustomerMyPageProps {
  user: AppUser | null;
  parentProfile: AppParent | null;
  onLogout: () => void;
  onSwitchToBooking: () => void;
}

export function CustomerMyPage({ 
  user, 
  parentProfile, 
  onLogout, 
  onSwitchToBooking 
}: CustomerMyPageProps) {
  const [reservations, setReservations] = useState<AppReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parentProfile) {
      fetchHistory();
    }
  }, [parentProfile]);

  const fetchHistory = async () => {
    if (!parentProfile) return;
    try {
      const data = await appApi.customers.get(parentProfile.id);
      setReservations(data.history || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchHistory();
      } else {
        const data = await res.json();
        console.error(data.error || 'キャンセルに失敗しました');
      }
    } catch (error) {
      console.error('通信エラーが発生しました', error);
    }
  };

  if (!parentProfile) return null;

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col">
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-slate-800">マイページ</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onSwitchToBooking} className="text-xs text-indigo-600 font-bold hover:underline">
            予約サイトへ
          </button>
          <button onClick={onLogout} className="text-slate-400 hover:text-slate-600">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8">
        <MyPageProfile parentProfile={parentProfile} />

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <History size={20} className="text-indigo-600" />
            <h3 className="text-xl font-bold">予約履歴・ステータス</h3>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500">読み込み中...</p>
            </div>
          ) : reservations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {reservations.map(res => (
                <MyPageReservationItem 
                  key={res.id} 
                  reservation={res} 
                  onCancel={handleCancel} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <p className="text-slate-500">まだ予約履歴はありません</p>
              <button 
                onClick={onSwitchToBooking}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                プログラムを探す
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
