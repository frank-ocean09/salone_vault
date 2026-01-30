import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const isActive = (path: string) => {
        if (path.startsWith('#')) {
            return location.hash === path || location.pathname + location.hash === '/' + path;
        }
        return location.pathname === path;
    };

    return (
        <nav className="bg-[#02353C] sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-white font-bold text-xl">Salone Vault</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {/* Desktop Navigation */}
                        <div className="flex items-center space-x-8">
                            <Link
                                to="/"
                                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-[#3FD0C9]' : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                Home
                            </Link>
                            <a
                                href="/#features"
                                className={`text-sm font-medium transition-colors ${isActive('#features') ? 'text-[#3FD0C9]' : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                Features
                            </a>
                            <a
                                href="/#how-it-works"
                                className={`text-sm font-medium transition-colors ${isActive('#how-it-works') ? 'text-[#3FD0C9]' : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                How It Works
                            </a>
                            <Link
                                to="/verify"
                                className={`text-sm font-medium transition-colors ${isActive('/verify') ? 'text-[#3FD0C9]' : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                Verify Document
                            </Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="px-4 py-2 text-sm font-medium text-white hover:text-[#3FD0C9] transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/auth?mode=login"
                                        className="px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-md hover:bg-white/10 transition-all"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/auth?mode=signup"
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#2EAF7D] rounded-md hover:bg-[#2EAF7D]/90 transition-all"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-white hover:bg-white/10 transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-[#02353C] border-t border-white/10">
                    <div className="px-4 py-4 space-y-3">
                        <Link
                            to="/"
                            className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <a
                            href="/#features"
                            className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="/#how-it-works"
                            className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            How It Works
                        </a>
                        <Link
                            to="/verify"
                            className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Verify Document
                        </Link>

                        {user ? (
                            <div className="pt-3 border-t border-white/10 space-y-2">
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 text-sm font-medium text-white hover:bg-white/5 rounded-md transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-all"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="pt-3 border-t border-white/10 space-y-2">
                                <Link
                                    to="/auth?mode=login"
                                    className="block px-3 py-2 text-sm font-medium text-center text-white border border-white/30 rounded-md hover:bg-white/10 transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/auth?mode=signup"
                                    className="block px-3 py-2 text-sm font-medium text-center text-white bg-[#2EAF7D] rounded-md hover:bg-[#2EAF7D]/90 transition-all"
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
