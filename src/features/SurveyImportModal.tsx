import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Building2, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import { api as appApi } from '../services/api';
import { Organization, Program } from '../types';

interface SurveyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SurveyImportModal({ isOpen, onClose, onSuccess }: SurveyImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [matchColumn, setMatchColumn] = useState('');
  const [matchType, setMatchType] = useState<'email' | 'phone'>('email');
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ matched: number; unlinked: number; total: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    try {
      const [orgsData, programsData] = await Promise.all([
        appApi.organizations.list(),
        appApi.programs.list()
      ]);
      setOrganizations(orgsData);
      setPrograms(programsData);
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setResult(null);

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setParsedData(results.data);
            setColumns(Object.keys(results.data[0]));
            
            // Auto-detect match column
            const cols = Object.keys(results.data[0]);
            const emailCol = cols.find(c => c.toLowerCase().includes('email') || c.includes('メール'));
            const phoneCol = cols.find(c => c.toLowerCase().includes('phone') || c.includes('電話'));
            
            if (emailCol) {
              setMatchColumn(emailCol);
              setMatchType('email');
            } else if (phoneCol) {
              setMatchColumn(phoneCol);
              setMatchType('phone');
            }
          } else {
            setError('CSVファイルが空か、読み込めませんでした。');
          }
        },
        error: (err) => {
          setError(`CSVの読み込みに失敗しました: ${err.message}`);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!title) {
      setError('アンケート名を入力してください。');
      return;
    }
    if (!matchColumn) {
      setError('紐付けに使用する列を選択してください。');
      return;
    }
    if (parsedData.length === 0) {
      setError('インポートするデータがありません。');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const res = await appApi.surveys.import({
        title,
        surveys: parsedData,
        matchColumn,
        matchType,
        organization_id: selectedOrgId || undefined,
        program_id: selectedProgramId || undefined
      });

      setResult({
        matched: res.matchedCount,
        unlinked: res.unlinkedCount,
        total: res.totalCount
      });
      onSuccess();
    } catch (err: any) {
      setError(err.error || 'インポート中にエラーが発生しました。');
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setTitle('');
    setParsedData([]);
    setColumns([]);
    setMatchColumn('');
    setError('');
    setResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-800">アンケート結果のインポート</h2>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {result ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">インポート完了</h3>
              <p className="text-slate-600">
                全 {result.total} 件のアンケートデータをインポートしました。
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <div className="bg-slate-50 p-4 rounded-xl text-center min-w-[120px]">
                  <div className="text-2xl font-bold text-indigo-600">{result.matched}</div>
                  <div className="text-xs text-slate-500 mt-1">顧客と紐付け成功</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center min-w-[120px]">
                  <div className="text-2xl font-bold text-amber-600">{result.unlinked}</div>
                  <div className="text-xs text-slate-500 mt-1">未紐付け</div>
                </div>
              </div>
              <div className="pt-8">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">アンケート名</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 2024年 夏期講習事前アンケート"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">CSVファイル</label>
                {!file ? (
                  <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-colors cursor-pointer">
                    <Upload size={32} className="mb-3 text-indigo-400" />
                    <span className="font-medium">クリックしてCSVファイルを選択</span>
                    <span className="text-xs mt-1">Googleフォームの回答スプレッドシートからダウンロードしたCSV</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="text-indigo-600" size={24} />
                      <div>
                        <div className="font-medium text-slate-800">{file.name}</div>
                        <div className="text-xs text-slate-500">{parsedData.length} 件のデータを読み込みました</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setFile(null); setParsedData([]); setColumns([]); }}
                      className="text-slate-400 hover:text-red-500 p-2"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {columns.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      顧客との紐付け設定
                    </h4>
                    <p className="text-sm text-slate-600">
                      CSVのどの列を使って、システム内の顧客情報と紐付けるかを選択してください。
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">CSVの列</label>
                        <select
                          value={matchColumn}
                          onChange={(e) => setMatchColumn(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                        >
                          <option value="">選択してください</option>
                          {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">紐付け先（顧客情報）</label>
                        <select
                          value={matchType}
                          onChange={(e) => setMatchType(e.target.value as 'email' | 'phone')}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                        >
                          <option value="email">メールアドレス</option>
                          <option value="phone">電話番号</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      団体・プログラムとの紐付け設定（任意）
                    </h4>
                    <p className="text-sm text-slate-600">
                      このアンケートが特定の団体やプログラムに関連している場合は、選択してください。
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                          <Building2 size={12} /> 団体
                        </label>
                        <select
                          value={selectedOrgId}
                          onChange={(e) => setSelectedOrgId(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                        >
                          <option value="">指定しない</option>
                          {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                          <Sparkles size={12} /> プログラム
                        </label>
                        <select
                          value={selectedProgramId}
                          onChange={(e) => setSelectedProgramId(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                        >
                          <option value="">指定しない</option>
                          {programs
                            .filter(p => !selectedOrgId || p.organization_id === selectedOrgId)
                            .map(prog => (
                            <option key={prog.id} value={prog.id}>{prog.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!result && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleImport}
              disabled={!file || !title || !matchColumn || isUploading}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  インポート中...
                </>
              ) : (
                'インポートを実行'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
