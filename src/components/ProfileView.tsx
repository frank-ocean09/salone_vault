import { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../lib/api';
import { Button } from './Button';

interface ProfileViewProps {
    userId: string;
    onUpdate?: () => void;
}

export function ProfileView({ userId, onUpdate }: ProfileViewProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        nin: ''
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                const data = await getUserProfile(userId);
                if (data) {
                    setProfile({
                        full_name: data.full_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        nin: data.nin || ''
                    });
                }
            } catch (err: any) {
                console.error('Failed to load profile:', err);
                setError('Failed to load profile details.');
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Validation for NIN (alphanumeric, 4-15 chars)
            if (profile.nin && !profile.nin.match(/^[a-zA-Z0-9]{4,15}$/)) {
                throw new Error("Please enter a valid NIN (alphanumeric, 4-15 characters)");
            }

            await updateUserProfile(userId, {
                full_name: profile.full_name,
                phone: profile.phone,
                nin: profile.nin
            });

            setSuccess('Profile updated successfully!');
            if (onUpdate) onUpdate();
        } catch (err: any) {
            console.error('Update failed:', err);
            setError(err.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-[#2EAF7D] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-[#02353C] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">Identity Profile</h2>
                        <p className="text-teal-100/70 text-sm">Manage your personal information and sovereign identity.</p>
                    </div>
                    {/* Decorative background circle */}
                    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#2EAF7D] rounded-full blur-[80px] opacity-20" />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-rose-700 font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                            <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-teal-700 font-medium">{success}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] transition-all font-medium text-slate-700"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Read-only)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 opacity-50" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] transition-all font-medium text-slate-700"
                                    placeholder="+232..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">National ID (NIN)</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={profile.nin}
                                    onChange={(e) => setProfile({ ...profile, nin: e.target.value.toUpperCase() })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] transition-all font-medium text-slate-700 uppercase"
                                    placeholder="e.g. SL123456"
                                    maxLength={15}
                                />
                            </div>
                            {!profile.nin && (
                                <p className="text-[10px] text-amber-600 font-bold mt-1 ml-1 flex items-center gap-1">
                                    <AlertCircle size={10} /> Needs verification
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full md:w-auto px-8 py-3 bg-[#2EAF7D] hover:bg-[#258f66] text-white flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#2EAF7D]/20 transition-all font-bold uppercase tracking-widest text-xs"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Update Profile'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-8 p-6 bg-[#2EAF7D]/5 rounded-3xl border border-[#2EAF7D]/10 text-center">
                <p className="text-sm text-slate-600 font-medium">
                    Your information is encrypted and stored securely in the National Digital Document Vault.
                </p>
            </div>
        </div>
    );
}
