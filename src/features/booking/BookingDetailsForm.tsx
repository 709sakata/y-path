import * as React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Calendar, Clock, CheckCircle2, LogIn, User as UserIcon } from 'lucide-react';
import { Program as AppProgram, Parent as AppParent, User as AppUser } from '../../types';

interface BookingDetailsFormProps {
  program: AppProgram;
  user: AppUser | null;
  parentProfile: AppParent | null;
  selectedScheduleId: string;
  onScheduleSelect: (id: string) => void;
  bookingData: {
    selectedChildIds: string[];
    isParentAttending: boolean;
    notes: string;
    agreedToTerms: boolean;
  };
  onBookingDataChange: (data: any) => void;
  onBack: () => void;
  onConfirm: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export function BookingDetailsForm({
  program,
  user,
  parentProfile,
  selectedScheduleId,
  onScheduleSelect,
  bookingData,
  onBookingDataChange,
  onBack,
  onConfirm,
  onLoginClick,
  onRegisterClick
}: BookingDetailsFormProps) {
  const toggleChildSelection = (childId: string) => {
    const isSelected = bookingData.selectedChildIds.includes(childId);
    if (isSelected) {
      onBookingDataChange({ 
        ...bookingData, 
        selectedChildIds: bookingData.selectedChildIds.filter(id => id !== childId) 
      });
    } else {
      onBookingDataChange({ 
        ...bookingData, 
        selectedChildIds: [...bookingData.selectedChildIds, childId] 
      });
    }
  };

  const toggleParentSelection = () => {
    onBookingDataChange({ ...bookingData, isParentAttending: !bookingData.isParentAttending });
  };

  const totalPrice = (parentProfile?.membership_type === 'member' 
    ? (program.base_price * bookingData.selectedChildIds.length) * 0.9 
    : (program.base_price * bookingData.selectedChildIds.length));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <button 
        onClick={onBack}
        className="text-zinc-400 hover:text-zinc-600 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
      >
        <ChevronRight size={14} className="rotate-180" />
        プログラム一覧に戻る
      </button>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden">
        <div className="bg-zinc-900 p-10 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-4 block">選択中のプログラム</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">{program.title}</h2>
            <p className="text-zinc-400 text-lg max-w-xl leading-relaxed">{program.description}</p>
          </div>
        </div>
        
        <div className="p-10 md:p-12 space-y-12">
          {/* Schedule Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xl font-bold text-zinc-900">1. 日程を選択</h4>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">開催スケジュール</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {program.schedules?.map(schedule => (
                <button
                  key={schedule.id}
                  onClick={() => onScheduleSelect(schedule.id)}
                  className={`p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                    selectedScheduleId === schedule.id 
                      ? 'border-brand-500 bg-brand-50/30 ring-4 ring-brand-500/5' 
                      : 'border-zinc-100 hover:border-brand-200 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">日付</span>
                      <div className="flex items-center gap-2 text-zinc-900 font-bold">
                        <Calendar size={16} className="text-brand-600" />
                        {schedule.date}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">時間</span>
                      <div className="flex items-center gap-2 text-zinc-900 font-bold">
                        <Clock size={16} className="text-brand-600" />
                        {schedule.start_time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold uppercase tracking-widest ${
                      (schedule.current_participants || 0) >= schedule.capacity 
                        ? 'text-red-500' 
                        : (schedule.current_participants || 0) >= schedule.capacity * 0.8 
                          ? 'text-amber-500' 
                          : 'text-emerald-500'
                    }`}>
                      {(schedule.current_participants || 0) >= schedule.capacity ? '満員' : `残り ${schedule.capacity - (schedule.current_participants || 0)} 名`}
                    </div>
                    {schedule.location && (
                      <span className="text-[10px] text-zinc-400 font-medium">{schedule.location}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Participant Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xl font-bold text-zinc-900">2. 参加者を選択</h4>
              {user && parentProfile && (!parentProfile.children || parentProfile.children.length === 0) && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold uppercase tracking-widest">お子様が登録されていません</span>
              )}
            </div>
            {user && parentProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={toggleParentSelection}
                  className={`p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                    bookingData.isParentAttending
                      ? 'border-brand-500 bg-brand-50/30 ring-4 ring-brand-500/5'
                      : 'border-zinc-100 hover:border-brand-200 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      bookingData.isParentAttending ? 'bg-brand-600 text-white' : 'bg-zinc-100 text-zinc-400'
                    }`}>
                      <UserIcon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-zinc-900">{parentProfile.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">保護者</p>
                    </div>
                  </div>
                  {bookingData.isParentAttending && (
                    <CheckCircle2 size={20} className="text-brand-600" />
                  )}
                </button>

                {parentProfile.children?.map(child => (
                  <button
                    key={child.id}
                    onClick={() => toggleChildSelection(child.id)}
                    className={`p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                      bookingData.selectedChildIds.includes(child.id)
                        ? 'border-brand-500 bg-brand-50/30 ring-4 ring-brand-500/5'
                        : 'border-zinc-100 hover:border-brand-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        bookingData.selectedChildIds.includes(child.id) ? 'bg-brand-600 text-white' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        <UserIcon size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-zinc-900">{child.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{child.birthday}</p>
                      </div>
                    </div>
                    {bookingData.selectedChildIds.includes(child.id) && (
                      <CheckCircle2 size={20} className="text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200 text-center">
                <p className="text-zinc-500 mb-6">ログインすると参加者を選択できます。</p>
                <button 
                  onClick={onLoginClick}
                  className="btn-secondary"
                >
                  ログイン / 新規登録
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-6">
            <h4 className="font-display text-xl font-bold text-zinc-900">3. その他・ご要望</h4>
            <textarea 
              value={bookingData.notes}
              onChange={(e) => onBookingDataChange({ ...bookingData, notes: e.target.value })}
              className="w-full p-6 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 h-32 resize-none transition-all"
              placeholder="アレルギーや配慮が必要な事項があれば入力してください"
            />
          </div>

          {/* Terms */}
          <div className="space-y-6">
            <h4 className="font-display text-xl font-bold text-zinc-900">4. 同意事項</h4>
            <label className="flex items-start gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 cursor-pointer hover:bg-zinc-100 transition-all group">
              <div className="pt-1">
                <input 
                  type="checkbox"
                  checked={bookingData.agreedToTerms}
                  onChange={(e) => onBookingDataChange({ ...bookingData, agreedToTerms: e.target.checked })}
                  className="w-5 h-5 text-brand-600 border-zinc-300 rounded-lg focus:ring-brand-500 transition-all"
                />
              </div>
              <span className="text-sm text-zinc-600 leading-relaxed">
                <button type="button" className="text-brand-600 font-bold hover:underline">利用規約</button>
                および
                <button type="button" className="text-brand-600 font-bold hover:underline">プライバシーポリシー</button>
                の内容を確認し、同意します。
              </span>
            </label>
          </div>

          {/* Summary */}
          <div className="bg-zinc-900 p-8 md:p-10 rounded-[2rem] text-white space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="flex justify-between text-sm text-zinc-400">
              <span className="font-bold uppercase tracking-widest">基本料金</span>
              <span className="font-mono">¥{(program.base_price * bookingData.selectedChildIds.length).toLocaleString()}</span>
            </div>
            {parentProfile?.membership_type === 'member' && bookingData.selectedChildIds.length > 0 && (
              <div className="flex justify-between text-sm text-brand-400">
                <span className="font-bold uppercase tracking-widest">会員割引 (10%)</span>
                <span className="font-mono">-¥{(program.base_price * bookingData.selectedChildIds.length * 0.1).toLocaleString()}</span>
              </div>
            )}
            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="font-display text-xl font-bold">お支払い合計</span>
              <span className="text-4xl font-display font-bold text-brand-400">
                ¥{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {user ? (
            <button 
              onClick={onConfirm}
              disabled={bookingData.selectedChildIds.length === 0 || !bookingData.agreedToTerms}
              className="w-full py-6 bg-brand-600 text-white rounded-[1.5rem] font-display text-xl font-bold shadow-2xl shadow-brand-500/30 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:grayscale disabled:shadow-none active:scale-[0.98]"
            >
              予約内容を確認する
            </button>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">予約を完了するにはログインが必要です</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={onLoginClick}
                  className="py-5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  ログイン
                </button>
                <button 
                  onClick={onRegisterClick}
                  className="py-5 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                >
                  <UserIcon size={18} />
                  新規登録
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
