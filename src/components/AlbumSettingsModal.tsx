import React, { useState, useEffect } from 'react';
import { Share2, X, Trash2, Mail, UserPlus, Shield } from 'lucide-react';
import { Button } from './Button';
import { getSharedAlbumMembers, inviteToSharedAlbum } from '../lib/api';

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
    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState(false);

    const isOwner = album.owner_id === currentUserId;

    useEffect(() => {
        if (isOpen && album) {
            loadMembers();
        }
    }, [isOpen, album]);

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
        } catch (error: any) {
            console.error('Invite failed', error);
            showToast(error.message || 'Failed to invite user', 'error');
        } finally {
            setInviting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Album Members</h3>
                            <p className="text-xs text-gray-500">{album.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Invite Section (Only for Owners for now, or maybe editors too?) */}
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

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
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
                                                    <span className={`capitalize ${member.role === 'owner' ? 'font-bold text-indigo-600' : ''}`}>{member.role}</span>
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
                                                onClick={() => showToast('Removing users is not implemented yet', 'info')}
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
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
};
