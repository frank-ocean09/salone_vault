import React, { useEffect, useState } from 'react';
import { Plus, Users, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { getSharedAlbumsForUser, createSharedAlbum, getSharedAlbumMembers, inviteToSharedAlbum } from '../lib/api';

type Props = {
  userId: string;
  onOpenShareFolder: (folderId: string) => void;
  onSelectAlbum: (album: any) => void;
  albums: { owned: any[]; shared: any[] };
  onUpdate: () => void;
};

export const SharedAlbumsSidebar: React.FC<Props> = ({ userId, onOpenShareFolder, onSelectAlbum, albums, onUpdate }) => {
  // Use derived state or just props. If we need local mutation (optimistic), we can use state initialized from props, 
  // but it's better to rely on parent re-fetching or passing updated data.
  // For simplicity, let's use the props directly for rendering.

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAlbumMembers, setSelectedAlbumMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError('Please enter an album name');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await createSharedAlbum(userId, null, trimmedName);
      setNewName('');
      onUpdate(); // Trigger parent refresh
    } catch (err: any) {
      console.error('Failed to create album:', err);
      setError(err.message || 'Failed to create album');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectAlbum = async (album: any) => {
    onSelectAlbum(album);
    try {
      const members = await getSharedAlbumMembers(album.id);
      setSelectedAlbumMembers(members || []);
    } catch (err) {
      console.warn('Failed to load members', err);
    }
  };

  const handleInvite = async (albumId: string) => {
    if (!inviteEmail.trim()) return;
    try {
      const invited = await inviteToSharedAlbum(albumId, inviteEmail.trim());
      setSelectedAlbumMembers(prev => [...prev, invited]);
      setInviteEmail('');
    } catch (err: any) {
      setError(err.message || 'Invite failed');
    }
  };

  const renderAlbumList = (list: any[], title: string) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{title}</h3>
      {list.length === 0 ? (
        <div className="text-sm text-slate-400 italic px-1">None</div>
      ) : (
        <div className="space-y-3">
          {list.map(album => (
            <div key={album.id} className="p-3 bg-white border border-gray-100 rounded-lg group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelectAlbum(album)}>
                  <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{album.name || '(Unnamed)'}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{album.folder_id ? 'Folder Linked' : 'Album'}</div>
                  </div>
                </div>
                <button onClick={() => handleSelectAlbum(album)} className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                  View
                </button>
              </div>

              {/* If selected show mini members list or invite (only for owner) */}
              {selectedAlbumMembers.length > 0 && selectedAlbumMembers[0]?.shared_album_id === album.id && album.owner_id === userId && (
                <div className="mt-3 pt-3 border-t border-gray-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Members</div>
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {selectedAlbumMembers.map(m => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 truncate max-w-[120px]" title={m.email}>{m.email}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{m.role}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Email"
                      className="flex-1 bg-slate-50 border border-slate-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button onClick={() => handleInvite(album.id)} className="bg-blue-600 text-white rounded p-1 hover:bg-blue-700">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <aside className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-4">
        <div className="flex gap-2 mb-6">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New Album Name"
            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all font-medium text-slate-700"
          />
          <Button onClick={handleCreate} disabled={creating} size="sm" className="rounded-lg px-3 bg-slate-800 text-white hover:bg-slate-900 border-none">
            <Plus size={16} />
          </Button>
        </div>

        {renderAlbumList(albums.owned || [], "My Albums")}
        {renderAlbumList(albums.shared || [], "Shared With Me")}

        {error && <div className="text-xs font-medium text-red-600 mt-2 p-2 bg-red-50 rounded-lg">{error}</div>}
      </div>
    </aside>
  );
};
