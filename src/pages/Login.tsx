import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const navigate = useNavigate();
    const { signIn, user } = useAuth();

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Handle redirection if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.email || !formData.password) {
            setError("Email and password are required");
            return;
        }

        setIsLoading(true);

        try {
            const { error: signInError, session } = await signIn(formData.email, formData.password);

            if (signInError) {
                if (signInError.message.includes("Email not confirmed")) {
                    setError("Please verify your email address before signing in. Check your inbox (and spam folder).");
                } else if (signInError.message.includes("Invalid login credentials")) {
                    setError("The email or password you entered is incorrect.");
                } else {
                    throw signInError;
                }
            } else if (session) {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    return (
        <div className="min-h-screen bg-[#012A32] flex flex-col font-sans selection:bg-[#2EAF7D]/30">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#2EAF7D] rounded-full blur-[120px] opacity-10 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[150px] opacity-10" />

                <div className="w-full max-w-[440px] z-10">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 p-8 md:p-10">
                        {/* Header */}
                        <div className="mb-10 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2EAF7D]/10 rounded-2xl mb-6 group transition-all duration-500 hover:scale-110">
                                <ShieldCheck className="h-8 w-8 text-[#2EAF7D] group-hover:rotate-12 transition-transform" />
                            </div>
                            <h1 className="text-3xl font-black text-[#012A32] tracking-tight mb-2">Welcome Back</h1>
                            <p className="text-slate-500 font-medium">Access your secure national digital vault</p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-rose-700 font-semibold leading-relaxed">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2EAF7D] transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2EAF7D]/10 focus:border-[#2EAF7D] focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                    <Link to="/auth/forgot-password" title="Forgot Password" className="text-[10px] font-black text-[#2EAF7D] uppercase tracking-wider hover:underline">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2EAF7D]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2EAF7D]/10 focus:border-[#2EAF7D] focus:bg-white outline-none transition-all font-bold text-slate-700 tracking-wider"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-[#2EAF7D] text-white font-black rounded-2xl shadow-xl shadow-[#2EAF7D]/25 hover:bg-[#28986d] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all uppercase tracking-widest text-xs"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Enter Vault</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10">
                            <div className="relative flex items-center justify-center mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100" />
                                </div>
                                <span className="relative px-4 bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Secure Identity
                                </span>
                            </div>
                            <GoogleLoginButton />
                        </div>

                        <div className="mt-8 text-center bg-slate-50 mx-[-40px] mb-[-40px] p-6 rounded-b-[2rem] border-t border-slate-100">
                            <Link to="/signup" className="text-sm font-bold text-slate-600 hover:text-[#2EAF7D] transition-colors">
                                Don't have an account? <span className="text-[#2EAF7D] font-black decoration-2 underline-offset-4 hover:underline">Register Now</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8 text-center">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                    Salone Vault &copy; 2026 • Encrypted Sovereign Identity
                </p>
            </div>
        </div>
    );
}

export default Login;
