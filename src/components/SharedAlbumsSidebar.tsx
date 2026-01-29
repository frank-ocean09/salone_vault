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
      <div className="space-y-4">
        <div className="flex gap-2 mb-6">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New Album Name" className="flex-1 bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-[#02353C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20" />
          <Button onClick={handleCreate} disabled={creating} size="sm" className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest">Create</Button>
        </div>

        {albums.map(album => (
          <div key={album.id} className="p-4 bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/80 dark:hover:bg-white/10 transition-all group shadow-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelectAlbum(album)}>
              <div className="h-10 w-10 bg-[#C1F6ED]/50 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={16} className="text-[#02353C] dark:text-brand-pale" />
              </div>
              <div>
                <div className="font-black text-xs text-[#02353C] dark:text-brand-pale uppercase tracking-widest">{album.name || '(Unnamed)'}</div>
                <div className="text-[10px] font-bold text-[#02353C]/40 dark:text-white/40">{album.folder_id ? 'Vault-Linked' : 'Standalone'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleSelectAlbum(album)} className="text-[10px] font-black uppercase tracking-widest bg-[#2EAF7D] text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-transform shadow-lg shadow-[#2EAF7D]/20">Open</button>
            </div>
          </div>
        ))}

        {selectedAlbumMembers.length > 0 && (
          <div className="mt-8 p-6 bg-[#02353C]/5 dark:bg-white/5 rounded-[2rem] border border-transparent dark:border-white/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#02353C]/60 dark:text-white/40 mb-4 ml-1">Collaborators</div>
            <div className="space-y-3 max-h-48 overflow-auto mb-6 pr-2 custom-scrollbar">
              {selectedAlbumMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-white/50 dark:bg-black/20">
                  <div className="text-xs font-bold text-[#02353C] dark:text-brand-pale truncate mr-2">{m.email}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#3FD0C9]/20 text-[#3FD0C9] px-2 py-0.5 rounded-md">{m.role}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email address" className="flex-1 bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-[#02353C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20" />
              <Button onClick={() => handleInvite(selectedAlbumMembers[0]?.shared_album_id || '')} size="sm" className="rounded-xl p-2"><Plus size={16} /></Button>
            </div>
          </div>
        )}

        {error && <div className="text-xs font-bold text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">{error}</div>}
      </div>
    </aside>
  );
};
