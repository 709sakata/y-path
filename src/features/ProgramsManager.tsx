import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Program as AppProgram, User as AppUser } from '../types';
import { api as appApi } from '../services/api';
import { ProgramList } from './ProgramList';
import { ProgramDetail } from './ProgramDetail';
import { ProgramForm } from './ProgramForm';

interface ProgramsManagerProps {
  user: AppUser | null;
  programs: AppProgram[];
  onRefresh: () => void;
  onUnauthorized?: () => void;
}

export function ProgramsManager({ user, programs, onRefresh, onUnauthorized }: ProgramsManagerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedProgram, setSelectedProgram] = useState<AppProgram | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  const handleOpenForm = (program?: AppProgram) => {
    if (program) {
      setEditingProgramId(program.id);
      setSelectedProgram(program);
    } else {
      setEditingProgramId(null);
      setSelectedProgram(null);
    }
    setViewMode('form');
  };

  const handleSubmit = async (formData: any) => {
    if (!confirm(editingProgramId ? '変更を保存しますか？' : '新しいプログラムを作成しますか？')) return;
    
    try {
      if (editingProgramId) {
        await appApi.programs.update(editingProgramId, formData);
      } else {
        await appApi.programs.create(formData);
      }
      
      setViewMode('list');
      setSelectedProgram(null);
      onRefresh();
    } catch (error: any) {
      if (error.error === 'Unauthorized' && onUnauthorized) {
        onUnauthorized();
      } else {
        alert(`プログラムの保存に失敗しました: ${error.error || 'サーバーエラー'}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このプログラムを削除（非表示）にしますか？')) return;
    try {
      await appApi.programs.delete(id);
      if (selectedProgram?.id === id) {
        setSelectedProgram(null);
        setViewMode('list');
      }
      onRefresh();
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ProgramList 
              programs={programs}
              onSelect={(p) => {
                setSelectedProgram(p);
                setViewMode('detail');
              }}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
              onAddNew={() => handleOpenForm()}
            />
          </motion.div>
        ) : viewMode === 'detail' && selectedProgram ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ProgramDetail 
              program={selectedProgram}
              onClose={() => {
                setSelectedProgram(null);
                setViewMode('list');
              }}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
            />
          </motion.div>
        ) : viewMode === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProgramForm 
              user={user}
              editingProgramId={editingProgramId}
              selectedProgram={selectedProgram}
              onClose={() => setViewMode(selectedProgram ? 'detail' : 'list')}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
