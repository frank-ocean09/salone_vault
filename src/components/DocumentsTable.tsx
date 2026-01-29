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
  onShare
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white/30 dark:bg-brand-lighter-dark/30 backdrop-blur-sm rounded-[3rem] border border-white/50 dark:border-white/5 uppercase tracking-[0.3em] text-[10px] font-black text-gray-400 dark:text-white/20">
            No documents found in this section
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="group bg-white dark:bg-brand-lighter-dark p-6 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
              {/* Subtle background icon */}
              <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 rotate-12 group-hover:rotate-0">
                <FileText size={160} />
              </div>

              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="h-6 w-6 rounded-xl border-gray-200 text-[#3FD0C9] focus:ring-[#3FD0C9] transition-all cursor-pointer"
                      checked={selectedIds.includes(doc.id)}
                      onChange={() => onToggleSelect(doc.id)}
                    />
                  </div>
                  <div className="p-4 bg-[#C1F6ED]/20 dark:bg-white/5 rounded-2xl text-[#02353C] dark:text-brand-pale group-hover:bg-[#02353C] group-hover:dark:bg-brand-teal group-hover:text-white transition-all duration-300">
                    <FileText className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => onView(doc)} className="p-2.5 text-gray-400 hover:text-[#3FD0C9] hover:bg-[#3FD0C9]/10 rounded-xl transition-all" title="Quick View">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button onClick={() => onShare(doc)} className="p-2.5 text-gray-400 hover:text-[#3FD0C9] hover:bg-[#3FD0C9]/10 rounded-xl transition-all" title="Share Document">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(doc)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Document">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div onClick={() => onView(doc)} className="cursor-pointer flex-1 relative z-10 flex flex-col">
                <h3 className="font-black text-[#02353C] dark:text-brand-pale text-xl mb-1 group-hover:text-[#3FD0C9] transition-colors truncate tracking-tight">
                  {doc.name}
                </h3>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                    <FolderIcon size={10} className="text-gray-400 dark:text-white/40" />
                    <span className="text-[10px] text-gray-500 dark:text-white/40 font-bold uppercase tracking-wider">
                      {getFolderName(doc.folder_id)}
                    </span>
                  </div>
                  <span className="text-[10px] bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-white/5 text-gray-400 dark:text-white/40 font-mono tracking-tighter uppercase font-bold">
                    ID: {doc.hash.slice(0, 8)}
                  </span>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/30 dark:text-white/20">{doc.type}</span>
                    {getStatusBadge(doc.status)}
                  </div>

                  <div className="flex items-center gap-2 text-gray-300 dark:text-white/20">
                    <Clock size={12} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Uploaded {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
