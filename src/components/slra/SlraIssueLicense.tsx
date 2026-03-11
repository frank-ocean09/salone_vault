import { useState } from 'react';
import { Search, MapPin, Phone, Mail, Shield, ExternalLink, Calendar, FileText, Upload } from 'lucide-react';

interface LicenseForm {
    citizenName: string;
    nin: string;
    licenseNumber: string;
    licenseClass: string;
    expiryDate: string;
}

export function SlraIssueLicense() {
    const [formData, setFormData] = useState<LicenseForm>({
        citizenName: '',
        nin: '',
        licenseNumber: '',
        licenseClass: 'Class A',
        expiryDate: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [isIssuing, setIsIssuing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsIssuing(true);
        // Simulation of issuance logic
        setTimeout(() => {
            setIsIssuing(false);
            setSuccess(true);
            // Reset after 3 seconds
            setTimeout(() => setSuccess(false), 5000);
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-[#006D77] p-8 text-white relative">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2">Issue Digital Driver's License</h2>
                        <p className="text-teal-50/80 text-sm font-medium">SLRA Official Issuance Portal</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                </div>

                <form onSubmit={handleIssue} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Citizen Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#006D77] transition-colors">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter as per ID"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#006D77] focus:bg-white transition-all font-medium text-slate-900"
                                    value={formData.citizenName}
                                    onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">National ID Number (NIN)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#006D77] transition-colors">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="12345678"
                                    pattern="[0-9]{8,}"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#006D77] focus:bg-white transition-all font-medium text-slate-900"
                                    value={formData.nin}
                                    onChange={(e) => setFormData({ ...formData, nin: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">License Number</label>
                            <input
                                type="text"
                                required
                                placeholder="SLRA-DL-XXXXXX"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:border-[#006D77] focus:bg-white transition-all font-medium text-slate-900"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">License Class</label>
                            <select
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:border-[#006D77] focus:bg-white transition-all font-medium text-slate-900"
                                value={formData.licenseClass}
                                onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                            >
                                <option>Class A</option>
                                <option>Class B</option>
                                <option>Class C</option>
                                <option>Class M</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Expiry Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:border-[#006D77] focus:bg-white transition-all font-medium text-slate-900"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">License Document (PDF/Image)</label>
                            <div className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${file ? 'border-[#006D77] bg-[#e6f0f1]' : 'border-slate-200 hover:border-[#006D77]'}`}>
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <Upload className={`h-6 w-6 mb-2 ${file ? 'text-[#006D77]' : 'text-slate-400'}`} />
                                <span className="text-xs font-bold text-slate-600">
                                    {file ? file.name : 'Drag & drop or click to upload'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            onClick={() => {
                                setFormData({ citizenName: '', nin: '', licenseNumber: '', licenseClass: 'Class A', expiryDate: '' });
                                setFile(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isIssuing}
                            className={`flex-1 md:flex-none md:min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-[#006D77] text-white font-black rounded-2xl shadow-lg shadow-[#006D77]/20 hover:bg-[#005a62] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isIssuing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5" />
                                    <span>Upload Document</span>
                                </>
                            )}
                        </button>
                    </div>

                    {success && (
                        <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3 text-teal-800 animate-in fade-in zoom-in slide-in-from-top-2">
                            <div className="p-1 bg-teal-500 rounded-full text-white">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Document Uploaded Successfully!</p>
                                <p className="text-xs opacity-90">Linked to NIN: {formData.nin}.</p>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default SlraIssueLicense;
