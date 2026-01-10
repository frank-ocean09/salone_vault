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
    folderName?: string | null
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

export async function createSharedAlbum(ownerId: string, folderId: string, name: string) {
    const { data, error } = await supabase
        .from('shared_albums')
        .insert({ owner_id: ownerId, folder_id: folderId, name })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function inviteToSharedAlbum(sharedAlbumId: string, email: string, role: 'viewer' | 'uploader' = 'viewer') {
    const { data, error } = await supabase
        .from('shared_album_members')
        .insert({ shared_album_id: sharedAlbumId, email, role })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getSharedAlbumsForUser(userId: string) {
    // Simple fetch: albums owned by the user (memberships can be added in RPC later)
    const { data, error } = await supabase
        .from('shared_albums')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getSharedAlbumMembers(sharedAlbumId: string) {
    const { data, error } = await supabase
        .from('shared_album_members')
        .select('*')
        .eq('shared_album_id', sharedAlbumId);
    if (error) throw error;
    return data;
}

