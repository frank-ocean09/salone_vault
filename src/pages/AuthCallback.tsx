import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function AuthCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session) {
                    // Check if user profile exists, create if not
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError && profileError.code === 'PGRST116') {
                        // Profile doesn't exist, create it
                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: session.user.id,
                                email: session.user.email,
                                full_name: session.user.user_metadata?.full_name || null,
                            });

                        if (insertError) {
                            console.error('Error creating profile:', insertError);
                        }
                    }

                    setStatus('success');

                    // Redirect to dashboard immediately once session is confirmed
                    navigate('/dashboard');
                } else {
                    throw new Error('No session found');
                }
            } catch (err: any) {
                console.error('Auth callback error:', err);
                setError(err.message || 'Authentication failed');
                setStatus('error');

                // Redirect to login after error
                setTimeout(() => {
                    navigate('/auth');
                }, 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                {status === 'loading' && (
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-primary-green border-t-transparent rounded-full mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Signing you in...
                        </h2>
                        <p className="text-gray-600">
                            Please wait while we complete your authentication.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Success!
                        </h2>
                        <p className="text-gray-600">
                            Redirecting to your dashboard...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Authentication Failed
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {error || 'Something went wrong during authentication.'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to login page...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
