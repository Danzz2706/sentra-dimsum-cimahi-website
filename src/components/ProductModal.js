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

    const totalPrice = product.price * quantity;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/40"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        {/* Image Header */}
                        <div className="relative h-56 w-full bg-gray-100">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-6 right-6">
                                <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                                <p className="text-white/90 line-clamp-1">{product.description}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Quantity Control */}
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">Jumlah Pesanan</span>
                                <div className="flex items-center gap-4 rounded-full bg-gray-50 p-1 border border-gray-100">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition-colors font-bold text-lg"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-bold text-lg text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="h-10 w-10 rounded-full bg-primary text-white shadow-md flex items-center justify-center hover:bg-primary-dark transition-colors font-bold text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">Catatan Khusus</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Contoh: Pedas, Jangan pakai bawang, dll..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    rows="3"
                                />
                            </div>

                            {/* Footer / Action */}
                            <div className="pt-2">
                                <button
                                    onClick={handleConfirm}
                                    className="flex w-full items-center justify-between rounded-xl bg-primary p-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span>Tambah ke Keranjang</span>
                                    <span className="rounded-lg bg-white/20 px-3 py-1 text-sm">
                                        {formatPrice(totalPrice)}
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
