import * as React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Clock3, Users, Tag } from 'lucide-react';
import { Reservation as AppReservation } from '../../types';

interface MyPageReservationItemProps {
  reservation: AppReservation;
  onCancel: (id: string) => void;
}

export const MyPageReservationItem: React.FC<MyPageReservationItemProps> = ({ reservation, onCancel }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold"><CheckCircle2 size={12} /> 確定</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-[10px] font-bold"><XCircle size={12} /> キャンセル</span>;
      case 'completed':
        return <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-full text-[10px] font-bold"><CheckCircle2 size={12} /> 完了</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-[10px] font-bold"><Clock3 size={12} /> 確認中</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {getStatusBadge(reservation.status)}
          <span className="text-xs text-slate-400">{reservation.date} {reservation.time}</span>
        </div>
        <h4 className="font-bold text-slate-800 text-lg">{reservation.program_title || '個別予約'}</h4>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Users size={12} /> 
            <div className="flex gap-1">
              {reservation.attendance?.map((a: any) => (
                <span key={a.id} className="font-bold">{a.is_parent ? '保護者' : a.children?.name}</span>
              ))}
            </div>
          </div>
          <span className="flex items-center gap-1"><Tag size={12} /> ¥{reservation.total_price?.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {reservation.status !== 'cancelled' && (reservation.status as string) !== 'completed' && (
          <button 
            onClick={() => onCancel(reservation.id)}
            className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
          >
            キャンセル
          </button>
        )}
        <button className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all">
          詳細を見る
        </button>
      </div>
    </motion.div>
  );
}
