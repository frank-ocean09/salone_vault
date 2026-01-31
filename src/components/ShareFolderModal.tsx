import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import {
  shareFolder,
  getFolderAccessList,
  updateFolderAccess,
  revokeFolderAccess
} from '../lib/api';
import type { Folder, FolderAccess } from '../lib/supabase';
import { X, Shield, Eye, Upload, UserPlus, Trash2 } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  folderId: string | null;
  folders: Folder[];
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export const ShareFolderModal: React.FC<Props> = ({ isOpen, onClose, folderId, folders, showToast }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'view_only' | 'upload_only' | 'view_upload'>('view_only');
  const [accessList, setAccessList] = useState<FolderAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const folder = folders.find(f => f.id === folderId);

  useEffect(() => {
    if (isOpen && folderId) {
      loadAccessList();
    } else {
      setInviteEmail('');
      setError(null);
    }
  }, [isOpen, folderId]);

  const loadAccessList = async () => {
    if (!folderId) return;
    setFetching(true);
    try {
      const data = await getFolderAccessList(folderId);
      setAccessList(data || []);
    } catch (err) {
      console.error('Failed to load access list', err);
    } finally {
      setFetching(false);
    }
  };

  const handleShare = async () => {
    if (!folderId || !inviteEmail.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await shareFolder(folderId, inviteEmail.trim(), permissionLevel);
      if (showToast) showToast('User added successfully', 'success');
      setInviteEmail('');
      loadAccessList();
    } catch (err: any) {
      setError(err.message || 'Failed to share folder');
      if (showToast) showToast(err.message || 'Failed to share folder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLevel = async (access: FolderAccess, newLevel: any) => {
    if (!folderId) return;
    try {
      await updateFolderAccess(folderId, access.id, access.profiles?.email || '', newLevel);
      if (showToast) showToast('Permission updated', 'success');
      loadAccessList();
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleRevoke = async (access: FolderAccess) => {
    if (!folderId) return;
    if (!confirm(`Remove access for ${access.profiles?.email}?`)) return;
    try {
      await revokeFolderAccess(folderId, access.id, access.profiles?.email || '');
      if (showToast) showToast('Access revoked', 'success');
      loadAccessList();
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Revoke failed', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-brand-lighter-dark rounded-3xl shadow-2xl overflow-hidden border border-white dark:border-white/5 animate-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Share "{folder?.name}"</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Manage who can access this folder</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* Invite Section */}
          <div className="mb-8 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-3">Invite User</label>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-white dark:bg-brand-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] dark:text-white transition-all"
                  placeholder="Enter user email..."
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={permissionLevel}
                  onChange={(e) => setPermissionLevel(e.target.value as any)}
                  className="w-full bg-white dark:bg-brand-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] dark:text-white transition-all font-medium"
                >
                  <option value="view_only">View only</option>
                  <option value="upload_only">Upload only</option>
                  <option value="view_upload">View & Upload</option>
                </select>
              </div>
              <Button onClick={handleShare} disabled={loading || !inviteEmail.trim()} className="bg-[#2EAF7D] hover:bg-[#258f66]">
                <UserPlus size={18} className="mr-2" />
                Add
              </Button>
            </div>
            {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
          </div>

          {/* Access List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4">Users with access</label>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {fetching ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-[#2EAF7D] border-t-transparent rounded-full mx-auto" />
                </div>
              ) : accessList.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                  <Shield size={32} className="mx-auto text-slate-200 dark:text-white/10 mb-2" />
                  <p className="text-sm text-slate-400 dark:text-gray-500">No users added yet</p>
                </div>
              ) : (
                accessList.map(access => (
                  <div key={access.id} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <UserPlus size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-white leading-tight">{access.profiles?.email}</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">Added {new Date(access.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={access.permission_level}
                        onChange={(e) => handleUpdateLevel(access, e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-[#2EAF7D] focus:ring-0 cursor-pointer hover:underline"
                      >
                        <option value="view_only">View only</option>
                        <option value="upload_only">Upload only</option>
                        <option value="view_upload">View & Upload</option>
                      </select>

                      <button
                        onClick={() => handleRevoke(access)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex justify-end">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-white/10">Done</Button>
        </div>
      </div>
    </div>
  );
};
