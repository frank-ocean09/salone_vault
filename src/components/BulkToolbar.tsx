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
    <div className="w-full flex items-center justify-between bg-white border rounded p-2 shadow-sm mb-4">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">{selectedCount} selected</div>
        <div className="flex gap-2">
          <button className="text-sm text-blue-600 hover:underline flex items-center gap-1" onClick={selectAll}>
            <CheckCircle size={16} /> Select all
          </button>
          <button className="text-sm text-gray-600 hover:underline flex items-center gap-1" onClick={deselectAll}>
            <XCircle size={16} /> Deselect
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onOpenMove} className="flex items-center gap-2">
          <Move size={16} /> Move
        </Button>
        <Button variant="ghost" onClick={onOpenShare} className="flex items-center gap-2">
          <Share2 size={16} /> Share
        </Button>
        <Button variant="destructive" onClick={onOpenDelete} className="flex items-center gap-2">
          <Trash2 size={16} /> Delete
        </Button>
      </div>
    </div>
  );
};
