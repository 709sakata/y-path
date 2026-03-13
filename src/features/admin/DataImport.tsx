import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, FileText, Users, Calendar, LayoutTemplate, MessageSquare, Copy, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export function DataImport() {
  const [importType, setImportType] = useState<'customers' | 'reservations' | 'programs' | 'surveys'>('customers');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const getPromptTemplate = () => {
    switch (importType) {
      case 'customers':
        return `以下の既存データを、指定されたCSVフォーマットに変換してください。

【出力フォーマット（CSV）】
name,email,phone,membership_type,child_names,child_birthdays

【データ要件】
- name: 保護者氏名
- email: メールアドレス（必須・一意）
- phone: 電話番号（ハイフンあり・なしどちらでも可）
- membership_type: "general" または "premium" のいずれか
- child_names: お子様氏名（複数いる場合はセミコロン ";" で区切る。例: 太郎;花子）
- child_birthdays: お子様生年月日（YYYY-MM-DD形式。複数いる場合はセミコロン ";" で区切る。例: 2015-01-01;2017-05-05）

【既存データ】
（ここに既存のデータを貼り付けてください）`;
      case 'reservations':
        return `以下の既存データを、指定されたCSVフォーマットに変換してください。

【出力フォーマット（CSV）】
parent_email,program_schedule_id,status,total_price,is_parent_attending,child_names

【データ要件】
- parent_email: 保護者のメールアドレス（必須）
- program_schedule_id: プログラムスケジュールのID（必須、UUID形式）
- status: "completed", "cancelled", "pending", "confirmed" のいずれか
- total_price: 支払金額（数値のみ、カンマなし）
- is_parent_attending: "true" または "false"
- child_names: 参加するお子様氏名（複数いる場合はセミコロン ";" で区切る）

【既存データ】
（ここに既存のデータを貼り付けてください）`;
      case 'programs':
        return `以下の既存データを、指定されたCSVフォーマットに変換してください。

【出力フォーマット（CSV）】
title,description,target_age_min,target_age_max,eligibility,nights,fire_type,capacity,category,status,pricing_labels,pricing_amounts,schedule_starts,schedule_ends,locations

【データ要件】
- title: プログラム名（必須）
- description: プログラムの説明
- target_age_min: 対象年齢（下限、数値のみ）
- target_age_max: 対象年齢（上限、数値のみ）
- eligibility: 参加資格
- nights: 宿泊数（日帰りは0）
- fire_type: 焚き火の種類（none, standard, premium）
- capacity: 定員（数値のみ）
- category: "regular", "irregular", "event" のいずれか
- status: "active", "draft", "archived" のいずれか
- pricing_labels: 料金ラベル（セミコロン区切り）
- pricing_amounts: 料金（セミコロン区切り）
- schedule_starts: 開始日時（セミコロン区切り）
- schedule_ends: 終了日時（セミコロン区切り）
- locations: 開催場所（セミコロン区切り）

【既存データ】
（ここに既存のデータを貼り付けてください）`;
      case 'surveys':
        return `以下の既存データを、指定されたCSVフォーマットに変換してください。

【出力フォーマット（CSV）】
title,parent_email,program_id,submitted_at,質問1の回答,質問2の回答...

【データ要件】
- title: アンケートのタイトル
- parent_email: 回答者のメールアドレス
- program_id: 関連するプログラムのID（任意、UUID形式）
- submitted_at: 回答日時（YYYY-MM-DD HH:MM:SS形式）
- それ以降の列: 質問の回答内容

【既存データ】
（ここに既存のデータを貼り付けてください）`;
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(getPromptTemplate());
    alert('プロンプトをクリップボードにコピーしました');
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim() !== '');
      
      if (rows.length < 2) {
        throw new Error('ファイルにデータが含まれていません');
      }

      const headers = rows[0].split(',').map(h => h.trim());
      const data = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      });

      let response;
      if (importType === 'customers') {
        // Transform flat CSV to nested object if needed
        const formattedData = data.map(d => {
          // Support both singular and plural column names for backward compatibility
          const childNamesStr = d.child_names || d.child_name || '';
          const childBirthdaysStr = d.child_birthdays || d.child_birthday || '';
          
          const childNames = childNamesStr ? childNamesStr.split(';').map((n: string) => n.trim()) : [];
          const childBirthdays = childBirthdaysStr ? childBirthdaysStr.split(';').map((d: string) => d.trim()) : [];
          
          const children = childNames.map((name: string, i: number) => ({
            name: name,
            birthday: childBirthdays[i] || null
          }));

          return {
            name: d.name,
            email: d.email,
            phone: d.phone,
            membership_type: d.membership_type || 'general',
            children: children
          };
        });
        response = await api.import.customers(formattedData);
      } else if (importType === 'reservations') {
        const formattedData = data.map(d => ({
          parent_email: d.parent_email,
          program_schedule_id: d.program_schedule_id,
          status: d.status || 'completed',
          total_price: parseInt(d.total_price || '0', 10),
          is_parent_attending: d.is_parent_attending === 'true' || d.is_parent_attending === '1',
          child_names: d.child_names ? d.child_names.split(';').map((n: string) => n.trim()) : []
        }));
        response = await api.import.reservations(formattedData);
      } else if (importType === 'programs') {
        const formattedData = data.map(d => {
          const pricingLabelsStr = d.pricing_labels || '';
          const pricingAmountsStr = d.pricing_amounts || '';
          
          const pricingLabels = pricingLabelsStr ? pricingLabelsStr.split(';').map((v: string) => v.trim()) : [];
          const pricingAmounts = pricingAmountsStr ? pricingAmountsStr.split(';').map((v: string) => parseInt(v.trim(), 10)) : [];
          
          const pricing = pricingLabels.map((label: string, i: number) => ({
            tier_label: label,
            amount: pricingAmounts[i] || 0
          }));

          const scheduleStartsStr = d.schedule_starts || '';
          const scheduleEndsStr = d.schedule_ends || '';
          const locationsStr = d.locations || '';
          
          const scheduleStarts = scheduleStartsStr ? scheduleStartsStr.split(';').map((v: string) => v.trim()) : [];
          const scheduleEnds = scheduleEndsStr ? scheduleEndsStr.split(';').map((v: string) => v.trim()) : [];
          const locations = locationsStr ? locationsStr.split(';').map((v: string) => v.trim()) : [];
          
          const schedules = scheduleStarts.map((start: string, i: number) => ({
            start_date: start,
            end_date: scheduleEnds[i] || start,
            locations: locations[i] ? [{
              location_name: locations[i],
              meeting_time: start.split('T')[1]?.substring(0, 5) || '09:00',
              dismissal_time: (scheduleEnds[i] || start).split('T')[1]?.substring(0, 5) || '17:00'
            }] : []
          }));

          return {
            title: d.title,
            description: d.description,
            target_age_min: d.target_age_min ? parseInt(d.target_age_min, 10) : undefined,
            target_age_max: d.target_age_max ? parseInt(d.target_age_max, 10) : undefined,
            eligibility: d.eligibility,
            nights: d.nights ? parseInt(d.nights, 10) : 0,
            fire_type: d.fire_type || 'none',
            capacity: parseInt(d.capacity || '20', 10),
            category: d.category || 'irregular',
            status: d.status || 'active',
            pricing: pricing.length > 0 ? pricing : [{ tier_label: '一般', amount: 0 }],
            schedules: schedules.length > 0 ? schedules : undefined
          };
        });
        response = await api.import.programs(formattedData);
      } else if (importType === 'surveys') {
        const formattedData = data.map(d => {
          const { parent_email, program_id, title, submitted_at, ...answers } = d;
          return {
            parent_email,
            program_id,
            title,
            submitted_at,
            ...answers
          };
        });
        response = await api.import.surveys(formattedData);
      }

      setResult(response);
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`インポートエラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">データインポート</h2>
        <p className="text-zinc-500 text-sm">
          過去の顧客や予約をCSV形式でシステムに取り込みます。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => setImportType('customers')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            importType === 'customers'
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${importType === 'customers' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
              <Users size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">顧客</h3>
          </div>
          <p className="text-sm text-zinc-500">
            保護者情報とお子様情報
          </p>
        </button>

        <button
          onClick={() => setImportType('reservations')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            importType === 'reservations'
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${importType === 'reservations' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">予約</h3>
          </div>
          <p className="text-sm text-zinc-500">
            過去のプログラム参加履歴
          </p>
        </button>

        <button
          onClick={() => setImportType('programs')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            importType === 'programs'
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${importType === 'programs' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
              <LayoutTemplate size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">プログラム</h3>
          </div>
          <p className="text-sm text-zinc-500">
            プログラムとスケジュール情報
          </p>
        </button>

        <button
          onClick={() => setImportType('surveys')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            importType === 'surveys'
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${importType === 'surveys' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-zinc-900">アンケート</h3>
          </div>
          <p className="text-sm text-zinc-500">
            過去のアンケート回答結果
          </p>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-8">
        <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <FileText size={18} />
          CSVフォーマット要件
        </h3>
        
        {importType === 'customers' && (
          <div className="text-sm text-zinc-600 space-y-2">
            <p>以下のヘッダー（1行目）を持つCSVファイルをご用意ください：</p>
            <code className="block p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-800">
              name, email, phone, membership_type, child_names, child_birthdays
            </code>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><span className="font-bold">name</span>: 保護者氏名</li>
              <li><span className="font-bold">email</span>: メールアドレス（必須・一意）</li>
              <li><span className="font-bold">phone</span>: 電話番号</li>
              <li><span className="font-bold">membership_type</span>: general または premium</li>
              <li><span className="font-bold">child_names</span>: お子様氏名（複数いる場合はセミコロン ";" で区切る）</li>
              <li><span className="font-bold">child_birthdays</span>: お子様生年月日（YYYY-MM-DD。複数いる場合はセミコロン ";" で区切る）</li>
            </ul>
          </div>
        )}
        
        {importType === 'reservations' && (
          <div className="text-sm text-zinc-600 space-y-2">
            <p>以下のヘッダー（1行目）を持つCSVファイルをご用意ください：</p>
            <code className="block p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-800">
              parent_email, program_schedule_id, status, total_price, is_parent_attending, child_names
            </code>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><span className="font-bold">parent_email</span>: 保護者のメールアドレス（必須）</li>
              <li><span className="font-bold">program_schedule_id</span>: プログラムスケジュールのID（必須）</li>
              <li><span className="font-bold">status</span>: completed, cancelled など</li>
              <li><span className="font-bold">total_price</span>: 支払金額（数値）</li>
              <li><span className="font-bold">is_parent_attending</span>: true または false</li>
              <li><span className="font-bold">child_names</span>: 参加するお子様氏名（セミコロン区切り）</li>
            </ul>
          </div>
        )}

        {importType === 'programs' && (
          <div className="text-sm text-zinc-600 space-y-2">
            <p>以下のヘッダー（1行目）を持つCSVファイルをご用意ください：</p>
            <code className="block p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-800">
              title, description, target_age_min, target_age_max, eligibility, nights, fire_type, capacity, category, status, pricing_labels, pricing_amounts, schedule_starts, schedule_ends, locations
            </code>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><span className="font-bold">title</span>: プログラム名（必須）</li>
              <li><span className="font-bold">description</span>: プログラムの説明</li>
              <li><span className="font-bold">target_age_min</span>: 対象年齢（下限）</li>
              <li><span className="font-bold">target_age_max</span>: 対象年齢（上限）</li>
              <li><span className="font-bold">eligibility</span>: 参加資格（例: 小学生以上）</li>
              <li><span className="font-bold">nights</span>: 宿泊数（日帰りは0）</li>
              <li><span className="font-bold">fire_type</span>: 焚き火の種類（none, standard, premium）</li>
              <li><span className="font-bold">capacity</span>: 定員（数値）</li>
              <li><span className="font-bold">category</span>: カテゴリ（irregular, regular, event）</li>
              <li><span className="font-bold">status</span>: ステータス（active, draft, archived）</li>
              <li><span className="font-bold">pricing_labels</span>: 料金ラベル（セミコロン区切り、例: 一般;会員）</li>
              <li><span className="font-bold">pricing_amounts</span>: 料金（セミコロン区切り、例: 5000;3500）</li>
              <li><span className="font-bold">schedule_starts</span>: 開始日時（セミコロン区切り、例: 2024-05-01T10:00:00）</li>
              <li><span className="font-bold">schedule_ends</span>: 終了日時（セミコロン区切り、例: 2024-05-01T12:00:00）</li>
              <li><span className="font-bold">locations</span>: 開催場所（セミコロン区切り）</li>
            </ul>
          </div>
        )}

        {importType === 'surveys' && (
          <div className="text-sm text-zinc-600 space-y-2">
            <p>以下のヘッダー（1行目）を持つCSVファイルをご用意ください：</p>
            <code className="block p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-800">
              title, parent_email, program_id, submitted_at, [任意の質問1], [任意の質問2]...
            </code>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><span className="font-bold">title</span>: アンケートのタイトル</li>
              <li><span className="font-bold">parent_email</span>: 回答者のメールアドレス（顧客と紐付け用）</li>
              <li><span className="font-bold">program_id</span>: 関連するプログラムのID（任意）</li>
              <li><span className="font-bold">submitted_at</span>: 回答日時（YYYY-MM-DD HH:MM:SS）</li>
              <li><span className="font-bold">その他の列</span>: 全てアンケートの質問と回答として保存されます</li>
            </ul>
          </div>
        )}

        {/* AI Prompt Section */}
        <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-brand-900 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-500" />
              AIフォーマット変換プロンプト
            </h4>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-brand-600 text-xs font-bold rounded-lg border border-brand-200 hover:bg-brand-50 transition-colors"
            >
              <Copy size={14} />
              コピー
            </button>
          </div>
          <p className="text-xs text-brand-700 mb-3">
            既存のデータをChatGPTやClaudeに貼り付けて、指定のCSVフォーマットに変換してもらうためのプロンプトです。
          </p>
          <div className="relative">
            <pre className="p-3 bg-white/60 rounded-lg border border-brand-200 text-xs text-brand-800 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
              {getPromptTemplate()}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-8 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="inline-flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-200 mb-4 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-colors">
            <Upload size={24} />
          </div>
          <span className="font-bold text-zinc-900 mb-1">
            {file ? file.name : 'CSVファイルを選択'}
          </span>
          <span className="text-sm text-zinc-500">
            クリックしてファイルを選択してください
          </span>
        </label>

        {file && (
          <div className="mt-8">
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-8 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'インポート中...' : 'インポートを実行'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <CheckCircle2 className="text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold">インポート完了</p>
              <p className="text-sm">成功: {result.success}件 / 失敗: {result.failed}件</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2 font-bold">
                <AlertCircle size={18} />
                エラー詳細
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
