import React from 'react';
import { Button } from './Button';
import { Clipboard, Trash2, RefreshCw } from 'lucide-react';

type Props = {
  documents: any[];
  selectedIds: string[];
  clearSelection: () => void;
  onRevalidate: () => Promise<void>;
  onDeleteSelected?: () => Promise<void>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export const DebugPanel: React.FC<Props> = ({ documents, selectedIds, clearSelection, onRevalidate, onDeleteSelected, showToast }) => {
  const handleExport = () => {
    const payload = JSON.stringify({ documents, selectedIds }, null, 2);
    navigator.clipboard.writeText(payload).then(() => {
      showToast?.('State copied to clipboard', 'info');
    }).catch(() => {
      showToast?.('Failed to copy to clipboard', 'error');
    });
  };

  const handleDeleteSelected = async () => {
    if (!onDeleteSelected) return;
    try {
      await onDeleteSelected();
      showToast?.('Delete action executed', 'success');
    } catch (err) {
      console.error('Debug delete failed', err);
      showToast?.('Delete action failed', 'error');
    }
  };

  return (
    <div className="fixed left-4 bottom-4 z-50 w-80 bg-white border rounded-lg shadow-lg p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">Debug Panel</div>
        <div className="text-xs text-gray-500">dev only</div>
      </div>

      <div className="mb-2">Documents: <span className="font-semibold">{documents.length}</span></div>
      <div className="mb-3">Selected: <span className="font-semibold">{selectedIds.length}</span></div>

      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => { clearSelection(); showToast?.('Selection cleared', 'info'); }}>
          <Clipboard size={14} /> Clear Selection
        </Button>
        <Button variant="ghost" onClick={() => onRevalidate()}>
          <RefreshCw size={14} /> Revalidate
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExport}><Clipboard size={14} /> Export</Button>
        <Button variant="destructive" onClick={handleDeleteSelected}><Trash2 size={14} /> Delete Selected</Button>
      </div>
    </div>
  );
};
