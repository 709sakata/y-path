import * as React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface BookingSuccessStepProps {
  onViewMyPage: () => void;
  onBookAnother: () => void;
}

export function BookingSuccessStep({ onViewMyPage, onBookAnother }: BookingSuccessStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center space-y-8 py-12"
    >
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
        <CheckCircle2 size={48} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">予約が完了しました！</h2>
        <p className="text-slate-500">
          ご予約ありがとうございます。内容の確認はマイページからいつでも行えます。
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button 
          onClick={onViewMyPage}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          マイページで確認する
        </button>
        <button 
          onClick={onBookAnother}
          className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          他のプログラムを予約する
        </button>
      </div>
    </motion.div>
  );
}
