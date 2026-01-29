import React from 'react';
import type { Document } from '../lib/supabase';
import { CheckCircle, Eye, Trash2, Share2, Clock, FileText } from 'lucide-react';

interface Props {
  documents: Document[];
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
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onView,
  onDelete,
  onShare,
  searchQuery = ''
}) => {
  // derive filtered list
  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allFilteredIds = filtered.map(d => d.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#449342]/10 text-[#449342] border border-[#449342]/20">
            <CheckCircle className="w-3 h-3 mr-1.5" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#2EAF7D]/10 text-[#2EAF7D] border border-[#2EAF7D]/20">
            <Clock className="w-3 h-3 mr-1.5" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
            Not Verified
          </span>
        );
    }
  };

  return (
    <>
      {/* Mobile & Grid Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-white uppercase tracking-widest text-xs font-bold text-gray-400">
            No documents found
          </div>
        ) : (
          filtered.map((doc) => (
            <div key={doc.id} className="group bg-white p-6 rounded-[2rem] border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full relative overflow-hidden">
              {/* Subtle background icon */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <FileText size={120} />
              </div>

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded-lg border-gray-200 text-[#3FD0C9] focus:ring-[#3FD0C9] transition-all cursor-pointer"
                      checked={selectedIds.includes(doc.id)}
                      onChange={() => onToggleSelect(doc.id)}
                    />
                  </div>
                  <div className="p-3 bg-[#C1F6ED]/30 rounded-2xl text-[#02353C] group-hover:bg-[#3FD0C9] group-hover:text-white transition-colors duration-300">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onView(doc)} className="p-2 text-gray-400 hover:text-[#3FD0C9] hover:bg-[#3FD0C9]/10 rounded-xl transition-all" title="Quick View">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button onClick={() => onShare(doc)} className="p-2 text-gray-400 hover:text-[#3FD0C9] hover:bg-[#3FD0C9]/10 rounded-xl transition-all" title="Share Document">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(doc)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Document">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div onClick={() => onView(doc)} className="cursor-pointer flex-1 relative z-10">
                <h3 className="font-bold text-[#02353C] text-lg mb-1 group-hover:text-[#3FD0C9] transition-colors truncate">
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-500 font-mono tracking-tighter uppercase font-bold">
                    Hash: {doc.hash.slice(0, 12)}...
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">{doc.type}</span>
                    {getStatusBadge(doc.status)}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
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
