import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export function PasswordResetRequest() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <button
                            onClick={() => navigate('/auth')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm">Back to Login</span>
                        </button>

                        {!success ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-green/10 rounded-full mb-4">
                                        <Mail className="h-8 w-8 text-primary-green" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Reset Your Password
                                    </h1>
                                    <p className="text-gray-600">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                                            placeholder="your.email@example.com"
                                        />
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
                                        disabled={loading || !email}
                                        className="w-full"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                Sending...
                                            </span>
                                        ) : (
                                            'Send Reset Link'
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
                                    Check Your Email
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Click the link in the email to reset your password. The link will expire in 1 hour.
                                </p>
                                <Button
                                    onClick={() => navigate('/auth')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Return to Login
                                </Button>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Didn't receive the email? Check your spam folder or{' '}
                        <button
                            onClick={() => setSuccess(false)}
                            className="text-primary-green hover:underline font-medium"
                        >
                            try again
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
