import React from 'react';
import type { Document, Folder } from '../lib/supabase';
import { CheckCircle, Eye, Trash2, Share2, Clock, FileText, Folder as FolderIcon } from 'lucide-react';

interface Props {
  documents: Document[];
  folders: Folder[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: () => void;
  onView: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onShare: (doc: Document) => void;
  searchQuery?: string;
  hideDelete?: boolean;
  hideShare?: boolean;
  emptyMessage?: string;
}

export const DocumentsTable: React.FC<Props> = ({
  documents,
  folders,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onView,
  onDelete,
  onShare,
  hideDelete = false,
  hideShare = false,
  emptyMessage = "No documents found"
}) => {
  const allFilteredIds = documents.map(d => d.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));

  const getFolderName = (folderId: string | null | undefined) => {
    if (!folderId) return 'Main Vault';
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Unknown Folder';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#449342]/10 dark:bg-[#449342]/20 text-[#449342] dark:text-[#58c455] border border-[#449342]/20 dark:border-[#449342]/30 transition-colors">
            <CheckCircle className="w-3 h-3 mr-1.5" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2EAF7D]/10 dark:bg-[#3FD0C9]/10 text-[#2EAF7D] dark:text-[#3FD0C9] border border-[#2EAF7D]/20 dark:border-[#3FD0C9]/20 transition-colors">
            <Clock className="w-3 h-3 mr-1.5" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/40 border border-gray-200 dark:border-white/10">
            Not Verified
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-4 w-10">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={selectedIds.length > 0 && selectedIds.length === documents.length}
                onChange={(e) => e.target.checked ? onSelectAll(documents.map(d => d.id)) : onDeselectAll()}
              />
            </th>
            <th className="px-6 py-4">Document Name</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Uploaded</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {documents.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    checked={selectedIds.includes(doc.id)}
                    onChange={() => onToggleSelect(doc.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg text-green-700">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 cursor-pointer hover:text-green-700 transition-colors" onClick={() => onView(doc)}>
                        {doc.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <FolderIcon size={10} />
                        {getFolderName(doc.folder_id)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{doc.type}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(doc.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onView(doc)}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    {!hideShare && (
                      <button
                        onClick={() => onShare(doc)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 size={16} />
                      </button>
                    )}
                    {!hideDelete && (
                      <button
                        onClick={() => onDelete(doc)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
