import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Shield, Mail, Lock, User, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
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
        confirmPassword: '',
        acceptTerms: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!isLogin) {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (!formData.acceptTerms) {
                setError("You must accept the Terms & Conditions");
                return;
            }
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                // Sign in
                const { error, session } = await signIn(formData.email, formData.password);
                if (error) throw error;

                if (session) {
                    navigate('/dashboard');
                } else {
                    setIsLoading(true);
                    const start = Date.now();
                    while (Date.now() - start < 5000) {
                        const { data: { session: current } } = await supabase.auth.getSession();
                        if (current) break;
                        await new Promise((r) => setTimeout(r, 200));
                    }
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
                setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false });
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    return (
        <div className="min-h-screen bg-[#C1F6ED] relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.2] pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2EAF7D" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#auth-grid)" />
                </svg>
            </div>

            <main className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
                <div className="max-w-xl w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 backdrop-blur-sm">

                        <div className="p-10 sm:p-12">
                            {/* Logo and Header */}
                            <div className="text-center mb-10">
                                <div className="inline-block p-4 rounded-3xl bg-[#C1F6ED]/30 mb-6 transition-transform hover:scale-105 duration-300">
                                    <ShieldCheck className="h-12 w-12 text-[#2EAF7D]" />
                                </div>
                                <h1 className="text-3xl font-bold text-[#02353C] tracking-tight">
                                    {isLogin ? 'Welcome Back' : 'Create Your Account'}
                                </h1>
                                <p className="text-[#02353C]/60 mt-2 font-medium">
                                    {isLogin ? 'Access your national digital vault' : 'Join the official document platform of Sierra Leone'}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-[#449342]/10 border border-[#449342]/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <ShieldCheck className="h-5 w-5 text-[#449342] flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#449342] font-semibold">{success}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {!isLogin && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="block text-sm font-bold text-[#02353C] ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3FD0C9] transition-colors" />
                                                <input
                                                    type="text" id="name" name="name"
                                                    value={formData.name} onChange={handleChange} required={!isLogin}
                                                    placeholder="John Doe"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:bg-white focus:border-[#3FD0C9] transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="block text-sm font-bold text-[#02353C] ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3FD0C9] transition-colors" />
                                                <input
                                                    type="tel" id="phone" name="phone"
                                                    value={formData.phone} onChange={handleChange} required={!isLogin}
                                                    placeholder="+232 XX XXX XXXX"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:bg-white focus:border-[#3FD0C9] transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-bold text-[#02353C] ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3FD0C9] transition-colors" />
                                        <input
                                            type="email" id="email" name="email"
                                            value={formData.email} onChange={handleChange} required
                                            placeholder="you@example.sl"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:bg-white focus:border-[#3FD0C9] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className={!isLogin ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "space-y-2"}>
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="block text-sm font-bold text-[#02353C] ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3FD0C9] transition-colors" />
                                            <input
                                                type="password" id="password" name="password"
                                                value={formData.password} onChange={handleChange} required
                                                placeholder="••••••••" minLength={6}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:bg-white focus:border-[#3FD0C9] transition-all"
                                            />
                                        </div>
                                    </div>
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#02353C] ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3FD0C9] transition-colors" />
                                                <input
                                                    type="password" id="confirmPassword" name="confirmPassword"
                                                    value={formData.confirmPassword} onChange={handleChange} required={!isLogin}
                                                    placeholder="••••••••" minLength={6}
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:bg-white focus:border-[#3FD0C9] transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isLogin && (
                                    <div className="text-right">
                                        <button type="button" onClick={() => navigate('/auth/forgot-password')} className="text-sm font-semibold text-[#3FD0C9] hover:underline">
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                {!isLogin && (
                                    <div className="flex items-start gap-3 ml-1">
                                        <div className="flex items-center h-6">
                                            <input
                                                id="acceptTerms" name="acceptTerms" type="checkbox"
                                                checked={formData.acceptTerms} onChange={handleChange} required
                                                className="h-5 w-5 text-[#2EAF7D] border-gray-300 rounded-lg focus:ring-[#2EAF7D] transition-colors cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="acceptTerms" className="text-sm text-[#02353C]/70">
                                            I accept the <a href="#" className="font-bold text-[#02353C] hover:underline">Terms & Conditions</a> and consent to my data being secured and verified.
                                        </label>
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 py-4 h-auto text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            {isLogin ? 'Authenticating...' : 'Registering...'}
                                        </span>
                                    ) : (
                                        isLogin ? 'Sign In' : 'Create Account'
                                    )}
                                </Button>
                            </form>

                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                    <span className="px-4 bg-white text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            <GoogleLoginButton />

                            <div className="mt-10 text-center">
                                <p className="text-[#02353C]/60 font-medium">
                                    {isLogin ? "New to SaloneVault? " : 'Already have an account? '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError(null);
                                            setSuccess(null);
                                        }}
                                        className="text-[#3FD0C9] font-bold hover:underline"
                                    >
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
