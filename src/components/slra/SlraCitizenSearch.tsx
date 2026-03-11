import { useState } from 'react';
import { Search, Shield, User, MapPin, Phone, Mail, FileText, CheckCircle, XCircle, CreditCard, ExternalLink } from 'lucide-react';

interface SlraCitizenSearchProps {
    setActiveTab: (tab: any) => void;
}

export function SlraCitizenSearch({ setActiveTab }: SlraCitizenSearchProps) {
    const [nin, setNin] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [citizen, setCitizen] = useState<any>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        // Simulation of search logic
        setTimeout(() => {
            setIsSearching(false);
            setSearched(true);
            if (nin === '12345678') {
                setCitizen({
                    name: 'Abu Bakarr Bangura',
                    nin: '12345678',
                    registered: true,
                    status: 'Active',
                    address: '12 Circular Rd, Freetown',
                    email: 'abu.bangura@gmail.com',
                    licenses: [
                        { type: 'Driver License', class: 'Class A', expiry: '2026-05-12' }
                    ]
                });
            } else {
                setCitizen(null);
            }
        }, 1000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 max-w-2xl mx-auto">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Search className="h-6 w-6 text-[#006D77]" />
                    Lookup Citizen (NIN)
                </h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#006D77] transition-colors">
                            <Shield className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="Enter 8-digit NIN"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#006D77] focus:bg-white transition-all font-bold text-slate-900 tracking-wider placeholder:tracking-normal"
                            value={nin}
                            onChange={(e) => setNin(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="px-8 py-4 bg-[#006D77] text-white font-black rounded-2xl shadow-lg shadow-[#006D77]/20 hover:bg-[#005a62] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Search'}
                    </button>
                </form>
            </div>

            {searched && (
                <div className="max-w-4xl mx-auto animate-in zoom-in fade-in duration-300">
                    {citizen ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 ring-8 ring-indigo-50/50">
                                        <User className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">{citizen.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">NIN: {citizen.nin}</span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                <CheckCircle className="h-3 w-3" /> Registered
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('issue')}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#006D77] text-white font-bold rounded-xl hover:bg-[#005a62] transition-colors"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Issue New License
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                <div className="p-8 space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Contact Info</h4>
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        {citizen.address}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        +232 7 XXXXXXX
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        {citizen.email}
                                    </div>
                                </div>

                                <div className="p-8 md:col-span-2 bg-slate-50/30">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current SLRA Records</h4>
                                    <div className="space-y-3">
                                        {citizen.licenses.map((license: any, idx: number) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-[#006D77]/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-teal-50 rounded-lg">
                                                        <FileText className="h-5 w-5 text-[#006D77]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{license.type} ({license.class})</p>
                                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Expires: {license.expiry}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-slate-300 hover:text-[#006D77] transition-colors">
                                                    <ExternalLink className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                                <XCircle className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">No Citizen Found</h3>
                            <p className="text-slate-500 font-medium mb-8">NIN ({nin}) is not linked to any active profile in SaloneVault.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    className="px-8 py-3 bg-[#006D77] text-white font-bold rounded-xl hover:bg-[#005a62] transition-all"
                                    onClick={() => setActiveTab('issue')}
                                >
                                    Issue New Account-Linked License
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SlraCitizenSearch;
