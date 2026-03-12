import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, Download, Upload, Filter, Calendar, Users, ChevronRight, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { api as appApi } from '../services/api';
import { SurveyImportModal } from './SurveyImportModal';

export function SurveysManager() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await appApi.surveys.getAll();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const filteredSurveys = surveys.filter(survey => {
    const searchLower = searchQuery.toLowerCase();
    const parentName = survey.parents?.name?.toLowerCase() || '';
    const title = survey.title?.toLowerCase() || '';
    
    // Search in answers
    const answersText = Object.values(survey.answers || {}).join(' ').toLowerCase();

    return parentName.includes(searchLower) || 
           title.includes(searchLower) || 
           answersText.includes(searchLower);
  });

  // Group surveys by title for summary view
  const surveyGroups = surveys.reduce((acc: any, survey: any) => {
    if (!acc[survey.title]) {
      acc[survey.title] = {
        title: survey.title,
        count: 0,
        linkedCount: 0,
        latestDate: survey.submitted_at
      };
    }
    acc[survey.title].count++;
    if (survey.parent_id) {
      acc[survey.title].linkedCount++;
    }
    if (new Date(survey.submitted_at) > new Date(acc[survey.title].latestDate)) {
      acc[survey.title].latestDate = survey.submitted_at;
    }
    return acc;
  }, {});

  const groupsList = Object.values(surveyGroups).sort((a: any, b: any) => 
    new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-2xl">アンケート管理</h3>
          <p className="text-slate-500 text-sm mt-1">インポートされたアンケート結果の確認と管理を行います。</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Upload size={16} />
            アンケートインポート
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : selectedSurvey ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <button 
                onClick={() => setSelectedSurvey(null)}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mb-2 flex items-center gap-1"
              >
                ← 一覧に戻る
              </button>
              <h4 className="text-xl font-bold text-slate-800">{selectedSurvey.title}</h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(selectedSurvey.submitted_at), 'yyyy/MM/dd HH:mm')}</span>
                {selectedSurvey.parents ? (
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <Users size={14} /> {selectedSurvey.parents.name} 様
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    <Users size={14} /> 未紐付け
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {Object.entries(selectedSurvey.answers).map(([question, answer]: [string, any], index) => {
              if (question.toLowerCase().includes('timestamp') || question.includes('タイムスタンプ')) return null;
              return (
                <div key={index} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h5 className="font-bold text-slate-700 mb-3 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5"><MessageSquare size={16} /></span>
                    {question}
                  </h5>
                  <p className="text-slate-600 whitespace-pre-wrap pl-6">{String(answer)}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Summary & Filters */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                アンケートサマリー
              </h4>
              <div className="space-y-4">
                {groupsList.map((group: any) => (
                  <div key={group.title} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-700 text-sm mb-2 line-clamp-1" title={group.title}>{group.title}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">回答数: <strong className="text-slate-700 text-sm">{group.count}</strong>件</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg font-medium">紐付け済: {group.linkedCount}件</span>
                    </div>
                  </div>
                ))}
                {groupsList.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    インポートされたアンケートはありません
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Survey List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="アンケート名、顧客名、回答内容で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredSurveys.map((survey) => (
                <motion.div 
                  key={survey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedSurvey(survey)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                          {format(new Date(survey.submitted_at), 'yyyy/MM/dd HH:mm')}
                        </span>
                        {survey.parents ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Users size={12} /> {survey.parents.name}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Users size={12} /> 未紐付け
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate">{survey.title}</h4>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {Object.values(survey.answers).filter(v => typeof v === 'string' && v.length > 0).join(' / ')}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredSurveys.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                  <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">アンケートが見つかりません</p>
                  <p className="text-slate-400 text-sm mt-1">検索条件を変更するか、新しくインポートしてください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SurveyImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          fetchSurveys();
        }}
      />
    </div>
  );
}
