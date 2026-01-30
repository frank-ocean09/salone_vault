import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Shield, Mail, Lock, User, Phone, AlertCircle, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

export function Auth() {
    const navigate = useNavigate();
    const { signUp, signIn } = useAuth();
    const { isDarkMode } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
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
                setError("You must agree to the Privacy Policy and Terms of Service");
                return;
            }
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                const { error, session } = await signIn(formData.email, formData.password);
                if (error) throw error;

                if (session) {
                    navigate('/dashboard');
                } else {
                    const start = Date.now();
                    while (Date.now() - start < 5000) {
                        const { data: { session: current } } = await supabase.auth.getSession();
                        if (current) break;
                        await new Promise((r) => setTimeout(r, 200));
                    }
                    navigate('/dashboard');
                }
            } else {
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
        <div className="min-h-screen bg-[#C1F6ED] dark:bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-500">
            {/* Technical Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1] pointer-events-none"
                style={{
                    backgroundImage: isDarkMode
                        ? 'linear-gradient(rgba(193, 246, 237, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(193, 246, 237, 0.2) 1px, transparent 1px)'
                        : 'linear-gradient(#02353C 1px, transparent 1px), linear-gradient(90deg, #02353C 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Abstract Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3FD0C9] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2EAF7D] rounded-full blur-[120px] opacity-20 -translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-xl relative z-10 transition-all duration-500">
                <div className="bg-white dark:bg-white/5 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(2,53,60,0.1)] p-8 sm:p-12 border border-white dark:border-white/10 relative overflow-hidden group">
                    {/* Subtle top accent line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#3FD0C9] via-[#2EAF7D] to-[#449342]" />

                    <div className="mb-10 text-center">
                        <Link to="/" className="inline-flex items-center gap-3 mb-8 group/logo">
                            <div className="p-3 bg-[#2EAF7D] rounded-2xl group-hover/logo:scale-110 transition-transform shadow-lg shadow-[#2EAF7D]/20">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-black text-2xl text-[#02353C] dark:text-brand-pale tracking-tighter">SALONEVAULT</span>
                        </Link>
                        <h1 className="text-3xl font-black text-[#02353C] dark:text-brand-pale tracking-tight mb-3">
                            {isLogin ? 'Welcome Back' : 'Create Secure Vault'}
                        </h1>
                        <p className="text-[#02353C]/40 dark:text-white/40 font-bold">
                            {isLogin
                                ? 'Access your official digital records securely.'
                                : 'Join the national digital document infrastructure.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/60 ml-4">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#02353C]/20" />
                                        <input
                                            type="text" name="name" required
                                            className="w-full pl-12 pr-4 py-4 bg-[#C1F6ED]/20 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#3FD0C9] focus:outline-none transition-all font-bold text-[#02353C]"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/60 ml-4">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#02353C]/20" />
                                        <input
                                            type="tel" name="phone" required
                                            className="w-full pl-12 pr-4 py-4 bg-[#C1F6ED]/20 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#3FD0C9] focus:outline-none transition-all font-bold text-[#02353C]"
                                            placeholder="+232 00 000 000"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/60 ml-4">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#02353C]/20" />
                                <input
                                    type="email" name="email" required
                                    className="w-full pl-12 pr-4 py-4 bg-[#C1F6ED]/20 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#3FD0C9] focus:outline-none transition-all font-bold text-[#02353C]"
                                    placeholder="name@example.sl"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={!isLogin ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "space-y-2"}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/60 ml-4">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#02353C]/20" />
                                    <input
                                        type="password" name="password" required
                                        className="w-full pl-12 pr-4 py-4 bg-[#C1F6ED]/20 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#3FD0C9] focus:outline-none transition-all font-bold text-[#02353C]"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/60 ml-4">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#02353C]/20" />
                                        <input
                                            type="password" name="confirmPassword" required
                                            className="w-full pl-12 pr-4 py-4 bg-[#C1F6ED]/20 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#3FD0C9] focus:outline-none transition-all font-bold text-[#02353C]"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="flex items-center gap-3 ml-4">
                                <input
                                    type="checkbox" name="acceptTerms" id="acceptTerms"
                                    checked={formData.acceptTerms} onChange={handleChange}
                                    className="w-5 h-5 rounded-lg border-2 border-[#2EAF7D] text-[#2EAF7D] focus:ring-[#3FD0C9] cursor-pointer"
                                />
                                <label htmlFor="acceptTerms" className="text-xs font-bold text-[#02353C]/60 cursor-pointer">
                                    I agree to the <Link to="/privacy" className="text-[#2EAF7D] hover:text-[#3FD0C9] underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link> and <Link to="/terms" className="text-[#2EAF7D] hover:text-[#3FD0C9] underline" onClick={(e) => e.stopPropagation()}>Terms & Conditions</Link>.
                                </label>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <p className="text-sm font-bold text-red-600">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 p-4 bg-[#449342]/10 rounded-2xl border border-[#449342]/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle className="h-5 w-5 text-[#449342]" />
                                <p className="text-sm font-bold text-[#449342]">{success}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-5 bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white font-black uppercase tracking-widest text-sm rounded-[1.5rem] shadow-xl shadow-[#2EAF7D]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 border-none"
                            loading={isLoading}
                            disabled={!isLogin && !formData.acceptTerms}
                        >
                            {isLogin ? 'Enter Vault' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#02353C]/5" />
                            </div>
                            <span className="relative px-4 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/20">Or continue with</span>
                        </div>
                        <GoogleLoginButton />
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-[#02353C]/40 font-bold mb-6 italic text-sm">
                            {isLogin ? "Don't have a vault yet?" : "Already have a vault?"}
                        </p>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="inline-flex items-center gap-2 text-[#02353C] font-black uppercase tracking-widest text-xs hover:text-[#2EAF7D] transition-colors"
                        >
                            {isLogin ? 'Start Free Application' : 'Back to Login'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Verification Badge */}
                <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]">
                        <ShieldCheck className="h-4 w-4" />
                        Official Platform
                    </div>
                    <div className="w-px h-4 bg-[#02353C]/20" />
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]">
                        <Lock className="h-4 w-4" />
                        SSL Secured
                    </div>
                </div>
            </div>
        </div>
    );
}
