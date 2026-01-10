import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Shield, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Auth() {
    const navigate = useNavigate();
    const { signUp, signIn } = useAuth();
    const [isLogin, setIsLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                // Sign in
                const { error, session } = await signIn(formData.email, formData.password);
                if (error) throw error;

                // If session is already returned, redirect immediately
                if (session) {
                    navigate('/dashboard');
                } else {
                    // Otherwise poll for session briefly (up to 5s) to ensure token is set before redirect
                    setIsLoading(true);
                    const start = Date.now();
                    let found = false;
                    while (Date.now() - start < 5000) {
                        const { data: { session: current } } = await supabase.auth.getSession();
                        if (current) {
                            found = true;
                            break;
                        }
                        await new Promise((r) => setTimeout(r, 200));
                    }
                    setIsLoading(false);
                    // Redirect regardless, but session should be present in most cases by now
                    navigate('/dashboard');
                }
            } else {
                // Sign up
                const { error } = await signUp(
                    formData.email,
                    formData.password,
                    formData.name,
                    formData.phone
                );
                if (error) throw error;
                setSuccess('Account created! Please check your email to verify your account.');
                // Clear form
                setFormData({ name: '', email: '', phone: '', password: '' });
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-primary-green p-8 text-center">
                            <img src="/nddv-logo.png" alt="Salone Vault Logo" className="h-16 w-16 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-white">
                                {isLogin ? 'Welcome Back' : 'Create Your Account'}
                            </h1>
                            <p className="text-blue-200 mt-2">
                                {isLogin
                                    ? 'Access your secure document vault'
                                    : 'Start securing your important documents today'}
                            </p>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-800">{success}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required={!isLogin}
                                                placeholder="John Doe"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="you@example.com"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                        />
                                    </div>
                                </div>

                                {!isLogin && (
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required={!isLogin}
                                                placeholder="+232 XX XXX XXXX"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                        />
                                    </div>
                                    {!isLogin && (
                                        <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                                    )}
                                    {isLogin && (
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate('/auth/forgot-password')}
                                                className="text-sm text-primary-green hover:underline"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                            {isLogin ? 'Signing In...' : 'Creating Account...'}
                                        </span>
                                    ) : (
                                        isLogin ? 'Sign In' : 'Create Account'
                                    )}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Google Login */}
                            <GoogleLoginButton />

                            {/* Toggle Login/Signup */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError(null);
                                            setSuccess(null);
                                        }}
                                        className="text-primary-green font-medium hover:underline"
                                    >
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </p>
                            </div>

                            {/* Security Note */}
                            {!isLogin && (
                                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-sm text-green-800 flex items-start gap-2">
                                        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>Your information is encrypted and secured with bank-grade security.</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
