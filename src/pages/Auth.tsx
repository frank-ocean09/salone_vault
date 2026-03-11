import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Auth() {
    const navigate = useNavigate();
    const { signUp, signIn } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        nin: '',
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
            if (!formData.nin.match(/^[0-9]{8}$/)) {
                setError("NIN must be 8 digits");
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
                    formData.phone,
                    formData.nin
                );
                if (error) throw error;
                setSuccess('Account created! Please check your email to verify your account.');
                setFormData({ name: '', email: '', phone: '', nin: '', password: '', confirmPassword: '', acceptTerms: false });
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
        <div className="min-h-screen bg-gradient-to-br from-[#02353C] via-[#024950] to-[#02353C] flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-[#02353C] mb-2">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h1>
                            <p className="text-gray-600">
                                {isLogin
                                    ? 'Sign in to access your vault'
                                    : 'Join Salone Vault today'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAF7D] focus:border-transparent outline-none transition-all"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAF7D] focus:border-transparent outline-none transition-all"
                                                placeholder="+232 00 000 000"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            National Identification Number (NIN)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="nin"
                                                required
                                                maxLength={8}
                                                pattern="[0-9]{8}"
                                                className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAF7D] focus:border-transparent outline-none transition-all"
                                                placeholder="Enter 8-digit NIN"
                                                value={formData.nin}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAF7D] focus:border-transparent outline-none transition-all"
                                        placeholder="name@example.sl"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAF7D] focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAF7D] focus:border-transparent outline-none transition-all"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        id="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleChange}
                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#2EAF7D] focus:ring-[#2EAF7D] cursor-pointer"
                                    />
                                    <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer">
                                        I agree to the{' '}
                                        <Link to="/privacy" className="text-[#2EAF7D] hover:underline">
                                            Privacy Policy
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/terms" className="text-[#2EAF7D] hover:underline">
                                            Terms of Service
                                        </Link>
                                    </label>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <p className="text-sm text-green-600">{success}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-2.5 bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white font-semibold rounded-lg transition-all border-none"
                                loading={isLoading}
                                disabled={!isLogin && !formData.acceptTerms}
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <span className="relative px-4 bg-white text-sm text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                            <GoogleLoginButton />
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                            </p>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm font-semibold text-[#2EAF7D] hover:text-[#2EAF7D]/80 transition-colors"
                            >
                                {isLogin ? 'Create Account' : 'Sign In'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
