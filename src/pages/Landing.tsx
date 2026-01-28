import { Link } from 'react-router-dom';
import { Lock, Search, Upload, Users, Globe, Award, Zap, FileText, Star, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';

export function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-hidden font-sans">
            <Navbar />

            {/* Hero Section - "Brightscout" Style */}
            <section className="relative text-white pt-32 pb-48 overflow-hidden">
                {/* Main Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#02353C] via-[#0D4448] to-[#2EAF7D] z-0" />

                {/* Abstract Geometric Elements */}
                {/* Large Circle Right */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#449342] rounded-full blur-3xl opacity-20 translate-x-1/3 -translate-y-1/4 animate-pulse" />
                {/* Small Glow Bottom Left */}
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3FD0C9] rounded-full blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2" />

                {/* Fine lines/grid (optional detail) */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight mb-8">
                            Design & Technology<br />
                            that <span className="text-[#3FD0C9]">Transforms</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
                            Building highly-polished digital products that transform business and accelerate the speed of innovation.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <Link to="/auth">
                                <button className="group relative px-8 py-4 bg-gradient-to-r from-[#2EAF7D] to-[#3FD0C9] rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2">
                                    LET'S GET STARTED
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Floating Abstract "Platform" Visual (Right Side) */}
                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] pointer-events-none">
                        {/* Example of abstract 3D-ish composition using CSS shapes */}
                        <div className="relative w-full h-full perspective-1000">
                            <div className="absolute top-1/2 left-1/2 w-96 h-96 border-[20px] border-[#3FD0C9]/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 rotate-x-60 animate-[spin_20s_linear_infinite]" />
                            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] border-[2px] border-[#fff]/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 rotate-x-60" />
                            {/* Floating bars */}
                            <div className="absolute top-[20%] right-[30%] w-4 h-32 bg-[#2EAF7D] opacity-80 backdrop-blur-md rounded-full animate-bounce delay-700" />
                            <div className="absolute bottom-[30%] right-[40%] w-4 h-48 bg-[#3FD0C9] opacity-60 backdrop-blur-md rounded-full animate-bounce delay-100" />
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

            {/* Benefits Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[#2EAF7D] font-bold tracking-wider uppercase text-sm">Features</span>
                        <h2 className="text-4xl font-bold text-[#02353C] mt-2 mb-4">Secure by Design</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We use advanced encryption and blockchain technology to ensure your documents are tamper-proof and permanently accessible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Lock, title: "Bank-Grade Encryption", desc: "AES-256 encryption protects your data at rest and in transit." },
                            { icon: Globe, title: "Global Access", desc: "Access your documents securely from anywhere in the world." },
                            { icon: Award, title: "Official Verification", desc: "Documents are verified against national registries instantly." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-[#C1F6ED] rounded-xl flex items-center justify-center text-[#02353C] mb-6">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-[#02353C] mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
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
