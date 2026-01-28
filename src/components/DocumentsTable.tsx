import React from 'react';
import type { Document } from '../lib/supabase';
import { CheckCircle, Eye, Trash2, Share2 } from 'lucide-react';

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

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No documents found</div>
        ) : (
          filtered.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-[#3FD0C9] focus:ring-[#3FD0C9]"
                    checked={selectedIds.includes(doc.id)}
                    onChange={() => onToggleSelect(doc.id)}
                  />
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="h-6 w-6 text-[#02353C]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7v10a2 2 0 0 0 2 2h14" /></svg>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onView(doc)} className="p-2 text-gray-400 hover:text-[#3FD0C9]">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button onClick={() => onShare(doc)} className="p-2 text-gray-400 hover:text-[#3FD0C9]">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(doc)} className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div onClick={() => onView(doc)} className="cursor-pointer">
                <h3 className="font-medium text-gray-900 mb-1">{doc.name}</h3>
                <div className="text-xs text-gray-500 font-mono mb-2 truncate">{doc.hash}</div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">{doc.type}</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'verified' ? 'bg-[#CFF4D2] text-[#02353C]' : 'bg-yellow-100 text-yellow-800'}`}>
                    {doc.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {doc.status === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  onChange={(e) => (e.target.checked ? onSelectAll(allFilteredIds) : onDeselectAll())}
                  checked={allSelected}
                  aria-label="Select all documents"
                />
              </th>
              <th className="px-6 py-4 font-medium">Document Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Date Uploaded</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center" colSpan={6}>
                  <div className="text-gray-600">No documents yet</div>
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedIds.includes(doc.id)}
                      onChange={() => onToggleSelect(doc.id)}
                      aria-label={`Select ${doc.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-[#02353C]">
                        <svg className="h-5 w-5 text-[#02353C]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7v10a2 2 0 0 0 2 2h14" /></svg>
                      </div>
                      <div>
                        <button onClick={() => onView(doc)} className="font-medium text-gray-900 hover:underline text-left">
                          {doc.name}
                        </button>
                        <p className="text-xs text-gray-500 font-mono">{doc.hash}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {doc.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {doc.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onView(doc)} className="p-2 text-gray-400 hover:text-[#3FD0C9] transition-colors" title="View Document">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onShare(doc)} className="p-2 text-gray-400 hover:text-[#3FD0C9] transition-colors" title="Share Document">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(doc)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Document">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
