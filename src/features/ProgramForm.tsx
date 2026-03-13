import * as React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit2, Plus, Tag, Clock, MapPin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Program, ProgramCategory, User as AppUser, Organization, ProgramPricing, ProgramSchedule, ScheduleLocation, EligibilityType, PricingUnit, FireType } from '../types';
import { PROGRAM_STATUS } from '../constants';
import { api as appApi } from '../services/api';

interface ProgramFormProps {
  user: AppUser | null;
  editingProgramId: string | null;
  selectedProgram: Program | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function ProgramForm({ user, editingProgramId, selectedProgram, onClose, onSubmit }: ProgramFormProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'schedules'>('basic');

  const [formData, setFormData] = useState({
    organization_id: selectedProgram?.organization_id || user?.organization_id || '',
    category: (selectedProgram?.category || 'EVENT') as ProgramCategory,
    title: selectedProgram?.title || '',
    description: selectedProgram?.description || '',
    status: (selectedProgram?.status === PROGRAM_STATUS.COMPLETED ? PROGRAM_STATUS.COMPLETED : PROGRAM_STATUS.ACTIVE) as typeof PROGRAM_STATUS[keyof typeof PROGRAM_STATUS],
    
    target_age_min: selectedProgram?.target_age_min || '',
    target_age_max: selectedProgram?.target_age_max || '',
    target_grade_min: selectedProgram?.target_grade_min || 0,
    target_grade_max: selectedProgram?.target_grade_max || 0,
    eligibility: (selectedProgram?.eligibility || 'open') as EligibilityType,
    requires_certificate: selectedProgram?.requires_certificate || false,
    lottery_based: selectedProgram?.lottery_based || false,
    
    capacity: selectedProgram?.capacity || 20,
    min_participants: selectedProgram?.min_participants || 1,
    nights: selectedProgram?.nights || 0,
    is_annual_recurring: selectedProgram?.is_annual_recurring || false,
    
    pricing_unit: (selectedProgram?.pricing_unit || 'per_person') as PricingUnit,
    
    fire_type: (selectedProgram?.fire_type || 'none') as FireType,
    water_activity: selectedProgram?.water_activity || false,
    muffler_prohibited: selectedProgram?.muffler_prohibited || false,
    
    study_time: selectedProgram?.study_time || false,
    parent_program: selectedProgram?.parent_program || false,
    rental_available: selectedProgram?.rental_available || false,
    
    pricing: selectedProgram?.pricing?.length ? selectedProgram.pricing : [
      { tier_label: '一般', amount: 3000, extra_fee: 0, sort_order: 0 }
    ],
    
    schedules: selectedProgram?.schedules?.length ? selectedProgram.schedules : [
      {
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        capacity: 20,
        status: 'open',
        schedule_locations: [
          { type: 'meeting', meeting_time: '10:00', location_id: null }
        ]
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

  const addPricing = () => {
    setFormData({
      ...formData,
      pricing: [
        ...formData.pricing,
        { tier_label: '', amount: 0, extra_fee: 0, sort_order: formData.pricing.length }
      ]
    });
  };

  const removePricing = (index: number) => {
    if (formData.pricing.length <= 1) return;
    const newPricing = [...formData.pricing];
    newPricing.splice(index, 1);
    setFormData({ ...formData, pricing: newPricing });
  };

  const updatePricing = (index: number, field: string, value: any) => {
    const newPricing = [...formData.pricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    setFormData({ ...formData, pricing: newPricing });
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedules: [
        ...formData.schedules,
        {
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: format(new Date(), 'yyyy-MM-dd'),
          capacity: formData.capacity,
          status: 'open',
          schedule_locations: [
            { type: 'meeting', meeting_time: '10:00', location_id: null }
          ]
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
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pricing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          料金設定
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            activeTab === 'pricing' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {formData.pricing.length}
          </span>
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
        {activeTab === 'basic' && (
          <div className="max-w-2xl space-y-6">
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="EVENT">イベント</option>
                    <option value="MONTHLY">月謝制</option>
                    <option value="SEASONAL">季節プログラム</option>
                    <option value="OVERNIGHT">宿泊</option>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">定員</label>
                  <input 
                    type="number" required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">宿泊数</label>
                  <input 
                    type="number" required
                    value={formData.nights}
                    onChange={(e) => setFormData({ ...formData, nights: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Tag size={18} className="text-indigo-600" />
                料金設定
              </h4>
              <button
                type="button"
                onClick={addPricing}
                className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700"
              >
                <Plus size={16} />
                料金を追加
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.pricing.map((price, index) => (
                <div key={index} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                  {formData.pricing.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePricing(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">料金ラベル</label>
                      <input 
                        type="text" required
                        value={price.tier_label}
                        onChange={(e) => updatePricing(index, 'tier_label', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="例：一般、会員"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">金額 (¥)</label>
                      <input 
                        type="number" required
                        value={price.amount}
                        onChange={(e) => updatePricing(index, 'amount', Number(e.target.value))}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">追加料金 (¥)</label>
                      <input 
                        type="number"
                        value={price.extra_fee}
                        onChange={(e) => updatePricing(index, 'extra_fee', Number(e.target.value))}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="非会員の臨時会費など"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                開催枠
              </h4>
              <button
                type="button"
                onClick={addSchedule}
                className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700"
              >
                <Plus size={16} />
                枠を追加
              </button>
            </div>

            <div className="space-y-4">
              {formData.schedules.map((schedule, index) => (
                <div key={index} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                  {formData.schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">開始日</label>
                      <input 
                        type="date" required
                        value={schedule.start_date}
                        onChange={(e) => updateSchedule(index, 'start_date', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">終了日</label>
                      <input 
                        type="date" required
                        value={schedule.end_date}
                        onChange={(e) => updateSchedule(index, 'end_date', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">定員</label>
                      <input 
                        type="number" required
                        value={schedule.capacity}
                        onChange={(e) => updateSchedule(index, 'capacity', Number(e.target.value))}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  
                  {/* Schedule Locations */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      <MapPin size={14} />
                      集合・解散場所
                    </h5>
                    {schedule.schedule_locations?.map((loc: any, locIndex: number) => (
                      <div key={locIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div>
                          <select
                            value={loc.type}
                            onChange={(e) => {
                              const newLocs = [...(schedule.schedule_locations || [])];
                              newLocs[locIndex].type = e.target.value;
                              updateSchedule(index, 'schedule_locations', newLocs);
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="meeting">集合</option>
                            <option value="dismissal">解散</option>
                            <option value="both">集合・解散</option>
                          </select>
                        </div>
                        <div>
                          <input
                            type="time"
                            value={loc.meeting_time || ''}
                            onChange={(e) => {
                              const newLocs = [...(schedule.schedule_locations || [])];
                              newLocs[locIndex].meeting_time = e.target.value;
                              updateSchedule(index, 'schedule_locations', newLocs);
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                            placeholder="時間"
                          />
                        </div>
                      </div>
                    ))}
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
