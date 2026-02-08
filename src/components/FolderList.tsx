import { useState } from 'react';
import { Folder, Plus, Edit2, Trash2, Share2, ChevronDown, ChevronRight } from 'lucide-react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);

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
        <div className="bg-white rounded-lg p-4 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-2 text-lg font-bold text-gray-800 hover:text-gray-600 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    Folders
                </button>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-gray-700"
                    title="New Folder"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {!isCollapsed && (
                <div className="space-y-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                    <button
                        onClick={() => onSelectFolder(null)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${selectedFolderId === null
                            ? 'bg-green-50 text-green-700'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Folder className={`h-5 w-5 ${selectedFolderId === null ? 'fill-green-200 text-green-600' : 'text-gray-400'}`} />
                        All Documents
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
                                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-green-500"
                                    />
                                </form>
                            ) : (
                                <div
                                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all group/item ${selectedFolderId === folder.id
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <button
                                        onClick={() => onSelectFolder(folder.id)}
                                        className="flex items-center gap-3 flex-1 text-left truncate"
                                    >
                                        <Folder className={`h-5 w-5 ${selectedFolderId === folder.id ? 'fill-green-200 text-green-600' : 'text-gray-400'}`} />
                                        <span className="text-sm font-medium truncate">{folder.name}</span>
                                    </button>

                                    <div className="flex opacity-0 group-hover/item:opacity-100 items-center gap-1 transition-opacity">
                                        {onShareFolder && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onShareFolder(folder.id);
                                                }}
                                                className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Share Folder"
                                            >
                                                <Share2 className="h-3 w-3" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingFolderId(folder.id);
                                                setEditName(folder.name);
                                            }}
                                            className="p-1 hover:text-green-600 hover:bg-green-50 rounded"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Delete folder "${folder.name}"? Documents inside will be moved to "All Documents".`)) {
                                                    onDeleteFolder(folder.id);
                                                }
                                            }}
                                            className="p-1 hover:text-red-500 hover:bg-red-50 rounded"
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
                                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-green-500"
                            />
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
