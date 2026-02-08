import React from 'react';
import { Folder, Share2, Edit2, Trash2, Clock, FileText, User } from 'lucide-react';
import type { Folder as FolderType } from '../lib/supabase';

interface FolderWithMeta extends FolderType {
    document_count?: number;
    last_updated?: string;
    permission_level?: string;
    is_shared?: boolean;
}

interface Props {
    folders: FolderWithMeta[];
    onSelect: (id: string) => void;
    onShare: (id: string) => void;
    onEdit: (id: string, name: string) => void;
    onDelete: (id: string, name: string) => void;
}

export const FolderGridView: React.FC<Props> = ({ folders, onSelect, onShare, onEdit, onDelete }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (folders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Folder className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No folders yet</h3>
                <p className="text-sm text-gray-500 max-w-xs text-center mt-1">
                    Create your first folder to start organizing your documents.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {folders.map((folder) => {
                const isOwner = !folder.is_shared;

                return (
                    <div
                        key={folder.id}
                        onClick={() => onSelect(folder.id)}
                        className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#2EAF7D]/30 transition-all cursor-pointer overflow-hidden flex flex-col"
                    >
                        {/* Header / Folder Icon */}
                        <div className="p-5 flex items-start justify-between">
                            <div className={`p-3 rounded-lg ${folder.is_shared ? 'bg-blue-50' : 'bg-green-50'}`}>
                                <Folder
                                    className={`h-8 w-8 ${folder.is_shared ? 'text-blue-600 fill-blue-100' : 'text-[#2EAF7D] fill-green-100'}`}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onShare(folder.id); }}
                                            className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-gray-400"
                                            title="Share"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(folder.id, folder.name); }}
                                            className="p-2 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors text-gray-400"
                                            title="Rename"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(folder.id, folder.name); }}
                                            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                                {!isOwner && (
                                    <div className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {folder.permission_level?.replace('_', ' ')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-5">
                            <h3 className="text-base font-bold text-slate-900 mb-1 truncate group-hover:text-[#2EAF7D] transition-colors">
                                {folder.name}
                            </h3>

                            <div className="space-y-2">
                                <div className="flex items-center text-xs text-slate-500 gap-2">
                                    <FileText size={14} className="text-gray-400" />
                                    <span>{folder.document_count || 0} Documents</span>
                                </div>

                                <div className="flex items-center text-xs text-slate-500 gap-2">
                                    <Clock size={14} className="text-gray-400" />
                                    <span>Updated: {formatDate(folder.last_updated)}</span>
                                </div>

                                {folder.is_shared && (
                                    <div className="flex items-center text-xs text-blue-600 gap-2 font-medium">
                                        <User size={14} className="text-blue-400" />
                                        <span>Shared Folder</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                                ID: {folder.id.split('-')[0]}...
                            </span>
                            <div className="w-2 h-2 rounded-full bg-[#2EAF7D]" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
