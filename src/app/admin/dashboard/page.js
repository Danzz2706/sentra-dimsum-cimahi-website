"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        todaySales: 0,
        totalSales: 0,
        todayRevenue: 0,
        totalRevenue: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data: orders, error } = await supabase
                .from("orders")
                .select("created_at, total_price, status")
                .neq('status', 'cancelled')
                .neq('status', 'pending');

            if (error) throw error;

            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            let todaySales = 0, totalSales = 0, todayRevenue = 0, totalRevenue = 0;
            const dailyMap = {};

            // Initialize last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                dailyMap[dateStr] = {
                    date: dateStr,
                    displayDate: new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
                    fullDate: new Date(dateStr).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                    sales: 0,
                    revenue: 0
                };
            }

            orders?.forEach(order => {
                const orderDate = order.created_at.split('T')[0];
                const amount = order.total_price || 0;

                totalSales++;
                totalRevenue += amount;

                if (orderDate === todayStr) {
                    todaySales++;
                    todayRevenue += amount;
                }

                if (dailyMap[orderDate]) {
                    dailyMap[orderDate].sales++;
                    dailyMap[orderDate].revenue += amount;
                }
            });

            setStats({ todaySales, totalSales, todayRevenue, totalRevenue });
            setChartData(Object.values(dailyMap));
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const channel = supabase
            .channel('realtime-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
    };

    const handleProfessionalPrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("Please allow popups to print report");

        const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const dateRange = `${sevenDaysAgo.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        const periodSales = chartData.reduce((acc, curr) => acc + curr.sales, 0);
        const periodRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Penjualan 7 Hari - Sentra Dimsum</title>
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
                    table { border-collapse: collapse; width: 100%; font-size: 13px; margin-top: 20px; }
                    th { text-align: left; border-bottom: 2px solid #000; padding: 12px; font-weight: bold; text-transform: uppercase; background-color: #f3f4f6; }
                    td { border-bottom: 1px solid #eee; padding: 12px; vertical-align: middle; }
                    tr:last-child td { border-bottom: none; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    .text-right { text-align: right; }
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    @media print { body { padding: 0; } .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="company-name">SENTRA DIMSUM CIMAHI</h1>
                    <p class="report-title">LAPORAN PENJUALAN 7 HARI TERAKHIR</p>
                    <p class="meta-info">Periode: ${dateRange} | Dicetak pada: ${today}</p>
                </div>
                <div class="summary-box">
                    <div class="summary-item"><div class="summary-label">Total Pendapatan (7 Hari)</div><div class="summary-value">${formatCurrency(periodRevenue)}</div></div>
                    <div class="summary-item"><div class="summary-label">Total Pesanan (7 Hari)</div><div class="summary-value">${periodSales}</div></div>
                    <div class="summary-item"><div class="summary-label">Rata-rata / Hari</div><div class="summary-value">${formatCurrency(periodRevenue / 7)}</div></div>
                </div>
                <table>
                    <thead><tr><th>Tanggal</th><th class="text-right">Jumlah Pesanan</th><th class="text-right">Pendapatan</th></tr></thead>
                    <tbody>
                        ${chartData.map(data => `<tr><td>${data.fullDate}</td><td class="text-right"><strong>${data.sales}</strong></td><td class="text-right"><strong>${formatCurrency(data.revenue)}</strong></td></tr>`).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #eee; font-weight: bold;"><td style="border-top: 2px solid #000;">TOTAL</td><td class="text-right" style="border-top: 2px solid #000;">${periodSales}</td><td class="text-right" style="border-top: 2px solid #000;">${formatCurrency(periodRevenue)}</td></tr>
                    </tfoot>
                </table>
                <div class="footer"><p>Laporan ini digenerate otomatis oleh sistem Sentra Dimsum Cimahi.</p></div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded-md mb-2"></div>
                        <div className="h-4 w-64 bg-gray-100 rounded-md"></div>
                    </div>
                    <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl border border-gray-200"></div>)}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {[1, 2].map(i => <div key={i} className="h-[350px] bg-gray-100 rounded-2xl border border-gray-200"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header - Made responsive for mobile */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Overview kinerja bisnis Anda hari ini.</p>
                </div>
                <button
                    onClick={handleProfessionalPrint}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 w-full sm:w-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                    Cetak Laporan
                </button>
            </div>

            {/* Stats Grid (4 Cards) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Today Sales */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-xl bg-orange-50 p-3 text-orange-500 transition-transform group-hover:scale-110 group-hover:bg-orange-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">Hari Ini</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Penjualan Harian</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.todaySales} <span className="text-base font-semibold text-gray-400">Order</span></h3>
                    </div>
                </motion.div>

                {/* Total Sales */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-500 transition-transform group-hover:scale-110 group-hover:bg-blue-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">Total</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Penjualan</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.totalSales} <span className="text-base font-semibold text-gray-400">Order</span></h3>
                    </div>
                </motion.div>

                {/* Today Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-green-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-xl bg-green-50 p-3 text-green-500 transition-transform group-hover:scale-110 group-hover:bg-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">Hari Ini</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Pendapatan Harian</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(stats.todayRevenue)}</h3>
                    </div>
                </motion.div>

                {/* Total Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-500 transition-transform group-hover:scale-110 group-hover:bg-purple-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">Total</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Pendapatan</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(stats.totalRevenue)}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Sales Report (Bar Chart) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Volume Pesanan</h3>
                            <p className="text-xs font-medium text-gray-500">7 Hari Terakhir</p>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600, fontSize: '14px' }}
                                />
                                <Bar dataKey="sales" name="Pesanan" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right: Sales & Revenue (Area Chart) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Tren Pendapatan</h3>
                            <p className="text-xs font-medium text-gray-500">7 Hari Terakhir</p>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dx={-10} tickFormatter={(value) => new Intl.NumberFormat("id-ID", { notation: "compact", compactDisplay: "short" }).format(value)} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600, fontSize: '14px' }}
                                    formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Pendapatan' : 'Pesanan']}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}