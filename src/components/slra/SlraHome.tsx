import { useState } from 'react';
import { CreditCard, Users, FileCheck, ArrowUpRight, Clock, ShieldCheck, Upload, ChevronRight, X, Shield, User, CheckCircle } from 'lucide-react';

interface SlraHomeProps {
    setActiveTab: (tab: any) => void;
}

export function SlraHome({ setActiveTab }: SlraHomeProps) {
    const [isIssuanceModalOpen, setIsIssuanceModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [nin, setNin] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [recipient, setRecipient] = useState<any>(null);
    const [isIssuing, setIsIssuing] = useState(false);
    const [issued, setIssued] = useState(false);

    const stats = [
        { label: 'Licenses Issued Today', value: '42', icon: CreditCard, color: 'bg-teal-50 text-teal-600', trend: '+8%' },
        { label: 'Citizens Verified', value: '156', icon: Users, color: 'bg-green-50 text-green-600', trend: '+12%' },
        { label: 'Active Licenses', value: '12,482', icon: FileCheck, color: 'bg-cyan-50 text-cyan-600', trend: '+3%' },
    ];

    const recentActions = [
        { title: 'Class A License Issued', citizen: 'Amadu Jalloh', time: '5 mins ago', type: 'issuance' },
        { title: 'License Renewal Processed', citizen: 'Fatu Conteh', time: '15 mins ago', type: 'issuance' },
        { title: 'Driver Registry Searched', nif: 'NIN-12345678', time: '1 hour ago', type: 'search' },
        { title: 'License PDF Uploaded', citizen: 'Samuel Turay', time: '2 hours ago', type: 'vault' },
        { title: 'Authority Audit Log Exported', officer: 'Officer Koroma', time: '4 hours ago', type: 'security' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="h-3 w-3" />
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions & Recent Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setActiveTab('issue')}
                                className="w-full flex items-center justify-between p-4 bg-teal-50 text-[#006D77] font-bold rounded-xl border border-teal-100/50 hover:bg-teal-100 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Upload className="h-5 w-5" />
                                    <span>Upload Document</span>
                                </div>
                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => setActiveTab('issue')}
                                className="w-full flex items-center justify-between p-4 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-100 hover:bg-slate-100 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Issue License</span>
                                </div>
                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#006D77] p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Need Support?</p>
                        <h4 className="text-lg font-black mb-4">Institutional Helpdesk</h4>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl backdrop-blur-md transition-all">
                            Open Support Ticket
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-[#006D77]" />
                            Recently Uploaded Documents
                        </h3>
                        <button className="text-sm font-semibold text-[#006D77] hover:underline">View All Registry</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {[
                            { name: 'DL_SCAN_KAMARA.pdf', size: '1.2 MB', time: '12 mins ago' },
                            { name: 'INSPECTION_REPORT_V3.jpg', size: '2.5 MB', time: '28 mins ago' },
                            { name: 'RENEWAL_FORM_09.pdf', size: '0.8 MB', time: '1 hour ago' },
                            { name: 'ACCIDENT_LOG_MARCH.pdf', size: '4.1 MB', time: '3 hours ago' },
                        ].map((doc, i) => (
                            <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:text-[#006D77] group-hover:bg-teal-50 transition-all">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{doc.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{doc.time}</span>
                                    <button
                                        onClick={() => {
                                            setSelectedDoc(doc);
                                            setIsIssuanceModalOpen(true);
                                        }}
                                        className="px-3 py-1 bg-teal-50 text-[#006D77] text-[10px] font-black uppercase tracking-widest rounded-lg border border-teal-100/50 hover:bg-teal-100 transition-all"
                                    >
                                        Upload
                                    </button>
                                    <button className="p-2 text-slate-300 hover:text-[#006D77] transition-all">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-[#006D77]" />
                            Institutional Activity
                        </h3>
                        <button className="text-sm font-semibold text-[#006D77] hover:underline">View Full Log</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {recentActions.map((action, i) => (
                            <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${action.type === 'issuance' ? 'bg-teal-400' :
                                        action.type === 'search' ? 'bg-cyan-400' :
                                            action.type === 'security' ? 'bg-rose-400' : 'bg-slate-300'
                                        }`} />
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{action.title}</h4>
                                        <p className="text-xs text-slate-500">
                                            {action.citizen || action.nif || action.officer}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-[#006D77] transition-colors">
                                    {action.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SLRA Security & Compliance */}
                <div className="bg-gradient-to-br from-[#006D77] to-[#1a4d52] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">SLRA Security Node</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                <p className="text-sm font-medium opacity-80">Unclaimed Licenses (Pending NIN Link)</p>
                                <p className="text-2xl font-bold">128 Pending</p>
                            </div>
                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                <p className="text-sm font-medium opacity-80">Blockchain Anchors In Progress</p>
                                <p className="text-2xl font-bold">15 Active</p>
                            </div>
                            <div className="pt-4">
                                <button className="w-full py-3 bg-white text-[#006D77] font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
                                    Generate Compliance Report
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
                </div>
            </div>
            {/* Issuance Modal */}
            {isIssuanceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#006D77] p-6 text-white flex justify-between items-center text-sm">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight leading-none mb-1">Issue Document</h3>
                                <p className="opacity-70 font-medium">Link {selectedDoc?.name} to Citizen</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsIssuanceModalOpen(false);
                                    setRecipient(null);
                                    setNin('');
                                }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {!recipient ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Recipient Citizen NIN</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1 group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#006D77]" />
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Enter Alphanumeric NIN"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#006D77] focus:bg-white transition-all font-bold text-slate-900 uppercase"
                                                value={nin}
                                                onChange={(e) => setNin(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsValidating(true);
                                                setTimeout(() => {
                                                    setIsValidating(false);
                                                    if (nin === '12345678') {
                                                        setRecipient({ name: 'Abu Bakarr Bangura', nin: '12345678', address: '12 Circular Rd, Freetown' });
                                                    }
                                                }, 800);
                                            }}
                                            disabled={isValidating || nin.length < 4}
                                            className="px-6 bg-[#006D77] text-white font-black rounded-xl shadow-lg shadow-[#006D77]/20 hover:bg-[#005a62] disabled:opacity-50 transition-all font-bold"
                                        >
                                            {isValidating ? '...' : 'Verify'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Enter 12345678 to test the verification flow.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                    <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner">
                                            <User className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-0.5">Verified Recipient</p>
                                            <p className="font-bold text-slate-900 text-lg leading-tight">{recipient.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{recipient.address}</p>
                                        </div>
                                    </div>

                                    {issued ? (
                                        <div className="py-6 text-center space-y-3 animate-in zoom-in duration-300">
                                            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-green-500/30">
                                                <CheckCircle className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-900 leading-none">Document Issued!</p>
                                                <p className="text-xs font-medium text-slate-500 mt-1">Successfully linked to citizen vault</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setRecipient(null)}
                                                className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsIssuing(true);
                                                    setTimeout(() => {
                                                        setIsIssuing(false);
                                                        setIssued(true);
                                                        setTimeout(() => {
                                                            setIssued(false);
                                                            setIsIssuanceModalOpen(false);
                                                            setNin('');
                                                            setRecipient(null);
                                                        }, 2000);
                                                    }, 1500);
                                                }}
                                                disabled={isIssuing}
                                                className="flex-[2] py-3.5 bg-[#006D77] text-white font-black rounded-xl shadow-lg shadow-[#006D77]/20 hover:bg-[#005a62] transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {isIssuing ? 'Uploading...' : 'Confirm Upload'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!recipient && nin.length >= 4 && !isValidating && nin !== '12345678' && (
                                <p className="text-xs text-rose-500 font-bold text-center bg-rose-50 py-2 rounded-lg border border-rose-100">NIN not found in SaloneVault registry.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SlraHome;
