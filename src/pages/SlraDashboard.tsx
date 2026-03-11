import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import SlraSidebar from '../components/slra/SlraSidebar';
import SlraHome from '../components/slra/SlraHome';
import SlraIssueLicense from '../components/slra/SlraIssueLicense';
import SlraCitizenSearch from '../components/slra/SlraCitizenSearch';
import SlraIssuedLicenses from '../components/slra/SlraIssuedLicenses';
import SlraActivityLogs from '../components/slra/SlraActivityLogs';

type SlraTab = 'home' | 'issue' | 'search' | 'issued' | 'logs';

export function SlraDashboard() {
    const [activeTab, setActiveTab] = useState<SlraTab>('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <SlraHome setActiveTab={setActiveTab} />;
            case 'issue': return <SlraIssueLicense />;
            case 'search': return <SlraCitizenSearch setActiveTab={setActiveTab} />;
            case 'issued': return <SlraIssuedLicenses />;
            case 'logs': return <SlraActivityLogs />;
            default: return <SlraHome setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            <Navbar />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <SlraSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Header section with Dynamic Title */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#006D77] uppercase tracking-[0.2em] mb-2">
                                    <span className="w-8 h-px bg-[#006D77]" />
                                    Institutional Portal
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
                                    {activeTab === 'home' ? 'SLRA Dashboard Overview' :
                                        activeTab === 'issue' ? 'Digital License Issuance' :
                                            activeTab === 'search' ? 'Citizen Registry Search' :
                                                activeTab === 'issued' ? 'Issued SLRA Licenses' : 'Institutional Audit Trail'}
                                </h1>
                                <p className="text-slate-500 text-sm mt-1 font-medium">
                                    SLRA – Digital License Issuance Dashboard
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveTab('issue')}
                                    className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#006D77] text-white font-bold rounded-xl shadow-lg shadow-[#006D77]/20 hover:bg-[#005a62] transition-all"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span>Upload Document</span>
                                </button>
                                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#006D77] animate-pulse" />
                                    <span className="text-xs font-bold text-slate-600">SLRA Authority Active</span>
                                    <div className="w-px h-4 bg-slate-200" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">
                                        Officer Session
                                    </span>
                                </div>
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
                    SaloneVault Institutional Protocol &copy; 2026 • Federated Identity Framework
                </p>
            </footer>
        </div>
    );
}

export default SlraDashboard;
