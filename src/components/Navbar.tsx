import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const lastScrollY = useRef(0);
    const { isDarkMode, toggleTheme } = useTheme();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setHidden(true);
            } else {
                setHidden(false);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => {
        if (path.startsWith('#')) {
            return location.hash === path || location.pathname + location.hash === '/' + path
                ? 'text-[#3FD0C9] dark:text-brand-pale'
                : 'text-[#02353C]/60 dark:text-white/60';
        }
        return location.pathname === path
            ? 'text-[#3FD0C9] dark:text-brand-pale'
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

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-[#02353C] dark:text-brand-pale hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="px-6 py-2 bg-[#2EAF7D] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#2EAF7D]/20">
                                    My Vault
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth?mode=login">
                                    <Button variant="outline" size="sm" className="font-black text-xs uppercase tracking-widest">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/auth?mode=signup">
                                    <Button variant="primary" size="sm" className="font-black text-xs uppercase tracking-widest shadow-lg shadow-[#2EAF7D]/20">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-[#02353C] dark:text-white hover:bg-[#02353C]/5 dark:hover:bg-white/5 transition-all"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white dark:bg-brand-dark border-t border-[#02353C]/5 dark:border-white/5 shadow-xl">
                    <div className="px-4 py-6 space-y-4">
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
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#02353C]/60 dark:text-white/60 hover:text-[#02353C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                        >
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        {user ? (
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-4 bg-[#2EAF7D] text-white text-center font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#2EAF7D]/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    My Vault
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <Link
                                    to="/auth?mode=login"
                                    className="block px-3 py-4 text-center border-2 border-[#2EAF7D] text-[#2EAF7D] dark:text-brand-pale font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#2EAF7D]/5 transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/auth?mode=signup"
                                    className="block px-3 py-4 bg-[#2EAF7D] text-white text-center font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#2EAF7D]/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
