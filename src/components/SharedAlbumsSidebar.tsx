import React, { useEffect, useState } from 'react';
import { Plus, Users, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { getSharedAlbumsForUser, createSharedAlbum, getSharedAlbumMembers, inviteToSharedAlbum } from '../lib/api';

type Props = {
  userId: string;
  onOpenShareFolder: (folderId: string) => void;
  onSelectAlbum: (album: any) => void;
};

export const SharedAlbumsSidebar: React.FC<Props> = ({ userId, onOpenShareFolder, onSelectAlbum }) => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAlbumMembers, setSelectedAlbumMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSharedAlbumsForUser(userId);
        setAlbums(data || []);
      } catch (err) {
        console.warn('Failed to load shared albums', err);
      }
    };
    load();
  }, [userId]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      // Create album without folder association initially
      // Use null instead of empty string if your schema allows null, otherwise ensure DB handles it.
      // Schema has folder_id uuid, so it must be valid UUID or NULL. Empty string will fail.
      const dummyFolderId = null;
      // @ts-ignore
      const created = await createSharedAlbum(userId, dummyFolderId, newName.trim());
      setAlbums(prev => [created, ...prev]);
      setNewName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create album');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectAlbum = async (album: any) => {
    // Notify parent to view this album
    onSelectAlbum(album);

    // Also load members for inline display
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

  return (
    <aside className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Shared Albums</h3>
        <Button variant="ghost" onClick={() => { /* focus new input */ }}>
          <Plus size={16} />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New album name" className="flex-1 px-2 py-1 border rounded" />
          <Button onClick={handleCreate} disabled={creating}>Create</Button>
        </div>

        {albums.map(album => (
          <div key={album.id} className="p-2 border rounded flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSelectAlbum(album)}>
              <Users size={16} className="text-gray-500" />
              <div>
                <div className="font-medium text-sm">{album.name || '(Unnamed)'}</div>
                <div className="text-xs text-gray-400">{album.folder_id ? 'Folder linked' : 'No folder'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleSelectAlbum(album)} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">Open</button>
              <button onClick={() => console.log('more')} className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
            </div>
          </div>
        ))}

        {selectedAlbumMembers.length > 0 && (
          <div className="mt-2 p-2 border rounded">
            <div className="text-sm font-medium mb-2">Members</div>
            <div className="space-y-1 max-h-40 overflow-auto">
              {selectedAlbumMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <div>{m.email} <span className="text-xs text-gray-500">{m.role}</span></div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Invite by email" className="flex-1 px-2 py-1 border rounded" />
              <Button onClick={() => handleInvite(selectedAlbumMembers[0]?.shared_album_id || '')}>Invite</Button>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </aside>
  );
};
