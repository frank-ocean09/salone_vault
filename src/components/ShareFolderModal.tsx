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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Share Folder</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        <p className="mb-3 text-sm text-gray-700">Invite users to collaborate on this folder. Invited users can view and (optionally) upload documents.</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Invite by email</label>
          <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="user@example.com" />
          <label className="block text-sm font-medium text-gray-700 mt-3">Role</label>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="w-full border border-gray-300 rounded-md px-3 py-2">
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
  );
};
