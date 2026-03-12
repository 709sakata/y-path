import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Zap, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  Info,
  Building2,
  Users2,
  BarChart3,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DUMMY_PROJECTION_DATA, DUMMY_HEALTH_CHECKS } from '../constants/dummyData';

interface LTVProjectionProps {
  // No props needed for standard page
}

export function LTVProjection({}: LTVProjectionProps) {
  const [period, setPeriod] = React.useState<6 | 12 | 36>(12);
  const [referralBoost, setReferralBoost] = React.useState(false);
  
  const filteredData = DUMMY_PROJECTION_DATA.slice(0, period);
  
  const assetValue = 12450000; // Total 3-year LTV of current customers
  const roiMonths = 14; // Estimated ROI for a new studio

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <TrendingUp size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">3年長期収益予測 (LTV Projection)</h2>
          </div>
          <p className="text-slate-500 max-w-2xl">
            顧客のライフスパンに基づいた将来収益のシミュレーション。
            長期的な投資判断と事業の健康診断をサポートします。
          </p>
        </div>
      </div>

      <div className="space-y-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <DollarSign size={20} />
                </div>
                <span className="text-sm font-bold text-slate-500">現存顧客の3年資産価値</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">¥{(assetValue / 10000).toLocaleString()}</span>
                <span className="text-sm font-bold text-slate-400">万円</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">現在の全顧客が今後3年でもたらす累積収益</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Building2 size={20} />
                </div>
                <span className="text-sm font-bold text-slate-500">新規拠点 投資回収予測</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{roiMonths}</span>
                <span className="text-sm font-bold text-slate-400">ヶ月</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">現在のLTV成長率に基づくスタジオ投資の回収期間</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Users2 size={20} />
                </div>
                <span className="text-sm font-bold text-slate-500">許容CPA (長期)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">¥12,500</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">3年LTVに基づく、事業継続可能な最大獲得単価</p>
            </div>
          </div>

          {/* Main Chart Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">収益成長シミュレーション</h3>
                <p className="text-xs text-slate-400 mt-1">ストック収益と複利効果の可視化</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Period Switcher */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {[6, 12, 36].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPeriod(m as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        period === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {m}ヶ月
                    </button>
                  ))}
                </div>

                {/* Referral Toggle */}
                <button 
                  onClick={() => setReferralBoost(!referralBoost)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    referralBoost 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <Zap size={14} />
                  紹介率+10% (複利効果)
                </button>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10}} 
                    interval={period === 36 ? 5 : 0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10}}
                    tickFormatter={(val) => `¥${(val / 10000).toLocaleString()}万`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(val: number, name: string) => [`¥${val.toLocaleString()}`, name]}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Area 
                    name="現状維持予測"
                    type="monotone" 
                    dataKey="baseRevenue" 
                    stroke="#94A3B8" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorBase)" 
                  />
                  <Area 
                    name="戦略実行後予測"
                    type="monotone" 
                    dataKey={referralBoost ? "projectedRevenue" : "baseRevenue"} 
                    stroke="#4F46E5" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorProjected)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Health Check & Advice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" />
                AI 事業健康診断 (3年スパン)
              </h4>
              <div className="space-y-4">
                {DUMMY_HEALTH_CHECKS.map((check) => (
                  <div key={check.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        check.impact === 'negative' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {check.impact === 'negative' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 mb-2">{check.title}</h5>
                        <p className="text-sm text-slate-600 leading-relaxed">{check.advice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-400">
                  <BarChart3 size={20} />
                  長期投資アドバイス
                </h4>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold">01</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        3年後の収益を最大化するには、入会金を下げることよりも、会員限定イベントの単価を年率5%ずつ上げるブランド戦略が最も効果的です。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold">02</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        LTV/CPA比率が現在4.2倍と非常に良好です。月間広告予算を20%増額しても、3年スパンでのROIはプラスを維持できます。
                      </p>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20">
                  投資シミュレーション詳細
                  <ChevronRight size={18} />
                </button>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
