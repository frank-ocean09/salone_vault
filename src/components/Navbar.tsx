import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
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
        return location.pathname === path || location.hash === path ? 'text-brand-teal' : 'text-white';
    };

    return (
        <nav className={`bg-primary-dark border-b border-gray-800 sticky top-0 z-50 transform transition-transform duration-300 ${hidden && !isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/nddv-logo.png" alt="NDDV Logo" className="h-10 w-10" />
                            <span className="font-heading font-bold text-xl text-white hidden sm:block">
                                Salone Vault
                            </span>
                            <span className="font-heading font-bold text-xl text-white sm:hidden">
                                Salone Vault
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`${isActive('/')} hover:text-brand-teal font-medium transition-colors`}>
                            Home
                        </Link>
                        <a href="/#features" className={`${isActive('#features')} hover:text-brand-teal font-medium transition-colors`}>
                            Features
                        </a>
                        <a href="/#how-it-works" className={`${isActive('#how-it-works')} hover:text-brand-teal font-medium transition-colors`}>
                            How It Works
                        </a>
                        <Link to="/verify" className={`${isActive('/verify')} hover:text-brand-teal font-medium transition-colors`}>
                            Verify Document
                        </Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" className={`${isActive('/dashboard')} hover:text-brand-teal font-medium transition-colors`}>
                                    My Vault
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 text-white hover:text-brand-teal font-medium transition-colors"
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
                                        className="border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10 hover:text-brand-cyan"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/auth?mode=signup">
                                    <Button variant="primary" size="sm">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white hover:text-brand-teal"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-primary-dark border-b border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-brand-teal hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <a
                            href="/#features"
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-brand-teal hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="/#how-it-works"
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-brand-teal hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                        >
                            How It Works
                        </a>
                        <Link
                            to="/verify"
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-brand-teal hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                        >
                            Verify Document
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-brand-teal hover:bg-white/5"
                                    onClick={() => setIsOpen(false)}
                                >
                                    My Vault
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:text-brand-teal hover:bg-white/5"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="space-y-2 pt-2 px-3">
                                <Link
                                    to="/auth?mode=login"
                                    className="block w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link
                                    to="/auth?mode=signup"
                                    className="block w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Button variant="primary" className="w-full">
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
