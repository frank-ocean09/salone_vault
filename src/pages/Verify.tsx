import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Search, CheckCircle, XCircle, FileText, Calendar, Hash } from 'lucide-react';
import { validateShareToken } from '../lib/shareApi';
import { supabase } from '../lib/supabase';

export function Verify() {
    const [searchParams] = useSearchParams();
    const [verificationCode, setVerificationCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    // Auto-verify if token is in URL
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setVerificationCode(token);
            handleVerifyWithToken(token);
        }
    }, [searchParams]);

    const handleVerifyWithToken = async (token: string) => {
        setStatus('loading');
        setError('');

        try {
            const { token: tokenData, document } = await validateShareToken(token);

            setStatus('success');
            setResult({
                name: document.name,
                type: document.type,
                hash: document.hash,
                date: new Date(document.created_at).toLocaleDateString(),
                status: document.status,
                verified: true,
                storedHash: document.hash,
                tokenExpiry: new Date(tokenData.expires_at).toLocaleString(),
                uses: tokenData.uses,
                maxUses: tokenData.max_uses,
                filePath: document.file_path, // Store file path instead of URL
            });
        } catch (err: any) {
            setStatus('error');
            setError(err.message || 'Invalid or expired verification code');
            setResult(null);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationCode) return;
        await handleVerifyWithToken(verificationCode.trim());
    };

    const handleViewDocument = async () => {
        if (!result?.filePath) return;

        try {
            // Generate fresh signed URL (valid for 5 minutes)
            const { data: signedUrlData, error } = await supabase.storage
                .from('Documents')
                .createSignedUrl(result.filePath, 300);

            if (error || !signedUrlData?.signedUrl) {
                setError('Failed to generate document URL');
                return;
            }

            window.location.href = signedUrlData.signedUrl;
        } catch (err) {
            setError('Failed to open document');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-primary-green p-8 text-center">
                        <img src="/nddv-logo.png" alt="Salone Vault Logo" className="h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white">Document Verification</h1>
                        <p className="text-blue-200 mt-2">Enter the verification token to verify document authenticity.</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                    Verification Token
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter verification token"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={status === 'loading'}>
                                {status === 'loading' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify Document'
                                )}
                            </Button>
                        </form>

                        {status === 'success' && result && (
                            <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                    <div>
                                        <h3 className="font-bold text-green-900">Verification Successful</h3>
                                        <p className="text-sm text-green-700">This document is authentic and verified.</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3 py-2 border-b border-green-200">
                                        <FileText className="h-4 w-4 text-green-700 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-gray-600 block">Document Name</span>
                                            <span className="font-medium text-gray-900">{result.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 py-2 border-b border-green-200">
                                        <FileText className="h-4 w-4 text-green-700 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-gray-600 block">Document Type</span>
                                            <span className="font-medium text-gray-900">{result.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 py-2 border-b border-green-200">
                                        <Calendar className="h-4 w-4 text-green-700 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-gray-600 block">Date Uploaded</span>
                                            <span className="font-medium text-gray-900">{result.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 py-2 border-b border-green-200">
                                        <CheckCircle className="h-4 w-4 text-green-700 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-gray-600 block">Status</span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {result.status === 'verified' ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    {result.maxUses && (
                                        <div className="flex items-start gap-3 py-2 border-b border-green-200">
                                            <FileText className="h-4 w-4 text-green-700 mt-0.5" />
                                            <div className="flex-1">
                                                <span className="text-gray-600 block">Link Usage</span>
                                                <span className="font-medium text-gray-900">
                                                    {result.uses} / {result.maxUses} uses
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 py-2 border-b border-green-200">
                                        <Calendar className="h-4 w-4 text-green-700 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-gray-600 block">Link Expires</span>
                                            <span className="font-medium text-gray-900">{result.tokenExpiry}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 pt-2">
                                        <Hash className="h-4 w-4 text-green-700 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-gray-600 block mb-1">File Hash</span>
                                            <code className="bg-white px-2 py-1 rounded border border-green-200 text-xs font-mono block break-all">
                                                {result.hash}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                {result.filePath && (
                                    <div className="mt-6 pt-6 border-t border-green-200">
                                        <Button
                                            onClick={handleViewDocument}
                                            className="w-full"
                                        >
                                            View Document
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-3">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div>
                                        <h3 className="font-bold text-red-900">Verification Failed</h3>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
