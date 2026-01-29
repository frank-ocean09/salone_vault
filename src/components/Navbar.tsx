import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const lastScrollY = useRef(0);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    useEffect(() => {
        // only run in browser
        if (typeof window === 'undefined') return;

        const onScroll = () => {
            const currentY = window.scrollY || window.pageYOffset;
            // if scrolling down and scrolled more than 60px hide
            if (currentY > lastScrollY.current && currentY > 60) {
                setHidden(true);
            } else {
                setHidden(false);
            }
            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path || location.hash === path
            ? 'text-[#3FD0C9]'
            : 'text-[#02353C]/60 dark:text-white/60';
    };

    return (
        <nav className={`bg-white dark:bg-brand-dark border-b border-[#02353C]/5 dark:border-white/5 sticky top-0 z-50 transform transition-all duration-500 shadow-xl ${hidden && !isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="p-2 bg-[#2EAF7D] rounded-xl shadow-lg shadow-[#2EAF7D]/20">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-black text-2xl text-[#02353C] dark:text-brand-pale tracking-tighter">
                                SALONEVAULT
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`${isActive('/')} hover:text-[#3FD0C9] font-black text-[10px] uppercase tracking-[0.2em] transition-colors`}>
                            Home
                        </Link>
                        <a href="/#features" className={`${isActive('#features')} hover:text-[#3FD0C9] font-black text-[10px] uppercase tracking-[0.2em] transition-colors`}>
                            Features
                        </a>
                        <a href="/#how-it-works" className={`${isActive('#how-it-works')} hover:text-[#3FD0C9] font-black text-[10px] uppercase tracking-[0.2em] transition-colors`}>
                            How It Works
                        </a>
                        <Link to="/verify" className={`${isActive('/verify')} hover:text-[#3FD0C9] font-black text-[10px] uppercase tracking-[0.2em] transition-colors`}>
                            Verify Document
                        </Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="px-6 py-2 bg-[#2EAF7D] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#2EAF7D]/20">
                                    My Vault
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 text-[#02353C]/40 dark:text-white/40 hover:text-red-500 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/auth?mode=login">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-[#3FD0C9] text-[#3FD0C9] hover:bg-[#3FD0C9]/10 font-bold text-xs uppercase tracking-widest px-6 py-2 h-auto rounded-xl"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/auth?mode=signup">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white font-bold text-xs uppercase tracking-widest px-6 py-2 h-auto rounded-xl shadow-lg shadow-[#2EAF7D]/20"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[#02353C] dark:text-white p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-brand-dark border-b border-[#02353C]/5 dark:border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            to="/"
                            className="block px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#02353C]/60 dark:text-white/60 hover:text-[#02353C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <a
                            href="/#features"
                            className="block px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#02353C]/60 dark:text-white/60 hover:text-[#02353C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="/#how-it-works"
                            className="block px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#02353C]/60 dark:text-white/60 hover:text-[#02353C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            How It Works
                        </a>
                        <Link
                            to="/verify"
                            className="block px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#02353C]/60 dark:text-white/60 hover:text-[#02353C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Verify Document
                        </Link>
                        {user ? (
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-[#2EAF7D] text-white shadow-lg shadow-[#2EAF7D]/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    My Vault
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <Link
                                    to="/auth?mode=login"
                                    className="block w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full border-[#3FD0C9] text-[#3FD0C9] hover:bg-[#3FD0C9]/10 font-black text-xs uppercase tracking-widest py-4 rounded-xl"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link
                                    to="/auth?mode=signup"
                                    className="block w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Button
                                        variant="primary"
                                        className="w-full bg-[#2EAF7D] text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-[#2EAF7D]/20"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
