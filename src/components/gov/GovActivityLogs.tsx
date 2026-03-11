import { Activity, Search, Filter, Download, Clock, FileText, Share2, Shield, User } from 'lucide-react';

export function GovActivityLogs() {
  const logs = [
    { action: 'issued', target: 'John Kamara', doc: 'Birth Certificate', time: '2024-03-10 14:30', origin: 'MOH' },
    { action: 'shared', target: 'SL Police', doc: 'Health_Registry_2024', time: '2024-03-10 12:45', origin: 'MOH' },
    { action: 'issued', target: 'Alice Sesay', doc: 'Degree Certificate', time: '2024-03-09 16:20', origin: 'USL' },
    { action: 'security', target: 'Role Update', doc: 'Admin Permissions', time: '2024-03-09 10:15', origin: 'MOH' },
    { action: 'uploaded', target: 'Internal Vault', doc: 'Policy_Manual_Final', time: '2024-03-08 09:30', origin: 'MOH' },
  ];

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'issued': return FileText;
      case 'shared': return Share2;
      case 'security': return Shield;
      case 'uploaded': return User;
      default: return Activity;
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'issued': return 'text-teal-600 bg-teal-50';
      case 'shared': return 'text-indigo-600 bg-indigo-50';
      case 'security': return 'text-rose-600 bg-rose-50';
      case 'uploaded': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Activity Audit Trail</h2>
          <p className="text-slate-500 text-sm">Full transparency logs of all government actions, issuance, and sharing.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all">
          <Download className="h-4 w-4" />
          Export Audit Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs by NIN, doc or action..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#006D77]/20"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Filter className="h-4 w-4" />
            Action Type
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Clock className="h-4 w-4" />
            Date Range
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">Action</th>
                <th className="px-6 py-4 text-left">Recipient / Target</th>
                <th className="px-6 py-4 text-left">Document / Asset</th>
                <th className="px-6 py-4 text-left">Timestamp</th>
                <th className="px-6 py-4 text-left">Institution</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {logs.map((log, i) => {
                const Icon = getActionIcon(log.action);
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        <Icon className="h-3 w-3" />
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{log.target}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {log.doc}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-500 font-medium">{log.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                        {log.origin}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GovActivityLogs;
