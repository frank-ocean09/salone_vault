import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { createSharedAlbum, getSharedAlbumMembers, inviteToSharedAlbum, getSharedAlbumsForUser } from '../lib/api';
import type { Folder } from '../lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  folderId: string | null;
  userId: string;
  folders: Folder[];
  onAlbumsUpdated?: (albums: any[]) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export const ShareFolderModal: React.FC<Props> = ({ isOpen, onClose, folderId, userId, folders, onAlbumsUpdated, showToast }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'uploader'>('viewer');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch members for an existing album (if any) when modal opens
  useEffect(() => {
    const fetch = async () => {
      if (!isOpen || !folderId) return;
      try {
        const albums = await getSharedAlbumsForUser(userId);
        const album = (albums || []).find((a: any) => a.folder_id === folderId);
        if (!album) {
          setMembers([]);
          return;
        }
        const memb = await getSharedAlbumMembers(album.id);
        setMembers(memb || []);
      } catch (err) {
        console.warn('Failed to load album members', err);
      }
    };
    fetch();
  }, [isOpen, folderId, userId]);

  const handleCreateAndInvite = async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const folder = folders.find(f => f.id === folderId);
      const album = await createSharedAlbum(userId, folderId, folder?.name || 'Shared Album');
      if (inviteEmail.trim()) {
        await inviteToSharedAlbum(album.id, inviteEmail.trim(), inviteRole);
        if (showToast) showToast('Invitation sent', 'success');
        setInviteEmail('');
      }
      // Refresh albums if callback provided
      if (onAlbumsUpdated) {
        const updated = await getSharedAlbumsForUser(userId);
        onAlbumsUpdated(updated || []);
      }
      setError(null);
      onClose();
      if (showToast) showToast('Shared album created', 'success');
    } catch (err: any) {
      console.error('Failed to create or invite', err);
      setError(err.message || 'Failed to create or invite');
      if (showToast) showToast('Failed to create shared album', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      // Find album for folder
      const albums = await getSharedAlbumsForUser(userId);
      const album = (albums || []).find((a: any) => a.folder_id === folderId);
      if (!album) {
        setError('No shared album for this folder yet. Create it first.');
        return;
      }
      const invited = await inviteToSharedAlbum(album.id, inviteEmail.trim(), inviteRole);
      setMembers(prev => [...prev, invited]);
      setInviteEmail('');
      if (showToast) showToast('Invitation sent', 'success');
    } catch (err: any) {
      console.error('Invite failed', err);
      setError(err.message || 'Invite failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-brand-lighter-dark rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 border border-white dark:border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-[#02353C] dark:text-brand-pale uppercase tracking-widest">Share Folder</h3>
          <button onClick={onClose} className="text-[#02353C]/40 dark:text-white/40 hover:text-[#02353C] dark:hover:text-white p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl">✕</button>
        </div>

        <p className="mb-6 text-sm text-[#02353C]/60 dark:text-white/40 font-semibold">Invite users to collaborate on this folder. Invited users can view and (optionally) upload documents.</p>

        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#02353C]/40 dark:text-white/40 mb-2">Invite by email</label>
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-[#02353C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:border-[#3FD0C9] transition-all" placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#02353C]/40 dark:text-white/40 mb-2">Role</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-[#02353C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:border-[#3FD0C9] transition-all">
              <option value="viewer">Viewer (view only)</option>
              <option value="uploader">Uploader (view & upload)</option>
            </select>
          </div>

          <div className="mb-4">
            <p className="font-medium mb-2">Current Members</p>
            <ul className="text-sm text-gray-700 list-disc list-inside">
              {members.length === 0 && <li className="text-gray-500">No members yet</li>}
              {members.map(m => (
                <li key={m.id}>{m.email || m.user_id} — {m.role}</li>
              ))}
            </ul>
          </div>

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreateAndInvite} disabled={loading}>{loading ? 'Working...' : 'Create & Invite'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
