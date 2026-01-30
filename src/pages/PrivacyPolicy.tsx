import React from 'react';
import { Navbar } from '../components/Navbar';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
                        <div className="p-3 bg-[#2EAF7D] rounded-2xl shadow-lg shadow-[#2EAF7D]/20">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#02353C] dark:text-brand-pale tracking-tight">Privacy Policy</h1>
                            <p className="text-[#02353C]/40 dark:text-white/40 font-bold text-sm uppercase tracking-widest">Effective Date: January 2026</p>
                        </div>
                    </div>

                    <div className="space-y-12 text-[#02353C]/80 dark:text-white/70 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#2EAF7D]/10 text-[#2EAF7D] text-sm font-black">1</span>
                                Introduction
                            </h2>
                            <p>
                                SaloneVault values your privacy and is committed to protecting your personal and document data. This policy explains what information we collect, why we collect it, and your rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#2EAF7D]/10 text-[#2EAF7D] text-sm font-black">2</span>
                                Data We Collect
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#3FD0C9] mt-2 shrink-0" />
                                    <p><strong className="text-[#02353C] dark:text-brand-pale">Personal Data:</strong> Name, email, and other contact details provided by you.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#3FD0C9] mt-2 shrink-0" />
                                    <p><strong className="text-[#02353C] dark:text-brand-pale">Document Data:</strong> Uploaded documents and related metadata (e.g., type, upload date, folder name).</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#3FD0C9] mt-2 shrink-0" />
                                    <p><strong className="text-[#02353C] dark:text-brand-pale">System Data:</strong> Account activity logs, login records, and permission changes.</p>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#2EAF7D]/10 text-[#2EAF7D] text-sm font-black">3</span>
                                How We Use Your Data
                            </h2>
                            <ul className="space-y-6">
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>To provide secure document storage and verification services.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>To maintain and improve platform security.</p>
                                </li>
                                <li className="p-6 bg-[#3FD0C9]/5 dark:bg-[#3FD0C9]/10 rounded-2xl border border-[#3FD0C9]/20">
                                    <p className="font-bold text-[#02353C] dark:text-brand-pale mb-2 font-heading uppercase text-xs tracking-widest">Activity Audit Logs</p>
                                    <p className="text-sm">
                                        SaloneVault maintains activity logs of user actions (such as login, document uploads, and verification requests) for security, auditing, and fraud-prevention purposes. These logs are visible only to the account owner and authorized system administrators.
                                    </p>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#2EAF7D]/10 text-[#2EAF7D] text-sm font-black">4</span>
                                Data Ownership & Control
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#3FD0C9] mt-2 shrink-0" />
                                    <p>Users retain full ownership of their documents and personal data.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#3FD0C9] mt-2 shrink-0" />
                                    <p>Users can view, update, or request deletion of their data at any time.</p>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#2EAF7D]/10 text-[#2EAF7D] text-sm font-black">5</span>
                                Data Protection
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>All data is transmitted over encrypted HTTPS connections.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>Sensitive information, including passwords, is securely hashed.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-[#2EAF7D] mt-2 shrink-0" />
                                    <p>Documents are stored in protected cloud storage with restricted access.</p>
                                </li>
                            </ul>
                        </section>

                        <section className="pt-8 border-t border-gray-100 dark:border-white/10">
                            <h2 className="text-xl font-black text-[#02353C] dark:text-brand-pale mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#2EAF7D]/10 text-[#2EAF7D] text-sm font-black">6</span>
                                Contact
                            </h2>
                            <div className="flex items-center gap-4 p-6 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                                <div className="p-3 bg-[#3FD0C9]/10 rounded-xl">
                                    <Mail className="h-6 w-6 text-[#3FD0C9]" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[#02353C]/40 dark:text-white/40 mb-1">Email Support</p>
                                    <a href="mailto:support.salonevault@gmail.com" className="font-bold text-[#2EAF7D] hover:text-[#3FD0C9] transition-colors">
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
