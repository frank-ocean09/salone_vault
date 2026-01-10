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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Folders</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="New Folder"
                >
                    <Plus className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            <div className="space-y-1">
                <button
                    onClick={() => onSelectFolder(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedFolderId === null
                        ? 'bg-primary-green/10 text-primary-green'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <FolderOpen className="h-5 w-5" />
                    <span className="font-medium">All Documents</span>
                </button>

                {folders.map(folder => (
                    <div key={folder.id} className="group relative">
                        {editingFolderId === folder.id ? (
                            <form
                                onSubmit={(e) => handleUpdateSubmit(e, folder.id)}
                                className="px-2 py-1"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => setEditingFolderId(null)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-green"
                                />
                            </form>
                        ) : (
                            <div
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${selectedFolderId === folder.id
                                    ? 'bg-primary-green/10 text-primary-green'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <button
                                    onClick={() => onSelectFolder(folder.id)}
                                    className="flex items-center gap-3 flex-1 text-left truncate"
                                >
                                    <Folder className={`h-5 w-5 ${selectedFolderId === folder.id ? 'text-primary-green' : 'text-gray-400'}`} />
                                    <span className="font-medium truncate">{folder.name}</span>
                                    {(folder as any).shared && (
                                        <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Shared</span>
                                    )}
                                </button>

                                <div className="hidden group-hover:flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingFolderId(folder.id);
                                            setEditName(folder.name);
                                        }}
                                        className="p-1 hover:text-blue-600"
                                        title="Rename"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            // Trigger share callback if provided
                                            if (typeof onShareFolder === 'function') {
                                                onShareFolder(folder.id);
                                            } else {
                                                alert('Sharing is not configured in this environment yet.');
                                            }
                                        }}
                                        className="p-1 hover:text-indigo-600"
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
                                        className="p-1 hover:text-red-600"
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
                    <form onSubmit={handleCreateSubmit} className="px-2 py-1">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onBlur={() => !newFolderName && setIsCreating(false)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-green"
                        />
                    </form>
                )}
            </div>
        </div>
    );
}
