import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  Search,
  Filter,
  BarChart3,
  Map as MapIcon,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { CompetitorEvent, MarketInsight, PositioningPoint } from '../types';
import { DUMMY_COMPETITOR_EVENTS, DUMMY_MARKET_INSIGHTS, DUMMY_POSITIONING } from '../constants/dummyData';

export function MarketIntelligence() {
  const [insights, setInsights] = React.useState<MarketInsight[]>(DUMMY_MARKET_INSIGHTS);
  const [activeTab, setActiveTab] = React.useState<'tracking' | 'insights' | 'positioning'>('insights');

  const handleAction = (id: string, status: 'executed' | 'dismissed') => {
    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, actionStatus: status } : insight
    ));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Globe size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">競合・市場インテリジェンス</h2>
          </div>
          <p className="text-slate-500 max-w-2xl">
            AIが市場のトレンドと競合他社の動向を24時間監視。
            自社のポジションを客観的に把握し、離脱防止と新規獲得のための戦略をリアルタイムに提案します。
          </p>
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {[
            { id: 'insights', label: 'AI戦略提案', icon: Zap },
            { id: 'tracking', label: '競合トラッキング', icon: Search },
            { id: 'positioning', label: 'ポジショニング', icon: MapIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* AI Alert Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                    <Zap size={14} className="text-amber-300" />
                    AI Critical Alert
                  </div>
                  <h3 className="text-2xl font-bold leading-tight">
                    競合B社が類似イベントを半額で実施予定です。
                    <span className="text-indigo-200"> 体験客の20%が流出するリスクがあります。</span>
                  </h3>
                  <p className="text-indigo-100/80 text-sm leading-relaxed">
                    AIの分析によると、価格競争に追随するよりも「会員限定の先行特典」を強調することで、
                    転換率を維持しつつブランド価値を守ることが可能です。
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleAction('mi-1', 'executed')}
                    className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    対策キャンペーンを実行
                    <ArrowRight size={18} />
                  </button>
                  <button className="px-8 py-4 bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold hover:bg-indigo-500/40 transition-all">
                    詳細レポートを見る
                  </button>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Insights List */}
              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-600" />
                  市場インサイト・提案
                </h4>
                {insights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`bg-white rounded-3xl border p-6 transition-all ${
                      insight.actionStatus === 'executed' ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          insight.type === 'cannibalization' ? 'bg-rose-100 text-rose-600' :
                          insight.type === 'trend' ? 'bg-indigo-100 text-indigo-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {insight.type === 'cannibalization' ? <AlertCircle size={20} /> :
                           insight.type === 'trend' ? <TrendingUp size={20} /> :
                           <Target size={20} />}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800">{insight.title}</h5>
                          <p className="text-xs text-slate-400">{insight.createdAt} • AI分析</p>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        insight.impact === 'high' ? 'bg-rose-100 text-rose-600' :
                        insight.impact === 'medium' ? 'bg-amber-100 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        Impact: {insight.impact}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
                        <Zap size={14} />
                        AI推奨アクション
                      </div>
                      <p className="text-sm text-slate-700 font-medium">
                        {insight.suggestedAction}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      {insight.actionStatus === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleAction(insight.id, 'dismissed')}
                            className="px-4 py-2 text-slate-400 hover:text-slate-600 text-sm font-bold transition-all"
                          >
                            無視する
                          </button>
                          <button 
                            onClick={() => handleAction(insight.id, 'executed')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                          >
                            実行する
                          </button>
                        </>
                      ) : (
                        <div className={`flex items-center gap-2 text-sm font-bold ${
                          insight.actionStatus === 'executed' ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          {insight.actionStatus === 'executed' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                          {insight.actionStatus === 'executed' ? '実行済み' : '却下済み'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Differentiation Strategy */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-indigo-600" />
                  差別化メッセージ生成
                </h4>
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <MessageSquare size={24} />
                  </div>
                  <h5 className="font-bold text-slate-800 mb-2">AIが作成した差別化コピー</h5>
                  <p className="text-xs text-slate-400 mb-6">競合にはない「コミュニティの深さ」を強調しています</p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl italic text-sm text-slate-700 leading-relaxed">
                      "単なる習い事ではなく、一生の仲間に出会える場所。ASOBOの会員限定コミュニティでは、プログラム後も続く深い繋がりを大切にしています。"
                    </div>
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl italic text-sm text-slate-700 leading-relaxed">
                      "プロの講師による指導はもちろん、お子様の成長を共に見守る『第二の家族』のような環境がここにあります。"
                    </div>
                  </div>
                  
                  <button className="w-full mt-8 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                    SNS・メールにコピー
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">競合イベント・動的トラッキング</h3>
                  <p className="text-sm text-slate-400 mt-1">AIが近隣・同業他社の公開情報を自動集約</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="競合名で検索..." 
                      className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100">
                    <Filter size={18} />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">競合他社名</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">イベントタイトル</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">価格</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">テーマ / タグ</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ソース</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DUMMY_COMPETITOR_EVENTS.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-5">
                          <span className="font-bold text-slate-700">{event.competitorName}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-slate-600">{event.title}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{event.date}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-mono font-bold text-slate-800">¥{event.price.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {event.themes.map(theme => (
                              <span key={theme} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            event.source === 'Peatix' ? 'bg-orange-100 text-orange-600' :
                            event.source === 'SNS' ? 'bg-sky-100 text-sky-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {event.source}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                            <ExternalLink size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'positioning' && (
          <motion.div
            key="positioning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Positioning Map */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">ポジショニング・マップ</h3>
                    <p className="text-sm text-slate-400 mt-1">価格 vs コミュニティの深さ (AI自動更新)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                      <span>自社</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                      <span>競合</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[500px] relative">
                  {/* Labels for Axis */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    コミュニティの深さ (ライト → コア)
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    価格 (安い → 高い)
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis 
                        type="number" 
                        dataKey="price" 
                        name="価格" 
                        domain={[0, 100]} 
                        hide 
                      />
                      <YAxis 
                        type="number" 
                        dataKey="communityDepth" 
                        name="コミュニティ" 
                        domain={[0, 100]} 
                        hide 
                      />
                      <ZAxis type="number" range={[400, 1000]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as PositioningPoint;
                            return (
                              <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                                <p className="font-bold text-slate-800">{data.name}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">価格スコア: {data.price}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">コミュニティスコア: {data.communityDepth}</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={DUMMY_POSITIONING}>
                        {DUMMY_POSITIONING.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.isSelf ? '#4F46E5' : '#CBD5E1'} 
                            className="transition-all duration-500"
                          />
                        ))}
                        <LabelList 
                          dataKey="name" 
                          position="top" 
                          offset={10} 
                          style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748B' }} 
                        />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Repositioning Advice */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Zap size={20} className="text-amber-500" />
                  AIリポジショニング助言
                </h4>
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <div className="space-y-8">
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                        現在のポジション
                      </h5>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        「高価格・高コミュニティ」のプレミアムポジションに位置しています。
                        競合A・Bの低価格攻勢に対し、価格で対抗するとブランド価値が毀損するリスクがあります。
                      </p>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-2xl text-white">
                      <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">AI推奨の戦い方</h5>
                      <p className="text-sm font-medium leading-relaxed mb-6">
                        「コミュニティの深さ」をさらに極め、他社が真似できない「クローズドな体験」に特化すべきです。
                      </p>
                      <ul className="space-y-3">
                        {[
                          '会員限定のオフ会頻度を2倍に',
                          '紹介制プログラムの導入',
                          '講師による個別フィードバック強化'
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 size={14} className="text-indigo-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
