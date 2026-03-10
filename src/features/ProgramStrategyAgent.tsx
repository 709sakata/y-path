import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Zap, 
  Target, 
  Flag, 
  BookOpen, 
  MessageSquare, 
  Loader2,
  CheckCircle2,
  Copy,
  Share2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { ProgramStrategyProposal, DashboardStats, MarketInsight } from '../types';

interface ProgramStrategyAgentProps {
  stats: DashboardStats;
  marketInsights: MarketInsight[];
}

export function ProgramStrategyAgent({ stats, marketInsights }: ProgramStrategyAgentProps) {
  const [loading, setLoading] = React.useState(false);
  const [proposals, setProposals] = React.useState<ProgramStrategyProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = React.useState<ProgramStrategyProposal | null>(null);

  const generateProposals = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const systemInstruction = `
        あなたは地域コミュニティ（ASOBOなど）のプログラム企画エキスパートです。
        以下のデータに基づき、LTV（顧客生涯価値）を最大化し、競合との差別化を図るための新規プログラム案を3つ提案してください。

        【企画ロジックの優先事項】
        1. マジックナンバーの活用: 「3回参加が転換点」というデータに基づき、2回参加者に向けた「入会決定打となるプログラム」を優先。
        2. 競合との差別化: 競合他社の弱点を突き、自社にしかできない「コミュニティの深さ」や「教育的価値」を強調。
        3. ターゲット選定: 具体的な行動データ（例：体験後に入会していない層）に基づいたセグメント。

        【出力形式】
        JSON形式で、ProgramStrategyProposal型の配列（3要素）を返してください。
      `;

      const prompt = `
        【現在の事業データ】
        - 平均LTV: ¥${stats.averageLTV.toLocaleString()}
        - 体験→会員転換率: ${stats.conversionRates.visitorToMember}%
        - 離脱リスク顧客数: ${stats.churnRiskList.length}名
        - マジックナンバー（入会率）: ${JSON.stringify(stats.magicNumberData)}

        【市場・競合インサイト】
        ${marketInsights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

        上記を踏まえ、今すぐ実施すべき「勝てる」プログラムを3つ提案してください。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING, description: "ターゲットの心に刺さるコンセプト名称" },
                target: { type: Type.STRING, description: "LTVの跳ね上がりが期待できる具体的な対象" },
                purpose: { type: Type.STRING, description: "プログラムの目的（例：メンバーシップ転換）" },
                curriculum: {
                  type: Type.OBJECT,
                  properties: {
                    introduction: { type: Type.STRING, description: "体験の質を高める仕掛け" },
                    main: { type: Type.STRING, description: "コア価値の提供" },
                    closing: { type: Type.STRING, description: "次回の参加や入会へ繋げる導線" }
                  },
                  required: ["introduction", "main", "closing"]
                },
                promotionDrafts: {
                  type: Type.OBJECT,
                  properties: {
                    line: { type: Type.STRING, description: "LINE用告知文案" },
                    email: { type: Type.STRING, description: "メルマガ用告知文案" },
                    sns: { type: Type.STRING, description: "SNS用告知文案" }
                  },
                  required: ["line", "email", "sns"]
                },
                logic: { type: Type.STRING, description: "なぜこの企画が今必要なのかのロジック" }
              },
              required: ["id", "name", "target", "purpose", "curriculum", "promotionDrafts", "logic"]
            }
          }
        },
      });

      const data = JSON.parse(response.text || "[]");
      setProposals(data);
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (proposals.length === 0) {
      generateProposals();
    }
  }, []);

  return (
    <div className="bg-white w-full h-[calc(100vh-120px)] rounded-[40px] shadow-xl overflow-hidden flex flex-col border border-slate-100">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-indigo-50/50 to-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">AI プログラム提案エージェント</h2>
            <p className="text-sm text-slate-500">データと市場の隙間から「勝てる」企画を自動生成</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar: Proposal List */}
        <div className="w-80 border-r border-slate-100 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">提案リスト</h3>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">戦略を分析中...</p>
            </div>
          ) : (
            proposals.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProposal(p)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  selectedProposal?.id === p.id 
                    ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100' 
                    : 'border-transparent hover:bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${selectedProposal?.id === p.id ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Proposal</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{p.name}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2">{p.target}</p>
              </button>
            ))
          )}
          
          {!loading && (
            <button 
              onClick={generateProposals}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={14} />
              別の案を生成する
            </button>
          )}
        </div>

        {/* Main Content: Proposal Detail */}
        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            {selectedProposal ? (
              <motion.div 
                key={selectedProposal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                {/* Title & Logic */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100">
                    <Zap size={12} />
                    AI STRATEGY LOGIC
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight">{selectedProposal.name}</h1>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm italic">
                    「{selectedProposal.logic}」
                  </p>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-indigo-600">
                      <Target size={20} />
                      <span className="text-xs font-bold uppercase tracking-wider">ターゲット選定</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedProposal.target}</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-emerald-600">
                      <Flag size={20} />
                      <span className="text-xs font-bold uppercase tracking-wider">プログラムの目的</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedProposal.purpose}</p>
                  </div>
                </div>

                {/* Curriculum Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <BookOpen size={22} className="text-indigo-600" />
                    カリキュラム / 構成案
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: '導入', content: selectedProposal.curriculum.introduction, icon: '01' },
                      { label: '本編', content: selectedProposal.curriculum.main, icon: '02' },
                      { label: 'クロージング', content: selectedProposal.curriculum.closing, icon: '03' }
                    ].map((step) => (
                      <div key={step.label} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
                        <span className="absolute -right-2 -top-2 text-6xl font-black text-slate-200/50 group-hover:text-indigo-100/50 transition-colors">
                          {step.icon}
                        </span>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 relative z-10">{step.label}</h4>
                        <p className="text-sm text-slate-700 leading-relaxed relative z-10">{step.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promotion Drafts */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <MessageSquare size={22} className="text-indigo-600" />
                    告知・集客用下書き
                  </h3>
                  <div className="space-y-4">
                    {[
                      { type: 'LINE', content: selectedProposal.promotionDrafts.line },
                      { type: 'メルマガ', content: selectedProposal.promotionDrafts.email },
                      { type: 'SNS', content: selectedProposal.promotionDrafts.sns }
                    ].map((draft) => (
                      <div key={draft.type} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{draft.type}</span>
                          <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="p-6">
                          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{draft.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-10 flex items-center gap-4">
                  <button className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} />
                    この案でドラフトを作成
                  </button>
                  <button className="px-8 py-5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold transition-all flex items-center gap-2">
                    <Share2 size={20} />
                    共有
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200">
                  <Sparkles size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">AIが戦略を提案します</h3>
                  <p className="text-slate-400 max-w-sm mt-2">左側のリストから、あなたの事業に最適なプログラム案を選択してください。</p>
                </div>
                {loading && (
                  <div className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm font-bold">分析中...</span>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
