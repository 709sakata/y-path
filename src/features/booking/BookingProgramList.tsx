import * as React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronRight, Building2, Filter } from 'lucide-react';
import { Program as AppProgram } from '../../types';

interface BookingProgramListProps {
  programs: AppProgram[];
  onSelect: (program: AppProgram) => void;
}

export function BookingProgramList({ programs, onSelect }: BookingProgramListProps) {
  const [selectedOrg, setSelectedOrg] = React.useState<string>('all');

  const organizations = Array.from(new Set(programs.map(p => p.organization_id || 'unknown'))).map(id => {
    return {
      id,
      name: programs.find(p => (p.organization_id || 'unknown') === id)?.organization_name || '不明な団体'
    };
  });

  const filteredPrograms = programs.filter(p => {
    const isOrgMatch = selectedOrg === 'all' || p.organization_id === selectedOrg;
    return p.status === 'active' && isOrgMatch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="text-center py-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-24 h-24 bg-brand-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-500/30"
        >
          <Sparkles size={48} />
        </motion.div>
        <h2 className="section-title text-5xl md:text-6xl mb-4">プログラム予約</h2>
        <p className="text-zinc-500 text-lg max-w-lg mx-auto leading-relaxed">
          日常を彩る、特別な体験を。<br />
          会員の方はすべてのプログラムが10%OFFでご利用いただけます。
        </p>
      </div>

      {/* Organization Filter */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <div key="filter-label" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-400 uppercase tracking-widest">
          <Filter size={14} />
          団体で絞り込む
        </div>
        <button
          key="filter-all"
          onClick={() => setSelectedOrg('all')}
          className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
            selectedOrg === 'all' 
              ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200' 
              : 'bg-white text-zinc-500 border border-zinc-200 hover:border-brand-500'
          }`}
        >
          すべて
        </button>
        {organizations.map(org => (
          <button
            key={`filter-org-${org.id}`}
            onClick={() => setSelectedOrg(org.id)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              selectedOrg === org.id 
                ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200' 
                : 'bg-white text-zinc-500 border border-zinc-200 hover:border-brand-500'
            }`}
          >
            {org.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPrograms.map(program => (
          <motion.button
            key={program.id}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            disabled={program.status === 'completed'}
            onClick={() => onSelect(program)}
            className={`bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm text-left transition-all group relative overflow-hidden ${
              program.status === 'completed' ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                  program.category === 'regular' ? 'bg-indigo-50 text-indigo-600' : 'bg-brand-50 text-brand-600'
                }`}>
                  {program.category === 'regular' ? '通常' : '特別'}
                </span>
                {program.status === 'completed' && (
                  <span className="text-[10px] font-bold px-3 py-1 bg-zinc-100 text-zinc-500 rounded-full uppercase tracking-widest">受付終了</span>
                )}
              </div>
              {program.status !== 'completed' && (
                program.schedules?.every(s => (s.current_participants || 0) >= s.capacity) ? (
                  <span className="text-[10px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-full uppercase tracking-widest">満員</span>
                ) : program.schedules?.some(s => (s.current_participants || 0) >= s.capacity * 0.8) ? (
                  <span className="text-[10px] font-bold px-3 py-1 bg-amber-50 text-amber-600 rounded-full uppercase tracking-widest">残りわずか</span>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                    <ChevronRight size={18} />
                  </div>
                )
              )}
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-brand-600 font-bold mb-2 uppercase tracking-widest">
              <Building2 size={12} />
              {program.organization_name}
            </div>
            
            <h3 className="font-display font-bold text-zinc-900 text-2xl mb-3 group-hover:text-brand-600 transition-colors">{program.title}</h3>
            <p className="text-zinc-500 text-sm mb-8 line-clamp-2 leading-relaxed">{program.description}</p>
            
            <div className="mt-auto pt-6 border-t border-zinc-100 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">お一人様あたり</span>
                <span className="font-display font-bold text-zinc-900 text-2xl">¥{program.base_price.toLocaleString()}</span>
              </div>
              <div className="btn-primary !py-2 !px-6 text-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                予約する
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
