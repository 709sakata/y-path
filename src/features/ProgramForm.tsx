import * as React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, X, Edit2, Plus, Tag, Clock, Repeat, RefreshCw, MapPin } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { Program, ProgramCategory, User as AppUser, Organization } from '../types';
import { api as appApi } from '../services/api';
import { generateSchedules, RecurrenceRule } from '../utils/recurrence';

interface ProgramFormProps {
  user: AppUser | null;
  editingProgramId: string | null;
  selectedProgram: Program | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function ProgramForm({ user, editingProgramId, selectedProgram, onClose, onSubmit }: ProgramFormProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedules'>('basic');
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>({
    frequency: 'weekly',
    interval: 1,
    weekDays: [1],
    nth: 1,
    endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
  });

  const [formData, setFormData] = useState({
    organization_id: selectedProgram?.organization_id || user?.organization_id || '',
    title: selectedProgram?.title || '',
    description: selectedProgram?.description || '',
    base_price: selectedProgram?.base_price || 3000,
    category: (selectedProgram?.category || 'irregular') as ProgramCategory,
    status: (selectedProgram?.status === 'completed' ? 'completed' : 'active') as 'active' | 'completed',
    schedules: selectedProgram?.schedules?.map(s => ({
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time || '',
      capacity: s.capacity,
      location: s.location || ''
    })) || [
      {
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '10:00',
        end_time: '11:00',
        capacity: 20,
        location: ''
      }
    ]
  });

  React.useEffect(() => {
    if (!user?.organization_id) {
      fetchOrgs();
    }
  }, [user]);

  const fetchOrgs = async () => {
    try {
      const data = await appApi.organizations.list();
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  const handleGenerateSchedules = () => {
    const baseSchedule = formData.schedules[0];
    const newSchedules = generateSchedules(recurrenceRule, baseSchedule, baseSchedule.date || format(new Date(), 'yyyy-MM-dd'));
    
    if (newSchedules.length > 0) {
      setFormData({ ...formData, schedules: newSchedules });
      setShowRecurrence(false);
    }
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedules: [
        ...formData.schedules,
        {
          date: format(new Date(), 'yyyy-MM-dd'),
          start_time: '10:00',
          end_time: '11:00',
          capacity: 20,
          location: ''
        }
      ]
    });
  };

  const removeSchedule = (index: number) => {
    if (formData.schedules.length <= 1) return;
    const newSchedules = [...formData.schedules];
    newSchedules.splice(index, 1);
    setFormData({ ...formData, schedules: newSchedules });
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setFormData({ ...formData, schedules: newSchedules });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
            title="一覧に戻る"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-sm">
            {editingProgramId ? <Edit2 size={24} /> : <Plus size={24} />}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{editingProgramId ? 'プログラム編集' : '新規プログラム作成'}</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">
              {editingProgramId ? `Editing ID: ${editingProgramId}` : 'Create a new program'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
          >
            キャンセル
          </button>
          <button 
            type="button"
            onClick={() => onSubmit(formData)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            {editingProgramId ? '変更を保存する' : 'プログラムを作成する'}
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'basic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          基本情報
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'schedules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          開催枠
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            activeTab === 'schedules' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {formData.schedules.length}
          </span>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'basic' ? (
          <div className="max-w-2xl space-y-6">
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!user?.organization_id && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">主催団体</label>
                    <select 
                      value={formData.organization_id}
                      onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">団体を選択してください</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">カテゴリー</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProgramCategory })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="irregular">不定期プログラム</option>
                    <option value="regular">定期レッスン</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">募集ステータス</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="active">募集中</option>
                    <option value="completed">募集終了</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">プログラム名</label>
                  <input 
                    type="text" required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="例：春の親子ヨガ教室"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">説明</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 h-32 resize-none"
                    placeholder="プログラムの詳細を入力してください"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">参加費 (¥)</label>
                  <input 
                    type="number" required
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowRecurrence(!showRecurrence)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    showRecurrence ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  <Repeat size={14} />
                  繰り返し設定
                </button>
                <button 
                  type="button"
                  onClick={addSchedule}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                >
                  <Plus size={14} />
                  日程を追加
                </button>
              </div>
            </div>

            {showRecurrence && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">頻度</label>
                    <select 
                      value={recurrenceRule.frequency}
                      onChange={(e) => setRecurrenceRule({ ...recurrenceRule, frequency: e.target.value })}
                      className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none text-sm"
                    >
                      <option value="daily">毎日</option>
                      <option value="weekly">毎週</option>
                      <option value="monthly">毎月（同じ日付）</option>
                      <option value="monthly_nth">毎月（第◯ ◯曜日）</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">終了日</label>
                    <input 
                      type="date"
                      value={recurrenceRule.endDate}
                      onChange={(e) => setRecurrenceRule({ ...recurrenceRule, endDate: e.target.value })}
                      className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none text-sm"
                    />
                  </div>
                </div>

                {recurrenceRule.frequency === 'monthly_nth' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">第◯</label>
                      <select 
                        value={recurrenceRule.nth}
                        onChange={(e) => setRecurrenceRule({ ...recurrenceRule, nth: Number(e.target.value) })}
                        className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none text-sm"
                      >
                        <option value={1}>第1</option>
                        <option value={2}>第2</option>
                        <option value={3}>第3</option>
                        <option value={4}>第4</option>
                        <option value={5}>最終</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">曜日</label>
                      <select 
                        value={recurrenceRule.weekDays[0]}
                        onChange={(e) => setRecurrenceRule({ ...recurrenceRule, weekDays: [Number(e.target.value)] })}
                        className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none text-sm"
                      >
                        <option value={0}>日曜日</option>
                        <option value={1}>月曜日</option>
                        <option value={2}>火曜日</option>
                        <option value={3}>水曜日</option>
                        <option value={4}>木曜日</option>
                        <option value={5}>金曜日</option>
                        <option value={6}>土曜日</option>
                      </select>
                    </div>
                  </div>
                )}

                {recurrenceRule.frequency === 'weekly' && (
                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-3">曜日を選択</label>
                    <div className="flex justify-between gap-2">
                      {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const newDays = recurrenceRule.weekDays.includes(i)
                              ? recurrenceRule.weekDays.filter(d => d !== i)
                              : [...recurrenceRule.weekDays, i];
                            setRecurrenceRule({ ...recurrenceRule, weekDays: newDays });
                          }}
                          className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                            recurrenceRule.weekDays.includes(i)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-indigo-400 border border-indigo-100'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleGenerateSchedules}
                  className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  スケジュールを一括生成
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.schedules.map((schedule, index) => (
                <div key={index} className="p-6 bg-slate-50 rounded-2xl space-y-4 relative border border-slate-100 group/item">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      日程 #{index + 1}
                    </span>
                    {formData.schedules.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">日付</label>
                      <input 
                        type="date" required
                        value={schedule.date}
                        onChange={(e) => updateSchedule(index, 'date', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">定員 (名)</label>
                      <input 
                        type="number" required
                        value={schedule.capacity}
                        onChange={(e) => updateSchedule(index, 'capacity', Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">開始時間</label>
                      <input 
                        type="time" required
                        value={schedule.start_time}
                        onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">終了時間</label>
                      <input 
                        type="time" required
                        value={schedule.end_time}
                        onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">場所</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={schedule.location}
                        onChange={(e) => updateSchedule(index, 'location', e.target.value)}
                        className="w-full p-2.5 pl-10 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        placeholder="例：ASOBO 3F ホール"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
