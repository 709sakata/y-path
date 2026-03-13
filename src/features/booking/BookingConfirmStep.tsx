import * as React from 'react';
import { motion } from 'motion/react';
import { Program as AppProgram, Parent as AppParent } from '../../types';
import { MEMBERSHIP_TYPE } from '../../constants';

interface BookingConfirmStepProps {
  program: AppProgram;
  parentProfile: AppParent | null;
  selectedScheduleId: string;
  bookingData: {
    selectedChildIds: string[];
    isParentAttending: boolean;
    notes: string;
  };
  onBack: () => void;
  onConfirm: () => void;
}

export function BookingConfirmStep({
  program,
  parentProfile,
  selectedScheduleId,
  bookingData,
  onBack,
  onConfirm
}: BookingConfirmStepProps) {
  const schedule = program.schedules?.find(s => s.id === selectedScheduleId);
  const participantCount = bookingData.selectedChildIds.length + (bookingData.isParentAttending ? 1 : 0);
  
  const calculateTotalPrice = () => {
    let total = 0;
    const participantCount = bookingData.selectedChildIds.length + (bookingData.isParentAttending ? 1 : 0);
    if (participantCount === 0) return 0;

    const isMember = parentProfile?.parent_organizations?.some(
      org => org.organization_id === program.organization_id && org.membership_type === 'member'
    );

    // Find the best pricing tier
    let pricePerPerson = 0;
    if (program.pricing && program.pricing.length > 0) {
      // Try to find a member price if they are a member
      const memberPricing = isMember ? program.pricing.find(p => p.tier_label.includes('会員')) : null;
      if (memberPricing) {
        pricePerPerson = memberPricing.amount;
      } else {
        // Default to the first pricing tier
        pricePerPerson = program.pricing[0].amount;
      }
    }

    return pricePerPerson * participantCount;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-100">
          <h3 className="text-2xl font-bold text-slate-800">予約の最終確認</h3>
          <p className="text-slate-500 text-sm mt-1">以下の内容で予約を確定しますか？</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">プログラム</span>
              <span className="text-slate-800 font-bold">{program.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">日時</span>
              <span className="text-slate-800 font-bold">
                {schedule?.start_date ? new Date(schedule.start_date).toLocaleDateString() : ''} {schedule?.schedule_locations?.[0]?.meeting_time || ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">参加人数</span>
              <span className="text-slate-800 font-bold">{participantCount}名</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 text-sm">参加者</span>
              <div className="flex flex-wrap gap-2">
                {bookingData.isParentAttending && (
                  <span className="px-2 py-1 bg-indigo-50 rounded-lg text-xs font-bold text-indigo-700 border border-indigo-100">
                    {parentProfile?.name} (保護者)
                  </span>
                )}
                {bookingData.selectedChildIds.map(id => (
                  <span key={id} className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                    {parentProfile?.children?.find(c => c.id === id)?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="py-4 border-y border-slate-100 flex justify-between items-center">
            <span className="font-bold text-slate-800">お支払い合計</span>
            <span className="text-2xl font-bold text-indigo-600">
              ¥{totalPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onBack}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              戻る
            </button>
            <button 
              onClick={onConfirm}
              className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              予約を確定する
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
