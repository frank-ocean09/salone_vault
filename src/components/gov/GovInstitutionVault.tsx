import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Folder, File as FileIcon, Upload, Share2, MoreVertical, Search, Plus, HardDrive } from 'lucide-react';

export function GovInstitutionVault() {
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // In a real app, we'd fetch based on user's institution_id
    // For now, let's pretend we're in 'General Internal'
    const fetchVault = async () => {
      setLoading(true);
      // Placeholder logic
      setLoading(false);
    };
    fetchVault();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Institution Vault</h2>
          <p className="text-slate-500 text-sm">Manage internal documents and inter-agency shared folders.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">
            <Plus className="h-4 w-4" />
            New Folder
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#006D77] text-white font-semibold rounded-xl shadow-lg shadow-[#006D77]/20 hover:bg-[#006D77]/90 transition-all">
            <Upload className="h-4 w-4" />
            Upload Internal
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-slate-800 rounded-2xl p-6 text-white flex flex-wrap gap-8 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-teal-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Storage Used</p>
              <p className="text-sm font-bold">12.4 GB / 100 GB</p>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-700 hidden md:block" />
          <div className="flex items-center gap-3">
            <Folder className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Folders</p>
              <p className="text-sm font-bold">42 Folders</p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-sm relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search vault..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sample Folders */}
        {[
          { name: 'Internal HR', items: '156 files', color: 'text-teal-500' },
          { name: 'Legal Documents', items: '89 files', color: 'text-cyan-500' },
          { name: 'Finance Hub', items: '234 files', color: 'text-amber-500' },
          { name: 'Inter-Agency Shared', items: '12 folders', color: 'text-indigo-500' }
        ].map((folder, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:border-[#006D77] hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-50 group-hover:bg-teal-50 transition-colors ${folder.color}`}>
                <Folder className="h-8 w-8 fill-current" />
              </div>
              <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{folder.name}</h4>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{folder.items}</span>
              <div className="flex items-center gap-1 text-slate-400 group-hover:text-teal-600 transition-colors font-semibold">
                View <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Files Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-800">Recent Internal Documents</h3>
          <button className="text-sm font-semibold text-[#006D77] hover:underline">Full Directory</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">Document Name</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Internal Owner</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {[
                { name: 'Policy_Manual_V2.pdf', type: 'PDF', owner: 'Legal Dept', status: 'Restricted' },
                { name: 'Annual_Budget_2025.xlsx', type: 'Spreadsheet', owner: 'Finance', status: 'Confidential' },
                { name: 'Agency_Protocol.docx', type: 'Word', owner: 'Operations', status: 'Public' }
              ].map((file, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <FileIcon className="h-4 w-4 text-teal-600" />
                    <span className="font-semibold text-slate-700">{file.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{file.type}</td>
                  <td className="px-6 py-4 text-slate-500">{file.owner}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      file.status === 'Restricted' ? 'bg-rose-50 text-rose-600' :
                      file.status === 'Confidential' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
                    }`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 group transition-colors">
                      <Share2 className="h-4 w-4 group-hover:text-teal-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Minimal ArrowRight for the folder cards
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default GovInstitutionVault;
