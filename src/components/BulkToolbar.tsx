import React from 'react';
import { Button } from './Button';
import { CheckCircle, XCircle, Trash2, Move, Share2 } from 'lucide-react';

type Props = {
  selectedCount: number;
  selectAll: () => void;
  deselectAll: () => void;
  onOpenDelete: () => void;
  onOpenMove: () => void;
  onOpenShare: () => void;
};

export const BulkToolbar: React.FC<Props> = ({ selectedCount, selectAll, deselectAll, onOpenDelete, onOpenMove, onOpenShare }) => {
  return (
    <div className="w-full flex flex-wrap items-center justify-between bg-white dark:bg-brand-lighter-dark border border-white dark:border-white/5 rounded-[2rem] p-3 shadow-xl animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-6 px-3">
        <div className="text-xs font-black uppercase tracking-widest text-[#02353C] dark:text-brand-pale">{selectedCount} Selected</div>
        <div className="flex gap-4">
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3FD0C9] hover:text-[#3FD0C9]/80 transition-colors flex items-center gap-1.5" onClick={selectAll}>
            <CheckCircle size={14} strokeWidth={3} /> Select all
          </button>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/40 dark:text-white/40 hover:text-red-500 transition-colors flex items-center gap-1.5" onClick={deselectAll}>
            <XCircle size={14} strokeWidth={3} /> Deselect
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onOpenMove} className="flex items-center gap-2 rounded-xl text-[#02353C] dark:text-white hover:bg-[#3FD0C9]/10">
          <Move size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Move</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenShare} className="flex items-center gap-2 rounded-xl text-[#02353C] dark:text-white hover:bg-[#3FD0C9]/10">
          <Share2 size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={onOpenDelete} className="flex items-center gap-2 rounded-xl">
          <Trash2 size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
        </Button>
      </div>
    </div>
  );
};
