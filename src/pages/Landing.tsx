import { Link } from 'react-router-dom';
import { Lock, Search, Upload, Users, Globe, Award, Zap, FileText, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';

export function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Navbar />

            {/* Hero Section - Enhanced with Gradients */}
            <section className="text-white py-24 lg:py-32 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #08287F 0%, #0a3299 50%, #08287F 100%)'
            }}>
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#00A859' }} />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#C84600', animationDelay: '1s' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                National Digital<br />
                                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                                    Document Vault
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
                                Secure and efficient storage of documents for Sierra Leone
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/auth">
                                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-105" style={{ backgroundColor: '#00A859', color: '#FFFFFF' }}>
                                        Get Started →
                                    </Button>
                                </Link>
                                <Link to="/verify">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all">
                                        Verify Document
                                    </Button>
                                </Link>
                            </div>
                            {/* Trust Badges */}
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-green-400" />
                                    <span className="text-sm opacity-80">Bank-Grade Security</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-400" />
                                    <span className="text-sm opacity-80">99.9% Uptime</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 blur-3xl opacity-40 rounded-full animate-pulse" style={{ backgroundColor: '#00A859' }} />
                                <div className="relative bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg p-16 rounded-3xl border-2 border-white/30 shadow-2xl transform hover:rotate-3 transition-transform duration-500">
                                    <img src="/nddv-logo.png" alt="NDDV Logo" className="h-48 w-48 relative z-10 drop-shadow-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section - Enhanced with Gradients */}
            <section className="py-16 mt-8 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #00A859 0%, #00c96d 100%)'
            }}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-4 gap-8 text-center text-white">
                        {[
                            { icon: Users, number: '10,000+', label: 'Active Users' },
                            { icon: FileText, number: '50,000+', label: 'Documents Secured' },
                            { icon: Lock, number: '99.9%', label: 'Uptime' },
                            { icon: Globe, number: '24/7', label: 'Support' },
                        ].map((stat, i) => (
                            <div key={i} className="transform hover:scale-110 transition-all duration-300 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl">
                                <stat.icon className="h-12 w-12 mx-auto mb-4 drop-shadow-lg" />
                                <div className="text-5xl font-bold mb-2 drop-shadow-lg">{stat.number}</div>
                                <div className="text-lg opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works - Enhanced Cards */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#00A859', color: 'white' }}>
                            Simple Process
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Three simple steps to secure your identity and assets
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Upload Document',
                                desc: 'Upload digital copies of your birth certificate, land title, or degree',
                                icon: Upload,
                                gradient: 'from-blue-500 to-blue-600'
                            },
                            {
                                step: '2',
                                title: 'Verify Identity',
                                desc: 'We verify your identity and document authenticity using blockchain',
                                icon: Lock,
                                gradient: 'from-green-500 to-emerald-600'
                            },
                            {
                                step: '3',
                                title: 'Secure Storage',
                                desc: 'Your documents are encrypted and stored safely, accessible only by you',
                                icon: Lock,
                                gradient: 'from-orange-500 to-red-600'
                            },
                        ].map((item) => (
                            <div key={item.step} className="group relative bg-white p-8 rounded-3xl border-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2" style={{ borderColor: '#00A859' }}>
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg bg-gradient-to-br ${item.gradient}`}>
                                        {item.step}
                                    </div>
                                    <item.icon className="h-12 w-12 mb-4 transition-transform group-hover:scale-110" style={{ color: '#08287F' }} />
                                    <h3 className="text-2xl font-bold mb-3" style={{ color: '#08287F' }}>{item.title}</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section - Enhanced */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: '#00A859', color: 'white' }}>
                                Benefits
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                                Why Use the Digital Vault?
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { text: 'Tamper-proof blockchain verification', icon: Lock },
                                    { text: 'Instant access from anywhere', icon: Zap },
                                    { text: 'Secure sharing with institutions', icon: Users },
                                    { text: 'Protection against physical loss', icon: Lock },
                                    { text: 'Official government recognition', icon: Award },
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-x-2 border border-gray-100">
                                        <div className="p-3 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #00A859 0%, #00c96d 100%)' }}>
                                            <benefit.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-lg font-semibold" style={{ color: '#08287F' }}>{benefit.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl blur-2xl opacity-30" />
                            <div className="relative bg-white p-10 rounded-3xl shadow-2xl border-2" style={{ borderColor: '#00A859' }}>
                                <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-900 to-green-700 bg-clip-text text-transparent">
                                    Security Features
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { icon: Lock, title: 'Bank-Grade Security', desc: 'AES-256 encryption ensures your data remains private and secure', color: '#08287F' },
                                        { icon: Award, title: 'Government Verified', desc: 'Direct integration with national registries for authenticity', color: '#00A859' },
                                        { icon: Search, title: 'Instant Verification', desc: 'Institutions can verify documents in seconds, not days', color: '#C84600' }
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all">
                                            <div className="p-4 rounded-xl shadow-lg" style={{ backgroundColor: feature.color }}>
                                                <feature.icon className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xl mb-2" style={{ color: '#08287F' }}>{feature.title}</h4>
                                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Enhanced */}
            <section className="py-20 text-white relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #00A859 0%, #00c96d 50%, #00A859 100%)'
            }}>
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
                        Ready to Secure Your Documents?
                    </h2>
                    <p className="text-xl mb-10 opacity-90 leading-relaxed">
                        Join thousands of Sierra Leoneans protecting their most important documents
                    </p>
                    <Link to="/auth">
                        <Button size="lg" className="text-lg px-12 py-4 shadow-2xl hover:shadow-white/50 transition-all transform hover:scale-105" style={{ backgroundColor: '#FFFFFF', color: '#00A859' }}>
                            Create Your Vault Now →
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer - Enhanced */}
            <footer className="text-white py-16 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #08287F 0%, #0a3299 100%)'
            }}>
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/nddv-logo.png" alt="NDDV Logo" className="h-14 w-14" />
                                <span className="font-bold text-2xl">NDDV</span>
                            </div>
                            <p className="text-lg opacity-80 max-w-sm leading-relaxed mb-6">
                                The official National Digital Document Vault of Sierra Leone.
                                Securing your future through digital identity.
                            </p>
                            <div className="flex gap-4">
                                {['🇸🇱', '🔒', '✓'].map((emoji, i) => (
                                    <div key={i} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl hover:bg-white/20 transition-all cursor-pointer">
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-6">Platform</h4>
                            <ul className="space-y-3 opacity-80">
                                <li><Link to="/" className="hover:opacity-100 hover:translate-x-1 inline-block transition-all">→ Home</Link></li>
                                <li><Link to="/dashboard" className="hover:opacity-100 hover:translate-x-1 inline-block transition-all">→ My Vault</Link></li>
                                <li><Link to="/verify" className="hover:opacity-100 hover:translate-x-1 inline-block transition-all">→ Verify Document</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-6">Support</h4>
                            <ul className="space-y-3 opacity-80">
                                <li><a href="#" className="hover:opacity-100 hover:translate-x-1 inline-block transition-all">→ Help Center</a></li>
                                <li><a href="#" className="hover:opacity-100 hover:translate-x-1 inline-block transition-all">→ Contact Us</a></li>
                                <li><a href="#" className="hover:opacity-100 hover:translate-x-1 inline-block transition-all">→ Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t pt-8 text-center opacity-70" style={{ borderColor: '#00A859' }}>
                        © 2024 National Digital Document Vault. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
