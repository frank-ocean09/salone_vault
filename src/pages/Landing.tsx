import { Link } from 'react-router-dom';
import { Lock, Search, Upload, Users, Globe, Award, Zap, FileText, Star, ArrowRight, ShieldCheck, FileCheck, Wallet, Share2, Database, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';

export function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-hidden font-sans">
            <Navbar />

            {/* Hero Section - Redesigned */}
            <section className="relative text-white pt-32 pb-48 overflow-hidden">
                {/* Main Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#02353C] via-[#0D4448] to-[#3FD0C9] z-0" />

                {/* Abstract Geometric Elements */}
                {/* Large Circle Right */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#2EAF7D] rounded-full blur-3xl opacity-10 translate-x-1/3 -translate-y-1/4 animate-pulse" />
                {/* Small Glow Bottom Left */}
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3FD0C9] rounded-full blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2" />

                {/* Fine lines/grid (optional detail) */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
                            Secure. Verify.<br />
                            Protect your <span className="text-[#3FD0C9]">documents digitally.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-[#C1F6ED] mb-10 leading-relaxed max-w-2xl font-light">
                            A trusted digital vault for official and personal records in Sierra Leone.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <Link to="/auth?mode=signup">
                                <Button
                                    variant="primary"
                                    className="bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white px-8 py-4 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    Create Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/verify">
                                <Button
                                    variant="outline"
                                    className="border-[#3FD0C9] text-[#3FD0C9] hover:bg-[#3FD0C9]/10 px-8 py-4 h-auto text-lg rounded-full"
                                >
                                    Verify a Document
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Floating Abstract "Platform" Visual (Right Side) */}
                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/6 w-[700px] h-[700px] pointer-events-none">
                        {/* Semi-abstract dashboard composition */}
                        <div className="relative w-full h-full perspective-1000">
                            {/* Central Card */}
                            <div className="absolute top-1/2 left-1/2 w-[400px] h-[300px] bg-[#02353C]/80 backdrop-blur-xl border border-[#3FD0C9]/30 rounded-2xl transform -translate-x-1/2 -translate-y-1/2 rotate-y-[-10deg] rotate-x-[5deg] shadow-2xl z-20 overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-8 bg-[#0D4448] border-b border-[#3FD0C9]/20 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="p-6 pt-12 space-y-4">
                                    <div className="h-4 w-3/4 bg-[#3FD0C9]/20 rounded animate-pulse"></div>
                                    <div className="h-4 w-1/2 bg-[#3FD0C9]/10 rounded"></div>
                                    <div className="flex gap-3 mt-8">
                                        <div className="h-24 w-20 bg-[#2EAF7D]/10 rounded border border-[#2EAF7D]/20 flex items-center justify-center">
                                            <ShieldCheck className="text-[#2EAF7D] w-8 h-8 opacity-80" />
                                        </div>
                                        <div className="h-24 w-20 bg-[#3FD0C9]/10 rounded border border-[#3FD0C9]/20 flex items-center justify-center">
                                            <FileCheck className="text-[#3FD0C9] w-8 h-8 opacity-80" />
                                        </div>
                                    </div>
                                </div>
                                {/* Scanning effect */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#3FD0C9]/10 to-transparent -translate-y-full animate-[scan_3s_ease-in-out_infinite]" />
                            </div>

                            {/* Back Card */}
                            <div className="absolute top-1/2 left-1/2 w-[350px] h-[250px] bg-[#0D4448]/80 backdrop-blur-md border border-[#2EAF7D]/20 rounded-2xl transform -translate-x-[40%] -translate-y-[60%] rotate-y-[-10deg] rotate-x-[5deg] z-10 scale-90 opacity-60"></div>

                            {/* Decorative Elements */}
                            <div className="absolute top-[20%] right-[20%] w-16 h-16 border-2 border-[#2EAF7D]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            <div className="absolute bottom-[30%] left-[20%] w-4 h-4 bg-[#3FD0C9] rounded-full animate-bounce shadow-[0_0_20px_#3FD0C9]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted/Stats Section */}
            <section className="bg-[#02353C] border-t border-white/10 py-12 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Documents Secured', value: '50K+' },
                            { label: 'Active Users', value: '10K+' },
                            { label: 'Uptime', value: '99.9%' },
                            { label: 'Trust Score', value: 'A+' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl font-bold text-[#3FD0C9] mb-1">{stat.value}</div>
                                <div className="text-sm uppercase tracking-wider opacity-70 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Security Section */}
            <section className="py-24 bg-[#C1F6ED]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[#449342] font-bold tracking-wider uppercase text-sm">Trust & Security</span>
                        <h2 className="text-4xl font-bold text-[#02353C] mt-2 mb-4">Bank-Grade Security & Control</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We use advanced encryption and blockchain technology to ensure your documents are tamper-proof and permanently accessible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Lock, title: "Encrypted Storage", desc: "Your documents are encrypted using AES-256 protocols." },
                            { icon: ShieldCheck, title: "Blockchain Verification", desc: "Tamper-proof verification on the Ethereum Sepolia network." },
                            { icon: Users, title: "User Control", desc: "Complete control over who views or accesses your documents." },
                            { icon: FileCheck, title: "Data Protection", desc: "Redundant backups and strict data separation policies." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-transparent mb-6">
                                    <item.icon className="w-8 h-8 text-[#449342]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#02353C] mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[#2EAF7D] font-bold tracking-wider uppercase text-sm">Key Features</span>
                        <h2 className="text-4xl font-bold text-[#02353C] mt-2 mb-4">Everything You Need</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Comprehensive tools to manage, verify, and share your important documents securely.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Wallet, title: "Secure Wallet", desc: "Store your official documents in a personal, encrypted digital wallet." },
                            { icon: CheckCircle, title: "Document Verification", desc: "Instantly verify the authenticity of any document issued on the platform." },
                            { icon: Share2, title: "Permission Sharing", desc: "Share documents temporarily with institutions or individuals securely." },
                            { icon: Database, title: "Blockchain Proof", desc: "Every document is hashed and anchored to the blockchain for immutable proof." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-[#3FD0C9] hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-transparent mb-6">
                                    <item.icon className="w-8 h-8 text-[#2EAF7D]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#02353C] mb-3">{item.title}</h3>
                                <p className="text-[#02353C] leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-[#C1F6ED]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[#2EAF7D] font-bold tracking-wider uppercase text-sm">How It Works</span>
                        <h2 className="text-4xl font-bold text-[#02353C] mt-2 mb-4">Simple, Secure Process</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Getting your documents secured on the blockchain in three easy steps.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-[#3FD0C9] -z-0 transform translate-y-4"></div>

                        <div className="grid md:grid-cols-3 gap-12 relative z-10">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-[#2EAF7D] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6 border-4 border-white">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-[#02353C] mb-3">1. Upload Document</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Securely upload your official records to your private vault. Files are encrypted locally before transmission.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-[#2EAF7D] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6 border-4 border-white">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-[#02353C] mb-3">2. Request Verification</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Our system checks with issuing authorities to manually or automatically verify authenticity.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-[#2EAF7D] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6 border-4 border-white">
                                    <Share2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-[#02353C] mb-3">3. Store & Share</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Once verified, the hash is stored on-chain. Store indefinitely or share with secure one-time links.
                                </p>
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <Link to="/auth?mode=signup">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white px-8 py-4 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                >
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* National Value Section */}
            <section id="national-value" className="py-24 bg-white relative overflow-hidden">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.4] pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C1F6ED" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#02353C] leading-tight mb-6">
                        Building a trusted <span className="text-[#2EAF7D]">national digital document system</span> for Sierra Leone.
                    </h2>

                    <div className="w-24 h-1.5 bg-[#2EAF7D] mx-auto rounded-full mb-8"></div>

                    <p className="text-lg md:text-xl text-[#02353C]/80 leading-relaxed font-medium">
                        Designed to support citizens, institutions, and future digital services with bank-grade security and transparency.
                    </p>
                </div>
            </section>

            {/* Color Palette Strip (Visual Reference only, per user request to "use this color scheme") */}
            <div className="grid grid-cols-5 h-2">
                <div className="bg-[#C1F6ED]" title="#C1F6ED" />
                <div className="bg-[#02353C]" title="#02353C" />
                <div className="bg-[#449342]" title="#449342" />
                <div className="bg-[#2EAF7D]" title="#2EAF7D" />
                <div className="bg-[#3FD0C9]" title="#3FD0C9" />
            </div>

            {/* Footer */}
            <footer className="bg-[#02353C] text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <img src="/nddv-logo.png" alt="Logo" className="h-8 w-8 grayscale brightness-200" />
                            <span className="font-bold text-xl">Salone Vault</span>
                        </div>
                        <div className="text-sm opacity-60">
                            &copy; 2024 Salone Vault. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
