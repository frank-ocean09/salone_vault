import { Home, CreditCard, Search, FileCheck, Activity, Settings } from 'lucide-react';

interface SlraSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export function SlraSidebar({ activeTab, setActiveTab }: SlraSidebarProps) {
    const menuItems = [
        { id: 'home', label: 'Dashboard Home', icon: Home },
        { id: 'issue', label: 'Issue Driver’s License', icon: CreditCard },
        { id: 'search', label: 'Search Citizen (NIN)', icon: Search },
        { id: 'issued', label: 'Issued Licenses', icon: FileCheck },
        { id: 'logs', label: 'Activity Log', icon: Activity },
    ];

    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">SLRA Portal</h3>
                </div>
                <nav className="p-2 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-[#006D77] text-white shadow-md shadow-[#006D77]/20'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#006D77]'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#006D77]'}`} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-4 p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-2 w-full text-slate-500 hover:text-slate-700 transition-colors text-sm">
                        <Settings className="h-4 w-4" />
                        <span>Institutional Settings</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default SlraSidebar;
