import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Activity, Filter, Download, Calendar, FileText, User, Clock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserActivityLogs } from '../lib/shareApi';
import { supabase } from '../lib/supabase';

interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    document_id: string | null;
    token: string | null;
    meta: Record<string, any> | null;
    created_at: string;
}

interface DocumentInfo {
    id: string;
    name: string;
}

export function ActivityLogs() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [documents, setDocuments] = useState<Map<string, DocumentInfo>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterAction, setFilterAction] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            loadActivityLogs();
        }
    }, [user, sortOrder]);

    const loadActivityLogs = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch activity logs
            const activityLogs = await getUserActivityLogs(user.id, 100);

            // Sort logs
            const sortedLogs = activityLogs.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            });

            setLogs(sortedLogs);

            // Fetch document names for logs that have document_id
            const documentIds = [...new Set(activityLogs
                .filter(log => log.document_id)
                .map(log => log.document_id as string))];

            if (documentIds.length > 0) {
                const { data: docs, error: docsError } = await supabase
                    .from('documents')
                    .select('id, name')
                    .in('id', documentIds);

                if (!docsError && docs) {
                    const docMap = new Map<string, DocumentInfo>();
                    docs.forEach(doc => docMap.set(doc.id, doc));
                    setDocuments(docMap);
                }
            }
        } catch (err: any) {
            console.error('Failed to load activity logs:', err);
            setError(err.message || 'Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionLabel = (action: string): string => {
        const labels: Record<string, string> = {
            'user_login': 'User Login',
            'user_logout': 'User Logout',
            'document_uploaded': 'Document Uploaded',
            'share_created': 'Share Link Created',
            'share_copied': 'Share Link Copied',
            'share_whatsapp': 'Shared via WhatsApp',
            'share_email': 'Shared via Email',
            'share_native': 'Shared via Native',
            'share_revoked': 'Share Link Revoked',
            'document_verified': 'Document Verified',
        };
        return labels[action] || action;
    };

    const getActionIcon = (action: string) => {
        if (action.includes('login') || action.includes('logout')) return User;
        if (action.includes('document')) return FileText;
        if (action.includes('share')) return Shield;
        return Activity;
    };

    const getActionColor = (action: string): string => {
        if (action.includes('login')) return 'text-green-600 bg-green-50';
        if (action.includes('logout')) return 'text-gray-600 bg-gray-50';
        if (action.includes('uploaded')) return 'text-blue-600 bg-blue-50';
        if (action.includes('share')) return 'text-purple-600 bg-purple-50';
        if (action.includes('revoked')) return 'text-red-600 bg-red-50';
        if (action.includes('verified')) return 'text-green-600 bg-green-50';
        return 'text-gray-600 bg-gray-50';
    };

    const maskToken = (token: string | null): string => {
        if (!token) return 'N/A';
        return token.length > 8 ? `${token.substring(0, 8)}...` : token;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredLogs = filterAction === 'all'
        ? logs
        : logs.filter(log => log.action === filterAction);

    const actionTypes = [...new Set(logs.map(log => log.action))];

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Action', 'Document', 'Token', 'Details'];
        const rows = filteredLogs.map(log => [
            formatDate(log.created_at),
            getActionLabel(log.action),
            log.document_id ? (documents.get(log.document_id)?.name || 'Unknown') : 'N/A',
            maskToken(log.token),
            log.meta ? JSON.stringify(log.meta) : 'N/A',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-primary-green border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading activity logs...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Activity className="h-8 w-8 text-primary-green" />
                                <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                            </div>
                            <Button onClick={() => navigate('/dashboard')} variant="outline">
                                Back to Dashboard
                            </Button>
                        </div>
                        <p className="text-gray-600">Track all your document and security activities</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Filters and Controls */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Action Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <select
                                    value={filterAction}
                                    onChange={(e) => setFilterAction(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                                >
                                    <option value="all">All Actions</option>
                                    {actionTypes.map(action => (
                                        <option key={action} value={action}>
                                            {getActionLabel(action)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>

                            {/* Export Button */}
                            <div className="ml-auto">
                                <Button onClick={exportToCSV} variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Logs Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {filteredLogs.length === 0 ? (
                            <div className="p-12 text-center">
                                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Logs</h3>
                                <p className="text-gray-600">
                                    {filterAction === 'all'
                                        ? 'Your activity will appear here as you use the application.'
                                        : 'No logs found for the selected filter.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Timestamp
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Document
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Token
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredLogs.map((log) => {
                                            const Icon = getActionIcon(log.action);
                                            return (
                                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                            {formatDate(log.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                                                            <Icon className="h-4 w-4" />
                                                            {getActionLabel(log.action)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {log.document_id
                                                            ? documents.get(log.document_id)?.name || 'Unknown'
                                                            : <span className="text-gray-400">N/A</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                                        {maskToken(log.token)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {log.meta ? (
                                                            <div className="max-w-xs truncate" title={JSON.stringify(log.meta, null, 2)}>
                                                                {Object.entries(log.meta)
                                                                    .filter(([key]) => !['timestamp', 'userAgent'].includes(key))
                                                                    .map(([key, value]) => `${key}: ${value}`)
                                                                    .join(', ') || 'No details'}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">No details</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Activities</p>
                                    <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                                </div>
                                <Activity className="h-8 w-8 text-primary-green" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Documents Uploaded</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {logs.filter(l => l.action === 'document_uploaded').length}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Shares Created</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {logs.filter(l => l.action === 'share_created').length}
                                    </p>
                                </div>
                                <Shield className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
