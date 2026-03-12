import * as React from 'react';
import { useState } from 'react';
import { ArrowLeft, X, AlertCircle, User, Baby, Plus, Trash2, Save } from 'lucide-react';
import { Parent } from '../types';

interface CustomerEditProps {
  customer: Parent;
  onBack: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CustomerEdit({ customer, onBack, onSubmit }: CustomerEditProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    membership_type: customer.membership_type,
    membership_status: customer.membership_status,
    children: customer.children?.map(c => ({ ...c })) || []
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setEditError('');
    try {
      await onSubmit(editForm);
    } catch (error: any) {
      setEditError(error.error || '更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const addChildToEdit = () => {
    setEditForm({
      ...editForm,
      children: [...editForm.children, { name: '', birthday: '', notes: '', is_active: true }]
    });
  };

  const removeChildFromEdit = (index: number) => {
    const newChildren = [...editForm.children];
    newChildren.splice(index, 1);
    setEditForm({ ...editForm, children: newChildren });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            type="button"
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
            title="詳細に戻る"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">顧客情報の編集</h2>
            <p className="text-slate-400 text-sm mt-1">{customer.name} 様の情報を修正しています</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        {editError && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            {editError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              基本情報
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">氏名</label>
                <input 
                  type="text" required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">メールアドレス</label>
                <input 
                  type="email" required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">電話番号</label>
                <input 
                  type="tel" required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">会員種別</label>
                <select 
                  value={editForm.membership_type}
                  onChange={(e) => setEditForm({ ...editForm, membership_type: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="general">一般会員</option>
                  <option value="member">プレミアム会員</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ステータス</label>
                <select 
                  value={editForm.membership_status}
                  onChange={(e) => setEditForm({ ...editForm, membership_status: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="active">有効</option>
                  <option value="withdrawn">退会</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Baby size={18} className="text-indigo-600" />
                お子様の情報
              </h4>
              <button 
                type="button" onClick={addChildToEdit}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"
              >
                <Plus size={16} />
                お子様を追加
              </button>
            </div>
            <div className="space-y-4">
              {editForm.children.map((child: any, index: number) => (
                <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                  <button 
                    type="button" onClick={() => removeChildFromEdit(index)}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">名前</label>
                      <input 
                        type="text" required
                        value={child.name}
                        onChange={(e) => {
                          const newChildren = [...editForm.children];
                          newChildren[index].name = e.target.value;
                          setEditForm({ ...editForm, children: newChildren });
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">生年月日</label>
                      <input 
                        type="date" required
                        value={child.birthday}
                        onChange={(e) => {
                          const newChildren = [...editForm.children];
                          newChildren[index].birthday = e.target.value;
                          setEditForm({ ...editForm, children: newChildren });
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {editForm.children.length === 0 && (
                <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                  <p className="text-slate-400 text-sm">お子様が登録されていません</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-slate-100">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            キャンセル
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                変更を保存する
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
