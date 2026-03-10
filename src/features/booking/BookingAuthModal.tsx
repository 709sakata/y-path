import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, LogIn, User as UserIcon } from 'lucide-react';

interface BookingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string;
  loginForm: any;
  onLoginFormChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToRegister: () => void;
}

export function BookingAuthModal({
  isOpen,
  onClose,
  isLoading,
  error,
  loginForm,
  onLoginFormChange,
  onSubmit,
  onSwitchToRegister
}: BookingAuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <LogIn size={20} />
                </div>
                <h3 className="text-xl font-bold">ログイン</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">メールアドレス</label>
                  <input 
                    type="email" required
                    value={loginForm.email}
                    onChange={(e) => onLoginFormChange({ ...loginForm, email: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="example@mail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">パスワード</label>
                  <input 
                    type="password" required
                    value={loginForm.password}
                    onChange={(e) => onLoginFormChange({ ...loginForm, password: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'ログインする'
                )}
              </button>
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={onSwitchToRegister}
                  className="text-sm text-indigo-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                >
                  <UserIcon size={14} />
                  新規会員登録はこちら
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
