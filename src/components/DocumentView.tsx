import { useState, useEffect } from 'react';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import {
    ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, WifiOff, Loader2,
    ShieldCheck, Share2, Download, Trash2, CheckCircle, Clock,
    FileText, Calendar, User, Folder as FolderIcon, Hash, ExternalLink
} from 'lucide-react';
import { Button } from './Button';
import { getDocumentFromCache, saveDocumentToCache } from '../lib/offlineStorage';
import { verifyDocumentOnChain } from '../lib/blockchain';
import { logActivity } from '../lib/shareApi';
import type { Document } from '../lib/supabase';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface DocumentViewProps {
    document: Document;
    url: string | null;
    userId: string;
    ownerName: string;
    folderName: string;
    onClose: () => void;
    onVerify: (doc: Document) => void;
}

export function DocumentView({
    document, url, userId, ownerName, folderName,
    onClose, onVerify
}: DocumentViewProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfData, setPdfData] = useState<string | Blob | null>(null);
    const [isOffline] = useState<boolean>(!navigator.onLine);
    const [jumpToPage, setJumpToPage] = useState<string>('1');
    const [blockchainStatus, setBlockchainStatus] = useState<{ verified: boolean; timestamp?: number; loading: boolean }>({
        verified: false,
        loading: false
    });

    // Handle initial scale
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setScale(0.6);
            else setScale(0.85);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load document logic
    useEffect(() => {
        const loadDocument = async () => {
            if (!url && !document.id) return;
            setLoading(true);
            setError(null);

            try {
                const cachedBlob = await getDocumentFromCache(document.id);
                if (cachedBlob) {
                    setPdfData(cachedBlob);
                    setLoading(false);
                    return;
                }

                if (!navigator.onLine) throw new Error('You are offline and this document is not cached.');
                if (!url) throw new Error('No URL provided');

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch document');

                const blob = await response.blob();
                setPdfData(blob);
                saveDocumentToCache(document.id, blob).catch(err => console.warn('Failed to cache:', err));

                logActivity(userId, 'document_viewed', document.id);
            } catch (err: any) {
                setError(err.message || 'Failed to load document');
            } finally {
                setLoading(false);
            }
        };
        loadDocument();
    }, [url, document.id, userId]);

    // Initial Blockchain Check
    useEffect(() => {
        if (document.hash) {
            handleCheckBlockchain();
        }
    }, [document.hash]);

    const handleCheckBlockchain = async () => {
        setBlockchainStatus(prev => ({ ...prev, loading: true }));
        try {
            const result: any = await verifyDocumentOnChain(document.hash);
            setBlockchainStatus({
                verified: result.verified,
                timestamp: result.timestamp,
                loading: false
            });
        } catch (err) {
            setBlockchainStatus(prev => ({ ...prev, loading: false }));
        }
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    function changePage(offset: number) {
        setPageNumber(prev => {
            const next = Math.min(Math.max(1, prev + offset), numPages);
            setJumpToPage(next.toString());
            return next;
        });
    }

    const isPdf = document.name.toLowerCase().endsWith('.pdf') ||
        document.type === 'application/pdf' ||
        document.type.toLowerCase() === 'pdf';

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#C1F6ED] dark:bg-brand-dark overflow-hidden font-sans transition-colors duration-500">
            {/* Technical Grid Pattern BG */}
            <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#02353C 1px, transparent 1px), linear-gradient(90deg, #02353C 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Header / Toolbar */}
            <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-brand-darker/80 backdrop-blur-md border-b border-[#02353C]/5 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#02353C] dark:bg-brand-pale rounded-lg transition-colors">
                        <ShieldCheck className="h-5 w-5 text-[#3FD0C9] dark:text-brand-dark" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-[#02353C] dark:text-brand-pale uppercase tracking-widest">National Digital Vault</h1>
                        <p className="text-[10px] font-bold text-[#02353C]/40 dark:text-white/40 uppercase tracking-tight">SECURE DOCUMENT VIEWER</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-[#C1F6ED] dark:bg-white/5 rounded-full border border-[#02353C]/5 dark:border-white/5 text-[#02353C] dark:text-brand-pale transition-colors">
                        <span className="w-2 h-2 rounded-full bg-[#2EAF7D] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Session</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#02353C]/5 dark:hover:bg-white/5 rounded-xl transition-colors text-[#02353C]/60 dark:text-white/40 hover:text-[#02353C] dark:hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <main className="relative z-10 flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
                {/* Left Panel: Preview */}
                <div className="flex-none lg:flex-1 min-h-[500px] lg:min-h-0 flex flex-col bg-gray-100/50 dark:bg-brand-dark/20 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#02353C]/5 dark:border-white/5">
                    {/* PDF Controls Area */}
                    {isPdf && !loading && !error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-6 py-2 bg-white/90 dark:bg-brand-darker/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-[#02353C]/10 border border-white dark:border-white/5 transition-colors">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="h-8 w-8 p-0 text-[#02353C] dark:text-brand-pale">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-black text-[#02353C] dark:text-brand-pale min-w-[60px] text-center">
                                    {pageNumber} / {numPages}
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => changePage(1)} disabled={pageNumber >= numPages} className="h-8 w-8 p-0 text-[#02353C] dark:text-brand-pale">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="w-px h-4 bg-[#02353C]/10 dark:bg-white/10" />
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className="h-8 w-8 p-0 text-[#02353C] dark:text-brand-pale">
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-black text-[#02353C] dark:text-brand-pale min-w-[40px] text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="h-8 w-8 p-0 text-[#02353C] dark:text-brand-pale">
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="h-12 w-12 text-[#2EAF7D] animate-spin mb-4" />
                                <p className="text-[#02353C]/60 font-black text-xs uppercase tracking-widest">Decrypting Content...</p>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center h-full text-center max-w-md">
                                <div className="bg-red-50 p-6 rounded-[2rem] mb-6">
                                    <WifiOff className="h-10 w-10 text-red-600" />
                                </div>
                                <h3 className="text-xl font-black text-[#02353C] mb-2">Access Interrupted</h3>
                                <p className="text-[#02353C]/40 font-bold text-sm mb-8">{error}</p>
                                <Button onClick={onClose} variant="outline" className="rounded-xl px-8 border-2">Close Viewer</Button>
                            </div>
                        )}

                        {!loading && !error && pdfData && (
                            <div className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden bg-white">
                                {isPdf ? (
                                    <PDFDocument
                                        file={pdfData}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={<div className="p-20"><Loader2 className="h-8 w-8 text-[#2EAF7D] animate-spin" /></div>}
                                    >
                                        <Page pageNumber={pageNumber} scale={scale} className="bg-white" />
                                    </PDFDocument>
                                ) : (
                                    <img src={URL.createObjectURL(pdfData as Blob)} alt={document.name} className="max-w-full h-auto" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Metadata & Actions */}
                <div className="w-full lg:w-[450px] bg-white dark:bg-brand-darker flex flex-col overflow-y-visible lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#02353C]/5 dark:border-white/5 shadow-2xl relative z-20 transition-colors">
                    <div className="p-10 space-y-10">
                        {/* Title & Badge */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest 
                                    ${document.status === 'verified'
                                        ? 'bg-[#449342]/10 text-[#449342] border border-[#449342]/20'
                                        : 'bg-[#2EAF7D]/10 text-[#2EAF7D] border border-[#2EAF7D]/20'}`}>
                                    {document.status === 'verified' ? 'Verified Official' : 'Verification Pending'}
                                </span>
                                {isOffline && (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 italic">
                                        Offline Copy
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-black text-[#02353C] dark:text-brand-pale tracking-tighter leading-tight">
                                {document.name}
                            </h2>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid gap-6">
                            {[
                                { label: 'Document Type', value: document.type, icon: FileText },
                                { label: 'Upload Date', value: new Date(document.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }), icon: Calendar },
                                { label: 'Vault Owner', value: ownerName, icon: User },
                                { label: 'Location', value: folderName, icon: FolderIcon },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-[#C1F6ED]/20 dark:bg-white/5 border border-transparent hover:border-[#3FD0C9]/30 transition-all">
                                    <div className="p-2.5 bg-white dark:bg-brand-dark rounded-xl shadow-sm transition-colors">
                                        <item.icon className="h-4 w-4 text-[#02353C] dark:text-brand-pale" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#02353C]/30 dark:text-white/30 mb-1">{item.label}</p>
                                        <p className="text-sm font-black text-[#02353C] dark:text-brand-pale">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Verification Panel */}
                        <div className="p-8 rounded-[2.5rem] bg-[#02353C] text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3FD0C9]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#3FD0C9]">Security Details</h4>
                                    {blockchainStatus.loading ? (
                                        <Loader2 size={16} className="text-[#3FD0C9] animate-spin" />
                                    ) : (
                                        <CheckCircle className={`h-5 w-5 ${blockchainStatus.verified ? 'text-[#449342]' : 'text-white/20'}`} />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Blockchain ID</p>
                                    <div className="flex items-center gap-2 group/hash">
                                        <code className="text-xs font-mono text-[#C1F6ED] truncate flex-1">{document.hash}</code>
                                        <button className="opacity-0 group-hover/hash:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                            <Hash size={12} className="text-[#3FD0C9]" />
                                        </button>
                                    </div>
                                </div>

                                {blockchainStatus.verified && (
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between animate-in fade-in">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Blockchain Timestamp</p>
                                            <p className="text-xs font-bold text-white">
                                                {blockchainStatus.timestamp ? new Date(blockchainStatus.timestamp).toLocaleString() : 'Confirmed'}
                                            </p>
                                        </div>
                                        <ExternalLink size={14} className="text-[#3FD0C9]" />
                                    </div>
                                )}

                                <div className="pt-2">
                                    <div className={`text-2xl font-black tracking-tight ${blockchainStatus.verified ? 'text-[#449342]' : 'text-white/40'}`}>
                                        {blockchainStatus.loading ? 'VERIFYING...' : blockchainStatus.verified ? 'VALIDATED' : 'NOT ON-CHAIN'}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-auto p-8 bg-gray-50 dark:bg-black/10 border-t border-[#02353C]/5 dark:border-white/5 text-center transition-colors">
                        <p className="text-[10px] font-black text-[#02353C]/20 dark:text-white/20 uppercase tracking-[0.3em]">SaloneVault National Infrastructure</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
