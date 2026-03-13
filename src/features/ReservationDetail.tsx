import * as React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Phone,
  Tag,
  FileText,
  ArrowLeft,
  Sparkles,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';
import { Reservation } from '../types';

import { RESERVATION_STATUS, RESERVATION_STATUS_LABELS, MEMBERSHIP_TYPE, ACTUAL_ATTENDANCE_STATUS } from '../constants';

interface ReservationDetailProps {
  reservation: Reservation;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateAttendance: (attendanceId: string, status: string) => void;
}

export function ReservationDetail({
  reservation,
  onClose,
  onUpdateStatus,
  onUpdateAttendance
}: ReservationDetailProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case RESERVATION_STATUS.PENDING:
        return { label: RESERVATION_STATUS_LABELS[status], color: 'bg-amber-100 text-amber-600', icon: AlertCircle };
      case RESERVATION_STATUS.CONFIRMED:
        return { label: RESERVATION_STATUS_LABELS[status], color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 };
      case RESERVATION_STATUS.CANCELLED:
        return { label: RESERVATION_STATUS_LABELS[status], color: 'bg-slate-100 text-slate-400', icon: XCircle };
      case RESERVATION_STATUS.COMPLETED:
        return { label: RESERVATION_STATUS_LABELS[status], color: 'bg-blue-100 text-blue-600', icon: CheckCircle2 };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-400', icon: AlertCircle };
    }
  };

  const statusConfig = getStatusConfig(reservation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
            title="一覧に戻る"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div className={`p-3 rounded-xl ${statusConfig.color} shadow-sm`}>
            <StatusIcon size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">予約詳細</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {reservation.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {reservation.status === RESERVATION_STATUS.PENDING && (
            <button 
              onClick={() => onUpdateStatus(reservation.id, RESERVATION_STATUS.CONFIRMED)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              予約を確定する
            </button>
          )}
          {reservation.status !== RESERVATION_STATUS.CANCELLED && (
            <button 
              onClick={() => onUpdateStatus(reservation.id, RESERVATION_STATUS.CANCELLED)}
              className="px-6 py-3 bg-white text-red-500 border border-red-100 rounded-2xl font-bold hover:bg-red-50 transition-all"
            >
              予約をキャンセル
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Program & Schedule */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={18} />
            <h4 className="font-bold text-sm uppercase tracking-wider">プログラム情報</h4>
          </div>
          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
            <h5 className="text-xl font-bold text-slate-800 mb-4">{reservation.program_title}</h5>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">開催日</p>
                  <p className="text-sm font-bold text-slate-700">{reservation.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">開始時間</p>
                  <p className="text-sm font-bold text-slate-700">{reservation.time}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer & Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-600">
              <User size={18} />
              <h4 className="font-bold text-sm uppercase tracking-wider">申込者情報</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">氏名</p>
                <p className="font-bold text-slate-800">{reservation.parent_name} 様</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <p className="text-sm text-slate-600">{reservation.parent_phone || '未登録'}</p>
              </div>
              <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                reservation.membership_type === MEMBERSHIP_TYPE.MEMBER ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {reservation.membership_type === MEMBERSHIP_TYPE.MEMBER ? '会員' : '一般'}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Users size={18} />
                <h4 className="font-bold text-sm uppercase tracking-wider">参加者リスト・出席管理</h4>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                当日チェックイン用
              </div>
            </div>
            <div className="space-y-3">
              {reservation.attendance?.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.is_parent ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                      {a.is_parent ? <User size={18} /> : <Users size={18} />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">
                        {a.is_parent ? '保護者' : a.children?.name || 'お子様'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {a.is_parent ? '申込者本人' : '参加児童'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onUpdateAttendance(a.id, ACTUAL_ATTENDANCE_STATUS.ATTENDED)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        a.actual_status === ACTUAL_ATTENDANCE_STATUS.ATTENDED 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      <UserCheck size={14} />
                      出席
                    </button>
                    <button 
                      onClick={() => onUpdateAttendance(a.id, ACTUAL_ATTENDANCE_STATUS.ABSENT)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        a.actual_status === ACTUAL_ATTENDANCE_STATUS.ABSENT 
                          ? 'bg-red-600 text-white shadow-md' 
                          : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <UserX size={14} />
                      欠席
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Notes & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText size={18} />
              <h4 className="font-bold text-sm uppercase tracking-wider">備考・ご要望</h4>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
              <p className="text-sm text-slate-600 leading-relaxed">
                {reservation.notes || '特になし'}
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Tag size={18} />
              <h4 className="font-bold text-sm uppercase tracking-wider">お支払い情報</h4>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-200">
              <div className="flex justify-between items-center mb-4 opacity-60">
                <span className="text-xs font-bold uppercase">決済ステータス</span>
                <span className="text-xs font-bold uppercase">現地決済</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60 mb-1">合計金額（税込）</p>
                  <p className="text-3xl font-bold tracking-tight">¥{reservation.total_price?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase opacity-60 mb-1">申込日</p>
                  <p className="text-xs font-bold">{format(new Date(reservation.created_at), 'yyyy/MM/dd')}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
