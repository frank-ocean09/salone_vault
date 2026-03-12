import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logActivity } from '../lib/shareApi';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, phone: string, nin: string) => Promise<{ error: AuthError | null }>;
    // Returns any auth error, and session if immediately available after sign in
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null; session?: Session | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Supabase isn't configured, avoid any network calls and run in demo/local mode.
        if (!isSupabaseConfigured) {
            console.warn('⚠️ Supabase not configured. Running in demo mode. No network calls will be made.');
            // eslint-disable-next-line
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error getting session:', error);
                setLoading(false);
            });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string, phone: string, nin: string) => {
        if (!isSupabaseConfigured) {
            console.warn('Attempted signUp while Supabase is not configured. Aborting network call.');
            return { error: { message: 'Supabase not configured', name: 'ConfigurationError' } as any };
        }

        try {
            console.log('[AuthContext] Attempting signUp for:', email);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
                    data: {
                        full_name: fullName,
                        phone: phone,
                        nin: nin,
                    },
                },
            });

            if (error) {
                console.error('[AuthContext] signUp error:', error);
            } else {
                console.log('[AuthContext] signUp success:', data.user?.id);
            }

            // Profile creation is now handled by a database trigger on signup
            return { error };
        } catch (err: any) {
            console.error('[AuthContext] signUp exception:', err);
            return { error: err };
        }
    };

    const signIn = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            console.warn('Attempted signIn while Supabase is not configured. Aborting network call.');
            return { error: { message: 'Supabase not configured', name: 'ConfigurationError' } as any };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            // Log successful login
            if (!error && data.user) {
                await logActivity(data.user.id, 'user_login', undefined, undefined, {
                    email,
                    login_method: 'password',
                });
            }

            // If a session is returned immediately, set it in context so callers can rely on it synchronously
            if (data?.session) {
                setSession(data.session);
                setUser(data.user ?? null);
            }

            return { error, session: data?.session ?? null };
        } catch (err: any) {
            return { error: err };
        }
    };

    const signOut = async () => {
        if (!isSupabaseConfigured) {
            console.warn('Attempted signOut while Supabase is not configured. Nothing to do.');
            return;
        }

        try {
            // Log logout before signing out
            if (user) {
                await logActivity(user.id, 'user_logout');
            }

            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
