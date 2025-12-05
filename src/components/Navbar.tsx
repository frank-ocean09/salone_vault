import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
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

    return (
        <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 transform transition-transform duration-300 ${hidden && !isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/nddv-logo.png" alt="NDDV Logo" className="h-10 w-10" />
                            <span className="font-heading font-bold text-xl text-primary-green hidden sm:block">
                                Salone Vault
                            </span>
                            <span className="font-heading font-bold text-xl text-primary-green sm:hidden">
                                Salone Vault
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-primary-green font-medium">
                            Home
                        </Link>
                        <Link to="/verify" className="text-gray-600 hover:text-primary-green font-medium">
                            Verify Document
                        </Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-primary-green font-medium">
                                    My Vault
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 text-gray-600 hover:text-primary-green font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/auth">
                                <Button variant="primary" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-primary-green"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-green hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/verify"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-green hover:bg-gray-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Verify Document
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-green hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    My Vault
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-green hover:bg-gray-50"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-green hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
