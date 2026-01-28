import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ChangeEmailPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                email: newEmail,
            });

            if (updateError) throw updateError;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to update email');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center px-4 py-12">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Please log in to change your email</p>
                        <Button onClick={() => navigate('/auth')}>Go to Login</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm">Back to Dashboard</span>
                        </button>

                        {!success ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-teal/10 rounded-full mb-4">
                                        <Mail className="h-8 w-8 text-brand-teal" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Change Email Address
                                    </h1>
                                    <p className="text-gray-600 mb-4">
                                        Current email: <strong>{user.email}</strong>
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Email Address
                                        </label>
                                        <input
                                            id="newEmail"
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                                            placeholder="new.email@example.com"
                                        />
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> You will receive verification emails at both your current and new email addresses. You must verify both to complete the change.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800">Error</p>
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading || !newEmail || newEmail === user.email}
                                        className="w-full"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                Updating...
                                            </span>
                                        ) : (
                                            'Update Email'
                                        )}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Verification Emails Sent
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    We've sent verification emails to:
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                                    <p className="text-sm text-gray-700">
                                        <strong>Current:</strong> {user.email}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <strong>New:</strong> {newEmail}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">
                                    Please check both inboxes and click the verification links to complete the email change.
                                </p>
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Return to Dashboard
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
