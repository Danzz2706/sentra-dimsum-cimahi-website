"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

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
        // Status Filter
        if (filterStatus !== "all" && order.status !== filterStatus) return false;

        // Date Filter
        if (filterDate !== "all") {
            const orderDate = new Date(order.created_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (filterDate === "today") {
                const orderDateString = orderDate.toDateString();
                const todayString = today.toDateString();
                if (orderDateString !== todayString) return false;
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

        // Payment Method Visibility Logic
        // 1. QRIS: Hide if 'pending' (not paid yet)
        // 2. WhatsApp: Show 'pending' (waiting for admin confirmation)
        if (order.payment_method === 'qris' && order.status === 'pending') return false;

        return true;
    });

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", id);

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
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "paid": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "processed": return "bg-blue-100 text-blue-700";
            case "completed": return "bg-gray-100 text-gray-700";
            case "cancelled": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const handleExport = () => {
        if (!orders.length) return;

        const headers = ["Order ID", "Tanggal", "Tipe", "Customer", "No. HP", "Alamat", "Total", "Status", "Items"];
        const csvContent = [
            headers.join(","),
            ...orders.map(order => {
                const itemsString = order.items.map(i => `${i.name} (${i.quantity})`).join("; ");
                return [
                    order.id,
                    new Date(order.created_at).toLocaleDateString("id-ID"),
                    order.order_type || "takeaway",
                    `"${order.customer_name}"`,
                    `"${order.customer_phone}"`,
                    `"${order.customer_address}"`,
                    order.total_price,
                    order.status,
                    `"${itemsString}"`
                ].join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("Please allow popups to print report");

        // Calculate Summary
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.status !== 'cancelled' ? order.total_price : 0), 0);
        const totalOrders = filteredOrders.length;
        const totalSuccess = filteredOrders.filter(o => ['paid', 'processed', 'completed'].includes(o.status)).length;
        const totalPending = filteredOrders.filter(o => o.status === 'pending').length;

        const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Penjualan - Sentra Dimsum</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 1000px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .company-name { font-size: 28px; font-weight: bold; margin: 0; color: #000; letter-spacing: 1px; }
                    .report-title { font-size: 20px; margin: 10px 0 5px; font-weight: 600; }
                    .meta-info { font-size: 14px; color: #666; }
                    
                    .summary-box { display: flex; gap: 20px; margin-bottom: 30px; justify-content: space-between; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
                    .summary-item { text-align: center; flex: 1; }
                    .summary-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
                    .summary-value { font-size: 24px; font-weight: bold; color: #111; }
                    
                    table { w-full; border-collapse: collapse; width: 100%; font-size: 12px; }
                    th { text-align: left; border-bottom: 2px solid #000; padding: 10px; font-weight: bold; text-transform: uppercase; }
                    td { border-bottom: 1px solid #eee; padding: 10px; vertical-align: top; }
                    tr:last-child td { border-bottom: none; }
                    
                    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; display: inline-block; }
                    .status-paid, .status-completed, .status-processed { background: #dcfce7; color: #166534; }
                    .status-pending { background: #fef9c3; color: #854d0e; }
                    .status-cancelled { background: #fee2e2; color: #991b1b; }
                    
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="company-name">SENTRA DIMSUM CIMAHI</h1>
                    <p class="report-title">LAPORAN PENJUALAN</p>
                    <p className="meta-info">Dicetak pada: ${today}</p>
                </div>

                <div class="summary-box">
                    <div class="summary-item">
                        <div class="summary-label">Total Pendapatan</div>
                        <div class="summary-value">${formatPrice(totalRevenue)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Pesanan</div>
                        <div class="summary-value">${totalOrders}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Pesanan Sukses</div>
                        <div class="summary-value">${totalSuccess}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Menunggu</div>
                        <div class="summary-value">${totalPending}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tanggal</th>
                            <th>Pelanggan</th>
                            <th>Tipe</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredOrders.map(order => `
                            <tr>
                                <td style="font-family: monospace;">#${order.id.slice(0, 6)}</td>
                                <td>${new Date(order.created_at).toLocaleDateString("id-ID")}</td>
                                <td>
                                    <strong>${order.customer_name}</strong><br>
                                    <span style="color: #666;">${order.customer_phone}</span>
                                </td>
                                <td>${order.order_type === 'delivery' ? 'Delivery' : 'Takeaway'}</td>
                                <td>${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                                <td style="font-weight: bold;">${formatPrice(order.total_price)}</td>
                                <td>
                                    <span class="status-badge status-${order.status}">${order.status}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Laporan ini digenerate otomatis oleh sistem Sentra Dimsum Cimahi.</p>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const handlePrintReceipt = (order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("Please allow popups to print receipt");

        const itemsHtml = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${item.quantity}x ${item.name}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
            ${item.note ? `<div style="font-size: 12px; color: #666; margin-top: -3px; margin-bottom: 5px;">Note: ${item.note}</div>` : ''}
        `).join('');

        const htmlContent = `
            <html>
            <head>
                <title>Receipt #${order.id.slice(0, 8)}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .title { font-size: 18px; font-weight: bold; margin: 0; }
                    .subtitle { font-size: 12px; color: #555; margin: 5px 0; }
                    .info { font-size: 12px; margin-bottom: 15px; }
                    .items { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; font-size: 12px; }
                    .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 10px; }
                    .footer { text-align: center; font-size: 10px; margin-top: 20px; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">SENTRA DIMSUM</h1>
                    <p class="subtitle">Cimahi, Jawa Barat</p>
                    <p class="subtitle">${new Date().toLocaleString('id-ID')}</p>
                </div>
                <div class="info">
                    <div><strong>Order:</strong> #${order.id.slice(0, 8)}</div>
                    <div><strong>Customer:</strong> ${order.customer_name}</div>
                    <div><strong>Type:</strong> ${order.order_type === 'delivery' ? 'DELIVERY' : 'TAKEAWAY'}</div>
                </div>
                <div class="items">
                    ${itemsHtml}
                </div>
                <div class="total">
                    <span>TOTAL</span>
                    <span>${formatPrice(order.total_price)}</span>
                </div>
                <div class="footer">
                    <p>Terima kasih atas pesanan Anda!</p>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Pesanan Masuk</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrintReport}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print Laporan
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processed">Diproses</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Batal</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Tanggal</label>
                    <select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                        <option value="all">Semua Waktu</option>
                        <option value="today">Hari Ini</option>
                        <option value="week">7 Hari Terakhir</option>
                        <option value="month">30 Hari Terakhir</option>
                    </select>
                </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">ID / Tanggal</th>
                            <th className="px-6 py-4 font-medium">Tipe</th>
                            <th className="px-6 py-4 font-medium">Pelanggan</th>
                            <th className="px-6 py-4 font-medium">Total</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</div>
                                    <div className="text-gray-900">{new Date(order.created_at).toLocaleDateString("id-ID")}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block rounded px-2 py-1 text-xs font-bold uppercase ${order.order_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {order.order_type === 'delivery' ? 'Diantar' : 'Ambil'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                                    <div className="text-xs text-gray-500">{order.customer_phone}</div>
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {formatPrice(order.total_price)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="rounded bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200"
                                        >
                                            Detail
                                        </button>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="rounded border border-gray-200 p-1 text-xs outline-none focus:border-primary"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="processed">Proses</option>
                                            <option value="completed">Selesai</option>
                                            <option value="cancelled">Batal</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">Tidak ada pesanan yang sesuai filter.</div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between border-b p-4 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Detail Pesanan #{selectedOrder.id.slice(0, 8)}</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-full p-1 hover:bg-gray-200 text-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Pelanggan</p>
                                    <p className="font-medium">{selectedOrder.customer_name}</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Tipe Order</p>
                                    <span className={`inline-block mt-1 rounded px-2 py-1 text-xs font-bold uppercase ${selectedOrder.order_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {selectedOrder.order_type === 'delivery' ? 'Diantar' : 'Ambil Sendiri'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Alamat</p>
                                    <p className="text-sm text-gray-700">{selectedOrder.customer_address}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 py-4">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-3">Item Pesanan</p>
                                <ul className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between text-sm">
                                            <div>
                                                <span className="font-bold">{item.quantity}x</span> {item.name}
                                                {item.note && <div className="text-xs text-gray-500 italic pl-5">Note: {item.note}</div>}
                                            </div>
                                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-xl text-primary">{formatPrice(selectedOrder.total_price)}</span>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex gap-3">
                            <button
                                onClick={() => handlePrintReceipt(selectedOrder)}
                                className="flex-1 rounded-lg bg-gray-800 py-2.5 font-bold text-white hover:bg-gray-900 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                Print Struk
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
