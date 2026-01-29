import { useState } from 'react';
import { Folder, Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import type { Folder as FolderType } from '../lib/supabase';

interface FolderListProps {
    folders: FolderType[];
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    onCreateFolder: (name: string, color: string) => void;
    onUpdateFolder: (folderId: string, name: string, color: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onShareFolder?: (folderId: string) => void;
}

export function FolderList({
    folders,
    selectedFolderId,
    onSelectFolder,
    onCreateFolder,
    onUpdateFolder,
    onDeleteFolder,
    onShareFolder
}: FolderListProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim(), 'blue');
            setNewFolderName('');
            setIsCreating(false);
        }
    };

    const handleUpdateSubmit = (e: React.FormEvent, folderId: string) => {
        e.preventDefault();
        if (editName.trim()) {
            onUpdateFolder(folderId, editName.trim(), 'blue');
            setEditingFolderId(null);
        }
    };

    return (
        <div className="bg-white/5 lg:bg-transparent rounded-2xl p-2 h-full">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">My Folders</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-all text-[#3FD0C9]"
                    title="New Folder"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-1.5">
                <button
                    onClick={() => onSelectFolder(null)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${selectedFolderId === null
                        ? 'bg-[#3FD0C9] text-white shadow-lg shadow-[#3FD0C9]/20 font-bold'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <FolderOpen className={`h-5 w-5 ${selectedFolderId === null ? 'text-white' : 'group-hover:text-[#3FD0C9] transition-colors'}`} />
                    <span className="text-sm">All Records</span>
                </button>

                {folders.map(folder => (
                    <div key={folder.id} className="group relative">
                        {editingFolderId === folder.id ? (
                            <form
                                onSubmit={(e) => handleUpdateSubmit(e, folder.id)}
                                className="px-2 py-2"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => setEditingFolderId(null)}
                                    className="w-full bg-[#02353C] text-white px-3 py-2 text-sm border border-white/10 rounded-xl focus:outline-none focus:border-[#3FD0C9] focus:ring-1 focus:ring-[#3FD0C9]"
                                />
                            </form>
                        ) : (
                            <div
                                className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all duration-300 group/item ${selectedFolderId === folder.id
                                    ? 'bg-[#3FD0C9] text-white shadow-lg shadow-[#3FD0C9]/20 font-bold'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <button
                                    onClick={() => onSelectFolder(folder.id)}
                                    className="flex items-center gap-3 flex-1 text-left truncate"
                                >
                                    <Folder className={`h-5 w-5 ${selectedFolderId === folder.id ? 'text-white' : 'group-hover:text-[#3FD0C9] transition-colors'}`} />
                                    <span className="text-sm truncate">{folder.name}</span>
                                    {(folder as any).shared && (
                                        <span className="ml-2 text-[8px] bg-[#2EAF7D]/20 text-[#2EAF7D] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">Shared</span>
                                    )}
                                </button>

                                <div className="flex opacity-0 group-hover/item:opacity-100 items-center gap-1 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingFolderId(folder.id);
                                            setEditName(folder.name);
                                        }}
                                        className="p-1.5 hover:text-[#3FD0C9] hover:bg-white/10 rounded-lg"
                                        title="Rename"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (typeof onShareFolder === 'function') {
                                                onShareFolder(folder.id);
                                            }
                                        }}
                                        className="p-1.5 hover:text-[#2EAF7D] hover:bg-white/10 rounded-lg"
                                        title="Share Folder"
                                    >
                                        <FolderOpen className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete folder "${folder.name}"? Documents inside will be moved to "All Documents".`)) {
                                                onDeleteFolder(folder.id);
                                            }
                                        }}
                                        className="p-1.5 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isCreating && (
                    <form onSubmit={handleCreateSubmit} className="px-2 py-2">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onBlur={() => !newFolderName && setIsCreating(false)}
                            className="w-full bg-[#02353C] text-white px-3 py-2 text-sm border border-white/10 rounded-xl focus:outline-none focus:border-[#3FD0C9] focus:ring-1 focus:ring-[#3FD0C9]"
                        />
                    </form>
                )}
            </div>
        </div>
    );
}
