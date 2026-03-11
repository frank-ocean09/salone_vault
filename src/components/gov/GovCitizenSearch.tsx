import { useState } from 'react';
import { Search, ShieldCheck, FileText, QrCode, Clipboard, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SendDocumentPanel from '../SendDocumentPanel';

export function GovCitizenSearch() {
  const [nin, setNin] = useState('');
  const [citizen, setCitizen] = useState<{ id: string; full_name: string; nin: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIssuePanel, setShowIssuePanel] = useState(false);

  const handleSearch = async () => {
    if (!nin.match(/^[0-9]{8}$/)) {
      setError('NIN must be 8 digits');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select('id, full_name, nin')
        .eq('nin', nin)
        .eq('role', 'citizen')
        .single();

      if (searchError) throw new Error('Citizen not found or error accessing record');
      setCitizen(data);
    } catch (err: any) {
      setError(err.message);
      setCitizen(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search Bar section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Citizen Document Issuance</h2>
          <p className="text-slate-500 text-sm">Search by National Identification Number (NIN) to issue or manage personal records.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={nin}
              onChange={(e) => setNin(e.target.value)}
              placeholder="Enter 11-digit NIN..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006D77] focus:border-transparent outline-none transition-all"
              maxLength={11}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-4 bg-[#006D77] text-white font-bold rounded-xl hover:bg-[#006D77]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006D77]/20 disabled:opacity-50"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Search className="h-5 w-5" />}
            Validate Citizen
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            {error}
          </div>
        )}
      </div>

      {citizen && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden divide-y divide-slate-100">
          <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#2EAF7D] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#2EAF7D]/20">
                {citizen.full_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-slate-800">{citizen.full_name}</h3>
                  <ShieldCheck className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-slate-500 font-mono text-sm tracking-widest">NIN: {citizen.nin}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowIssuePanel(!showIssuePanel)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  showIssuePanel ? 'bg-slate-800 text-white' : 'bg-[#2EAF7D] text-white shadow-lg shadow-[#2EAF7D]/20'
                }`}
              >
                <FileText className="h-5 w-5" />
                {showIssuePanel ? 'Cancel Issuance' : 'Issue New Document'}
              </button>
            </div>
          </div>

          {!showIssuePanel && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/50 flex items-center gap-4 group hover:border-[#006D77] transition-all cursor-pointer">
                <div className="p-3 bg-white rounded-xl shadow-sm text-[#006D77]">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Claim Code</h4>
                  <p className="text-xs text-slate-500">Generate QR for physical delivery</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/50 flex items-center gap-4 group hover:border-[#006D77] transition-all cursor-pointer">
                <div className="p-3 bg-white rounded-xl shadow-sm text-[#006D77]">
                  <Clipboard className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Copy Profile Link</h4>
                  <p className="text-xs text-slate-500">Share secure access URL</p>
                </div>
              </div>
              <div className="p-6 bg-[#E6F4F1] rounded-2xl border border-[#006D77]/20 flex items-center gap-4 transition-all">
                <div className="p-3 bg-white rounded-xl shadow-sm text-[#2EAF7D]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Verification Active</h4>
                  <p className="text-xs text-slate-500">Identity cryptographically anchored</p>
                </div>
              </div>
            </div>
          )}

          {showIssuePanel && (
            <div className="p-8 bg-slate-50/30">
              <SendDocumentPanel citizenId={citizen.id} onSent={() => {
                setShowIssuePanel(false);
                // Trigger success toast or notification
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GovCitizenSearch;
