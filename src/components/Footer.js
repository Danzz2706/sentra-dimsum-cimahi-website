"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="bg-[#080808] text-white pt-24 pb-12 rounded-t-[4rem] lg:rounded-t-[6rem] mt-24 overflow-hidden relative">
            {/* Background Decorative Text */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-[0.02] pointer-events-none select-none">
                <span className="text-[20vw] font-black uppercase italic tracking-tighter">
                    CIMAHI PRIDE • SENTRA DIMSUM •
                </span>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">

                    {/* Brand Section - Large */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 1 }}
                                className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 p-1 bg-white/5"
                            >
                                <Image
                                    src="/logo.jpeg"
                                    alt="Sentra Dimsum Logo"
                                    width={64}
                                    height={64}
                                    className="object-cover rounded-xl"
                                />
                            </motion.div>
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter leading-none">
                                    SENTRA <br />
                                    <span className="text-orange-500 italic">DIMSUM.</span>
                                </h3>
                            </div>
                        </div>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                            Menghadirkan kebahagiaan dalam setiap gigitan hangat. Cita rasa otentik yang lahir dari dapur Cimahi untuk dunia.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Buttons */}
                            <a href="https://www.instagram.com/sentra_dimsum_cimahi/" target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-orange-500 transition-all border border-white/10 group">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </a>
                            <a href="https://wa.me/6281770697325" target="_blank" className="p-3 bg-white/5 rounded-full hover:bg-green-500 transition-all border border-white/10 group">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Navigation - Right Aligned */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Location List */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Find Us</h4>
                            <div className="space-y-4">
                                <div className="group">
                                    <p className="text-white font-bold text-lg group-hover:text-orange-500 transition-colors">Cigugur Tengah (Pusat)</p>
                                    <p className="text-slate-500 text-sm mt-1">Jl. Cibaligo Cluster Pintu Air Kav No. 03</p>
                                </div>
                                <div className="group">
                                    <p className="text-white font-bold text-lg group-hover:text-orange-500 transition-colors">Cabang Melong</p>
                                    <p className="text-slate-500 text-sm mt-1">Jl. Melong 3 No.30, Cimahi Selatan</p>
                                </div>
                            </div>
                        </div>

                        {/* Useful Links / Hours */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Service Hours</h4>
                            <ul className="space-y-4">
                                <li className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-400">Senin — Minggu</span>
                                    <span className="font-bold">10:00 - 19:00</span>
                                </li>
                                <li className="flex justify-between border-b border-white/5 pb-2 text-green-500">
                                    <span className="font-bold italic uppercase text-[10px] tracking-widest">Open Every Day</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </li>
                            </ul>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                                Back to Top ↑
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        © {new Date().getFullYear()} Sentra Dimsum Cimahi. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}