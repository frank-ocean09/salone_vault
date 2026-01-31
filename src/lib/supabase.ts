import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the Supabase client. If env vars are missing we still create a client
// with placeholders to avoid crashing the app; but we surface clear warnings to
// the developer so they can fix their `.env` or deployment secrets.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Check if Supabase is properly configured in this runtime
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Helper to log masked debug info about Supabase env variables.
export function checkSupabaseConfig(): void {
    try {
        // Mask the anon key for logs (show only first 8 chars)
        const maskedKey = supabaseAnonKey ? `${supabaseAnonKey.slice(0, 8)}...` : '(missing)';
        // Short-circuit message
        if (!supabaseUrl || !supabaseAnonKey) {

            console.warn('[supabase] Missing configuration.');

            console.info('[supabase] VITE_SUPABASE_URL =', supabaseUrl || '(missing)');

            console.info('[supabase] VITE_SUPABASE_ANON_KEY =', maskedKey);

            console.info(
                '[supabase] To fix: add a `.env.local` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and restart dev server.'
            );
            return;
        }

        // If present, print a concise confirmation (don't log the full key)

        console.info('[supabase] Config detected. URL =', supabaseUrl);

        console.info('[supabase] ANON_KEY (masked) =', maskedKey);

        console.info(
            '[supabase] If you still get 401s, check Row-Level Security (RLS) policies on the Supabase table.'
        );
    } catch (err) {

        console.error('[supabase] Error while checking config:', err);
    }
}

// Database types
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: string;
    user_id: string;
    name: string;
    type: string;
    file_path: string;
    file_size: number | null;
    hash: string;
    status: 'pending' | 'verified';
    folder_name?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Folder {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
    document_count?: number;
}

export interface Document {
    id: string;
    user_id: string;
    name: string;
    type: string;
    file_path: string;
    file_size: number | null;
    hash: string;
    status: 'pending' | 'verified';
    folder_name?: string | null; // Deprecated, kept for backward compatibility if needed
    folder_id?: string | null;
    created_at: string;
    updated_at: string;
}

export interface VerificationToken {
    id: string;
    document_id: string;
    token: string;
    expires_at: string;
    created_at: string;
}

export interface FolderAccess {
    id: string;
    folder_id: string;
    user_id: string;
    permission_level: 'view_only' | 'upload_only' | 'view_upload';
    created_at: string;
    updated_at: string;
    profiles?: {
        email: string;
        full_name: string | null;
    };
    folders?: {
        name: string;
        user_id: string;
    };
}

export interface ActivityLog {
    id: string;
    album_id?: string | null;
    folder_id?: string | null;
    document_id?: string | null;
    user_id: string | null;
    action: string;
    token?: string | null;
    details?: any;
    meta?: any;
    created_at: string;
}
