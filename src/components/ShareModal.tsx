import { useState, useEffect, useRef } from 'react';
import { X, Copy, Mail, MessageCircle, Share2, Ban, CheckCircle, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from './Button';
import { createShareToken, revokeShareToken, logActivity } from '../lib/shareApi';
import type { Document } from '../lib/supabase';

interface ShareModalProps {
    document: Document;
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export function ShareModal({ document, isOpen, onClose, userId }: ShareModalProps) {
    const [expiryHours, setExpiryHours] = useState(24);
    const [shareUrl, setShareUrl] = useState('');
    const [token, setToken] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isRevoked, setIsRevoked] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Generate share token when modal opens - removed auto-generation
    // User should select expiry first, then click generate

    // Generate QR code when share URL changes
    useEffect(() => {
        if (shareUrl && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, shareUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#047857',
                    light: '#FFFFFF',
                },
            }).catch(err => console.error('QR code generation failed:', err));
        }
    }, [shareUrl]);

    const generateShareToken = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await createShareToken(document.id, userId, expiryHours);
            setShareUrl(result.shareUrl);
            setToken(result.token);
            setTokenId(result.id);
        } catch (err: any) {
            setError(err.message || 'Failed to generate share link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(token);
            setSuccess('Token copied to clipboard!');
            await logActivity(userId, 'share_copied', document.id, token);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to copy token');
        }
    };

    const handleWhatsAppShare = async () => {
        const message = `Check out this document: ${document.name}\n${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        await logActivity(userId, 'share_whatsapp', document.id, token);
    };

    const handleEmailShare = async () => {
        const subject = `Shared Document: ${document.name}`;
        const body = `I'm sharing this document with you:\n\nDocument: ${document.name}\nType: ${document.type}\n\nAccess link: ${shareUrl}\n\nThis link will expire in ${expiryHours} hours.`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        await logActivity(userId, 'share_email', document.id, token);
    };

    const handleNativeShare = async () => {
        if ('share' in navigator) {
            try {
                await navigator.share({
                    title: `Shared Document: ${document.name}`,
                    text: `Check out this document: ${document.name}`,
                    url: shareUrl,
                });
                await logActivity(userId, 'share_native', document.id, token);
            } catch (err: any) {
                if (err.name !== 'AbortError') setError('Failed to share');
            }
        }
    };

    const handleRevoke = async () => {
        if (!confirm('Are you sure you want to revoke this share link?')) return;

        setLoading(true);
        setError(null);

        try {
            await revokeShareToken(tokenId, userId);
            setIsRevoked(true);
            setSuccess('Share link has been revoked');
        } catch (err: any) {
            setError(err.message || 'Failed to revoke share link');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShareUrl('');
        setToken('');
        setTokenId('');
        setError(null);
        setSuccess(null);
        setIsRevoked(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
                <div className="bg-primary-green p-4 sm:p-6 text-white sticky top-0 z-10">
                    <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <Share2 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5 sm:mt-0" />
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold">Share Document</h2>
                                <p className="text-xs sm:text-sm text-blue-100 mt-1 truncate">{document.name}</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-colors flex-shrink-0">
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {error && (
                        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 sm:gap-3">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-green-700">{success}</p>
                        </div>
                    )}

                    {loading && !shareUrl ? (
                        <div className="text-center py-6 sm:py-8">
                            <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary-green border-t-transparent rounded-full mx-auto mb-3 sm:mb-4" />
                            <p className="text-sm sm:text-base text-gray-600">Generating secure share link...</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Link Expiry</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { label: '1 Hour', value: 1 },
                                        { label: '6 Hours', value: 6 },
                                        { label: '24 Hours', value: 24 },
                                        { label: '7 Days', value: 168 },
                                        { label: '30 Days', value: 720 },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setExpiryHours(option.value)}
                                            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border transition-colors ${expiryHours === option.value
                                                ? 'bg-primary-green text-white border-primary-green'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-green'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!shareUrl ? (
                                <Button onClick={generateShareToken} className="w-full" disabled={loading}>
                                    Generate Share Link
                                </Button>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Scan QR Code</p>
                                        <div className="inline-block p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg">
                                            <canvas ref={canvasRef} className="mx-auto" style={{ maxWidth: '100%', height: 'auto' }} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Verification Token</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={token}
                                                readOnly
                                                className="flex-1 min-w-0 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm font-mono truncate"
                                            />
                                            <Button onClick={handleCopyLink} size="sm" disabled={isRevoked}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Share this token or scan the QR code</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <button
                                            onClick={handleWhatsAppShare}
                                            disabled={isRevoked}
                                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                            <span className="font-medium">WhatsApp</span>
                                        </button>

                                        <button
                                            onClick={handleEmailShare}
                                            disabled={isRevoked}
                                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                                            <span className="font-medium">Email</span>
                                        </button>

                                        {'share' in navigator && (
                                            <button
                                                onClick={handleNativeShare}
                                                disabled={isRevoked}
                                                className="sm:col-span-2 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                                            >
                                                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                <span className="font-medium">More Options</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => {
                                                setShareUrl('');
                                                setToken('');
                                                setTokenId('');
                                                setIsRevoked(false);
                                                generateShareToken();
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                            disabled={loading || isRevoked}
                                        >
                                            Regenerate
                                        </Button>
                                        {!isRevoked ? (
                                            <Button
                                                onClick={handleRevoke}
                                                variant="outline"
                                                className="flex-1"
                                                disabled={loading}
                                            >
                                                <Ban className="h-4 w-4 mr-1" />
                                                Revoke
                                            </Button>
                                        ) : (
                                            <div className="flex-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-center">
                                                <p className="text-xs font-medium text-red-800">Revoked</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
