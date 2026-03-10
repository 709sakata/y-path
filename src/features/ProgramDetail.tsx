import * as React from 'react';
import { X, Calendar, Tag, Trash2, Clock, Users, MapPin } from 'lucide-react';
import { Program } from '../types';

interface ProgramDetailProps {
  program: Program;
  onClose: () => void;
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
}

export function ProgramDetail({ program, onClose, onEdit, onDelete }: ProgramDetailProps) {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
          <div className={`p-4 rounded-2xl ${program.category === 'regular' ? 'bg-blue-600' : 'bg-purple-600'} text-white shadow-lg`}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{program.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                program.category === 'regular' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {program.category === 'regular' ? '定期プログラム' : '不定期プログラム'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                program.recruiting_status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {program.recruiting_status === 'closed' ? '募集終了' : '募集中'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {program.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onEdit(program)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            編集する
          </button>
          <button 
            onClick={() => onDelete(program.id)}
            className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Tag size={18} className="text-indigo-600" />
              <h4 className="font-bold text-sm uppercase tracking-wider">基本情報</h4>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">基本料金</p>
                <p className="text-2xl font-bold text-indigo-600">¥{program.base_price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">説明</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{program.description}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Schedules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <Clock size={18} className="text-indigo-600" />
              <h4 className="font-bold text-sm uppercase tracking-wider">開催スケジュール</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              全 {program.schedules?.length || 0} 件
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.schedules?.map(schedule => (
              <div key={schedule.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Calendar size={16} className="text-indigo-600" />
                    <span className="font-bold">{schedule.date}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    受付中
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {schedule.start_time} - {schedule.end_time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    定員 {schedule.capacity}名
                  </div>
                </div>
                {schedule.location && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={14} />
                    {schedule.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
