import { Home, Users, Building, Share2, Activity, FileText, Settings } from 'lucide-react';

interface GovSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function GovSidebar({ activeTab, setActiveTab }: GovSidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Dashboard Home', icon: Home },
    { id: 'search', label: 'Citizen Search', icon: Users },
    { id: 'vault', label: 'Institution Vault', icon: Building },
    { id: 'shared', label: 'Shared Assets', icon: Share2 },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
    { id: 'templates', label: 'Templates', icon: FileText },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden sticky top-24">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation</h3>
        </div>
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
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
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default GovSidebar;
