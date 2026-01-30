import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { FolderList } from '../components/FolderList';
import { ShareModal } from '../components/ShareModal';
import { DocumentView } from '../components/DocumentView';
import { AlbumSettingsModal } from '../components/AlbumSettingsModal';
import { Plus, FileText, CheckCircle, Clock, Share2, Search, Upload as UploadIcon, AlertCircle, Eye, Trash2, FolderInput, Activity, ChevronDown, ChevronUp, Users, Settings, Wallet, Bell, User as UserIcon, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { DocumentsTable } from '../components/DocumentsTable';
import { BulkToolbar } from '../components/BulkToolbar';
import { SharedAlbumsSidebar } from '../components/SharedAlbumsSidebar';
import { ShareFolderModal } from '../components/ShareFolderModal';
import { DebugPanel } from '../components/DebugPanel';
import { useSelection } from '../hooks/useSelection';
import { Toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import {
    getUserDocuments,
    uploadDocument,
    createDocument,
    generateDocumentHash,
    getDocumentUrl,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveDocumentToFolder,
    // Shared album APIs
    createSharedAlbum,
    inviteToSharedAlbum,
    getSharedAlbumsForUser,
    getSharedAlbumMembers,
    getSharedAlbumDocuments,
} from '../lib/api';
import { registerDocumentOnChain } from '../lib/blockchain';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/shareApi';
import CryptoJS from 'crypto-js';
import type { Document, Folder } from '../lib/supabase';

export function Dashboard() {
    const navigate = useNavigate();
    const { user, loading: authLoading, signOut } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [viewingSharedAlbum, setViewingSharedAlbum] = useState<{ id: string; name: string; folder_id?: string; owner_id: string } | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [albumSettingsOpen, setAlbumSettingsOpen] = useState(false);

    // Selection handled by hook
    const { selectedIds: selectedDocIds, toggle: toggleSelect, selectAll, deselectAll, clear } = useSelection();
    const selectedCount = selectedDocIds.length;

    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'not_verified'>('all');

    // Bulk action modals
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkShareOpen, setBulkShareOpen] = useState(false);
    const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
    const [bulkMoveFolderId, setBulkMoveFolderId] = useState<string | null>(null);
    const [bulkMoveNewFolderName, setBulkMoveNewFolderName] = useState('');
    const [bulkShareExpiry, setBulkShareExpiry] = useState<string>('24 hours');

    // Selection helpers are provided by the useSelection hook: toggleSelect, selectAll, deselectAll, clear
    // Use those directly where needed (no extra wrappers to avoid naming collisions).

    // Modal state and controls
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadModalStep, setUploadModalStep] = useState<'info' | 'success'>('info');
    const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [blockchainAddress, setBlockchainAddress] = useState<string>('');
    const [selectedDocType, setSelectedDocType] = useState<string>('Birth Certificate');
    const [documentName, setDocumentName] = useState<string>('');
    const [otherDocType, setOtherDocType] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [shareExpiry, setShareExpiry] = useState<string>('24 hours');
    const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const [shareTargetDocument, setShareTargetDocument] = useState<Document | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    // PDF Viewer state
    const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
    const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);

    // New share modal state
    const [newShareModalOpen, setNewShareModalOpen] = useState<boolean>(false);
    const [newShareTargetDocument, setNewShareTargetDocument] = useState<Document | null>(null);

    // Folder sharing state
    const [shareFolderId, setShareFolderId] = useState<string | null>(null);
    const [shareFolderModalOpen, setShareFolderModalOpen] = useState(false);

    // Shared albums list (declared before useEffect to avoid temporal dead zone)
    const [sharedAlbums, setSharedAlbums] = useState<any[]>([]);



    // Folder states for upload modal
    const [uploadSelectedFolderId, setUploadSelectedFolderId] = useState<string>('');
    const [uploadNewFolderName, setUploadNewFolderName] = useState<string>('');
    const [suggestedFolderName, setSuggestedFolderName] = useState<string | null>(null);

    // Suggest folder based on type/name
    useEffect(() => {
        if (!showUploadModal) {
            setSuggestedFolderName(null);
            return;
        }
        const type = selectedDocType === 'Other' ? otherDocType : selectedDocType;
        const suggestion = suggestFolder(type, documentName);
        setSuggestedFolderName(suggestion);
    }, [showUploadModal, selectedDocType, otherDocType, documentName]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        }
    }, [user, authLoading, navigate]);

    // Fetch documents and user's shared albums

    useEffect(() => {
        if (user) {
            loadDocuments();
        }
    }, [user]);

    const loadDocuments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const [docs, userFolders, userSharedAlbums] = await Promise.all([
                getUserDocuments(user.id),
                getFolders(user.id),
                getSharedAlbumsForUser(user.id)
            ]);
            setDocuments(docs);
            setFolders(userFolders);
            setSharedAlbums(userSharedAlbums || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (name: string, color: string) => {
        if (!user) return;
        try {
            const newFolder = await createFolder(user.id, name, color);
            setFolders([...folders, newFolder]);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateFolder = async (folderId: string, name: string, color: string) => {
        try {
            const updated = await updateFolder(folderId, { name, color });
            setFolders(folders.map(f => f.id === folderId ? updated : f));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        try {
            await deleteFolder(folderId);
            setFolders(folders.filter(f => f.id !== folderId));
            if (selectedFolderId === folderId) setSelectedFolderId(null);
            // Refresh documents to update folder_id references
            const docs = await getUserDocuments(user!.id);
            setDocuments(docs);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleMoveDocument = async (doc: Document, folderId: string | null) => {
        try {
            await moveDocumentToFolder(doc.id, folderId);
            setDocuments(documents.map(d => d.id === doc.id ? { ...d, folder_id: folderId } : d));
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Auto-categorize helper
    const suggestFolder = (docType: string, docName: string): string | null => {
        const lowerName = docName.toLowerCase();

        if (docType === 'Birth Certificate' || lowerName.includes('birth')) return 'Certificates';
        if (docType === 'Academic Certificate' || lowerName.includes('degree') || lowerName.includes('diploma')) return 'Education';
        if (docType.includes('ID') || docType.includes('Passport') || docType.includes('License')) return 'Identity';
        if (lowerName.includes('contract') || lowerName.includes('agreement')) return 'Contracts';
        if (lowerName.includes('invoice') || lowerName.includes('receipt')) return 'Financial';

        return null;
    };

    const handleViewDocument = async (doc: Document) => {
        try {
            // For both PDFs and images, we'll open the new DocumentView modal
            let url = null;
            if (navigator.onLine) {
                url = await getDocumentUrl(doc.file_path);
            }

            setViewingDocument(doc);
            setViewingDocUrl(url);
        } catch (err: any) {
            console.error('Error opening document:', err);
            setError('Failed to open document');
        }
    };
    const handleDeleteDocument = async (doc: Document) => {
        if (!confirm(`Are you sure you want to delete "${doc.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            console.log('Deleting document:', doc.id, doc.file_path);

            // Step 1: Delete verification tokens first (foreign key constraint)
            const { error: tokenError } = await supabase
                .from('verification_tokens')
                .delete()
                .eq('document_id', doc.id);

            if (tokenError) {
                console.error('Token delete error:', tokenError);
                throw new Error('Cannot delete this document because it has shared verification links. This is a database permission issue - please contact your administrator or delete the verification tokens from the Supabase dashboard first.');
            }
            console.log('Verification tokens deleted (or none existed)');

            // Step 2: Delete from database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

            if (dbError) {
                console.error('Database delete error:', dbError);
                throw new Error(`Database error: ${dbError.message}`);
            }
            console.log('Document deleted from database');

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('Documents')
                .remove([doc.file_path]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Don't throw - file might already be deleted or not exist
                console.warn('Failed to delete file from storage, but database record was removed');
            } else {
                console.log('Document deleted from storage');
            }

            // Update local state
            setDocuments(documents.filter(d => d.id !== doc.id));
            console.log('Document removed from UI');
        } catch (err: any) {
            console.error('Delete failed:', err);
            setError(err.message || 'Failed to delete document');
        }
    };

    // Bulk Delete selected documents
    const handleConfirmBulkDelete = async () => {
        if (selectedDocIds.length === 0) return;
        setBulkDeleteOpen(false);

        try {
            // Gather file paths for storage deletion
            const docsToDelete = documents.filter(d => selectedDocIds.includes(d.id));
            const filePaths = docsToDelete.map(d => d.file_path);

            // 1. Delete verification tokens in batch
            const { error: tokenErr } = await supabase
                .from('verification_tokens')
                .delete()
                .in('document_id', selectedDocIds);

            if (tokenErr) throw tokenErr;

            // 2. Delete documents in batch
            const { error: docsErr } = await supabase
                .from('documents')
                .delete()
                .in('id', selectedDocIds);

            if (docsErr) throw docsErr;

            // 3. Remove files from storage
            if (filePaths.length > 0) {
                const { error: storageErr } = await supabase.storage
                    .from('Documents')
                    .remove(filePaths);
                if (storageErr) console.warn('Some files failed to delete from storage', storageErr);
            }

            // 4. Update UI
            setDocuments(prev => prev.filter(d => !selectedDocIds.includes(d.id)));
            clear();
            showToast(`Deleted ${docsToDelete.length} documents`, 'success');
        } catch (err: any) {
            console.error('Bulk delete failed', err);
            setError(err.message || 'Bulk delete failed');
            showToast('Bulk delete encountered an error', 'error');
        }
    };

    // Bulk Share selected documents
    const handleConfirmBulkShare = async () => {
        if (selectedDocIds.length === 0) return;
        setBulkShareOpen(false);

        try {
            const tokens: string[] = [];

            await Promise.all(selectedDocIds.map(async (docId) => {
                const doc = documents.find(d => d.id === docId);
                if (!doc) return;

                const tokenArray = crypto.getRandomValues(new Uint8Array(16));
                const token = Array.from(tokenArray)
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');

                const now = new Date();
                const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // default 24h

                const { error: insertError } = await supabase
                    .from('verification_tokens')
                    .insert({
                        token,
                        document_id: doc.id,
                        document_type_snapshot: doc.type,
                        document_snapshot: { document_type: doc.type, uploaded_at: doc.created_at },
                        expires_at: expiresAt,
                    });

                if (insertError) throw insertError;

                tokens.push(token);
            }));

            // Copy tokens to clipboard as newline-separated list
            await navigator.clipboard.writeText(tokens.join('\n'));
            showToast(`Created ${tokens.length} share tokens and copied to clipboard`, 'success');
            clear();
        } catch (err: any) {
            console.error('Bulk share failed', err);
            setError(err.message || 'Bulk share failed');
            showToast('Bulk share encountered an error', 'error');
        }
    };

    // Bulk Move selected documents to folder
    const handleConfirmBulkMove = async () => {
        if (selectedDocIds.length === 0) return;
        setBulkMoveOpen(false);

        try {
            let folderIdToUse = bulkMoveFolderId;
            if (!folderIdToUse && bulkMoveNewFolderName.trim()) {
                const newF = await createFolder(user!.id, bulkMoveNewFolderName.trim(), 'blue');
                setFolders(prev => [...prev, newF]);
                folderIdToUse = newF.id;
            }

            if (!folderIdToUse) {
                showToast('Please select or create a folder to move documents into', 'error');
                return;
            }

            await Promise.all(selectedDocIds.map(async (docId) => {
                await moveDocumentToFolder(docId, folderIdToUse as string);
            }));

            // Update UI
            setDocuments(prev => prev.map(d => selectedDocIds.includes(d.id) ? { ...d, folder_id: folderIdToUse } : d));
            clear();
            setBulkMoveFolderId(null);
            setBulkMoveNewFolderName('');
            showToast('Documents moved successfully', 'success');
        } catch (err: any) {
            console.error('Bulk move failed', err);
            setError(err.message || 'Bulk move failed');
            showToast('Bulk move encountered an error', 'error');
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only PDF, JPEG, and PNG files are allowed');
            return;
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            setError('File size must be less than 50MB');
            return;
        }

        // Store file and show modal for metadata entry
        setSelectedFile(file);
        // require user to type a name (do not prefill)
        setDocumentName('');
        setUploadModalStep('info');
        setShowUploadModal(true);
        e.target.value = ''; // Reset file input
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile || !user || !documentName.trim()) {
            setError('Please enter a document name');
            return;
        }

        setIsUploading(true);
        setUploadStatus('Processing & Uploading...');
        setError(null);

        try {
            // Start both operations in parallel
            const [hash, filePath] = await Promise.all([
                generateDocumentHash(selectedFile),
                uploadDocument(selectedFile, user.id)
            ]);

            // Use selected type or custom type
            const type = selectedDocType === 'Other' ? otherDocType : selectedDocType;

            // Determine folder ID
            let finalFolderId = uploadSelectedFolderId || null;

            // If new folder name is provided, create it
            if (uploadNewFolderName.trim()) {
                const newFolder = await createFolder(user.id, uploadNewFolderName.trim(), 'blue');
                setFolders(prev => [...prev, newFolder]);
                finalFolderId = newFolder.id;
            }
            // If no folder selected, try auto-categorization
            else if (!finalFolderId) {
                const suggestedName = suggestFolder(type, documentName);
                if (suggestedName) {
                    // Check if folder exists
                    const existing = folders.find(f => f.name === suggestedName);
                    if (existing) {
                        finalFolderId = existing.id;
                    } else {
                        // Create it
                        const newFolder = await createFolder(user.id, suggestedName, 'blue');
                        setFolders(prev => [...prev, newFolder]);
                        finalFolderId = newFolder.id;
                    }
                }
            }

            // Create document record with selected metadata
            setUploadStatus('Finalizing Record...');

            const newDoc = await createDocument(
                user.id,
                documentName.trim(),
                type,
                filePath,
                selectedFile.size,
                hash,
                uploadSelectedFolderId || null,
                viewingSharedAlbum?.id || null // Pass shared album ID if active
            );

            if (finalFolderId) {
                await moveDocumentToFolder(newDoc.id, finalFolderId);
                newDoc.folder_id = finalFolderId;
            }

            // Get preview URL
            let preview = '';
            try {
                preview = await getDocumentUrl(filePath);
            } catch (err) {
                console.warn('Failed to get preview URL', err);
            }

            // Trigger background blockchain registration
            // We do not await this, so the UI returns success immediately
            registerDocumentOnChain(selectedFile, newDoc.id);

            // Generate blockchain address (Placeholder for immediate UI feedback, or remove if we want to show real one later)
            const blockchainAddress = `0x${CryptoJS.SHA1(newDoc.id + Date.now().toString()).toString().slice(0, 40)}`;

            // Update modal to success state
            setUploadedDocument(newDoc);
            setPreviewUrl(preview);
            setBlockchainAddress(blockchainAddress);
            setUploadModalStep('success');

            // Add to list
            setDocuments([newDoc, ...documents]);

            // Log document upload activity
            await logActivity(user.id, 'document_uploaded', newDoc.id, undefined, {
                document_name: documentName.trim(),
                document_type: type,
                file_size: selectedFile.size,
                folder_id: finalFolderId,
            });

            // Simulate verification after a delay
            setTimeout(() => {
                setDocuments(prev => prev.map(d =>
                    d.id === newDoc.id
                        ? { ...d, status: 'verified' as const }
                        : d
                ));
            }, 3000);

        } catch (err: any) {
            console.error(new Date().toISOString(), 'Upload failed:', err);
            setError(err.message || 'Failed to upload document');
        } finally {
            setIsUploading(false);
            setUploadStatus('');
        }
    };

    const handleCloseModal = () => {
        setShowUploadModal(false);
        setUploadedDocument(null);
        setPreviewUrl('');
        setBlockchainAddress('');
        setSelectedDocType('Birth Certificate');
        setOtherDocType('');
        setShareExpiry('24 hours');
        setUploadSelectedFolderId('');
        setUploadNewFolderName('');
    };

    const handlePreviewNow = () => {
        if (previewUrl) window.open(previewUrl, '_blank');
    };

    const handleUploadAnother = () => {
        handleCloseModal();
        // open file dialog again
        fileInputRef.current?.click();
    };

    const handleCopyAddress = async () => {
        if (!blockchainAddress) return;
        try {
            await navigator.clipboard.writeText(blockchainAddress);
            showToast('Blockchain address copied to clipboard!', 'success');
        } catch (err) {
            console.error('Copy failed', err);
            showToast('Failed to copy address', 'error');
        }
    };

    const openShareModal = (doc: Document) => {
        setShareTargetDocument(doc);
        setShareExpiry('24 hours');
        setShareModalOpen(true);
    };

    const closeShareModal = () => {
        setShareTargetDocument(null);
        setShareModalOpen(false);
        setShareExpiry('24 hours');
    };

    const handleCreateShareLink = async () => {
        const doc = shareTargetDocument;
        if (!doc) return;

        let expiresParam: any = { days: 1 };
        switch (shareExpiry) {
            case '10 minutes':
                expiresParam.minutes = 10;
                delete expiresParam.days;
                break;
            case '1 hour':
                expiresParam.hours = 1;
                delete expiresParam.days;
                break;
            case '24 hours':
                expiresParam.days = 1;
                break;
            case '7 days':
                expiresParam = { days: 7 };
                break;
            case '30 days':
                expiresParam = { days: 30 };
                break;
            case 'Never expires':
                expiresParam = 'never';
                break;
            default:
                expiresParam = { days: 1 };
        }

        try {
            // Generate secure random token
            const tokenArray = crypto.getRandomValues(new Uint8Array(16));
            const token = Array.from(tokenArray)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            // Calculate expiry time
            const now = new Date();
            let expiresAt: string = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Default to 24hrs

            switch (shareExpiry) {
                case '10min':
                    expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
                    break;
                case '1hr':
                    expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
                    break;
                case '24hr':
                    expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
                    break;
                case '7days':
                    expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
                    break;
                case '30days':
                    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
                    break;
                case 'never':
                    // Set expiry to 100 years in the future for "never expire" tokens
                    expiresAt = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
                    break;
            }

            // Prepare document snapshot
            const documentSnapshot = {
                document_type: doc.type,
                // issuer: doc.issuer || 'Unknown Issuer', // TODO: Add issuer field to Document type
                // blockchain_address: doc.blockchain_address || null, // TODO: Add blockchain_address field
                // file_hash: doc.file_hash || null, // TODO: Add file_hash field
                uploaded_at: doc.created_at,
            };

            // Insert verification token into database
            const { error: insertError } = await supabase
                .from('verification_tokens')
                .insert({
                    token,
                    document_id: doc.id,
                    document_type_snapshot: doc.type,
                    // issuer_snapshot: doc.issuer || 'Unknown Issuer', // TODO: Add issuer field
                    // blockchain_address_snapshot: doc.blockchain_address || null, // TODO: Add blockchain_address
                    // file_hash: doc.file_hash || null, // TODO: Add file_hash field
                    document_snapshot: documentSnapshot,
                    expires_at: expiresAt,
                });

            if (insertError) {
                throw new Error(`Failed to create verification token: ${insertError.message}`);
            }

            // Generate signed URL for document preview (valid for 5 minutes)
            await supabase.storage
                .from('Documents')
                .createSignedUrl(doc.file_path, 300); // 300 seconds = 5 minutes

            // Copy just the token to clipboard
            await navigator.clipboard.writeText(token);

            // Notify user
            const expiryText = expiresAt
                ? `Expires: ${new Date(expiresAt).toLocaleString()}`
                : 'Never expires';
            alert(`✓ Token copied to clipboard!\n${expiryText}\n\nShare this token to verify the document.`);

            closeShareModal();
        } catch (err: any) {
            console.error('Failed to create share link', err);
            setError(err.message || 'Failed to create share link');
        }
    };

    // Create shared album (used by other flows)
    const handleCreateSharedAlbumAndInvite = async () => {
        if (!user || !shareFolderId) return;
        try {
            setShareFolderModalOpen(false);
            const folder = folders.find(f => f.id === shareFolderId);
            await createSharedAlbum(user.id, shareFolderId, folder?.name || 'Shared Album');

            // Refresh shared albums list
            const userSharedAlbums = await getSharedAlbumsForUser(user.id);
            setSharedAlbums(userSharedAlbums || []);
            showToast('Shared album created', 'success');
        } catch (err: any) {
            console.error('Failed to create shared album', err);
            setError(err.message || 'Failed to create shared album');
            showToast('Failed to create shared album', 'error');
        }
    };

    const handleSelectSharedAlbum = async (album: any) => {
        try {
            setLoading(true);
            setViewingSharedAlbum({ id: album.id, name: album.name, folder_id: album.folder_id, owner_id: album.owner_id });
            setSelectedFolderId(null); // Deselect personal folder

            // If the album is linked to a folder, fetch documents via RPC
            if (album.folder_id) {
                const docs = await getSharedAlbumDocuments(album.id);
                setDocuments(docs || []);
            } else {
                setDocuments([]); // Empty album
            }
            setMobileMenuOpen(false); // Close mobile menu if open
        } catch (err: any) {
            console.error('Failed to load shared documents', err);
            setError('Failed to load shared documents');
            showToast('Could not load shared album', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToMyVault = async () => {
        setViewingSharedAlbum(null);
        await loadDocuments();
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFolder = selectedFolderId === null || doc.folder_id === selectedFolderId;

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'verified' && doc.status === 'verified') ||
            (statusFilter === 'pending' && doc.status === 'pending') ||
            (statusFilter === 'not_verified' && doc.status !== 'verified' && doc.status !== 'pending');

        return matchesSearch && matchesFolder && matchesStatus;
    });

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false,
    });

    const [showDebugPanel, setShowDebugPanel] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const getWelcomeMessage = () => {
        const name = user?.user_metadata?.full_name || user?.email?.split('@')[0];
        if (name) {
            // Capitalize first letter of name if it's lowercase
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            return `Oh, welcome back, ${formattedName}!`;
        }
        return 'Welcome back!';
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#C1F6ED] flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-[#2EAF7D] border-t-transparent rounded-full" />
            </div>
        );
    }

    const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${active
                ? 'bg-[#3FD0C9] text-white shadow-lg shadow-[#3FD0C9]/20'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon className={`h-5 w-5 ${active ? 'text-white' : 'group-hover:text-[#3FD0C9] transition-colors'}`} />
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );



    return (
        <div className="min-h-screen bg-[#C1F6ED] flex transition-colors duration-500">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-72 bg-[#02353C] p-6 text-white fixed h-screen z-50 transition-colors duration-500">
                <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')}>
                    <div className="p-2 bg-[#2EAF7D] rounded-xl shadow-lg shadow-[#2EAF7D]/20">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tight leading-none block">SALONE</span>
                        <span className="font-medium text-[10px] tracking-[0.2em] text-[#3FD0C9] uppercase">Vault</span>
                    </div>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                    <NavItem icon={Activity} label="My Wallet" active={false} onClick={() => navigate('/wallet')} />
                    <NavItem icon={FolderInput} label="My Folders" active={!viewingSharedAlbum} onClick={handleBackToMyVault} />
                    <NavItem icon={Users} label="Shared With Me" active={!!viewingSharedAlbum} onClick={() => { }} />
                    <NavItem icon={FileText} label="Verification Requests" onClick={() => navigate('/requests')} />
                    <NavItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />

                    <div className="mt-10">
                        <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Folder Structure</p>
                        <div className="px-2">
                            <FolderList
                                folders={folders.map(f => ({ ...f, shared: sharedAlbums.some(sa => sa.folder_id === f.id) }))}
                                selectedFolderId={selectedFolderId}
                                onSelectFolder={(id) => { setSelectedFolderId(id); setMobileMenuOpen(false); }}
                                onCreateFolder={handleCreateFolder}
                                onUpdateFolder={handleUpdateFolder}
                                onDeleteFolder={handleDeleteFolder}
                                onShareFolder={(folderId) => { setShareFolderId(folderId); setShareFolderModalOpen(true); }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        onClick={() => signOut().then(() => navigate('/auth'))}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all group"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-bold text-sm">Sign Out</span>
                    </button>
                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#449342] animate-pulse" />
                            <span className="text-[10px] font-bold text-[#449342]">Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar Mobile */}
            <aside className={`lg:hidden fixed inset-y-0 left-0 w-80 bg-[#02353C] p-6 text-white z-[70] transition-transform duration-500 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2EAF7D] rounded-xl">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight">SALONEVAULT</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-xl border border-white/10">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-2 overflow-y-auto h-[calc(100vh-140px)] no-scrollbar py-6">
                    <NavItem icon={Activity} label="My Wallet" active={false} onClick={() => navigate('/wallet')} />
                    <NavItem icon={FolderInput} label="My Folders" active={!viewingSharedAlbum} onClick={handleBackToMyVault} />
                    <NavItem icon={Users} label="Shared With Me" active={!!viewingSharedAlbum} onClick={() => { }} />
                    <NavItem icon={FileText} label="Verification Requests" onClick={() => navigate('/requests')} />
                    <NavItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />

                    <div className="mt-8 px-2">
                        <FolderList
                            folders={folders.map(f => ({ ...f, shared: sharedAlbums.some(sa => sa.folder_id === f.id) }))}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={(id) => { setSelectedFolderId(id); setMobileMenuOpen(false); }}
                            onCreateFolder={handleCreateFolder}
                            onUpdateFolder={handleUpdateFolder}
                            onDeleteFolder={handleDeleteFolder}
                            onShareFolder={(folderId) => { setShareFolderId(folderId); setShareFolderModalOpen(true); }}
                        />
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col lg:pl-72 relative min-h-screen">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />

                {/* Top Bar */}
                <header className="sticky top-0 z-40 bg-[#02353C] border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between h-20 transition-all shadow-lg">
                    <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-3 flex-1 max-w-xl mx-4 lg:mx-0">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#3FD0C9] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search national digital vault..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#3FD0C9]/20 focus:bg-white/10 transition-all text-white placeholder:text-white/30"
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center px-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">National Digital Vault</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 h-2 w-2 bg-[#2EAF7D] rounded-full border-2 border-[#02353C]" />
                        </button>

                        <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block" />


                        <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block" />

                        <div className="flex items-center gap-3 pl-2">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-white leading-none mb-1">{user?.user_metadata?.full_name || 'Authorized User'}</p>
                                <p className="text-[10px] font-bold text-[#3FD0C9] uppercase tracking-widest">{user?.email?.split('@')[1] === 'gov.sl' ? 'Official' : 'Resident'}</p>
                            </div>
                            <button className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border-2 border-white/20 shadow-sm transition-transform hover:scale-110 active:scale-95 overflow-hidden">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon size={24} strokeWidth={2.5} />
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 sm:p-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dashboard-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#02353C" strokeWidth="0.5" />
                                    <circle cx="0" cy="0" r="1" fill="#02353C" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                            <div className="animate-in fade-in slide-in-from-left duration-700">
                                <h1 className="text-4xl font-black text-[#02353C] tracking-tight mb-2">
                                    {getWelcomeMessage()}
                                </h1>
                                <p className="text-[#02353C]/60 font-semibold flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-[#2EAF7D]" />
                                    Your personal state-secured digital document vault.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-right duration-700">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                <button
                                    onClick={handleUploadClick}
                                    className="bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white px-6 py-4 rounded-2xl shadow-lg shadow-[#2EAF7D]/20 transition-all flex items-center gap-3 font-bold active:scale-95 disabled:opacity-50"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Plus size={20} strokeWidth={3} />
                                    )}
                                    {isUploading ? 'Uploading...' : 'Upload Document'}
                                </button>
                                <button
                                    onClick={() => navigate('/activity-logs')}
                                    className="bg-white hover:bg-gray-50 text-[#02353C] px-6 py-4 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center gap-3 font-bold active:scale-95"
                                >
                                    <Activity size={20} />
                                    Activity
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4 animate-in slide-in-from-top duration-500 shadow-sm">
                                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-red-800 uppercase tracking-widest mb-1">System Alert</p>
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Vault Items', value: documents.length, icon: FileText, color: '#02353C' },
                                { label: 'State Verified', value: documents.filter(d => d.status === 'verified').length, icon: CheckCircle, color: '#449342' },
                                { label: 'Awaiting Verification', value: documents.filter(d => d.status === 'pending').length, icon: Clock, color: '#2EAF7D' },
                                { label: 'Security Score', value: '100%', icon: ShieldCheck, color: '#3FD0C9' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-2xl transition-colors duration-300" style={{ backgroundColor: `rgba(${stat.color === '#02353C' ? '2, 53, 60' : i === 1 ? '68, 147, 66' : i === 2 ? '46, 175, 125' : '63, 208, 201'}, 0.1)` }}>
                                            <stat.icon size={20} style={{ color: stat.color }} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-[#02353C] tracking-tighter mb-1">{stat.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#02353C]/40">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Document List Header */}
                        <div className="bg-white/40 backdrop-blur-sm p-8 rounded-t-[3rem] border-x border-t border-white flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6 w-full">
                                <h2 className="text-2xl font-black text-[#02353C] tracking-tight">
                                    {viewingSharedAlbum ? (
                                        <span className="flex items-center gap-3">
                                            <Users size={24} className="text-[#3FD0C9]" />
                                            {viewingSharedAlbum.name}
                                        </span>
                                    ) : selectedFolderId ? (
                                        <span className="flex items-center gap-3 text-[#3FD0C9]">
                                            <FolderInput size={24} />
                                            {folders.find(f => f.id === selectedFolderId)?.name}
                                        </span>
                                    ) : 'All Vault Items'}
                                </h2>
                                {selectedCount > 0 && (
                                    <div className="animate-in zoom-in duration-300">
                                        <BulkToolbar
                                            selectedCount={selectedCount}
                                            selectAll={() => selectAll(filteredDocuments.map(d => d.id))}
                                            deselectAll={() => deselectAll()}
                                            onOpenDelete={() => setBulkDeleteOpen(true)}
                                            onOpenMove={() => setBulkMoveOpen(true)}
                                            onOpenShare={() => setBulkShareOpen(true)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="flex bg-white/50 p-1 rounded-2xl border border-white shadow-sm">
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'verified', label: 'Verified' },
                                        { id: 'pending', label: 'Pending' },
                                        { id: 'not_verified', label: 'Not Verified' }
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setStatusFilter(f.id as any)}
                                            className={`px-4 py-2 rounded-xl shadow-sm text-xs font-bold tracking-widest uppercase transition-all ${statusFilter === f.id
                                                ? 'bg-white text-[#02353C] shadow-md'
                                                : 'text-[#02353C]/40 hover:text-[#02353C]'
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Document Grid Container */}
                        <div className="bg-white/40 backdrop-blur-sm p-8 rounded-b-[3rem] border-x border-b border-white min-h-[500px]">
                            {filteredDocuments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-1000">
                                    <div className="h-24 w-24 bg-[#C1F6ED]/50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <UploadIcon className="h-10 w-10 text-[#2EAF7D]" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#02353C] mb-2 uppercase tracking-widest">
                                        {documents.length === 0 ? 'Vault Empty' : 'No Matches Found'}
                                    </h3>
                                    <p className="text-[#02353C]/40 font-bold text-sm max-w-xs mx-auto mb-8">
                                        {documents.length === 0
                                            ? 'Start securing your essential national documents by uploading them now.'
                                            : 'Try adjusting your search criteria or switching folders.'}
                                    </p>
                                    {documents.length === 0 && (
                                        <button onClick={handleUploadClick} className="bg-[#2EAF7D] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-lg shadow-[#2EAF7D]/20">
                                            Initialize Upload
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col xl:flex-row gap-8">
                                    <div className="flex-1 min-w-0">
                                        <DocumentsTable
                                            documents={filteredDocuments}
                                            folders={folders}
                                            selectedIds={selectedDocIds}
                                            onToggleSelect={toggleSelect}
                                            onSelectAll={(ids) => selectAll(ids)}
                                            onDeselectAll={() => deselectAll()}
                                            onView={handleViewDocument}
                                            onDelete={handleDeleteDocument}
                                            onShare={(doc) => openShareModal(doc)}
                                            searchQuery={searchQuery}
                                        />
                                    </div>

                                    {/* Shared Albums integrated as a sidebar within content if needed, but we have them in main sidebar too */}
                                    <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
                                        <div className="bg-white/50 dark:bg-brand-lighter-dark/50 p-6 rounded-[2rem] border border-white dark:border-white/5">
                                            <h3 className="text-sm font-black text-[#02353C] dark:text-brand-pale uppercase tracking-widest mb-4">Manage Albums</h3>
                                            <SharedAlbumsSidebar
                                                userId={user!.id}
                                                onSelectAlbum={handleSelectSharedAlbum}
                                                onOpenShareFolder={(folderId) => { setShareFolderId(folderId); setShareFolderModalOpen(true); }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="w-full max-w-2xl bg-white dark:bg-brand-lighter-dark rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 border border-white dark:border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-[#02353C] dark:text-brand-pale uppercase tracking-widest">
                                    {uploadModalStep === 'info' ? 'Upload Document' : 'Next Steps'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-[#02353C]/40 dark:text-white/40 hover:text-[#02353C] dark:hover:text-white p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all">✕</button>
                            </div>

                            {uploadModalStep === 'info' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#02353C]/40 dark:text-white/40 mb-2">Document Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={documentName}
                                            onChange={(e) => setDocumentName(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-[#02353C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:border-[#3FD0C9] transition-all"
                                            placeholder="e.g., My Birth Certificate"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {[
                                                'Birth Certificate',
                                                'National ID Card',
                                                'Passport',
                                                'Voter ID',
                                                "Driver’s License",
                                                'Academic Certificate',
                                                'Other',
                                            ].map((opt) => (
                                                <label key={opt} className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="docType"
                                                        value={opt}
                                                        checked={selectedDocType === opt}
                                                        onChange={() => setSelectedDocType(opt)}
                                                        className="text-[#3FD0C9] focus:ring-[#3FD0C9]"
                                                    />
                                                    <span className="text-sm">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {selectedDocType === 'Other' && (
                                            <input
                                                type="text"
                                                placeholder="Please specify"
                                                value={otherDocType}
                                                onChange={(e) => setOtherDocType(e.target.value)}
                                                className="mt-2 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:border-[#3FD0C9]"
                                            />
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Folder (optional)</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={uploadSelectedFolderId}
                                                    onChange={(e) => { setUploadSelectedFolderId(e.target.value); setUploadNewFolderName(''); }}
                                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:border-[#3FD0C9]"
                                                >
                                                    <option value="">— No folder —</option>
                                                    {folders.map((f) => (
                                                        <option key={f.id} value={f.id}>{f.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Or create new folder"
                                                    value={uploadNewFolderName}
                                                    onChange={(e) => { setUploadNewFolderName(e.target.value); setUploadSelectedFolderId(''); }}
                                                    className="w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3FD0C9]/20 focus:border-[#3FD0C9]"
                                                />
                                            </div>
                                            {suggestedFolderName && !uploadSelectedFolderId && !uploadNewFolderName && (
                                                <div className="mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const existing = folders.find(f => f.name === suggestedFolderName);
                                                            if (existing) {
                                                                setUploadSelectedFolderId(existing.id);
                                                            } else {
                                                                setUploadNewFolderName(suggestedFolderName);
                                                            }
                                                        }}
                                                        className="text-xs text-[#3FD0C9] hover:underline flex items-center gap-1"
                                                    >
                                                        <span className="bg-[#CFF4D2] px-2 py-0.5 rounded-full font-medium text-[#02353C]">
                                                            Suggested: {suggestedFolderName}
                                                        </span>
                                                        <span className="text-gray-500">(Click to apply)</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                                        <Button onClick={handleConfirmUpload} disabled={isUploading || !documentName.trim()}>
                                            {isUploading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                    {uploadStatus || 'Uploading...'}
                                                </span>
                                            ) : (
                                                'Upload'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Step 2: Preview prompt */}
                                    <div className="mb-4">
                                        <p className="font-medium mb-2">Your document has been uploaded successfully. Would you like to preview it now?</p>
                                        <div className="flex gap-3">
                                            <Button onClick={handlePreviewNow}>View Document</Button>
                                            <Button variant="outline" onClick={handleUploadAnother}>Upload Another Document</Button>
                                        </div>
                                    </div>

                                    {/* Step 4: Blockchain address */}
                                    <div className="mb-4 border-t pt-4">
                                        <p className="font-medium mb-2">Your document has been securely stored. A unique blockchain address has been generated for verification:</p>
                                        <div className="bg-gray-50 p-3 rounded-md font-mono">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="truncate">{blockchainAddress}</span>
                                                <div className="flex items-center gap-2">
                                                    <Button onClick={handleCopyAddress}>Copy Address</Button>
                                                    {uploadedDocument && (
                                                        <Button variant="outline" onClick={() => openShareModal(uploadedDocument)}>
                                                            Create Verification Link
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button onClick={handleCloseModal}>Close</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {shareModalOpen && shareTargetDocument && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Share Verification Link</h3>
                                <button onClick={closeShareModal} className="text-gray-500 hover:text-gray-800">✕</button>
                            </div>

                            <p className="mb-3 text-sm text-gray-700">Create a shareable verification link for <span className="font-medium">{shareTargetDocument.name}</span></p>

                            <div className="mb-4">
                                <p className="font-medium mb-2">Choose when the shared link should expire:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['10 minutes', '1 hour', '24 hours', '7 days', '30 days', 'Never expires'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setShareExpiry(opt)}
                                            className={`px-3 py-1 rounded-md border ${shareExpiry === opt ? 'bg-brand-teal text-white' : 'bg-white'}`}
                                        >{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button onClick={handleCreateShareLink}>Create Share Link</Button>
                                <Button variant="outline" onClick={closeShareModal}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Delete Confirm Modal */}
                {bulkDeleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-red-600">Delete {selectedCount} documents?</h3>
                                <button onClick={() => setBulkDeleteOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">This action cannot be undone. Documents will be removed from your vault and storage.</p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
                                <Button onClick={handleConfirmBulkDelete} className="bg-red-600">Delete</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Share Modal */}
                {bulkShareOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-white dark:bg-brand-lighter-dark rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 border border-white dark:border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-[#02353C] dark:text-brand-pale uppercase tracking-widest">Share {selectedCount} items</h3>
                                <button onClick={() => setBulkShareOpen(false)} className="text-[#02353C]/40 dark:text-white/40 hover:text-[#02353C] dark:hover:text-white p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl">✕</button>
                            </div>

                            <p className="mb-6 text-sm text-[#02353C]/60 dark:text-white/40 font-semibold">Create verification tokens for the selected documents and copy them to your clipboard.</p>

                            <div className="mb-4">
                                <p className="font-medium mb-2">Choose when the shared links should expire:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['10 minutes', '1 hour', '24 hours', '7 days', '30 days', 'Never expires'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setBulkShareExpiry(opt)}
                                            className={`px-3 py-1 rounded-md border ${bulkShareExpiry === opt ? 'bg-brand-teal text-white' : 'bg-white'}`}
                                        >{opt}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4 text-sm text-gray-700">
                                <ul className="list-disc list-inside max-h-40 overflow-auto">
                                    {documents.filter(d => selectedDocIds.includes(d.id)).map(d => (
                                        <li key={d.id}>{d.name}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setBulkShareOpen(false)}>Cancel</Button>
                                <Button onClick={handleConfirmBulkShare}>Create Tokens</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Move Modal */}
                {bulkMoveOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Add {selectedCount} documents to folder</h3>
                                <button onClick={() => setBulkMoveOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Choose Folder</label>
                                <select value={bulkMoveFolderId ?? ''} onChange={(e) => setBulkMoveFolderId(e.target.value || null)} className="w-full border border-gray-300 rounded-md px-3 py-2">
                                    <option value="">— Select existing folder —</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-2">Or create a new folder</p>
                                <input value={bulkMoveNewFolderName} onChange={(e) => setBulkMoveNewFolderName(e.target.value)} className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="New folder name" />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setBulkMoveOpen(false)}>Cancel</Button>
                                <Button onClick={handleConfirmBulkMove}>Move</Button>
                            </div>
                        </div>
                    </div>
                )}

                <ShareFolderModal
                    isOpen={shareFolderModalOpen}
                    onClose={() => setShareFolderModalOpen(false)}
                    folderId={shareFolderId}
                    userId={user!.id}
                    folders={folders}
                    onAlbumsUpdated={(a) => setSharedAlbums(a)}
                    showToast={showToast}
                />
                {/* New Share Modal */}
                {newShareModalOpen && newShareTargetDocument && user && (
                    <ShareModal
                        document={newShareTargetDocument}
                        isOpen={newShareModalOpen}
                        onClose={() => {
                            setNewShareModalOpen(false);
                            setNewShareTargetDocument(null);
                        }}
                        userId={user.id}
                    />
                )}

                {/* Debug Panel (dev-only) */}
                {import.meta.env.VITE_DEBUG === 'true' && showDebugPanel && (
                    <DebugPanel
                        documents={documents}
                        selectedIds={selectedDocIds}
                        clearSelection={clear}
                        onRevalidate={async () => {
                            try {
                                const d = await getUserDocuments(user!.id);
                                setDocuments(d || []);
                                showToast('Documents revalidated', 'success');
                            } catch (err) {
                                showToast('Failed to revalidate', 'error');
                            }
                        }}
                        onDeleteSelected={async () => {
                            // Reuse the existing bulk delete logic but without requiring modal confirmation
                            try {
                                // make a shallow copy of selected ids
                                const idsToDelete = [...selectedDocIds];
                                if (idsToDelete.length === 0) return;

                                // Delete tokens
                                await supabase.from('verification_tokens').delete().in('document_id', idsToDelete);
                                // Delete documents
                                await supabase.from('documents').delete().in('id', idsToDelete);

                                // Remove from UI
                                setDocuments(prev => prev.filter(d => !idsToDelete.includes(d.id)));
                                clear();
                            } catch (err) {
                                console.error('Debug bulk delete failed', err);
                                throw err;
                            }
                        }}
                        showToast={showToast}
                    />
                )}

                {/* Document Details View (Redesigned PDF Viewer) */}
                {viewingDocument && user && (
                    <DocumentView
                        document={viewingDocument}
                        url={viewingDocUrl}
                        userId={user.id}
                        ownerName={user.user_metadata?.full_name || user.email || 'Authorized User'}
                        folderName={folders.find(f => f.id === viewingDocument.folder_id)?.name || 'Main Vault'}
                        onClose={() => {
                            setViewingDocument(null);
                            setViewingDocUrl(null);
                        }}
                        onVerify={(doc) => {
                            // Link to verify page or trigger on-chain check
                            window.open(`/verify?token=${doc.hash}`, '_blank');
                        }}
                        onShare={(doc) => {
                            setViewingDocument(null);
                            openShareModal(doc);
                        }}
                        onDownload={async (doc) => {
                            try {
                                const url = await getDocumentUrl(doc.file_path);
                                window.open(url, '_blank');
                            } catch (err) {
                                showToast('Failed to download document', 'error');
                            }
                        }}
                        onDelete={(doc) => {
                            setViewingDocument(null);
                            handleDeleteDocument(doc);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
