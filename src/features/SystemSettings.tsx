import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Building2, Shield, Search, Trash2, Edit2, AlertCircle, ArrowLeft, Settings, Plus, X, Download } from 'lucide-react';
import { api } from '../services/api';
import { User, Organization } from '../types';
import { DataImport } from './admin/DataImport';

interface SystemUser {
  id: string;
  email: string;
  role: string;
  name: string;
  organization_id: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

interface SystemSettingsProps {
  onBack: () => void;
}

export function SystemSettings({ onBack }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'organizations' | 'import'>('users');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Org Modal State
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await api.organizations.list();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'organizations') {
      fetchOrganizations();
    }
  }, [activeTab]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`このユーザーの権限を「${newRole === 'admin' ? '管理者' : '一般ユーザー'}」に変更しますか？`)) {
      return;
    }
    
    try {
      await api.users.updateRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('権限を更新しました');
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('権限の更新に失敗しました');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('本当にこのユーザーを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await api.users.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('ユーザーを削除しました');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('ユーザーの削除に失敗しました');
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    try {
      const data = await api.organizations.create({ name: newOrgName, description: newOrgDesc });
      setOrganizations([...organizations, data]);
      setShowOrgModal(false);
      setNewOrgName('');
      setNewOrgDesc('');
      alert('団体を作成しました');
    } catch (error) {
      console.error('Failed to create organization:', error);
      alert('団体の作成に失敗しました');
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!window.confirm('本当にこの団体を削除しますか？関連するデータが削除される可能性があります。')) {
      return;
    }
    try {
      await api.organizations.delete(id);
      setOrganizations(organizations.filter(o => o.id !== id));
      alert('団体を削除しました');
    } catch (error) {
      console.error('Failed to delete organization:', error);
      alert('団体の削除に失敗しました');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Custom Header for Settings */}
      <header className="h-20 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-zinc-900 leading-tight">システム設定</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Settings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-zinc-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === 'users' 
                  ? 'border-zinc-900 text-zinc-900' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                ユーザー管理
              </div>
            </button>
            <button
              onClick={() => setActiveTab('organizations')}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === 'organizations' 
                  ? 'border-zinc-900 text-zinc-900' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 size={18} />
                団体管理
              </div>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === 'import' 
                  ? 'border-zinc-900 text-zinc-900' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Download size={18} />
                データインポート
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            {activeTab === 'users' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="メールアドレスや名前で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-zinc-500">読み込み中...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 text-zinc-500">
                          <th className="pb-3 font-medium">ユーザー</th>
                          <th className="pb-3 font-medium">権限</th>
                          <th className="pb-3 font-medium">登録日</th>
                          <th className="pb-3 font-medium">最終ログイン</th>
                          <th className="pb-3 font-medium text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="group hover:bg-zinc-50/50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold">
                                  {user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-900">{user.name || '名前未設定'}</p>
                                  <p className="text-xs text-zinc-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none transition-all ${
                                  user.role === 'admin' 
                                    ? 'bg-zinc-900 text-white border-zinc-900 focus:ring-2 focus:ring-zinc-500/20' 
                                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 focus:ring-2 focus:ring-zinc-500/20'
                                }`}
                              >
                                <option value="customer">一般ユーザー</option>
                                <option value="admin">管理者</option>
                              </select>
                            </td>
                            <td className="py-4 text-zinc-500">
                              {new Date(user.created_at).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="py-4 text-zinc-500">
                              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ja-JP') : '未ログイン'}
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="ユーザーを削除"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12 text-zinc-500">
                        ユーザーが見つかりません
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'organizations' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="団体名で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 outline-none transition-all text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => setShowOrgModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white font-bold text-sm rounded-xl hover:bg-zinc-800 transition-all"
                  >
                    <Plus size={18} />
                    新規団体作成
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-zinc-500">読み込み中...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 text-zinc-500">
                          <th className="pb-3 font-medium">団体名</th>
                          <th className="pb-3 font-medium">説明</th>
                          <th className="pb-3 font-medium">登録日</th>
                          <th className="pb-3 font-medium text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {filteredOrgs.map(org => (
                          <tr key={org.id} className="group hover:bg-zinc-50/50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold border border-zinc-200">
                                  <Building2 size={18} />
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-900">{org.name}</p>
                                  <p className="text-xs text-zinc-500 font-mono">{org.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-zinc-600 max-w-xs truncate">
                              {org.description || '-'}
                            </td>
                            <td className="py-4 text-zinc-500">
                              {org.created_at ? new Date(org.created_at).toLocaleDateString('ja-JP') : '-'}
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => handleDeleteOrg(org.id)}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="団体を削除"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrgs.length === 0 && (
                      <div className="text-center py-12 text-zinc-500">
                        団体が見つかりません
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'import' && (
              <DataImport />
            )}
          </div>
        </div>
      </main>

      {/* Create Organization Modal */}
      <AnimatePresence>
        {showOrgModal && (
          <>
            <div 
              className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowOrgModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-zinc-900">新規団体作成</h3>
                <button 
                  onClick={() => setShowOrgModal(false)}
                  className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">団体名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 outline-none transition-all"
                    placeholder="例: 株式会社ASOBO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">説明 (任意)</label>
                  <textarea
                    value={newOrgDesc}
                    onChange={(e) => setNewOrgDesc(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 outline-none transition-all resize-none"
                    placeholder="団体の説明を入力..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowOrgModal(false)}
                  className="px-6 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateOrg}
                  disabled={!newOrgName.trim()}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  作成する
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
