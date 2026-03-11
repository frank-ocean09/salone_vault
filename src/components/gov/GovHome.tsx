import { FileText, Users, Building, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export function GovHome() {
  const stats = [
    { label: 'Total Issued', value: '1,284', icon: FileText, color: 'bg-teal-50 text-teal-600', trend: '+12%' },
    { label: 'Citizens Served', value: '856', icon: Users, color: 'bg-green-50 text-green-600', trend: '+5%' },
    { label: 'Internal Docs', value: '432', icon: Building, color: 'bg-cyan-50 text-cyan-600', trend: '+18%' },
  ];

  const recentActions = [
    { title: 'Birth Certificate Issued', citizen: 'John Kamara', time: '10 mins ago', type: 'issuance' },
    { title: 'Land Title Shared', institution: 'Ministry of Lands', time: '45 mins ago', type: 'sharing' },
    { title: 'New Folder Created', vault: 'Internal / HR', time: '2 hours ago', type: 'vault' },
    { title: 'Degree Verified', citizen: 'Mariama Bangura', time: '3 hours ago', type: 'issuance' },
    { title: 'Permissions Updated', institution: 'SL Police', time: '5 hours ago', type: 'security' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#006D77]" />
              Recent Actions
            </h3>
            <button className="text-sm font-semibold text-[#006D77] hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActions.map((action, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    action.type === 'issuance' ? 'bg-teal-400' :
                    action.type === 'sharing' ? 'bg-cyan-400' :
                    action.type === 'security' ? 'bg-rose-400' : 'bg-slate-300'
                  }`} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{action.title}</h4>
                    <p className="text-xs text-slate-500">
                      {action.citizen || action.institution || action.vault}
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

        {/* System Health / Notifications */}
        <div className="bg-gradient-to-br from-[#006D77] to-[#2EAF7D] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">System Integrity</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-sm font-medium opacity-80">Pending Claim Requests</p>
                <p className="text-2xl font-bold">24 Citizens</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-sm font-medium opacity-80">Expiring Shares</p>
                <p className="text-2xl font-bold">8 Documents</p>
              </div>
              <div className="pt-4">
                <button className="w-full py-3 bg-white text-[#006D77] font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
                  Generate Summary Report
                </button>
              </div>
            </div>
          </div>
          
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
        </div>
      </div>
    </div>
  );
}

export default GovHome;
