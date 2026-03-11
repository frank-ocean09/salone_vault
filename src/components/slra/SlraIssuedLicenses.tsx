import { useState } from 'react';
import { FileCheck, Search, Download, ExternalLink, Filter, MoreVertical, Calendar, Share2, Shield, User, X, CheckCircle } from 'lucide-react';

export function SlraIssuedLicenses() {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<any>(null);
    const [nin, setNin] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [citizen, setCitizen] = useState<any>(null);
    const [shared, setShared] = useState(false);

    const licenses = [
        { id: 'DL-5521', citizen: 'John Kamara', nin: '12345678', class: 'Class A', issued: '2026-03-10', status: 'Active' },
        { id: 'DL-8832', citizen: 'Zainab Sesay', nin: '22340011', class: 'Class B', issued: '2026-03-09', status: 'Pending Claim' },
        { id: 'DL-1104', citizen: 'Ibrahim Kallon', nin: '33451122', class: 'Class C', issued: '2026-03-08', status: 'Active' },
        { id: 'DL-9945', citizen: 'Mary Bangura', nin: '44562233', class: 'Class A', issued: '2026-03-07', status: 'Active' },
        { id: 'DL-4433', citizen: 'Samuel Turay', nin: '55673344', class: 'Class M', issued: '2026-03-06', status: 'Active' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsValidating(true);
        // Simulation of search logic
        setTimeout(() => {
            setIsValidating(false);
            if (nin === '12345678') {
                setCitizen({ name: 'Abu Bakarr Bangura', nin: '12345678' });
            } else {
                setCitizen(null);
            }
        }, 800);
    };

    const handleShare = () => {
        setShared(true);
        setTimeout(() => {
            setShared(false);
            setIsShareModalOpen(false);
            setNin('');
            setCitizen(null);
            setSelectedLicense(null);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-[#006D77]" />
                    Issued Licenses Registry
                </h3>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search licenses..."
                            className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#006D77] transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-bold text-sm rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIN</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {licenses.map((license) => (
                            <tr key={license.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 font-black text-slate-900 text-sm">#{license.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{license.citizen}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-500 uppercase tracking-tighter">{license.nin}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">
                                        {license.class}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                    {license.issued}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${license.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600 animate-pulse'
                                        }`}>
                                        {license.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-400 hover:text-[#006D77] transition-colors rounded-lg hover:bg-slate-100">
                                            <Download className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedLicense(license);
                                                setIsShareModalOpen(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-[#006D77] transition-colors rounded-lg hover:bg-slate-100"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Showing 5 of 1,284 licenses</span>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">Prev</button>
                    <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
}

export default SlraIssuedLicenses;
