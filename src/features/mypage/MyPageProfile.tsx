import * as React from 'react';
import { User as UserIcon, Baby } from 'lucide-react';
import { Parent as AppParent } from '../../types';

interface MyPageProfileProps {
  parentProfile: AppParent;
}

export function MyPageProfile({ parentProfile }: MyPageProfileProps) {
  return (
    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
        <UserIcon size={48} />
      </div>
      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <h2 className="text-3xl font-bold text-slate-800">{parentProfile.name} 様</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            parentProfile.membership_type === 'member' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {parentProfile.membership_type === 'member' ? 'プレミアム会員' : '一般会員'}
          </span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            parentProfile.membership_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {parentProfile.membership_status === 'active' ? '入会中' : '退会済'}
          </span>
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
          {parentProfile.children?.map(child => (
            <div key={child.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600">
              <Baby size={14} className="text-indigo-400" />
              <span className="font-bold">{child.name}</span>
              <span className="opacity-60">({child.birthday})</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">メールアドレス</span>
            <span className="text-sm font-bold text-slate-800">{parentProfile.email}</span>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">電話番号</span>
            <span className="text-sm font-bold text-slate-800">{parentProfile.phone}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
