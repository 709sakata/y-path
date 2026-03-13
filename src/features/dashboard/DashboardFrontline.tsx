import * as React from 'react';
import { Zap, MousePointer2, ChevronRight, AlertTriangle, Gift } from 'lucide-react';
import { DashboardStats } from '../../types';

interface DashboardFrontlineProps {
  stats: DashboardStats;
  periodLabel: string;
}

export function DashboardFrontline({ stats, periodLabel }: DashboardFrontlineProps) {
  return (
    <section id="frontline" className="scroll-mt-32 space-y-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-xl shadow-zinc-200">
          <Zap size={24} />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-zinc-900">アクションリスト</h2>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">優先顧客への介入アクション</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-zinc-100 bg-brand-50/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand-100 text-brand-600 rounded-xl">
                <MousePointer2 size={20} />
              </div>
              <h3 className="font-display font-bold text-zinc-900 text-lg">入会推奨リスト</h3>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">スポット参加料が入会金に迫る非会員</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-zinc-50">
            {stats.enrollmentPushList.map(customer => (
              <div key={customer.parentId} className="p-6 hover:bg-zinc-50 transition-all flex items-center justify-between group cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{customer.parentName}</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">累計スポット料: ¥{customer.spotRevenue.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-zinc-100 bg-red-50/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-display font-bold text-zinc-900 text-lg">離脱防止リスト</h3>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">平均参加間隔を超えた優良会員</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-zinc-50">
            {stats.churnRiskList.map(customer => (
              <div key={customer.parentId} className="p-6 hover:bg-zinc-50 transition-all flex items-center justify-between group cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-zinc-900 group-hover:text-red-600 transition-colors">{customer.parentName}</p>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">最終参加日: {customer.lastParticipationDate}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-zinc-100 bg-emerald-50/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <Gift size={20} />
              </div>
              <h3 className="font-display font-bold text-zinc-900 text-lg">サンクス・特典対象</h3>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">参加回数が節目に達した顧客</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-zinc-50">
            {stats.milestoneList.map(customer => (
              <div key={customer.parentId} className="p-6 hover:bg-zinc-50 transition-all flex items-center justify-between group cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{customer.parentName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      {customer.participationCount}回 達成
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
