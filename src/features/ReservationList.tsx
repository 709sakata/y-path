import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Reservation } from '../types';

interface ReservationListProps {
  filteredReservations: Reservation[];
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: any) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: any) => void;
  selectedProgramFilter: string;
  setSelectedProgramFilter: (filter: string) => void;
  programsList: string[];
  onSelect: (res: Reservation) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onExport: () => void;
  stats: { total: number; pending: number; confirmed: number };
}

export function ReservationList({
  filteredReservations,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  dateRange,
  setDateRange,
  selectedProgramFilter,
  setSelectedProgramFilter,
  programsList,
  onSelect,
  onUpdateStatus,
  onExport,
  stats
}: ReservationListProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '保留中', color: 'bg-amber-100 text-amber-600', icon: AlertCircle };
      case 'confirmed':
        return { label: '確定済み', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'キャンセル', color: 'bg-slate-100 text-slate-400', icon: XCircle };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-400', icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="font-bold text-slate-800 text-2xl">予約管理</h3>
          <p className="text-slate-500 text-sm mt-1">予約の確認、確定、キャンセルを一括管理できます。</p>
        </div>
        
        <div className="flex flex-col gap-2 min-w-[280px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">予約ステータス内訳</span>
            <span className="text-[10px] font-bold text-slate-400">合計 {stats.total} 件</span>
          </div>
          
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(stats.confirmed / (stats.total || 1)) * 100}%` }}
              className="h-full bg-emerald-400" 
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(stats.pending / (stats.total || 1)) * 100}%` }}
              className="h-full bg-amber-400" 
            />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((stats.total - stats.confirmed - stats.pending) / (stats.total || 1)) * 100}%` }}
              className="h-full bg-slate-200" 
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold text-slate-500">確定: {stats.confirmed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-bold text-slate-500">保留: {stats.pending}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-500">他: {stats.total - stats.confirmed - stats.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex p-1 bg-slate-50 rounded-xl w-fit">
            {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {filter === 'all' ? 'すべて' : 
                 filter === 'pending' ? '保留中' : 
                 filter === 'confirmed' ? '確定済み' : 'キャンセル'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <Download size={16} />
              CSV出力
            </button>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
              <button 
                onClick={() => {
                  if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else setSortBy('date');
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  sortBy === 'date' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                開催日
                {sortBy === 'date' && <ArrowUpDown size={10} />}
              </button>
              <button 
                onClick={() => {
                  if (sortBy === 'created_at') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else setSortBy('created_at');
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  sortBy === 'created_at' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                申込順
                {sortBy === 'created_at' && <ArrowUpDown size={10} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="名前、IDで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all appearance-none"
            >
              <option value="all">すべてのプログラム</option>
              {programsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 md:col-span-1 lg:col-span-2">
            <div className="flex-1 relative">
              <input 
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
              />
              <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-bold text-slate-400 uppercase">開始日</span>
            </div>
            <span className="text-slate-300">~</span>
            <div className="flex-1 relative">
              <input 
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
              />
              <span className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-bold text-slate-400 uppercase">終了日</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">申込者</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">プログラム / 開催日時</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">参加者</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">金額</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ステータス</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {filteredReservations.map((res) => {
                const status = getStatusConfig(res.status);
                const StatusIcon = status.icon;
                
                return (
                  <motion.tr
                    key={res.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelect(res)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full w-fit ${
                          res.membership_type === 'member' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {res.membership_type === 'member' ? '会員' : '一般'}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{res.parent_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[200px] block">
                          {res.program_title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <Calendar size={12} /> {res.date} <Clock size={12} className="ml-1" /> {res.time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {res.attendance?.map((a, i) => (
                          <span key={i} className={`text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-bold ${
                            a.is_parent ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {a.is_parent ? '保護者' : a.children?.name || 'お子様'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800">¥{res.total_price?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        {res.status === 'pending' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(res.id, 'confirmed');
                            }}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="確定する"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredReservations.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Calendar size={32} />
            </div>
            <p className="text-slate-400 font-medium">該当する予約が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
}
