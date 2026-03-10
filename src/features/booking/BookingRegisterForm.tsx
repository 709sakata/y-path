import * as React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, User as UserIcon, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface BookingRegisterFormProps {
  isLoading: boolean;
  error: string;
  registerForm: any;
  onRegisterFormChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export function BookingRegisterForm({
  isLoading,
  error,
  registerForm,
  onRegisterFormChange,
  onSubmit,
  onBack,
  onSwitchToLogin
}: BookingRegisterFormProps) {
  const addChild = () => {
    onRegisterFormChange({
      ...registerForm,
      children: [...registerForm.children, { name: '', birthday: '', notes: '' }]
    });
  };

  const removeChild = (index: number) => {
    const newChildren = [...registerForm.children];
    newChildren.splice(index, 1);
    onRegisterFormChange({ ...registerForm, children: newChildren });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <button 
        onClick={onBack}
        className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold"
      >
        <ChevronRight size={16} className="rotate-180" />
        予約内容の入力に戻る
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <h3 className="text-2xl font-bold">新規会員登録</h3>
          <p className="opacity-80 text-sm mt-1">必要事項を入力して登録してください</p>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">保護者氏名</label>
              <input 
                type="text" required
                value={registerForm.parentName}
                onChange={(e) => onRegisterFormChange({ ...registerForm, parentName: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">電話番号</label>
              <input 
                type="tel" required
                value={registerForm.phone}
                onChange={(e) => onRegisterFormChange({ ...registerForm, phone: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="090-0000-0000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">メールアドレス</label>
              <input 
                type="email" required
                value={registerForm.email}
                onChange={(e) => onRegisterFormChange({ ...registerForm, email: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">パスワード</label>
              <input 
                type="password" required
                value={registerForm.password}
                onChange={(e) => onRegisterFormChange({ ...registerForm, password: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="6文字以上"
              />
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800">お子様の情報</h4>
              <button 
                type="button" onClick={addChild}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"
              >
                <Plus size={16} />
                お子様を追加
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {registerForm.children.map((child: any, index: number) => (
                <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                  <button 
                    type="button" onClick={() => removeChild(index)}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">名前</label>
                      <input 
                        type="text" required
                        value={child.name}
                        onChange={(e) => {
                          const newChildren = [...registerForm.children];
                          newChildren[index].name = e.target.value;
                          onRegisterFormChange({ ...registerForm, children: newChildren });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                        placeholder="山田 花子"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">生年月日</label>
                      <input 
                        type="date" required
                        value={child.birthday}
                        onChange={(e) => {
                          const newChildren = [...registerForm.children];
                          newChildren[index].birthday = e.target.value;
                          onRegisterFormChange({ ...registerForm, children: newChildren });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {registerForm.children.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">お子様を1人以上登録してください</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || registerForm.children.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '登録して予約を続ける'
            )}
          </button>
          
          <div className="text-center">
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-indigo-600 font-bold hover:underline"
            >
              既にアカウントをお持ちの方はこちら（ログイン）
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
