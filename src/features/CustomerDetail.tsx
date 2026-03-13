import * as React from 'react';
import { ArrowLeft, Mail, Phone, ShieldCheck, Baby, ChevronRight, History, CheckCircle2, XCircle, Clock3, CreditCard, Users, ExternalLink, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Parent } from '../types';
import { RESERVATION_STATUS, MEMBERSHIP_STATUS, MEMBERSHIP_TYPE } from '../constants';

interface CustomerDetailProps {
  customer: Parent;
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function CustomerDetail({ customer, loading, onClose, onEdit }: CustomerDetailProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case RESERVATION_STATUS.CONFIRMED:
        return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold"><CheckCircle2 size={12} /> 確定</span>;
      case RESERVATION_STATUS.CANCELLED:
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-[10px] font-bold"><XCircle size={12} /> キャンセル</span>;
      case RESERVATION_STATUS.PENDING:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-[10px] font-bold"><Clock3 size={12} /> 確認中</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
            title="一覧に戻る"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-sm">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-800">{customer.name} 様</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                customer.parent_organizations?.[0]?.membership_type === 'member' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {customer.parent_organizations?.[0]?.membership_type === 'member' ? 'プレミアム会員' : '一般会員'}
              </span>
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-4">
              <span className="flex items-center gap-1"><Mail size={14} /> {customer.email}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onEdit}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            編集する
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">詳細情報を読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info & Children */}
            <div className="lg:col-span-1 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  <h4 className="font-bold text-sm uppercase tracking-wider">会員ステータス</h4>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">現在の状態</span>
                    <span className={`text-xs font-bold ${customer.parent_organizations?.[0]?.membership_status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {customer.parent_organizations?.[0]?.membership_status === 'active' ? '有効' : '無効'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">登録日</span>
                    <span className="text-xs font-bold text-slate-700">
                      {customer.created_at ? format(new Date(customer.created_at), 'yyyy年MM月dd日') : '---'}
                    </span>
                  </div>
                  <button 
                    onClick={onEdit}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-all"
                  >
                    ステータスを変更
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <Baby size={18} className="text-indigo-600" />
                  <h4 className="font-bold text-sm uppercase tracking-wider">登録済みのお子様</h4>
                </div>
                <div className="space-y-2">
                  {customer.children?.map(child => (
                    <div key={child.id} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 text-indigo-400 rounded-lg flex items-center justify-center">
                          <Baby size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{child.name}</p>
                          <p className="text-[10px] text-slate-400">{child.birthday} 生まれ</p>
                        </div>
                      </div>
                      <button 
                        onClick={onEdit}
                        className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={onEdit}
                    className="w-full py-3 border-2 border-dashed border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold hover:border-indigo-200 hover:text-indigo-400 transition-all"
                  >
                    + お子様を追加
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <History size={18} className="text-indigo-600" />
                  <h4 className="font-bold text-sm uppercase tracking-wider">予約履歴</h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  全 {customer.history?.length || 0} 件
                </span>
              </div>

              <div className="space-y-3">
                {customer.history && customer.history.length > 0 ? (
                  customer.history.map((res: any) => (
                    <div key={res.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all flex items-center justify-between group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(res.status)}
                          <span className="text-[10px] text-slate-400 font-medium">{res.date} {res.time}</span>
                        </div>
                        <h5 className="font-bold text-slate-700">{res.program_title}</h5>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <CreditCard size={10} /> ¥{res.total_price?.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Users size={10} /> {res.attendance?.length}名
                          </span>
                        </div>
                      </div>
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 text-sm">予約履歴はありません</p>
                  </div>
                )}
              </div>

              {/* Surveys Section */}
              <div className="pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-slate-800">
                    <FileText size={18} className="text-indigo-600" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">アンケート回答</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    全 {customer.surveys?.length || 0} 件
                  </span>
                </div>

                <div className="space-y-4">
                  {customer.surveys && customer.surveys.length > 0 ? (
                    customer.surveys.map((survey: any) => (
                      <div key={survey.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                          <h5 className="font-bold text-slate-800">{survey.title}</h5>
                          <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                            {format(new Date(survey.submitted_at), 'yyyy/MM/dd HH:mm')}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {Object.entries(survey.answers).map(([question, answer]) => {
                            // Skip timestamp or matching columns if they are just metadata, but for now show all
                            if (question.toLowerCase().includes('timestamp') || question.includes('タイムスタンプ')) return null;
                            return (
                              <div key={question} className="bg-slate-50 p-3 rounded-xl">
                                <div className="text-xs font-bold text-slate-500 mb-1">{question}</div>
                                <div className="text-sm text-slate-800 whitespace-pre-wrap">{String(answer)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 text-sm">アンケート回答はありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
