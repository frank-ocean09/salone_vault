import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, WifiOff, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { saveDocumentToCache, getDocumentFromCache } from '../lib/offlineStorage';
import { logActivity } from '../lib/shareApi';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    url: string | null;
    documentId: string;
    documentName: string;
    userId: string;
    onClose: () => void;
}

export function PDFViewer({ url, documentId, documentName, userId, onClose }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfData, setPdfData] = useState<string | Blob | null>(null);
    const [isOffline] = useState<boolean>(!navigator.onLine);
    const [jumpToPage, setJumpToPage] = useState<string>('1');

    // Handle window resize for responsive scaling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setScale(0.6);
            } else if (window.innerWidth < 1024) {
                setScale(0.8);
            } else {
                setScale(1.0);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load document logic
    useEffect(() => {
        const loadDocument = async () => {
            if (!url && !documentId) return;

            setLoading(true);
            setError(null);

            try {
                // Check if we are offline or if we should try cache first
                const cachedBlob = await getDocumentFromCache(documentId);

                if (cachedBlob) {
                    console.log('Loaded from offline cache');
                    setPdfData(cachedBlob);
                    setLoading(false);
                    return;
                }

                if (!navigator.onLine) {
                    throw new Error('You are offline and this document is not cached.');
                }

                if (!url) {
                    throw new Error('No URL provided');
                }

                // Fetch and cache
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch document');

                const blob = await response.blob();
                setPdfData(blob);

                // Cache asynchronously
                saveDocumentToCache(documentId, blob).catch(err =>
                    console.warn('Failed to cache document:', err)
                );

                // Log view
                logActivity(userId, 'document_viewed', documentId, undefined, {
                    offline: false,
                    cached: false
                });

            } catch (err: any) {
                console.error('Error loading PDF:', err);
                setError(err.message || 'Failed to load document');
            } finally {
                setLoading(false);
            }
        };

        loadDocument();
    }, [url, documentId, userId]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    function changePage(offset: number) {
        setPageNumber(prevPageNumber => {
            const newPage = Math.min(Math.max(1, prevPageNumber + offset), numPages);
            setJumpToPage(newPage.toString());
            return newPage;
        });
    }

    function handleJumpToPage(e: React.FormEvent) {
        e.preventDefault();
        const page = parseInt(jumpToPage);
        if (page >= 1 && page <= numPages) {
            setPageNumber(page);
        } else {
            setJumpToPage(pageNumber.toString());
        }
    }

    if (!url && !pdfData && !loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                        {documentName}
                    </h2>
                    {isOffline && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <WifiOff className="w-3 h-3 mr-1" />
                            Offline Mode
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-2 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <form onSubmit={handleJumpToPage} className="flex items-center gap-1">
                        <input
                            type="text"
                            value={jumpToPage}
                            onChange={(e) => setJumpToPage(e.target.value)}
                            className="w-12 h-8 text-center text-sm border-none focus:ring-0 bg-transparent"
                        />
                        <span className="text-sm text-gray-500">/ {numPages}</span>
                    </form>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= numPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                        className="h-8 w-8 p-0"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500 min-w-[3rem] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
                        className="h-8 w-8 p-0"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Viewer Area */}
            <div className="flex-grow overflow-auto bg-gray-100 flex justify-center p-4 sm:p-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 text-brand-teal animate-spin mb-4" />
                        <p className="text-gray-600">Loading secure document...</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-md">
                        <div className="bg-red-100 p-4 rounded-full mb-4">
                            <WifiOff className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load document</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={onClose} variant="outline">
                            Close Viewer
                        </Button>
                    </div>
                )}

                {!loading && !error && pdfData && (
                    <div className="shadow-2xl">
                        <Document
                            file={pdfData}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex items-center justify-center p-12">
                                    <Loader2 className="h-8 w-8 text-brand-teal animate-spin" />
                                </div>
                            }
                            error={
                                <div className="p-8 bg-white text-center text-red-600">
                                    Failed to render PDF. The file might be corrupted.
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="bg-white"
                            />
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
}
