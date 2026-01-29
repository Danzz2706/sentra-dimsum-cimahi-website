"use client";

import { Toaster, toast } from "sonner";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OrderStatusPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        // Fetch initial order data
        async function fetchOrder() {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching order:", error);
            } else {
                setOrder(data);
            }
            setLoading(false);
        }

        fetchOrder();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`order-${id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `id=eq.${id}`,
                },
                (payload) => {
                    setOrder(payload.new);
                    toast.success(`Status pesanan diperbarui: ${payload.new.status}`);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "paid": return "bg-green-100 text-green-800 border-green-200";
            case "processed": return "bg-blue-100 text-blue-800 border-blue-200";
            case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending": return "Menunggu Pembayaran / Konfirmasi";
            case "paid": return "Pembayaran Diterima";
            case "processed": return "Sedang Disiapkan";
            case "completed": return "Selesai";
            case "cancelled": return "Dibatalkan";
            default: return status;
        }
    };

    const handleWhatsAppConfirm = () => {
        if (!order) return;

        const phoneNumber = "6281770697325"; // Replace with actual number
        let message = `Halo Sentra Dimsum, saya mau konfirmasi pesanan #${order.id}:\n\n`;
        message += `Nama: ${order.customer_name}\n`;
        message += `Total: ${formatPrice(order.total_price)}\n\n`;
        message += "Mohon diproses ya kak.";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Pesanan Tidak Ditemukan</h1>
                <Link href="/" className="mt-4 text-primary hover:underline">Kembali ke Beranda</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
                >
                    {/* Header */}
                    <div className="bg-primary px-6 py-8 text-center text-white">
                        <p className="text-sm font-medium opacity-90">Order ID: #{order.id}</p>
                        <h1 className="mt-2 text-3xl font-bold">Status Pesanan</h1>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold shadow-sm border ${getStatusColor(order.status)} bg-white/90`}>
                                {getStatusLabel(order.status)}
                            </div>
                            <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold shadow-sm border bg-white/90 ${order.order_type === 'delivery' ? 'text-blue-700 border-blue-200' : 'text-orange-700 border-orange-200'}`}>
                                {order.order_type === 'delivery' ? 'Diantar' : 'Ambil Sendiri'}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-10 space-y-8">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pemesan</h3>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{order.customer_name}</p>
                                <p className="text-gray-600">{order.customer_phone}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Alamat Pengiriman</h3>
                                <p className="mt-1 text-gray-900">{order.customer_address}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Items */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Rincian Pesanan</h3>
                            <ul className="divide-y divide-gray-100">
                                {order.items.map((item, index) => (
                                    <li key={index} className="flex justify-between py-3">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.name} <span className="text-gray-500 text-sm">x{item.quantity}</span></p>
                                            {item.note && <p className="text-sm text-gray-500 italic">"{item.note}"</p>}
                                        </div>
                                        <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                                <p className="text-lg font-bold text-gray-900">Total</p>
                                <p className="text-xl font-bold text-primary">{formatPrice(order.total_price)}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-4">
                            {order.status === "pending" && (
                                <button
                                    onClick={handleWhatsAppConfirm}
                                    className="w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    Konfirmasi via WhatsApp
                                </button>
                            )}
                            <Link
                                href="/"
                                className="w-full rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-700 transition-all hover:bg-gray-200 text-center"
                            >
                                Kembali ke Menu
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Toaster position="top-center" richColors />
        </div>
    );
}
