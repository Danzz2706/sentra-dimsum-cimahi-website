"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function ProductModal({ product, isOpen, onClose }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");

    if (!isOpen || !product) return null;

    const handleConfirm = () => {
        addToCart({ ...product, quantity }, note);
        setQuantity(1);
        setNote("");
        onClose();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Card (Split-Screen on Desktop) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-white shadow-2xl flex flex-col md:flex-row z-10 max-h-[90vh]"
                    >
                        {/* Close Button (Floating) */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 md:right-6 md:top-6 z-20 rounded-full bg-white/80 p-2 text-slate-900 backdrop-blur-md transition-all hover:bg-slate-100 hover:scale-110 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        {/* Image Section (Left side on Desktop) */}
                        <div className="relative h-64 md:h-auto md:w-1/2 bg-slate-100 shrink-0">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                        </div>

                        {/* Content Section (Right side on Desktop) */}
                        <div className="flex flex-col p-6 sm:p-8 md:p-12 md:w-1/2 overflow-y-auto">

                            <div className="mb-8">
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 block">
                                    {product.category || "Signature Menu"}
                                </span>
                                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-4">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {product.description}
                                </p>
                            </div>

                            <div className="space-y-8 mt-auto">
                                {/* Quantity Control */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kuantitas</span>
                                    <div className="flex items-center gap-4 rounded-full bg-slate-50 p-1 border border-slate-100">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-orange-500 transition-colors font-bold text-lg active:scale-95"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center font-bold text-lg text-slate-900">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="h-10 w-10 rounded-full bg-slate-900 text-white shadow-md flex items-center justify-center hover:bg-orange-500 transition-colors font-bold text-lg active:scale-95"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Note Input */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Catatan Tambahan</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Contoh: Pedas, pisah saus, dll..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none font-medium"
                                        rows="2"
                                    />
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={handleConfirm}
                                    className="group flex w-full items-center justify-between rounded-full bg-orange-500 p-2 pl-6 font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98]"
                                >
                                    <span className="uppercase tracking-widest text-xs">Tambah Pesanan</span>
                                    <span className="rounded-full bg-white text-orange-600 px-6 py-3 text-sm font-black transition-transform group-hover:scale-105">
                                        {formatPrice(product.price * quantity)}
                                    </span>
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}