import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Program } from '../types';
import { PROGRAM_STATUS } from '../constants';

interface ProgramListProps {
  programs: Program[];
  onSelect: (program: Program) => void;
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function ProgramList({ programs, onSelect, onEdit, onDelete, onAddNew }: ProgramListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-2xl">プログラム管理</h3>
          <p className="text-slate-500 text-sm mt-1">提供するプログラムやレッスンの作成・編集を行います。</p>
        </div>
        <button 
          onClick={onAddNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} />
          新規プログラム作成
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">プログラム情報</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">カテゴリー</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">募集状況</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">料金</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">スケジュール</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {programs.map(program => (
                  <motion.tr 
                    key={program.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => onSelect(program)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400">{program.organization_name || '-'}</span>
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{program.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      program.category === 'MONTHLY' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {program.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${program.status === PROGRAM_STATUS.COMPLETED ? 'bg-slate-300' : 'bg-emerald-400'}`} />
                      <span className={`text-xs font-bold ${
                        program.status === PROGRAM_STATUS.COMPLETED ? 'text-slate-500' : 'text-emerald-600'
                      }`}>
                        {program.status === PROGRAM_STATUS.COMPLETED ? '募集終了' : '募集中'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-slate-800 text-sm">¥{program.pricing?.[0]?.amount?.toLocaleString() || '---'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                        {program.schedules?.length || 0} 枠
                      </span>
                      {program.schedules && program.schedules.length > 0 && (
                        <span className="text-[10px] text-slate-400">
                          次回: {new Date(program.schedules[0].start_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(program);
                        }} 
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="編集"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(program.id);
                        }} 
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all ml-2">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </td>
                </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {programs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Plus size={32} />
              </div>
              <p className="text-slate-400 font-medium">プログラムがまだありません。<br/>「新規プログラム作成」から追加してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
