import { FileText, Plus, Search, Filter, ShieldCheck } from 'lucide-react';

export function GovDocumentTemplates() {
  const templates = [
    { title: 'National Driver\'s License', category: 'Transportation', code: 'DL-SOFT-V2', popularity: 'High' },
    { title: 'Official Birth Certificate', category: 'Civil Registry', code: 'BC-CIV-V1', popularity: 'High' },
    { title: 'Land Title / Property Deed', category: 'Lands & Surveys', code: 'LP-TIT-V3', popularity: 'Medium' },
    { title: 'Academic Degree / Diploma', category: 'Education', code: 'EDU-DEG-V1', popularity: 'Medium' },
    { title: 'Business Operating Permit', category: 'Commerce', code: 'BUS-PER-V1', popularity: 'Low' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Document Templates</h2>
          <p className="text-slate-500 text-sm">Standardized templates to ensure consistency across all issued documents.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#006D77] text-white font-bold rounded-xl shadow-lg shadow-[#006D77]/20 hover:bg-[#006D77]/90 transition-all">
          <Plus className="h-5 w-5" />
          Create New Template
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#006D77]/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          <Filter className="h-4 w-4" />
          Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:border-[#2EAF7D] hover:shadow-lg transition-all cursor-pointer group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-teal-50 rounded-2xl text-[#006D77] group-hover:bg-[#006D77] group-hover:text-white transition-all">
                  <FileText className="h-8 w-8" />
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  template.popularity === 'High' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {template.popularity} Usage
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">{template.title}</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">{template.category}</p>
              
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-4">
                <span className="uppercase tracking-widest">Code:</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{template.code}</span>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#2EAF7D]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Verified Template</span>
              </div>
              <button className="text-xs font-bold text-[#006D77] hover:underline uppercase tracking-widest">
                Edit 
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GovDocumentTemplates;
