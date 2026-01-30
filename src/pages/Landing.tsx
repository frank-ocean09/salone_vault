import { Link } from 'react-router-dom';
import { Lock, Search, Upload, Users, Globe, Award, Zap, FileText, Star, ArrowRight, ShieldCheck, FileCheck, Wallet, Share2, Database, CheckCircle, Mail, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';

export function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-hidden font-sans selection:bg-[#3FD0C9] selection:text-[#02353C]">
            <Navbar />

            {/* Hero Section */}
            <section className="relative text-white pt-32 pb-48 overflow-hidden">
                {/* Main Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#02353C] via-[#02353C] to-[#3FD0C9] z-0" />

                {/* Abstract Geometric Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3FD0C9] rounded-full blur-[120px] opacity-10 translate-x-1/4 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2EAF7D] rounded-full blur-[100px] opacity-10 -translate-x-1/2 translate-y-1/2" />

                {/* Technical Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="w-2 h-2 rounded-full bg-[#2EAF7D] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C1F6ED]">National Digital Vault</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            Secure. Verify.<br />
                            <span className="text-[#3FD0C9]">Protect your records.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-[#C1F6ED]/80 mb-12 leading-relaxed max-w-2xl font-bold animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            A trusted digital infrastructure for official and personal documents in Sierra Leone.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <Link to="/auth?mode=signup">
                                <Button
                                    variant="primary"
                                    className="bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white px-10 py-5 h-auto text-sm font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-[#2EAF7D]/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none"
                                >
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/verify">
                                <Button
                                    variant="outline"
                                    className="border-2 border-[#3FD0C9] text-[#3FD0C9] hover:bg-[#3FD0C9]/10 px-10 py-5 h-auto text-sm font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#3FD0C9]/10"
                                >
                                    Verify a Document
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Preview Layered UI (Right Side) */}
                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-[600px] h-[500px] pointer-events-none perspective-1000">
                        <div className="relative w-full h-full">
                            <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-[#02353C]/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rotate-y-[-15deg] rotate-x-[10deg] z-20 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-white/10" />
                                        <div className="w-3 h-3 rounded-full bg-white/10" />
                                        <div className="w-3 h-3 rounded-full bg-white/10" />
                                    </div>
                                    <div className="h-2 w-32 bg-white/5 rounded-full" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-8 w-1/2 bg-[#3FD0C9]/20 rounded-xl" />
                                    <div className="h-4 w-3/4 bg-white/5 rounded-lg" />
                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <div className="aspect-square bg-[#2EAF7D]/10 rounded-3xl border border-[#2EAF7D]/20 flex items-center justify-center">
                                            <ShieldCheck className="text-[#2EAF7D] w-12 h-12" />
                                        </div>
                                        <div className="aspect-square bg-[#3FD0C9]/10 rounded-3xl border border-[#3FD0C9]/20 flex items-center justify-center">
                                            <FileCheck className="text-[#3FD0C9] w-12 h-12" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-20 w-[400px] h-[250px] bg-[#02353C]/40 backdrop-blur-md border border-white/5 rounded-[3rem] rotate-y-[-15deg] rotate-x-[10deg] z-10 translate-y-12 shadow-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust & Security Section */}
            <section className="py-24 bg-[#C1F6ED] relative overflow-hidden">
                {/* Subtle pattern for tech feel */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="dot-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="#02353C" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-[#449342]/10 border border-[#449342]/20 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#449342]">Security Infrastructure</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#02353C] tracking-tighter mb-6">
                            Verified. Secure. Official.
                        </h2>
                        <p className="text-[#02353C]/60 max-w-2xl mx-auto font-bold text-lg">
                            Utilizing high-grade encryption and immutable blockchain technology to establish a national standard for document integrity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Lock, title: "Encrypted Storage", desc: "Local-first encryption ensuring your sensitive documents stay private at all times." },
                            { icon: ShieldCheck, title: "Blockchain Storage", desc: "Tamper-proof verification records anchored to global blockchain networks." },
                            { icon: Users, title: "Access Control", desc: "Granular permission systems to control who can view and verify your records." },
                            { icon: FileCheck, title: "Official Validation", desc: "Built to match national standards for digital identity and document security." }
                        ].map((item, i) => (
                            <div key={i} className="group bg-white p-10 rounded-[3rem] shadow-sm border border-white hover:shadow-2xl hover:shadow-[#02353C]/10 transition-all duration-500 hover:-translate-y-2">
                                <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-[#C1F6ED]/50 mb-8 group-hover:bg-[#02353C] group-hover:text-white transition-all duration-300">
                                    <item.icon className="w-8 h-8 text-[#449342] group-hover:text-[#3FD0C9]" />
                                </div>
                                <h3 className="text-xl font-black text-[#02353C] mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-[#02353C]/40 font-bold leading-relaxed text-sm group-hover:text-[#02353C]/60">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-[#2EAF7D]/10 border border-[#2EAF7D]/20 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2EAF7D]">Core Capabilities</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#02353C] tracking-tighter mb-6">Built for Reliability.</h2>
                        <p className="text-[#02353C]/60 max-w-2xl mx-auto font-bold text-lg">
                            Comprehensive digital infrastructure to manage, verify, and protect your most important assets.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Wallet, title: "State Wallet", desc: "A secure, encrypted vault for all your official national identification records." },
                            { icon: CheckCircle, title: "Instant Verification", desc: "Third-party entities can verify document authenticity in seconds via secure protocols." },
                            { icon: Share2, title: "Granular Sharing", desc: "Issue temporary, secure access tokens for specific documents without revealing the contents." },
                            { icon: Database, title: "Blockchain Ledger", desc: "Immutable records of verification events ensuring a permanent, auditable history." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#3FD0C9]/30 hover:shadow-xl hover:shadow-[#3FD0C9]/10 transition-all duration-500 hover:-translate-y-2 group">
                                <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-[#C1F6ED]/50 mb-8 group-hover:bg-[#3FD0C9] group-hover:text-white transition-all duration-300">
                                    <item.icon className="w-8 h-8 text-[#2EAF7D] group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-black text-[#02353C] mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-[#02353C]/40 font-bold leading-relaxed text-sm group-hover:text-[#02353C]/60">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-[#02353C] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#3FD0C9]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2EAF7D]/20 to-transparent" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20 text-white">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 font-black uppercase tracking-[0.3em] text-[10px] text-[#3FD0C9]">Process Overview</div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Simple. Secure. Systematic.</h2>
                        <p className="text-[#C1F6ED]/60 max-w-2xl mx-auto font-bold text-lg">
                            Our streamlined workflow ensures your records are protected on the blockchain in minutes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16 relative">
                        <div className="hidden md:block absolute top-16 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#3FD0C9]/20 to-transparent -translate-y-4" />

                        {[
                            { step: '01', icon: Upload, title: 'Upload & Encrypt', desc: 'Securely upload records to your vault. Files are encrypted locally before being stored.' },
                            { step: '02', icon: ShieldCheck, title: 'Network Validation', desc: 'Documents are hashed and recorded on the blockchain for permanent authenticity.' },
                            { step: '03', icon: Share2, title: 'Controlled Access', desc: 'Share your verified documents with trusted institutions with full permission control.' }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center relative group">
                                <div className="w-24 h-24 bg-[#02353C] border-2 border-[#2EAF7D] rounded-[2.5rem] flex items-center justify-center text-white mb-8 group-hover:bg-[#2EAF7D] transition-all duration-500 relative z-10">
                                    <step.icon className="w-10 h-10 text-[#2EAF7D] group-hover:text-white" />
                                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#3FD0C9] rounded-2xl flex items-center justify-center text-[#02353C] text-xs font-black shadow-lg shadow-[#3FD0C9]/20">
                                        {step.step}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-[#C1F6ED]/40 font-bold leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* National Identity Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-[#449342]/10 border border-[#449342]/20 mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#449342]">National Initiative</span>
                            </div>
                            <h2 className="text-5xl font-black text-[#02353C] tracking-tighter leading-tight mb-8">
                                A Trusted Digital Future for <br />
                                <span className="text-[#449342]">Sierra Leone.</span>
                            </h2>
                            <p className="text-xl text-[#02353C]/60 font-bold leading-relaxed mb-10">
                                Building the digital bridge for citizens and institutions. SaloneVault is the cornerstone of national document verification and secure digital identity.
                            </p>
                            <div className="flex items-center gap-8">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full bg-[#C1F6ED]" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm font-black text-[#02353C] uppercase tracking-widest">
                                    Over <span className="text-[#2EAF7D]">10,000+</span> citizens secured
                                </p>
                            </div>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            <div className="relative aspect-video rounded-[3rem] bg-[#02353C] overflow-hidden shadow-2xl group border border-[#3FD0C9]/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#02353C] to-[#2EAF7D]/30 opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                                        <div className="w-12 h-12 bg-[#2EAF7D] rounded-full flex items-center justify-center shadow-xl shadow-[#2EAF7D]/40">
                                            <ShieldCheck className="text-white w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-10 left-10 p-6 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl">
                                            <ShieldCheck className="h-6 w-6 text-[#2EAF7D]" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-xs uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-[#3FD0C9] font-black">Secure Infrastructure</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-[#02353C] rounded-[4rem] px-8 py-20 text-center overflow-hidden shadow-2xl border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#02353C] via-[#0D4448] to-[#2EAF7D]/20 z-0" />
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#3FD0C9] rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 leading-tight">
                                Ready to Secure Your Digital <br /> Official Records?
                            </h2>
                            <p className="text-[#C1F6ED]/60 text-lg font-bold mb-12">
                                Join the thousands of citizens securing their document future on the official SaloneVault platform.
                            </p>
                            <Link to="/auth?mode=signup">
                                <Button
                                    variant="primary"
                                    className="bg-[#2EAF7D] hover:bg-[#2EAF7D]/90 text-white px-12 py-6 h-auto text-sm font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-[#2EAF7D]/30 transition-all hover:scale-105 border-none"
                                >
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#02353C] text-white pt-24 pb-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <Link to="/" className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-[#2EAF7D] rounded-xl">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                                <span className="font-black text-2xl tracking-tighter">SALONEVAULT</span>
                            </Link>
                            <p className="text-white/40 font-bold leading-relaxed mb-8">
                                The official national digital document repository and verification platform for Sierra Leone.
                            </p>
                            <div className="flex gap-4">
                                {[Globe, Mail, MapPin].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[#3FD0C9] hover:text-[#02353C] transition-all">
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#3FD0C9] mb-8">Platform</h4>
                            <ul className="space-y-4 font-bold text-white/40">
                                {['Features', 'Security', 'Verification', 'How It Works'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#3FD0C9] mb-8">Legal</h4>
                            <ul className="space-y-4 font-bold text-white/40">
                                {['Privacy Policy', 'Terms of Service', 'Data Governance', 'Compliance'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#3FD0C9] mb-8">Resources</h4>
                            <ul className="space-y-4 font-bold text-white/40">
                                {['Documentation', 'Help Center', 'API Reference', 'Status'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-white/20 font-bold text-sm">
                            © {new Date().getFullYear()} SaloneVault. National Digital Document Repository.
                        </p>
                        <div className="flex items-center gap-8">
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                <span className="w-2 h-2 rounded-full bg-[#2EAF7D]" />
                                Systems Operational
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
