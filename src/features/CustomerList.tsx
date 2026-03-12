import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Download, Users, Baby, ChevronRight, Upload } from 'lucide-react';
import { Parent } from '../types';
import { CustomerFilterType } from '../hooks/useCustomerFilters';

interface CustomerListProps {
  customers: Parent[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: CustomerFilterType;
  onFilterChange: (type: CustomerFilterType) => void;
  onSelect: (customer: Parent) => void;
  onExport: () => void;
  onImportSurveys: () => void;
}

export function CustomerList({ 
  customers, 
  searchQuery, 
  onSearchChange, 
  filterType, 
  onFilterChange, 
  onSelect, 
  onExport,
  onImportSurveys
}: CustomerListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-2xl">顧客管理</h3>
          <p className="text-slate-500 text-sm mt-1">登録されている顧客情報の検索や確認を行います。</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onImportSurveys}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Upload size={16} />
            アンケートインポート
          </button>
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Download size={16} />
            CSVエクスポート
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="名前、メール、電話番号で検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
          />
        </div>
        <div className="flex p-1 bg-slate-50 rounded-xl">
          {(['all', 'member', 'general'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterType === type 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'all' ? 'すべて' : type === 'member' ? '会員' : '一般'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">顧客情報</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">お子様</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">会員種別</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ステータス</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {customers.map(customer => (
                <motion.tr 
                  key={customer.id} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => onSelect(customer)}
                >
                  <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {customer.children?.map(child => (
                      <span key={child.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">
                        <Baby size={10} className="text-indigo-400" />
                        {child.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    customer.membership_type === 'member' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {customer.membership_type === 'member' ? '会員' : '一般'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${customer.membership_status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className={`text-xs font-bold ${
                      customer.membership_status === 'active' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {customer.membership_status === 'active' ? '入会中' : '退会'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <p className="text-slate-400 text-sm">該当する顧客が見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
}
