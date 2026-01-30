import React, { useState, useEffect } from 'react';
import { Share2, X, Trash2, Mail, UserPlus, Shield } from 'lucide-react';
import { Button } from './Button';
import { getSharedAlbumMembers, inviteToSharedAlbum, removeAlbumMember, updateAlbumMemberRole, getAlbumActivityLogs } from '../lib/api';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    album: { id: string; name: string; owner_id: string };
    currentUserId: string;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
};

export const AlbumSettingsModal: React.FC<Props> = ({ isOpen, onClose, album, currentUserId, showToast }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'viewer' | 'uploader'>('viewer');
    const [members, setMembers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'members' | 'activity'>('members');
    const [loading, setLoading] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [inviting, setInviting] = useState(false);

    const isOwner = album.owner_id === currentUserId;

    useEffect(() => {
        if (isOpen && album) {
            loadMembers();
            if (activeTab === 'activity') {
                loadLogs();
            }
        }
    }, [isOpen, album, activeTab]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await getSharedAlbumMembers(album.id);
            setMembers(data || []);
        } catch (error) {
            console.error('Failed to load members', error);
            showToast('Failed to load members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        setLoadingLogs(true);
        try {
            const data = await getAlbumActivityLogs(album.id);
            setLogs(data || []);
        } catch (error) {
            console.error('Failed to load activity logs', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    // ... (handleInvite, handleRemoveMember, handleUpdateRole implementation same as before)
    const handleInvite = async () => {
        if (!email.trim()) return;

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setInviting(true);
        try {
            // Support comma-separated emails? For now just one.
            await inviteToSharedAlbum(album.id, email.trim(), role);

            showToast(`Invited ${email}`, 'success');
            setEmail('');
            loadMembers(); // Refresh list
            if (activeTab === 'activity') loadLogs();
        } catch (error: any) {
            console.error('Invite failed', error);
            showToast(error.message || 'Failed to invite user', 'error');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await removeAlbumMember(album.id, memberId);
            showToast('Member removed', 'success');
            loadMembers();
            if (activeTab === 'activity') loadLogs();
        } catch (error: any) {
            console.error('Failed to remove member', error);
            showToast(error.message || 'Failed to remove member', 'error');
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: 'viewer' | 'uploader') => {
        try {
            await updateAlbumMemberRole(album.id, memberId, newRole);
            showToast('Role updated', 'success');
            loadMembers();
            if (activeTab === 'activity') loadLogs();
        } catch (error: any) {
            console.error('Failed to update role', error);
            showToast(error.message || 'Failed to update role', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Album Settings</h3>
                            <p className="text-xs text-gray-500">{album.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Activity
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    {activeTab === 'members' ? (
                        <>
                            {/* Invite Section */}
                            {isOwner && (
                                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <UserPlus size={16} className="text-blue-600" />
                                        Invite People
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <div className="relative flex-1">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter email address (e.g. gmail)"
                                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                            />
                                        </div>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value as any)}
                                            className="border border-gray-300 rounded-lg text-sm px-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="uploader">Uploader</option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={handleInvite}
                                        disabled={inviting || !email.trim()}
                                        className="w-full justify-center"
                                        size="sm"
                                    >
                                        {inviting ? 'Sending Invite...' : 'Send Invitation'}
                                    </Button>
                                </div>
                            )}

                            {/* Members List */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                                    <span>People with access</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{members.length}</span>
                                </h4>

                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="text-center py-4 text-gray-500 text-sm">Loading members...</div>
                                    ) : members.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 text-sm italic">No members yet</div>
                                    ) : (
                                        members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                                                        {(member.email?.[0] || '?')}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {member.email || 'Unknown User'}
                                                            {member.user_id === currentUserId && <span className="ml-2 text-xs text-gray-400">(You)</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            {isOwner && member.role !== 'owner' ? (
                                                                <select
                                                                    value={member.role}
                                                                    onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                                                                    className="bg-transparent border-none p-0 text-gray-500 focus:ring-0 cursor-pointer hover:text-blue-600 text-xs"
                                                                >
                                                                    <option value="viewer">viewer</option>
                                                                    <option value="uploader">uploader</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`capitalize ${member.role === 'owner' ? 'font-bold text-indigo-600' : ''}`}>{member.role}</span>
                                                            )}
                                                            <span>•</span>
                                                            <span className={member.status === 'active' ? 'text-green-600' : 'text-orange-500'}>
                                                                {member.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isOwner && member.role !== 'owner' && (
                                                    <button
                                                        className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove Access"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                {member.role === 'owner' && <Shield size={16} className="text-gray-300" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {loadingLogs ? (
                                <div className="text-center py-8 text-slate-400 text-sm">Loading activity...</div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm italic">No activity recorded yet</div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="flex gap-3 text-sm">
                                        <div className="flex-1">
                                            <p className="text-slate-800">
                                                <span className="font-semibold">{log.action.replace('_', ' ')}</span>
                                                {' '}
                                                <span className="text-slate-500">
                                                    {log.details?.email || log.details?.name || ''}
                                                    {log.details?.newRole ? ` to ${log.details.newRole}` : ''}
                                                </span>
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(log.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-end shrink-0">
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
};
