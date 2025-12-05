import { supabase } from './supabase';

// --- Share Token Management ---

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new share token for a document
 */
export async function createShareToken(
    documentId: string,
    userId: string,
    expiryHours: number,
    maxUses?: number
) {
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const { data, error } = await supabase
        .from('share_tokens')
        .insert({
            document_id: documentId,
            token,
            created_by: userId,
            expires_at: expiresAt.toISOString(),
            max_uses: maxUses || null,
        })
        .select()
        .single();

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'share_created', documentId, token, {
        expiry_hours: expiryHours,
        max_uses: maxUses,
    });

    return {
        ...data,
        shareUrl: `${window.location.origin}/verify?token=${token}`,
    };
}

/**
 * Revoke a share token
 */
export async function revokeShareToken(tokenId: string, userId: string) {
    const { data, error } = await supabase
        .from('share_tokens')
        .update({ revoked: true })
        .eq('id', tokenId)
        .eq('created_by', userId)
        .select()
        .single();

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'share_revoked', data.document_id, data.token);

    return data;
}

/**
 * Validate and use a share token
 */
export async function validateShareToken(token: string) {
    // Get token data
    const { data: tokenData, error: tokenError } = await supabase
        .from('share_tokens')
        .select('*, documents(*)')
        .eq('token', token)
        .single();

    if (tokenError) throw new Error('Invalid or expired token');

    // Check if revoked
    if (tokenData.revoked) {
        throw new Error('This share link has been revoked');
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('This share link has expired');
    }

    // Check max uses
    if (tokenData.max_uses !== null && tokenData.uses >= tokenData.max_uses) {
        throw new Error('This share link has reached its maximum number of uses');
    }

    // Increment uses
    const { error: updateError } = await supabase
        .from('share_tokens')
        .update({ uses: tokenData.uses + 1 })
        .eq('id', tokenData.id);

    if (updateError) throw updateError;

    // Log verification activity (no user_id for public access)
    await logActivity(null, 'document_verified', tokenData.document_id, token, {
        uses: tokenData.uses + 1,
    });

    return {
        token: tokenData,
        document: tokenData.documents,
    };
}

/**
 * Get all share tokens for a document
 */
export async function getDocumentShareTokens(documentId: string, userId: string) {
    const { data, error } = await supabase
        .from('share_tokens')
        .select('*')
        .eq('document_id', documentId)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// --- Activity Logging ---

/**
 * Log an activity
 */
export async function logActivity(
    userId: string | null,
    action: string,
    documentId?: string,
    token?: string,
    meta?: Record<string, any>
) {
    const activityMeta: Record<string, any> = {
        ...meta,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
    };

    const { error } = await supabase
        .from('activity_logs')
        .insert({
            user_id: userId,
            action,
            document_id: documentId || null,
            token: token || null,
            meta: activityMeta,
        });

    if (error) {
        console.error('Failed to log activity:', error);
    }
}

/**
 * Get activity logs for a user
 */
export async function getUserActivityLogs(userId: string, limit: number = 50) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

/**
 * Get activity logs for a document
 */
export async function getDocumentActivityLogs(documentId: string, userId: string) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
