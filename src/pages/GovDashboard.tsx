import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import GovSidebar from '../components/gov/GovSidebar';
import GovHome from '../components/gov/GovHome';
import GovCitizenSearch from '../components/gov/GovCitizenSearch';
import GovInstitutionVault from '../components/gov/GovInstitutionVault';
import GovSharedAssets from '../components/gov/GovSharedAssets';
import GovActivityLogs from '../components/gov/GovActivityLogs';
import GovDocumentTemplates from '../components/gov/GovDocumentTemplates';

type GovTab = 'home' | 'search' | 'vault' | 'shared' | 'logs' | 'templates';

export function GovDashboard() {
  const [activeTab, setActiveTab] = useState<GovTab>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <GovHome />;
      case 'search': return <GovCitizenSearch />;
      case 'vault': return <GovInstitutionVault />;
      case 'shared': return <GovSharedAssets />;
      case 'logs': return <GovActivityLogs />;
      case 'templates': return <GovDocumentTemplates />;
      default: return <GovHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <GovSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header section with Dynamic Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#006D77] uppercase tracking-[0.2em] mb-2">
                  <span className="w-8 h-px bg-[#006D77]" />
                  Internal Analytics Portal
                </div>
                <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
                  {activeTab === 'home' ? 'Governance Overview' : 
                   activeTab === 'search' ? 'Citizen Registry' :
                   activeTab === 'vault' ? 'Institutional Vault' :
                   activeTab === 'shared' ? 'Inter-Agency Hub' :
                   activeTab === 'logs' ? 'Security Audit Trail' : 'Document Templates'}
                </h1>
              </div>
              
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600">MOH Authority Active</span>
                <div className="w-px h-4 bg-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">
                  Lvl 4 Admin
                </span>
              </div>
            </div>

            {/* Dynamic Page Content */}
            <div className="relative">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer for Dashboard */}
      <footer className="max-w-[1600px] mx-auto px-6 py-12 text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.3em]">
          SaloneVault Security Protocol &copy; 2025 • Federated Identity Framework
        </p>
      </footer>
    </div>
  );
}

export default GovDashboard;
