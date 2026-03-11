import { Activity, Search, Filter, Calendar, FileText, User, Shield, Share2 } from 'lucide-react';

export function SlraActivityLogs() {
    const logs = [
        { title: 'New License Issued', citizen: 'John Kamara', officer: 'Officer Koroma', time: '10 mins ago', type: 'issuance' },
        { title: 'NIN Lookup Performed', nin: '12345678', officer: 'Officer Koroma', time: '25 mins ago', type: 'search' },
        { title: 'Blockchain Anchor Created', document: 'SLRA-DL-5521', officer: 'System', time: '45 mins ago', type: 'security' },
        { title: 'License Revoked', citizen: 'Unknown User', officer: 'Admin Jalloh', time: '2 hours ago', type: 'delete' },
        { title: 'Registry Exported', format: 'CSV', officer: 'Officer Koroma', time: '5 hours ago', type: 'security' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-[#006D77]" />
                        SLRA Institutional Audit Trail
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Real-time monitoring of all license-related transactions</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search audit trail..."
                            className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#006D77] transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-bold text-sm rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="p-0">
                <div className="divide-y divide-slate-100">
                    {logs.map((log, i) => (
                        <div key={i} className="p-6 hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${log.type === 'issuance' ? 'bg-teal-50 text-teal-600' :
                                            log.type === 'search' ? 'bg-cyan-50 text-cyan-600' :
                                                log.type === 'delete' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                                        }`}>
                                        {log.type === 'issuance' ? <FileText className="h-5 w-5" /> :
                                            log.type === 'search' ? <User className="h-5 w-5" /> :
                                                log.type === 'delete' ? <Activity className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 group-hover:text-[#006D77] transition-colors">{log.title}</h4>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                                <User className="h-3 w-3" />
                                                Target: {log.citizen || log.nin || log.document || log.format}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                                <Shield className="h-3 w-3" />
                                                Officer: {log.officer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 pl-14 md:pl-0">
                                    <Calendar className="h-3 w-3" />
                                    {log.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
                <button className="text-sm font-black text-[#006D77] hover:underline uppercase tracking-[0.2em]">
                    Access Historical Archives
                </button>
            </div>
        </div>
    );
}

export default SlraActivityLogs;
