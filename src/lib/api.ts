import CryptoJS from 'crypto-js';
import { supabase } from './supabase';
import type { Document } from './supabase';

// Generate SHA-256 hash for document
// Generate SHA-256 hash for document using Web Crypto API
export async function generateDocumentHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex.substring(0, 16)}`; // Shortened for display
}

// Upload document file to Supabase Storage
export async function uploadDocument(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('Documents')
        .upload(filePath, file);

    if (error) throw error;
    return data.path;
}

// Create document record in database
export async function createDocument(
    userId: string,
    name: string,
    type: string,
    filePath: string,
    fileSize: number,
    hash: string,
    folderName?: string | null,
    sharedAlbumId?: string | null
) {
    const insertBody: any = {
        user_id: userId,
        name,
        type,
        file_path: filePath,
        file_size: fileSize,
        hash,
        status: 'pending',
    };

    if (folderName) insertBody.folder_name = folderName;
    if (sharedAlbumId) insertBody.shared_album_id = sharedAlbumId;

    const { data, error } = await supabase
        .from('documents')
        .insert(insertBody)
        .select()
        .single();

    if (error) throw error;
    return data as Document;
}

// Get all documents for a user
export async function getUserDocuments(userId: string) {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
}

// Get document download URL (signed URL valid for 1 hour)
export async function getDocumentUrl(filePath: string) {
    const { data, error } = await supabase.storage
        .from('Documents')
        .createSignedUrl(filePath, 3600); // 1 hour

    if (error) throw error;
    return data.signedUrl;
}

// Generate verification token for a document
export async function generateVerificationToken(documentId: string, expiresIn: { minutes?: number; hours?: number; days?: number } | 'never' = { days: 30 }) {
    const token = CryptoJS.lib.WordArray.random(16).toString();

    let expiresAt: Date;
    if (expiresIn === 'never') {
        // Use a far-future date to represent "never expires"
        expiresAt = new Date('2099-12-31T23:59:59Z');
    } else {
        expiresAt = new Date();
        if (expiresIn.minutes) expiresAt.setMinutes(expiresAt.getMinutes() + expiresIn.minutes);
        if (expiresIn.hours) expiresAt.setHours(expiresAt.getHours() + expiresIn.hours);
        if (expiresIn.days) expiresAt.setDate(expiresAt.getDate() + expiresIn.days);
    }

    const { data, error } = await supabase
        .from('verification_tokens')
        .insert({
            document_id: documentId,
            token,
            expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Verify document by token
export async function verifyDocumentByToken(token: string) {
    const { data: tokenData, error: tokenError } = await supabase
        .from('verification_tokens')
        .select('*, documents(*)')
        .eq('token', token)
        .single();

    if (tokenError) throw tokenError;

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Verification token has expired');
    }

    // Derive an issuer name from the document type for display purposes
    const doc = tokenData.documents;
    const issuerMap: Record<string, string> = {
        'Birth Certificate': 'Births and Deaths Registry',
        'National ID Card': 'National ID Authority',
        'Passport': 'Immigration Office',
        'Voter ID': 'Electoral Commission',
        "Driver’s License": 'DMV',
        'Driver\'s License': 'DMV',
        'Academic Certificate': 'Issuing Educational Institution',
    };

    const issuer = issuerMap[doc?.type] || 'Issuing Authority';

    return {
        token: tokenData.token,
        expires_at: tokenData.expires_at,
        document: doc,
        issuer,
    };
}

// Update document status
export async function updateDocumentStatus(documentId: string, status: 'pending' | 'verified') {
    const { data, error } = await supabase
        .from('documents')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// --- Folder Management ---

export async function getFolders(userId: string) {
    const { data, error } = await supabase
        .from('folders')
        .select('*, documents(count)')
        .eq('user_id', userId)
        .order('name', { ascending: true });

    if (error) throw error;

    return data.map((folder: any) => ({
        ...folder,
        document_count: folder.documents && folder.documents[0] ? folder.documents[0].count : 0
    }));
}

export async function getFolderDocuments(folderId: string) {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
}

export async function createFolder(userId: string, name: string, color: string = 'blue') {
    const { data, error } = await supabase
        .from('folders')
        .insert({ user_id: userId, name, color })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateFolder(folderId: string, updates: { name?: string; color?: string }) {
    const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', folderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteFolder(folderId: string) {
    // First, unlink all documents from this folder (set folder_id to null)
    const { error: unlinkError } = await supabase
        .from('documents')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

    if (unlinkError) throw unlinkError;

    // Then delete the folder
    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

    if (error) throw error;
}

export async function moveDocumentToFolder(documentId: string, folderId: string | null) {
    const { data, error } = await supabase
        .from('documents')
        .update({ folder_id: folderId })
        .eq('id', documentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// --- Shared Albums (Collaborative Folders) ---

// --- Shared Albums (Collaborative Folders) ---

export async function logAlbumActivity(albumId: string, action: string, userId: string | null, details: any = {}) {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                album_id: albumId,
                action,
                user_id: userId,
                details
            });
        if (error) console.error('Failed to log activity:', error);
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
}

export async function createSharedAlbum(ownerId: string, folderId: string | null, name: string) {
    const { data: album, error } = await supabase
        .from('shared_albums')
        .insert({ owner_id: ownerId, folder_id: folderId, name })
        .select()
        .single();

    if (error) throw error;

    // Log creation
    await logAlbumActivity(album.id, 'created', ownerId, { name });

    return album;
}

export async function inviteToSharedAlbum(sharedAlbumId: string, email: string, role: 'viewer' | 'uploader' = 'viewer') {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: member, error } = await supabase
        .from('shared_album_members')
        .insert({ shared_album_id: sharedAlbumId, email, role })
        .select()
        .single();

    if (error) throw error;

    // Log invite
    await logAlbumActivity(sharedAlbumId, 'invited', user?.id || null, { email, role });

    return member;
}

export async function removeAlbumMember(albumId: string, memberId: string) { // memberId is the ID from shared_album_members table
    const { data: { user } } = await supabase.auth.getUser();

    // Get member details first for logging
    const { data: member } = await supabase.from('shared_album_members').select('email').eq('id', memberId).single();

    const { error } = await supabase
        .from('shared_album_members')
        .delete()
        .eq('id', memberId);

    if (error) throw error;

    if (member) {
        await logAlbumActivity(albumId, 'removed', user?.id || null, { email: member.email });
    }
}

export async function updateAlbumMemberRole(albumId: string, memberId: string, newRole: 'viewer' | 'uploader') {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: member } = await supabase.from('shared_album_members').select('email').eq('id', memberId).single();

    const { data, error } = await supabase
        .from('shared_album_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .select()
        .single();

    if (error) throw error;

    if (member) {
        await logAlbumActivity(albumId, 'permission_changed', user?.id || null, { email: member.email, newRole });
    }
    return data;
}

export async function getSharedAlbumsForUser(userId: string) {
    // 1. Get albums owned by user
    const { data: ownedAlbums, error: ownedError } = await supabase
        .from('shared_albums')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

    if (ownedError) throw ownedError;

    // 2. Get albums shared with user (where user_id matches OR email matches)
    // We'll need the user's email for this.
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email;

    let sharedAlbums: any[] = [];
    if (userEmail) {
        const { data: memberRecords, error: memberError } = await supabase
            .from('shared_album_members')
            .select('shared_album_id, shared_albums(*)')
            .or(`user_id.eq.${userId},email.eq.${userEmail}`);

        if (memberError) throw memberError;

        sharedAlbums = memberRecords
            .map((m: any) => m.shared_albums)
            .filter((album: any) => album && album.owner_id !== userId); // Exclude if we are owner (already fetched)
    }

    return {
        owned: ownedAlbums || [],
        shared: sharedAlbums || []
    };
}

export async function getSharedAlbumMembers(sharedAlbumId: string) {
    const { data, error } = await supabase
        .from('shared_album_members')
        .select('*')
        .eq('shared_album_id', sharedAlbumId);
    if (error) throw error;
    return data;
}

export async function getSharedAlbumDocuments(albumId: string) {
    // We can just use standard select with filter now that RLS is set up, 
    // but the RPC might still be useful if it does complex joining. 
    // Taking a mental check: The migration `20260110153000_get_shared_documents.sql` (implied name) probably has valid logic.
    // But let's stick to simple select if possible to avoid RPC dependnecy issues if not needed.
    // Actually, let's use the RPC if it exists, or fallback to simple query.
    // The previous code used RPC `get_shared_album_documents`. I'll keep it to avoid breaking changes if that RPC does something specific.

    // However, if we want to ensure we get proper RLS filtered docs:
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('shared_album_id', albumId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
}

export async function getAlbumActivityLogs(albumId: string) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// --- Folder Sharing & Permissions ---

export async function logFolderActivity(folderId: string, action: string, userId: string | null, details: any = {}) {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                folder_id: folderId,
                action,
                user_id: userId,
                details
            });
        if (error) console.error('Failed to log folder activity:', error);
    } catch (err) {
        console.error('Failed to log folder activity:', err);
    }
}

export async function shareFolder(folderId: string, email: string, permissionLevel: 'view_only' | 'upload_only' | 'view_upload') {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('Not authenticated');

    // 1. Find target user by email in profiles
    const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profileError || !targetProfile) {
        throw new Error('User does not exist');
    }

    // 2. Check if already shared
    const { data: existingAccess } = await supabase
        .from('folder_access')
        .select('id')
        .eq('folder_id', folderId)
        .eq('user_id', targetProfile.id)
        .single();

    if (existingAccess) {
        throw new Error('User is already added to this folder');
    }

    // 3. Insert access record
    const { data: access, error: accessError } = await supabase
        .from('folder_access')
        .insert({
            folder_id: folderId,
            user_id: targetProfile.id,
            permission_level: permissionLevel
        })
        .select()
        .single();

    if (accessError) throw accessError;

    // 4. Log activity
    await logFolderActivity(folderId, 'User added to folder', currentUser.id, {
        target_email: email,
        permission_level: permissionLevel
    });

    return access;
}

export async function getFolderAccessList(folderId: string) {
    const { data, error } = await supabase
        .from('folder_access')
        .select(`
            *,
            profiles:user_id (email, full_name)
        `)
        .eq('folder_id', folderId);

    if (error) throw error;
    return data;
}

export async function updateFolderAccess(folderId: string, accessId: string, email: string, newLevel: 'view_only' | 'upload_only' | 'view_upload') {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('folder_access')
        .update({ permission_level: newLevel })
        .eq('id', accessId)
        .select()
        .single();

    if (error) throw error;

    await logFolderActivity(folderId, 'Permission changed', currentUser?.id || null, {
        target_email: email,
        new_permission_level: newLevel
    });

    return data;
}

export async function revokeFolderAccess(folderId: string, accessId: string, email: string) {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('folder_access')
        .delete()
        .eq('id', accessId);

    if (error) throw error;

    await logFolderActivity(folderId, 'User removed', currentUser?.id || null, {
        target_email: email
    });
}

export async function getSharedWithMeFolders(userId: string) {
    const { data, error } = await supabase
        .from('folder_access')
        .select(`
            folder_id,
            permission_level,
            folders:folder_id (*)
        `)
        .eq('user_id', userId);

    if (error) throw error;

    // Map to a more useful format
    return data.map((item: any) => ({
        ...item.folders,
        permission_level: item.permission_level,
        is_shared: true
    }));
}
