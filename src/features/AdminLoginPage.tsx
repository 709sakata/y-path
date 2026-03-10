import * as React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function AdminLoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'admin' }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        if (isRegistering) {
          setIsRegistering(false);
          setError('登録が完了しました。ログインしてください。');
          return;
        }
        if (data.user.role !== 'admin') {
          setError('管理者権限が必要です');
          setIsLoading(false);
          return;
        }
        setTimeout(() => onLogin(data.user), 100);
      } else {
        setError(data.error || '失敗しました');
      }
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold">{isRegistering ? '管理者登録' : '管理者ログイン'}</h2>
          <p className="opacity-80 text-sm mt-2">ASOBO 管理システム</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className={`p-3 ${error.includes('完了') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} text-xs rounded-lg flex items-center gap-2`}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">メールアドレス</label>
            <input 
              type="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">パスワード</label>
            <input 
              type="password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isLoading ? '処理中...' : 'ログイン'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-[10px] text-slate-400">
              アカウントをお持ちでない場合は、システム管理者にお問い合わせください。
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
