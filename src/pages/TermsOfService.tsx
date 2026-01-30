import React from 'react';
import { Navbar } from '../components/Navbar';
import { FileText, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white dark:bg-brand-dark transition-colors duration-500">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 text-[#2EAF7D] hover:text-[#3FD0C9] font-bold text-xs uppercase tracking-widest transition-colors mb-8">
                    <ArrowLeft size={16} />
                    Back to Sign Up
                </Link>

                <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-[#3FD0C9] rounded-2xl shadow-lg shadow-[#3FD0C9]/20">
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#02353C] dark:text-brand-pale tracking-tight">Terms of Service</h1>
                            <p className="text-[#02353C]/40 dark:text-white/40 font-bold text-sm uppercase tracking-widest">Last Updated: January 2026</p>
                        </div>
                    </div>

                    <div className="space-y-12 text-[#02353C]/80 dark:text-white/70 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9] text-sm font-black">1</span>
                                Acceptance of Terms
                            </h2>
                            <p>
                                By using SaloneVault, you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9] text-sm font-black">2</span>
                                Use of the Platform
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>SaloneVault provides a secure digital document storage and verification service.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>You are responsible for all documents you upload and actions performed under your account.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>Do NOT attempt to access others’ accounts or manipulate the platform.</p>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9] text-sm font-black">3</span>
                                Account Security
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#3FD0C9] mt-2 shrink-0" />
                                    <p>Keep your login credentials secure. You are responsible for maintaining the confidentiality of your password.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#3FD0C9] mt-2 shrink-0" />
                                    <p>SaloneVault may terminate or suspend accounts for misuse or violations of these terms.</p>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9] text-sm font-black">4</span>
                                Intellectual Property
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>All platform content, design, and technology belong to SaloneVault.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>Users retain full ownership of their documents and data.</p>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9] text-sm font-black">5</span>
                                Limitation of Liability
                            </h2>
                            <p>
                                SaloneVault is not responsible for user negligence, lost data due to account deletion, or misuse of documents outside the platform. We provide the service "as is" without warranties of any kind.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9] text-sm font-black">6</span>
                                Changes to Terms
                            </h2>
                            <p>
                                SaloneVault may update these Terms. Users will be notified of material changes. Continued use of the platform after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section className="pt-8 border-t border-gray-100 dark:border-white/10">
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9] text-sm font-black">7</span>
                                Contact
                            </h2>
                            <div className="flex items-center gap-4 p-6 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                                <div className="p-3 bg-[#2EAF7D]/10 rounded-xl">
                                    <Mail className="h-6 w-6 text-[#2EAF7D]" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#02353C]/40 dark:text-white/40 mb-1">Legal Inquiries</p>
                                    <a href="mailto:support.salonevault@gmail.com" className="font-bold text-[#3FD0C9] hover:text-[#2EAF7D] transition-colors">
                                        support.salonevault@gmail.com
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-gray-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#02353C]/20 dark:text-white/20">
                        &copy; {new Date().getFullYear()} SaloneVault National Digital Repository
                    </p>
                </div>
            </footer>
        </div>
    );
}
