import { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route, useParams, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { FolderList } from '../components/FolderList';
import { ShareModal } from '../components/ShareModal';
import { DocumentView } from '../components/DocumentView';
import { AlbumSettingsModal } from '../components/AlbumSettingsModal';
import { Plus, FileText, CheckCircle, Clock, Share2, Search, Upload as UploadIcon, AlertCircle, Eye, Trash2, FolderInput, Activity, ChevronDown, ChevronUp, Users, Settings, Wallet, Bell, User as UserIcon, LogOut, Menu, X, ShieldCheck, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { DocumentsTable } from '../components/DocumentsTable';
import { BulkToolbar } from '../components/BulkToolbar';
import { SharedAlbumsSidebar } from '../components/SharedAlbumsSidebar';
import { ShareFolderModal } from '../components/ShareFolderModal';
import { DebugPanel } from '../components/DebugPanel';
import { useSelection } from '../hooks/useSelection';
import { FolderGridView } from '../components/FolderGridView';
import { Toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
    const location = useLocation();
    const { user, loading: authLoading, signOut } = useAuth();
    const { toggleTheme, isDarkMode } = useTheme();
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

    type FolderWithMetadata = Folder & {
        permission_level?: string;
        is_shared?: boolean;
        document_count?: number;
        last_updated?: string;
        owner_name?: string;
    };

    const [sharedWithMeFolders, setSharedWithMeFolders] = useState<FolderWithMetadata[]>([]);
    const { "*": splat } = useParams();
    const activeSharedFolderId = splat?.startsWith('sharedfolder/') ? splat.split('/')[1] : null;
    const activeSharedAlbumId = splat?.startsWith('sharedalbum/') ? splat.split('/')[1] : null;

    // Sync selectedFolderId with route if in a shared folder route
    useEffect(() => {
        if (activeSharedFolderId) {
            setSelectedFolderId(activeSharedFolderId);
            setViewingSharedAlbum(null);
        } else if (activeSharedAlbumId) {
            setSelectedFolderId(null);
            // We'll fetch album details in another useEffect
        } else if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            // Only auto-reset if we are at the root dashboard path
            setSelectedFolderId(null);
            setViewingSharedAlbum(null);
        }
    }, [activeSharedFolderId, activeSharedAlbumId, location.pathname]);

    // Navigation state
    const [activeTab, setActiveTab] = useState<'documents' | 'folders' | 'shared'>('documents');
    const [isSharedCollapsed, setIsSharedCollapsed] = useState(false);

    // Shared albums list
    const [sharedAlbums, setSharedAlbums] = useState<{ owned: any[]; shared: any[] }>({ owned: [], shared: [] });

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

    // Handle folder/album selection and document fetching
    useEffect(() => {
        if (!user) return;

        const fetchContent = async () => {
            try {
                // Only show global loading if we have NO documents yet
                if (documents.length === 0) setLoading(true);

                if (activeSharedAlbumId) {
                    // Fetch album documents $ metadata
                    const [albumDocs, albumDetails] = await Promise.all([
                        getSharedAlbumDocuments(activeSharedAlbumId),
                        // Fetch the album metadata from our existing state or DB
                        (async () => {
                            const allAlbums = [...sharedAlbums.owned, ...sharedAlbums.shared];
                            const found = allAlbums.find(a => a.id === activeSharedAlbumId);
                            if (found) return found;

                            // If not in state, maybe it's a direct link, fetch it?
                            // For now, let's assume it's loaded in sharedAlbums
                            return null;
                        })()
                    ]);

                    setDocuments(albumDocs || []);
                    if (albumDetails) {
                        setViewingSharedAlbum({
                            id: albumDetails.id,
                            name: albumDetails.name,
                            folder_id: albumDetails.folder_id,
                            owner_id: albumDetails.owner_id
                        });
                    }
                } else if (selectedFolderId || activeSharedFolderId) {
                    const targetId = selectedFolderId || activeSharedFolderId;
                    const { getFolderDocuments } = await import('../lib/api');
                    const folderDocs = await getFolderDocuments(targetId as string);
                    setDocuments(folderDocs);
                } else {
                    // Only fetch user docs if we are NOT in any folder
                    const docs = await getUserDocuments(user.id);
                    setDocuments(docs);
                }
            } catch (err: any) {
                console.error('Failed to fetch content', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [selectedFolderId, activeSharedFolderId, activeSharedAlbumId, user, sharedAlbums]);

    const loadDocuments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const [docs, userFolders, userSharedAlbums, sharedWithMe] = await Promise.all([
                getUserDocuments(user.id),
                getFolders(user.id),
                getSharedAlbumsForUser(user.id),
                import('../lib/api').then(m => m.getSharedWithMeFolders(user.id))
            ]);
            setDocuments(docs);
            setFolders(userFolders);
            setSharedAlbums(userSharedAlbums || { owned: [], shared: [] });
            setSharedWithMeFolders(sharedWithMe || []);
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
            const { error: tokenError } = await supabase
                .from('verification_tokens')
                .delete()
                .eq('document_id', doc.id);
            if (tokenError) {
                throw new Error('Cannot delete this document because it has shared verification links. This is a database permission issue - please contact your administrator or delete the verification tokens from the Supabase dashboard first.');
            }
            const { error: dbError } = await supabase.from('documents').delete().eq('id', doc.id);
            if (dbError) throw new Error(`Database error: ${dbError.message}`);
            const { error: storageError } = await supabase.storage.from('Documents').remove([doc.file_path]);
            setDocuments(documents.filter(d => d.id !== doc.id));
        } catch (err: any) {
            console.error('Delete failed:', err);
            setError(err.message || 'Failed to delete document');
        }
    };

    const handleConfirmBulkDelete = async () => {
        if (selectedDocIds.length === 0) return;
        setBulkDeleteOpen(false);
        try {
            const docsToDelete = documents.filter(d => selectedDocIds.includes(d.id));
            const filePaths = docsToDelete.map(d => d.file_path);
            const { error: tokenErr } = await supabase.from('verification_tokens').delete().in('document_id', selectedDocIds);
            if (tokenErr) throw tokenErr;
            const { error: docsErr } = await supabase.from('documents').delete().in('id', selectedDocIds);
            if (docsErr) throw docsErr;
            if (filePaths.length > 0) {
                await supabase.storage.from('Documents').remove(filePaths);
            }
            setDocuments(prev => prev.filter(d => !selectedDocIds.includes(d.id)));
            clear();
            showToast(`Deleted ${docsToDelete.length} documents`, 'success');
        } catch (err: any) {
            console.error('Bulk delete failed', err);
            setError(err.message || 'Bulk delete failed');
            showToast('Bulk delete encountered an error', 'error');
        }
    };

    const handleConfirmBulkShare = async () => {
        if (selectedDocIds.length === 0) return;
        setBulkShareOpen(false);
        try {
            const tokens: string[] = [];
            await Promise.all(selectedDocIds.map(async (docId) => {
                const doc = documents.find(d => d.id === docId);
                if (!doc) return;
                const tokenArray = crypto.getRandomValues(new Uint8Array(16));
                const token = Array.from(tokenArray).map((b) => b.toString(16).padStart(2, '0')).join('');
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
                const { error: insertError } = await supabase.from('verification_tokens').insert({
                    token,
                    document_id: doc.id,
                    document_type_snapshot: doc.type,
                    document_snapshot: { document_type: doc.type, uploaded_at: doc.created_at },
                    expires_at: expiresAt,
                });
                if (insertError) throw insertError;
                tokens.push(token);
            }));
            await navigator.clipboard.writeText(tokens.join('\n'));
            showToast(`Created ${tokens.length} share tokens and copied to clipboard`, 'success');
            clear();
        } catch (err: any) {
            console.error('Bulk share failed', err);
            setError(err.message || 'Bulk share failed');
            showToast('Bulk share encountered an error', 'error');
        }
    };

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
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only PDF, JPEG, and PNG files are allowed');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setError('File size must be less than 50MB');
            return;
        }
        setSelectedFile(file);
        setDocumentName('');
        setUploadModalStep('info');
        setShowUploadModal(true);
        e.target.value = '';
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
            const [hash, filePath] = await Promise.all([
                generateDocumentHash(selectedFile),
                uploadDocument(selectedFile, user.id)
            ]);
            const type = selectedDocType === 'Other' ? otherDocType : selectedDocType;
            let finalFolderId = uploadSelectedFolderId || null;
            if (uploadNewFolderName.trim()) {
                const newFolder = await createFolder(user.id, uploadNewFolderName.trim(), 'blue');
                setFolders(prev => [...prev, newFolder]);
                finalFolderId = newFolder.id;
            } else if (!finalFolderId) {
                const suggestedName = suggestFolder(type, documentName);
                if (suggestedName) {
                    const existing = folders.find(f => f.name === suggestedName);
                    if (existing) {
                        finalFolderId = existing.id;
                    } else {
                        const newFolder = await createFolder(user.id, suggestedName, 'blue');
                        setFolders(prev => [...prev, newFolder]);
                        finalFolderId = newFolder.id;
                    }
                }
            }
            setUploadStatus('Finalizing Record...');
            const newDoc = await createDocument(
                user.id,
                documentName.trim(),
                type,
                filePath,
                selectedFile.size,
                hash,
                uploadSelectedFolderId || null,
                activeSharedAlbumId || viewingSharedAlbum?.id || null
            );
            if (finalFolderId) {
                await moveDocumentToFolder(newDoc.id, finalFolderId);
                newDoc.folder_id = finalFolderId;
            }
            let preview = '';
            try {
                preview = await getDocumentUrl(filePath);
            } catch (err) {
                console.warn('Failed to get preview URL', err);
            }
            registerDocumentOnChain(selectedFile, newDoc.id);
            const blockchainAddress = `0x${CryptoJS.SHA1(newDoc.id + Date.now().toString()).toString().slice(0, 40)}`;
            setUploadedDocument(newDoc);
            setPreviewUrl(preview);
            setBlockchainAddress(blockchainAddress);
            setUploadModalStep('success');
            setDocuments([newDoc, ...documents]);
            await logActivity(user.id, 'document_uploaded', newDoc.id, undefined, {
                document_name: documentName.trim(),
                document_type: type,
                file_size: selectedFile.size,
                folder_id: finalFolderId,
            });
            setTimeout(() => {
                setDocuments(prev => prev.map(d =>
                    d.id === newDoc.id ? { ...d, status: 'verified' as const } : d
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
        try {
            const tokenArray = crypto.getRandomValues(new Uint8Array(16));
            const token = Array.from(tokenArray).map((b) => b.toString(16).padStart(2, '0')).join('');
            const now = new Date();
            let expiresAt: string = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            if (shareExpiry === '10 minutes') expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
            if (shareExpiry === '1 hour') expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
            if (shareExpiry === 'Never expires') expiresAt = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();

            const { error: insertError } = await supabase.from('verification_tokens').insert({
                token,
                document_id: doc.id,
                document_type_snapshot: doc.type,
                document_snapshot: { document_type: doc.type, uploaded_at: doc.created_at },
                expires_at: expiresAt,
            });
            if (insertError) throw new Error(`Failed to create verification token: ${insertError.message}`);
            await supabase.storage.from('Documents').createSignedUrl(doc.file_path, 300);
            await navigator.clipboard.writeText(token);
            alert(`✓ Token copied to clipboard!\nShare this token to verify the document.`);
            closeShareModal();
        } catch (err: any) {
            console.error('Failed to create share link', err);
            setError(err.message || 'Failed to create share link');
        }
    };

    const handleCreateSharedAlbumAndInvite = async () => {
        if (!user || !shareFolderId) return;
        try {
            setShareFolderModalOpen(false);
            const folder = folders.find(f => f.id === shareFolderId);
            await createSharedAlbum(user.id, shareFolderId, folder?.name || 'Shared Album');
            const userSharedAlbums = await getSharedAlbumsForUser(user.id);
            setSharedAlbums(userSharedAlbums || { owned: [], shared: [] });
            showToast('Shared album created', 'success');
        } catch (err: any) {
            console.error('Failed to create shared album', err);
            setError(err.message || 'Failed to create shared album');
            showToast('Failed to create shared album', 'error');
        }
    };

    const handleSelectSharedAlbum = (album: any) => {
        if (album.folder_id) {
            navigate(`/dashboard/sharedfolder/${album.folder_id}`);
        } else {
            navigate(`/dashboard/sharedalbum/${album.id}`);
        }
        setMobileMenuOpen(false);
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

    // Determine current folder for shared folder view
    const currentSharedFolder = activeSharedFolderId
        ? (sharedWithMeFolders.find(f => f.id === activeSharedFolderId) as FolderWithMetadata)
        : null;

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
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            return `Oh, welcome back, ${formattedName}!`;
        }
        return 'Welcome back!';
    };

    if (authLoading || (loading && documents.length === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-[#2EAF7D] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
            <Navbar />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Folders */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
                        <FolderList
                            folders={folders}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={setSelectedFolderId}
                            onCreateFolder={handleCreateFolder}
                            onUpdateFolder={handleUpdateFolder}
                            onDeleteFolder={handleDeleteFolder}
                            onShareFolder={(folderId) => { setShareFolderId(folderId); setShareFolderModalOpen(true); }}
                        />

                        {sharedWithMeFolders.length > 0 && (
                            <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <button
                                        onClick={() => setIsSharedCollapsed(!isSharedCollapsed)}
                                        className="text-sm font-bold text-gray-800 flex items-center gap-2 hover:text-gray-600 transition-colors"
                                    >
                                        <Users size={16} className="text-[#2EAF7D]" />
                                        Shared With Me
                                        {isSharedCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                </div>
                                {!isSharedCollapsed && (
                                    <div className="space-y-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                                        {sharedWithMeFolders.map(folder => (
                                            <button
                                                key={folder.id}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/dashboard/sharedfolder/${folder.id}`);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm font-medium ${selectedFolderId === folder.id
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 truncate">
                                                    <Shield className={`h-4 w-4 ${selectedFolderId === folder.id ? 'text-[#2EAF7D]' : 'text-gray-400'}`} />
                                                    <span className="truncate">{folder.name}</span>
                                                </div>
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">
                                                    {folder.permission_level?.replace('_', ' ') || ''}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Global Header (Always Visible) */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                                    {getWelcomeMessage()}
                                </h1>
                                <p className="text-slate-500 text-sm">
                                    Manage and protect your essential documents.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/activity-logs')}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Activity size={16} />
                                    Activity Logs
                                </button>

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
                                    className="px-4 py-2 bg-[#2EAF7D] hover:bg-[#258f66] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                                    disabled={isUploading}
                                >
                                    <Plus size={16} />
                                    Upload Document
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Global Stats Cards (Always Visible) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-slate-500">Total Documents</span>
                                    <FileText size={18} className="text-[#02353C]" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{documents.length}</div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-slate-500">Verified</span>
                                    <CheckCircle size={18} className="text-[#2EAF7D]" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">
                                    {documents.filter(d => d.status === 'verified').length}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-slate-500">Pending</span>
                                    <div className="w-4 h-4" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">
                                    {documents.filter(d => d.status === 'pending').length}
                                </div>
                            </div>
                        </div>

                        {/* View Content Area */}
                        {(!activeSharedFolderId && !activeSharedAlbumId) ? (
                            <div className="space-y-6">
                                {/* Tabs Navigation */}
                                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-fit">
                                    <button
                                        onClick={() => setActiveTab('documents')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'documents'
                                            ? 'bg-[#2EAF7D] text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <FileText size={18} />
                                        Documents
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('folders')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'folders'
                                            ? 'bg-[#2EAF7D] text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <FolderInput size={18} />
                                        Folders
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('shared')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'shared'
                                            ? 'bg-[#2EAF7D] text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Users size={18} />
                                        Shared
                                    </button>
                                </div>

                                {/* Document/Folder Section */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                                        {selectedFolderId ? (
                                            (() => {
                                                const currentFolder = (folders.find(f => f.id === selectedFolderId) || sharedWithMeFolders.find(f => f.id === selectedFolderId)) as FolderWithMetadata;
                                                return (
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    navigate('/dashboard');
                                                                    setSelectedFolderId(null);
                                                                    setActiveTab('folders');
                                                                    setSearchQuery('');
                                                                }}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-500"
                                                                title="Back to Folders"
                                                            >
                                                                <ArrowLeft size={20} />
                                                            </button>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h2 className="text-xl font-bold text-slate-900">{currentFolder?.name}</h2>
                                                                    {currentFolder?.is_shared && (
                                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                                                            Shared
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                                        <UserIcon size={14} className="text-[#2EAF7D]" />
                                                                        <span>{currentFolder?.is_shared ? `Shared by: ${currentFolder.owner_name}` : 'Owned by me'}</span>
                                                                    </div>
                                                                    {currentFolder?.is_shared && (
                                                                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                                            <Shield size={14} className="text-[#2EAF7D]" />
                                                                            <span className="capitalize">{currentFolder.permission_level?.replace('_', ' ')}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="relative w-full sm:w-64">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search in folder..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="p-0 border-none flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <h2 className="text-lg font-bold text-slate-900">
                                                    {activeTab === 'folders' ? 'All Folders' : activeTab === 'shared' ? 'Shared Albums & Folders' : 'All Documents'}
                                                </h2>

                                                <div className="relative w-full sm:w-64">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder={`Search ${activeTab === 'shared' ? 'albums' : activeTab}...`}
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-0">
                                        {activeTab === 'documents' ? (
                                            <DocumentsTable
                                                documents={(sharedWithMeFolders.find(f => f.id === selectedFolderId)?.permission_level === 'upload_only') ? [] : filteredDocuments}
                                                folders={folders}
                                                selectedIds={selectedDocIds}
                                                onToggleSelect={toggleSelect}
                                                onSelectAll={selectAll}
                                                onDeselectAll={deselectAll}
                                                onView={handleViewDocument}
                                                onDelete={handleDeleteDocument}
                                                onShare={openShareModal}
                                                searchQuery={searchQuery}
                                                hideDelete={!!sharedWithMeFolders.some(f => f.id === selectedFolderId)}
                                                hideShare={sharedWithMeFolders.find(f => f.id === selectedFolderId)?.permission_level === 'view_only'}
                                                emptyMessage={selectedFolderId ? "No documents in this folder yet." : "No documents found"}
                                            />
                                        ) : activeTab === 'folders' ? (
                                            <FolderGridView
                                                folders={[...folders, ...sharedWithMeFolders].map(f => {
                                                    const folderDocs = documents.filter(d => d.folder_id === f.id);
                                                    const latestTimestamp = folderDocs.length > 0
                                                        ? Math.max(...folderDocs.map(d => new Date(d.updated_at).getTime()))
                                                        : new Date(f.updated_at).getTime();

                                                    return {
                                                        ...f,
                                                        document_count: folderDocs.length,
                                                        last_updated: new Date(latestTimestamp).toISOString(),
                                                        is_shared: sharedWithMeFolders.some(sf => sf.id === f.id)
                                                    };
                                                }).filter(f =>
                                                    f.name.toLowerCase().includes(searchQuery.toLowerCase())
                                                )}
                                                onSelect={(id) => {
                                                    const isShared = sharedWithMeFolders.some(sf => sf.id === id);
                                                    if (isShared) {
                                                        navigate(`/dashboard/sharedfolder/${id}`);
                                                    } else {
                                                        setSelectedFolderId(id);
                                                    }
                                                }}
                                                onEdit={(id, name) => handleUpdateFolder(id, name, 'green')}
                                                onDelete={(id, name) => handleDeleteFolder(id)}
                                                onShare={(id) => { setShareFolderId(id); setShareFolderModalOpen(true); }}
                                            />
                                        ) : (
                                            /* Shared Albums View */
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {/* Owned Shared Albums */}
                                                    {sharedAlbums.owned.map(album => (
                                                        <div key={album.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all group relative">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                    <Users size={24} />
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        if (album.folder_id) navigate(`/dashboard/sharedfolder/${album.folder_id}`);
                                                                        else navigate(`/dashboard/sharedalbum/${album.id}`);
                                                                    }}
                                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                >
                                                                    View
                                                                </button>
                                                            </div>
                                                            <div className="mt-2">
                                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{album.name}</h3>
                                                                <p className="text-sm text-slate-500 mt-1">
                                                                    {album.folder_id ? 'Linked Folder' : 'Custom Album'}
                                                                </p>
                                                            </div>
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">
                                                                    Owner
                                                                </span>
                                                                <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase tracking-wider">
                                                                    Full Access
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* Shared With Me Albums */}
                                                    {sharedAlbums.shared.map(album => (
                                                        <div key={album.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all group relative">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                                    <Users size={24} />
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        if (album.folder_id) navigate(`/dashboard/sharedfolder/${album.folder_id}`);
                                                                        else navigate(`/dashboard/sharedalbum/${album.id}`);
                                                                    }}
                                                                    className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                                                                >
                                                                    View
                                                                </button>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900 mb-1">{album.name}</h3>
                                                            <p className="text-xs text-slate-500 mb-4 truncate">Shared by others</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded">Guest</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {sharedAlbums.owned.length === 0 && sharedAlbums.shared.length === 0 && (
                                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                                                            <Users size={48} className="mb-4 opacity-20" />
                                                            <p className="font-medium text-lg">No shared albums yet</p>
                                                            <p className="text-sm">Shared folders and albums will appear here.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Shared Folder Content Area */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                                    <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        navigate('/dashboard');
                                                        setActiveTab('folders');
                                                        setSelectedFolderId(null);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-500"
                                                    title="Back to Shared Folders"
                                                >
                                                    <ArrowLeft size={20} />
                                                </button>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="text-xl font-bold text-slate-900">
                                                            {activeSharedFolderId ? currentSharedFolder?.name : viewingSharedAlbum?.name}
                                                        </h2>
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                                            {activeSharedFolderId ? 'Shared Folder' : 'Shared Album'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                            <UserIcon size={14} className="text-[#2EAF7D]" />
                                                            <span>
                                                                {activeSharedFolderId
                                                                    ? `Shared by: ${currentSharedFolder?.owner_name || 'Unknown'}`
                                                                    : `Owner ID: ${viewingSharedAlbum?.owner_id?.split('-')[0]}...`
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                            <Shield size={14} className="text-[#2EAF7D]" />
                                                            <span className="capitalize">
                                                                {activeSharedFolderId
                                                                    ? currentSharedFolder?.permission_level?.replace('_', ' ')
                                                                    : 'Full Access'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <div className="relative flex-1 sm:w-64">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search in folder..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2EAF7D]/20 focus:border-[#2EAF7D] transition-all"
                                                    />
                                                </div>
                                                {(activeSharedAlbumId || currentSharedFolder?.permission_level === 'upload_only' || currentSharedFolder?.permission_level === 'full_access') && (
                                                    <button
                                                        onClick={() => {
                                                            if (activeSharedFolderId) {
                                                                setUploadSelectedFolderId(activeSharedFolderId);
                                                            } else {
                                                                setUploadSelectedFolderId('');
                                                            }
                                                            handleUploadClick();
                                                        }}
                                                        className="px-4 py-2 bg-[#2EAF7D] hover:bg-[#258f66] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                                                    >
                                                        <Plus size={16} />
                                                        <span className="hidden sm:inline">Upload Document</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-0">
                                        <DocumentsTable
                                            documents={currentSharedFolder?.permission_level === 'upload_only' ? [] : documents.filter(d =>
                                                (activeSharedFolderId ? d.folder_id === activeSharedFolderId : true) &&
                                                d.name.toLowerCase().includes(searchQuery.toLowerCase())
                                            )}
                                            folders={folders}
                                            selectedIds={selectedDocIds}
                                            onToggleSelect={toggleSelect}
                                            onSelectAll={selectAll}
                                            onDeselectAll={deselectAll}
                                            onView={handleViewDocument}
                                            onDelete={handleDeleteDocument}
                                            onShare={openShareModal}
                                            hideDelete={activeSharedFolderId ? true : false} // Owner can delete from album
                                            hideShare={activeSharedFolderId ? currentSharedFolder?.permission_level === 'view_only' : false}
                                            emptyMessage={activeSharedFolderId ? "No documents in this folder yet." : "No documents in this album yet."}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Shared Albums */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 px-2">Shared Albums</h3>
                            <SharedAlbumsSidebar
                                userId={user!.id}
                                onOpenShareFolder={(folderId) => { setShareFolderId(folderId); setShareFolderModalOpen(true); }}
                                onSelectAlbum={handleSelectSharedAlbum}
                                albums={sharedAlbums}
                                onUpdate={loadDocuments}
                            />
                        </div>
                    </aside>
                </div>
            </main >

            {/* Modals */}
            {
                showUploadModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300">
                            {uploadModalStep === 'info' ? (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-900">Document Details</h3>
                                        <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Document Name</label>
                                            <input
                                                type="text"
                                                value={documentName}
                                                onChange={(e) => setDocumentName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#2EAF7D] focus:border-[#2EAF7D]"
                                                placeholder="e.g. My Birth Certificate"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                                            <select
                                                value={selectedDocType}
                                                onChange={(e) => setSelectedDocType(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#2EAF7D] focus:border-[#2EAF7D]"
                                            >
                                                <option>Birth Certificate</option>
                                                <option>National ID / Passport</option>
                                                <option>Academic Certificate</option>
                                                <option>Land Title / Deed</option>
                                                <option>Business Registration</option>
                                                <option>Marriage Certificate</option>
                                                <option>Driver License</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        {selectedDocType === 'Other' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Specify Type</label>
                                                <input
                                                    type="text"
                                                    value={otherDocType}
                                                    onChange={(e) => setOtherDocType(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#2EAF7D] focus:border-[#2EAF7D]"
                                                    placeholder="e.g. Tax Clearance"
                                                />
                                            </div>
                                        )}

                                        {/* Folder Selection for Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Save to Folder</label>
                                            <div className="space-y-2">
                                                <select
                                                    value={uploadSelectedFolderId}
                                                    onChange={(e) => setUploadSelectedFolderId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#2EAF7D] focus:border-[#2EAF7D]"
                                                >
                                                    <option value="">
                                                        {suggestedFolderName ? `Auto-create "${suggestedFolderName}"` : 'Auto-Categorize'}
                                                    </option>
                                                    {folders.map(f => (
                                                        <option key={f.id} value={f.id}>{f.name}</option>
                                                    ))}
                                                </select>
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-200" />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-white px-2 text-gray-500">Or create new</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="New folder name"
                                                        value={uploadNewFolderName}
                                                        onChange={(e) => {
                                                            setUploadNewFolderName(e.target.value);
                                                            if (e.target.value) setUploadSelectedFolderId('');
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#2EAF7D] focus:border-[#2EAF7D]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                onClick={handleConfirmUpload}
                                                className="w-full bg-[#2EAF7D] hover:bg-[#258f66] text-white py-3 rounded-lg font-bold shadow-lg shadow-[#2EAF7D]/20 transition-all flex items-center justify-center gap-2"
                                                disabled={isUploading}
                                            >
                                                {isUploading ? (
                                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                                ) : (
                                                    <UploadIcon size={20} />
                                                )}
                                                {isUploading ? 'Uploading...' : 'Upload & Verify'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-end p-2 pb-0">
                                        <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="p-8 pt-4 text-center">
                                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Successful!</h3>
                                        <p className="text-slate-500 mb-8">
                                            Your document has been securely uploaded and is pending state verification.
                                            <br />
                                            <span className="text-xs text-gray-400 mt-2 block font-mono bg-gray-50 p-2 rounded break-all select-all cursor-pointer" onClick={handleCopyAddress} title="Click to copy">
                                                Tx: {blockchainAddress}
                                            </span>
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <button onClick={handlePreviewNow} className="w-full bg-[#02353C] text-white py-3 rounded-lg font-bold hover:bg-[#022c32] transition-colors">
                                                View Document
                                            </button>
                                            <button onClick={handleUploadAnother} className="w-full bg-white border border-gray-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                                                Upload Another
                                            </button>
                                            <button onClick={handleCloseModal} className="w-full mt-2 text-slate-500 text-sm font-semibold hover:text-slate-800 transition-colors">
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Document Viewer Modal */}
            {
                viewingDocument && user && (
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
                )
            }

            {
                shareTargetDocument && user && (
                    <ShareModal
                        isOpen={shareModalOpen}
                        onClose={closeShareModal}
                        document={shareTargetDocument}
                        userId={user.id}
                    />
                )
            }

            {
                user && (
                    <ShareFolderModal
                        isOpen={shareFolderModalOpen}
                        onClose={() => setShareFolderModalOpen(false)}
                        folderId={shareFolderId}
                        folders={folders}
                        showToast={showToast}
                    />
                )
            }

            {
                showDebugPanel && (
                    <DebugPanel
                        documents={documents}
                        selectedIds={selectedDocIds}
                        clearSelection={clear}
                        onRevalidate={loadDocuments}
                        showToast={showToast}
                    />
                )
            }
        </div >
    );
}
