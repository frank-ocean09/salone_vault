import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { FolderList } from '../components/FolderList';
import { ShareModal } from '../components/ShareModal';
import { PDFViewer } from '../components/PDFViewer';
import { Plus, FileText, CheckCircle, Clock, Share2, Search, Upload as UploadIcon, AlertCircle, Eye, Trash2, FolderInput, Activity, ChevronDown, ChevronUp } from 'lucide-react';
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
} from '../lib/api';
import { registerDocumentOnChain } from '../lib/blockchain';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/shareApi';
import CryptoJS from 'crypto-js';
import type { Document, Folder } from '../lib/supabase';

export function Dashboard() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Selection handled by hook
    const { selectedIds: selectedDocIds, toggle: toggleSelect, selectAll, deselectAll, clear } = useSelection();
    const selectedCount = selectedDocIds.length;

    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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
            // Check if it's a PDF
            const isPdf = doc.name.toLowerCase().endsWith('.pdf') || doc.type === 'application/pdf';

            if (isPdf) {
                // If online, get signed URL. If offline, pass null (viewer will try cache)
                let url = null;
                if (navigator.onLine) {
                    url = await getDocumentUrl(doc.file_path);
                }

                setViewingDocument(doc);
                setViewingDocUrl(url);
            } else {
                // For images, open in new tab (or same tab if preferred)
                const url = await getDocumentUrl(doc.file_path);
                window.location.href = url;
            }
        } catch (err: any) {
            console.error('Error opening document:', err);

            // If it's a PDF and we failed (maybe offline), try viewer anyway to check cache
            const isPdf = doc.name.toLowerCase().endsWith('.pdf') || doc.type === 'application/pdf';
            if (isPdf) {
                setViewingDocument(doc);
                setViewingDocUrl(null);
            } else {
                setError('Failed to open document');
            }
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
                null // Deprecated folder_name
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

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFolder = selectedFolderId === null || doc.folder_id === selectedFolderId;

        return matchesSearch && matchesFolder;
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary-green border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
                        <p className="text-gray-600">Manage and protect your essential documents.</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button onClick={() => navigate('/activity-logs')} variant="outline">
                            <Activity className="h-4 w-4 mr-2" />
                            Activity Logs
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <Button onClick={handleUploadClick} disabled={isUploading}>
                            {isUploading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    Uploading...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Upload Document
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Error</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar - Folder List */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        {/* Mobile Toggle */}
                        <div className="md:hidden mb-4">
                            <Button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                variant="outline"
                                className="w-full justify-between bg-white"
                            >
                                <span className="flex items-center gap-2">
                                    <FolderInput className="h-4 w-4" />
                                    {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name || 'Folders' : 'All Folders'}
                                </span>
                                {mobileMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block space-y-4`}>
                            <FolderList
                                folders={folders.map(f => ({ ...f, shared: sharedAlbums.some(sa => sa.folder_id === f.id) }))}
                                selectedFolderId={selectedFolderId}
                                onSelectFolder={(id) => { setSelectedFolderId(id); setMobileMenuOpen(false); }}
                                onCreateFolder={handleCreateFolder}
                                onUpdateFolder={handleUpdateFolder}
                                onDeleteFolder={handleDeleteFolder}
                                onShareFolder={(folderId) => { setShareFolderId(folderId); setShareFolderModalOpen(true); }}
                            />

                            {sharedAlbums.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Joined Albums</h3>
                                    <ul className="space-y-2 text-sm">
                                        {sharedAlbums.map(sa => (
                                            <li key={sa.id} className="flex items-center justify-between">
                                                <button onClick={() => { setSelectedFolderId(sa.folder_id); setMobileMenuOpen(false); }} className="text-left text-sm text-gray-800 hover:underline">{sa.name}</button>
                                                <span className="text-xs text-gray-500">{sa.owner_id === user?.id ? 'You' : 'Shared'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-500">Total Documents</h3>
                                    <FileText className="h-5 w-5 text-primary-green" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-500">Verified</h3>
                                    <CheckCircle className="h-5 w-5 text-primary-green" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {documents.filter(d => d.status === 'verified').length}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-500">Pending</h3>
                                    <Clock className="h-5 w-5 text-accent" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {documents.filter(d => d.status === 'pending').length}
                                </p>
                            </div>
                        </div>

                        {/* Document List */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4 w-full">
                                    <h2 className="text-lg font-bold text-gray-900 flex-1">
                                        {selectedFolderId
                                            ? folders.find(f => f.id === selectedFolderId)?.name || 'Folder'
                                            : 'All Documents'}
                                    </h2>

                                    {/* Selection toolbar */}
                                    {selectedCount > 0 ? (
                                        <BulkToolbar
                                            selectedCount={selectedCount}
                                            selectAll={() => selectAll(filteredDocuments.map(d => d.id))}
                                            deselectAll={() => deselectAll()}
                                            onOpenDelete={() => setBulkDeleteOpen(true)}
                                            onOpenMove={() => setBulkMoveOpen(true)}
                                            onOpenShare={() => setBulkShareOpen(true)}
                                        />
                                    ) : null}
                                </div>

                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                                    />
                                </div>
                            </div>

                            {filteredDocuments.length === 0 ? (
                                <div className="p-12 text-center">
                                    <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {documents.length === 0 ? 'No documents yet' : 'No matching documents'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {documents.length === 0
                                            ? 'Upload your first document to get started'
                                            : 'Try a different search term or folder'}
                                    </p>
                                    {documents.length === 0 && (
                                        <Button onClick={handleUploadClick}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Upload Document
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col xl:flex-row gap-6">
                                        <div className="flex-1 min-w-0">
                                            <DocumentsTable
                                                documents={documents}
                                                selectedIds={selectedDocIds}
                                                onToggleSelect={toggleSelect}
                                                onSelectAll={(ids) => selectAll(ids)}
                                                onDeselectAll={() => deselectAll()}
                                                onView={(doc) => handleViewDocument(doc)}
                                                onDelete={(doc) => handleDeleteDocument(doc)}
                                                onShare={(doc) => { setNewShareTargetDocument(doc); setNewShareModalOpen(true); }}
                                                searchQuery={searchQuery}
                                            />
                                        </div>

                                        {/* Shared Albums sidebar - Side on XL+, integrated below on smaller */}
                                        <div className="w-full xl:w-72 flex-shrink-0">
                                            <div className="bg-gray-50 p-4 rounded-lg xl:bg-white xl:p-0 xl:border-l xl:pl-6 xl:rounded-none">
                                                <h3 className="xl:hidden font-bold mb-3">Manage Albums</h3>
                                                <SharedAlbumsSidebar userId={user!.id} onOpenShareFolder={(folderId) => { setShareFolderId(folderId); setShareFolderModalOpen(true); }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Debug toggle (dev only) */}
                                    {import.meta.env.VITE_DEBUG === 'true' && (
                                        <>
                                            <button onClick={() => setShowDebugPanel(s => !s)} className="fixed left-4 bottom-20 z-50 bg-white border rounded-full p-2 shadow-lg text-sm hidden lg:block">Debug</button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold">
                                {uploadModalStep === 'info' ? 'Upload Document' : 'Document Upload — Next Steps'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800">✕</button>
                        </div>

                        {uploadModalStep === 'info' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
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
                                                    className="text-primary-green focus:ring-primary-green"
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
                                            className="mt-2 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                                        />
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Folder (optional)</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={uploadSelectedFolderId}
                                                onChange={(e) => { setUploadSelectedFolderId(e.target.value); setUploadNewFolderName(''); }}
                                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
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
                                                className="w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
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
                                                    className="text-xs text-primary-green hover:underline flex items-center gap-1"
                                                >
                                                    <span className="bg-primary-green/10 px-2 py-0.5 rounded-full font-medium">
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
                                        className={`px-3 py-1 rounded-md border ${shareExpiry === opt ? 'bg-primary-green text-white' : 'bg-white'}`}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Share {selectedCount} documents</h3>
                            <button onClick={() => setBulkShareOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
                        </div>

                        <p className="mb-3 text-sm text-gray-700">Create verification tokens for the selected documents and copy them to your clipboard.</p>

                        <div className="mb-4">
                            <p className="font-medium mb-2">Choose when the shared links should expire:</p>
                            <div className="flex flex-wrap gap-2">
                                {['10 minutes', '1 hour', '24 hours', '7 days', '30 days', 'Never expires'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setBulkShareExpiry(opt)}
                                        className={`px-3 py-1 rounded-md border ${bulkShareExpiry === opt ? 'bg-primary-green text-white' : 'bg-white'}`}
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

            {/* PDF Viewer */}
            {viewingDocument && user && (
                <PDFViewer
                    url={viewingDocUrl}
                    documentId={viewingDocument.id}
                    documentName={viewingDocument.name}
                    userId={user.id}
                    onClose={() => {
                        setViewingDocument(null);
                        setViewingDocUrl(null);
                    }}
                />
            )}
        </div>
    );
}
