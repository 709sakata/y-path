import * as React from 'react';
import { ArrowLeft, Calendar, Tag, Trash2, Clock, Users, MapPin, User, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Program, Reservation } from '../types';
import { PROGRAM_STATUS, PROGRAM_STATUS_LABELS, RESERVATION_STATUS } from '../constants';

interface ProgramDetailProps {
  program: Program;
  reservations: Reservation[];
  onClose: () => void;
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
}

export function ProgramDetail({ program, reservations, onClose, onEdit, onDelete }: ProgramDetailProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case RESERVATION_STATUS.CONFIRMED: return <CheckCircle2 size={14} className="text-emerald-500" />;
      case RESERVATION_STATUS.PENDING: return <AlertCircle size={14} className="text-amber-500" />;
      case RESERVATION_STATUS.CANCELLED: return <XCircle size={14} className="text-slate-400" />;
      default: return null;
    }
  };
  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
            title="一覧に戻る"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div className={`p-3 rounded-xl ${program.category === 'MONTHLY' ? 'bg-blue-600' : 'bg-purple-600'} text-white shadow-sm`}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{program.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                program.category === 'MONTHLY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {program.category}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                program.status === PROGRAM_STATUS.COMPLETED ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {program.status === PROGRAM_STATUS.COMPLETED ? '募集終了' : '募集中'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {program.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => onEdit(program)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            編集する
          </button>
          <button 
            type="button"
            onClick={() => onDelete(program.id)}
            className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Top Section: Info */}
        <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{program.description}</p>
          </div>
          <div className="w-full md:w-auto md:min-w-[160px] bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">料金</p>
            {program.pricing?.map((p, i) => (
              <div key={i} className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">{p.tier_label}</span>
                <span className="text-sm font-bold text-indigo-600">¥{p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Kanban Board: Schedules */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Clock size={18} className="text-indigo-600" />
            <h4 className="font-bold text-sm uppercase tracking-wider">開催枠</h4>
            <span className="ml-2 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              全 {program.schedules?.length || 0} 件
            </span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
            {program.schedules?.map(schedule => {
              const scheduleReservations = reservations.filter(r => r.program_schedule_id === schedule.id);
              const confirmedCount = scheduleReservations.filter(r => r.status === RESERVATION_STATUS.CONFIRMED).length;

              return (
                <div key={schedule.id} className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-start flex flex-col bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden">
                  {/* Column Header (Schedule Info) */}
                  <div className="p-5 bg-white border-b border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800">
                        <Calendar size={16} className="text-indigo-600" />
                        <span className="font-bold text-sm">{new Date(schedule.start_date).toLocaleDateString()} ~ {new Date(schedule.end_date).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {schedule.status === 'open' ? '受付中' : schedule.status === 'waitlist' ? 'キャンセル待ち' : '受付終了'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {confirmedCount} / {schedule.capacity}名
                      </div>
                    </div>
                    {schedule.schedule_locations?.map((loc: any, i: number) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={14} />
                        <span>{loc.type === 'meeting' ? '集合' : loc.type === 'dismissal' ? '解散' : '集合・解散'}: {loc.meeting_time}</span>
                      </div>
                    ))}
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full ${confirmedCount >= schedule.capacity ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, (confirmedCount / schedule.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Column Body (Reservations) */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[500px]">
                    {scheduleReservations.length > 0 ? (
                      scheduleReservations.map(res => (
                        <div key={res.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-indigo-200 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <User size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{res.parent_name} 様</p>
                                <p className="text-[10px] text-slate-400">{res.attendance?.length || 0}名参加</p>
                              </div>
                            </div>
                            {getStatusIcon(res.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400">予約はまだありません</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
