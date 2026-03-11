import { Share2, Building, Clock, Download, ExternalLink, Shield } from 'lucide-react';

export function GovSharedAssets() {
  const incomingShares = [
    { name: 'Vehicle_Registry_Data', sender: 'SL Police', date: '2024-03-08', permission: 'View Only', status: 'Active' },
    { name: 'National_Health_Audit', sender: 'MOH', date: '2024-03-05', permission: 'Download', status: 'Active' },
    { name: 'Land_Deed_Registry', sender: 'Ministry of Lands', date: '2024-03-01', permission: 'Both', status: 'Expiring Soon' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shared With This Institution</h2>
          <p className="text-slate-500 text-sm">Access documents and data repositories shared by other government agencies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {incomingShares.map((share, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-all group">
            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{share.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Issued by {share.sender}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                share.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600 animate-pulse'
              }`}>
                {share.status}
              </span>
            </div>
            
            <div className="p-6 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Permission</p>
                  <p className="text-sm font-semibold text-slate-700">{share.permission}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Received</p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <Clock className="h-3 w-3" />
                    {share.date}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                  <Download className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm font-bold text-xs uppercase tracking-wider">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state illustration if none (example logic) */}
      {incomingShares.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
          <Share2 className="h-20 w-20 mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-500">No incoming shares found</h3>
          <p className="text-slate-400 text-sm max-w-xs">Documents shared by other institutions will appear here once authorized.</p>
        </div>
      )}
    </div>
  );
}

export default GovSharedAssets;
