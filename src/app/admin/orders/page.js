"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersPage() {
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) setOrders(data || []);
        setLoading(false);
    }

    const filteredOrders = orders.filter(order => {
        if (filterStatus !== "all" && order.status !== filterStatus) return false;
        if (filterDate !== "all") {
            const orderDate = new Date(order.created_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (filterDate === "today") {
                if (orderDate.toDateString() !== today.toDateString()) return false;
            } else if (filterDate === "week") {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                if (orderDate < sevenDaysAgo) return false;
            } else if (filterDate === "month") {
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                if (orderDate < thirtyDaysAgo) return false;
            }
        }
        if (order.payment_method === 'qris' && order.status === 'pending') return false;
        return true;
    });

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
        if (!error) {
            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } else {
            alert("Gagal update status");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
    };

    const getStatusTheme = (status) => {
        switch (status) {
            case "paid": return "bg-emerald-50 text-emerald-600 border-emerald-200";
            case "pending": return "bg-amber-50 text-amber-600 border-amber-200";
            case "processed": return "bg-blue-50 text-blue-600 border-blue-200";
            case "completed": return "bg-gray-100 text-gray-600 border-gray-200";
            case "cancelled": return "bg-rose-50 text-rose-600 border-rose-200";
            default: return "bg-gray-50 text-gray-500 border-gray-200";
        }
    };

    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("Please allow popups to print report");

        const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const totalSales = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((acc, order) => acc + (order.total_price || 0), 0);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Penjualan - Sentra Dimsum</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 20px; }
                    .logo { width: 80px; height: auto; }
                    .company-info { text-align: left; }
                    .company-name { font-size: 24px; font-weight: bold; margin: 0; color: #000; }
                    .report-title { font-size: 18px; margin: 5px 0 0; font-weight: 600; }
                    .summary { display: flex; gap: 40px; margin-bottom: 30px; background: #f9fafb; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; }
                    .summary-item strong { display: block; font-size: 24px; color: #111; }
                    .summary-item span { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 20px; }
                    th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #000; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                    td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    .text-right { text-align: right; }
                    .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    @media print { .no-print { display: none; } body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo.jpeg" class="logo" alt="Logo" />
                    <div class="company-info">
                        <h1 class="company-name">SENTRA DIMSUM CIMAHI</h1>
                        <p class="report-title">LAPORAN PENJUALAN</p>
                        <p style="font-size: 12px; color: #666;">Digenerate pada: ${today}</p>
                    </div>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <span>Total Pesanan</span>
                        <strong>${totalSales}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Total Pendapatan</span>
                        <strong>${formatPrice(totalRevenue)}</strong>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Tanggal</th>
                            <th>Pelanggan</th>
                            <th>Tipe</th>
                            <th>Status</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredOrders.map((order, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>
                                    ${new Date(order.created_at).toLocaleDateString('id-ID')}
                                    <div style="font-size: 10px; color: #999;">${new Date(order.created_at).toLocaleTimeString('id-ID')}</div>
                                </td>
                                <td>
                                    <strong>${order.customer_name}</strong>
                                    <div style="font-size: 10px; color: #666;">${order.customer_phone}</div>
                                </td>
                                <td>${order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}</td>
                                <td>${order.status}</td>
                                <td class="text-right"><strong>${formatPrice(order.total_price)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="footer"><p>Laporan ini digenerate otomatis oleh sistem Sentra Dimsum Cimahi.</p></div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const handleExport = () => {
        const headers = ["Order ID", "Tanggal", "Nama Pelanggan", "No HP", "Alamat", "Tipe Order", "Status", "Items", "Total Harga"];
        const csvContent = [
            headers.join(","),
            ...filteredOrders.map(order => {
                const itemsRequest = order.items.map(i => `${i.quantity}x ${i.name}`).join(" | ");
                return [
                    order.id,
                    new Date(order.created_at).toLocaleString('id-ID'),
                    `"${order.customer_name}"`,
                    `"${order.customer_phone}"`,
                    `"${order.customer_address ? order.customer_address.replace(/"/g, '""') : '-'}"`,
                    order.order_type,
                    order.status,
                    `"${itemsRequest.replace(/"/g, '""')}"`,
                    order.total_price
                ].join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan_penjualan_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintReceipt = (order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("Please allow popups to print receipt");

        const date = new Date(order.created_at).toLocaleString('id-ID');
        const total = formatPrice(order.total_price);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Struk #${order.id.slice(0, 8)}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 10px; width: 300px; margin: 0 auto; color: #000; position: relative; }
                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 60%;
                        opacity: 0.08;
                        z-index: -1;
                        pointer-events: none;
                        filter: grayscale(100%);
                    }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                    .store-name { font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; }
                    .store-address { font-size: 10px; margin: 5px 0; line-height: 1.4; }
                    .meta { font-size: 10px; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .meta p { margin: 2px 0; display: flex; justify-content: space-between; }
                    .item-list { width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 10px; }
                    .item-list td { padding: 4px 0; vertical-align: top; }
                    .qty { width: 25px; font-weight: bold; }
                    .price { text-align: right; }
                    .total-section { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
                    .sub-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; }
                    .footer { text-align: center; font-size: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
                    @media print { @page { margin: 0; } body { padding: 5px; } }
                </style>
            </head>
            <body>
                <img src="/logo.jpeg" class="watermark" alt="Watermark" />
                <div class="header">
                    <h1 class="store-name">SENTRA DIMSUM CIMAHI</h1>
                    <p class="store-address">Jl. Cibaligo Cluster Pintu Air Kavling No. 03<br>Cimahi, Jawa Barat</p>
                </div>
                <div class="meta">
                    <p><span>ID Order:</span> <span>#${order.id.slice(0, 8)}</span></p>
                    <p><span>Tanggal:</span> <span>${date}</span></p>
                    <p><span>Pelanggan:</span> <span>${order.customer_name}</span></p>
                    <p><span>Tipe:</span> <span>${order.order_type === 'delivery' ? 'DELIVERY' : 'PICKUP'}</span></p>
                </div>
                <table class="item-list">
                    ${order.items.map(item => `
                        <tr>
                            <td class="qty">${item.quantity}x</td>
                            <td class="name">${item.name}</td>
                            <td class="price">${formatPrice(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="total-section">
                    <div class="total-row">
                        <span>TOTAL</span>
                        <span>${total}</span>
                    </div>
                     <div class="sub-row">
                        <span>Status Bayar</span>
                        <span>${order.status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="footer">
                    <p>Terima Kasih!</p>
                    <p>Sentra Dimsum Cimahi</p>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Manajemen Pesanan</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Pantau dan kelola semua pesanan masuk di sini.</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={handlePrintReport}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print Laporan
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1ebd5a] transition-all shadow-sm hover:shadow-md hover:shadow-[#25D366]/20 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Filter Status</label>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer"
                        >
                            <option value="all">🚀 Semua Status</option>
                            <option value="pending">⏳ Pending</option>
                            <option value="paid">✅ Paid</option>
                            <option value="processed">🍳 Diproses</option>
                            <option value="completed">🎉 Selesai</option>
                            <option value="cancelled">❌ Batal</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Rentang Waktu</label>
                    <div className="relative">
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer"
                        >
                            <option value="all">📅 Semua Waktu</option>
                            <option value="today">⚡ Hari Ini</option>
                            <option value="week">📊 7 Hari Terakhir</option>
                            <option value="month">📈 30 Hari Terakhir</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider">ID / Tanggal</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider">Pelanggan</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider">Tipe & Total</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                // Skeleton Loader
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-200 rounded mb-2"></div><div className="h-3 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-200 rounded mb-2"></div><div className="h-3 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-5"><div className="h-4 w-16 bg-gray-200 rounded mb-2"></div><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-5"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                                        <td className="px-6 py-5"><div className="h-8 w-full bg-gray-200 rounded-lg"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-semibold text-primary">#{order.id.slice(0, 8)}</div>
                                            <div className="text-gray-500 text-xs mt-1">{new Date(order.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{order.customer_name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{order.customer_phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${order.order_type === 'delivery' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {order.order_type === 'delivery' ? 'Diantar' : 'Ambil'}
                                                </span>
                                            </div>
                                            <div className="font-black text-gray-900">{formatPrice(order.total_price)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusTheme(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors shadow-sm"
                                                >
                                                    Detail
                                                </button>
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                        className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-bold outline-none transition-all hover:bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer text-gray-700 shadow-sm"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="processed">Proses</option>
                                                        <option value="completed">Selesai</option>
                                                        <option value="cancelled">Batal</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">Pesanan Tidak Ditemukan</h3>
                                            <p className="text-xs text-gray-500">Coba ubah filter status atau tanggal di atas.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-white/80 backdrop-blur">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Pesanan #{selectedOrder.id.slice(0, 8)}</h2>
                                    <p className="text-xs text-gray-500 font-medium">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto bg-gray-50/50">
                                <div className="grid grid-cols-2 gap-5 mb-6">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Pelanggan</p>
                                        <p className="font-bold text-gray-900 line-clamp-1">{selectedOrder.customer_name}</p>
                                        <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedOrder.customer_phone}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Tipe Order</p>
                                        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide mt-1 ${selectedOrder.order_type === 'delivery' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {selectedOrder.order_type === 'delivery' ? '🚗 Diantar' : '🛍️ Ambil Sendiri'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Alamat Pengiriman / Catatan</p>
                                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{selectedOrder.customer_address}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-4 border-b border-gray-50 pb-2">Daftar Item</p>
                                    <ul className="space-y-4">
                                        {selectedOrder.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-start text-sm group">
                                                <div className="flex gap-3">
                                                    <span className="font-black text-primary bg-orange-50 px-2 py-0.5 rounded-md h-fit">{item.quantity}x</span>
                                                    <div>
                                                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.name}</span>
                                                        {item.note && <div className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-1.5 rounded-md border border-gray-100">Catatan: {item.note}</div>}
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-700 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6 flex justify-between items-center bg-gray-900 rounded-2xl p-5 text-white shadow-lg">
                                    <span className="font-bold text-gray-300 uppercase tracking-wider text-xs">Total Pembayaran</span>
                                    <span className="font-black text-2xl">{formatPrice(selectedOrder.total_price)}</span>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
                                <button
                                    onClick={() => handlePrintReceipt(selectedOrder)}
                                    className="flex-1 rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                    Cetak Struk
                                </button>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}