import * as React from 'react';
import { TrendingUp, Award, UserPlus, DollarSign, Users, BarChart3, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats } from '../../types';
import { StatsCard } from '../../components/UI';

interface DashboardManagementProps {
  stats: DashboardStats;
  onViewProjection: () => void;
}

export function DashboardManagement({ stats, onViewProjection }: DashboardManagementProps) {
  return (
    <section id="management" className="scroll-mt-32 space-y-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-xl shadow-zinc-200">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-zinc-900">経営サマリー</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">リアルタイム・パフォーマンス指標</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onViewProjection}
            className="btn-primary flex items-center gap-2 !py-3 !px-6"
          >
            <BarChart3 size={18} />
            LTV収益予測
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard 
          title="平均LTV" 
          value={`¥${stats.averageLTV.toLocaleString()}`} 
          icon={Award} 
          trend="+12.5%" 
          trendUp={true} 
        />
        <StatsCard 
          title="入会率" 
          value={`${stats.conversionRates.visitorToMember}%`} 
          icon={UserPlus} 
          trend="+5.2%" 
          trendUp={true} 
        />
        <StatsCard 
          title="月次売上" 
          value={`¥${stats.monthlyRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+8.1%" 
          trendUp={true} 
        />
        <StatsCard 
          title="アクティブ顧客" 
          value={stats.activeCustomers} 
          icon={Users} 
          trend="+3.4%" 
          trendUp={true} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-display font-bold text-zinc-900 text-xl">フェーズ別LTV分析</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">体験 vs ビジター vs 正規会員</p>
            </div>
            <div className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              直近30日間
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: '体験', value: stats.phaseLTV.trial, color: '#D4D4D8' },
                { name: 'ビジター', value: stats.phaseLTV.visitor, color: '#F27D26' },
                { name: '正規会員', value: stats.phaseLTV.member, color: '#4F46E5' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#A1A1AA', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em'}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#A1A1AA', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono'}} 
                />
                <Tooltip 
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, 'LTV']}
                  cursor={{fill: '#FAFAFA'}}
                  contentStyle={{
                    borderRadius: '20px', 
                    border: '1px solid #F4F4F5', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontFamily: 'Outfit',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={80}>
                  {[0, 1, 2].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#D4D4D8', '#F27D26', '#4F46E5'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h3 className="font-display font-bold text-xl mb-10 relative z-10">コンバージョン・ファンネル</h3>
          <div className="space-y-12 relative z-10">
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">体験ユーザー</span>
                <span className="font-mono text-sm font-bold">{stats.phaseCounts.trial}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-400 w-full"></div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                <ArrowDownRight size={12} />
                {stats.conversionRates.trialToVisitor}% 継続率
              </div>
            </div>

            <div className="relative pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">リピートビジター</span>
                <span className="font-mono text-sm font-bold">{stats.phaseCounts.visitor}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500" style={{width: `${stats.conversionRates.trialToVisitor}%`}}></div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                <ArrowDownRight size={12} />
                {stats.conversionRates.visitorToMember}% 入会率
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">正規会員</span>
                <span className="font-mono text-sm font-bold">{stats.phaseCounts.member}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600" style={{width: `${(stats.conversionRates.trialToVisitor * stats.conversionRates.visitorToMember) / 100}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
