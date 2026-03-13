import * as React from 'react';
import { Target, Zap, Activity } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DashboardStats } from '../../types';

interface DashboardMarketingProps {
  stats: DashboardStats;
  periodLabel: string;
}

export function DashboardMarketing({ stats, periodLabel }: DashboardMarketingProps) {
  return (
    <section id="marketing" className="scroll-mt-32 space-y-12">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-xl shadow-zinc-200">
          <Target size={24} />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-zinc-900">マーケティング分析</h2>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">行動・定着分析</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-display font-bold text-zinc-900 text-xl">マジックナンバー分析</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">参加回数と入会率の相関</p>
            </div>
            <Zap size={20} className="text-brand-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.magicNumberData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                <XAxis 
                  dataKey="participations" 
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
                  formatter={(value: number) => [`${value}%`, '入会率']}
                  labelFormatter={(label) => `${label}回参加`}
                  contentStyle={{
                    borderRadius: '20px', 
                    border: '1px solid #F4F4F5', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontFamily: 'Outfit',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="enrollmentRate" stroke="#F27D26" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-6 bg-brand-50 rounded-2xl border border-brand-100">
            <p className="text-sm text-brand-900 font-medium leading-relaxed">
              <span className="font-bold uppercase tracking-widest text-[10px] block mb-1">分析結果</span>
              参加回数が <span className="text-xl font-bold text-brand-600">3回</span> を超えると入会率が急増しています。3回目参加時の入会案内が最も効果的です。
            </p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-display font-bold text-zinc-900 text-xl">リピート定着分析</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">月次リピート率の推移</p>
            </div>
            <Activity size={20} className="text-brand-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueData}>
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
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '売上']}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    borderRadius: '20px', 
                    border: '1px solid #F4F4F5', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontFamily: 'Outfit',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={4} dot={{r: 6, fill: '#4F46E5', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
