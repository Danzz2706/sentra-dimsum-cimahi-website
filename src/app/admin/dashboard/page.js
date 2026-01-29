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
            // Fetch all orders (for simplicity in this demo, in prod use pagination/filtering)
            const { data: orders, error } = await supabase
                .from("orders")
                .select("created_at, total_price, status")
                .neq('status', 'cancelled')
                .neq('status', 'pending'); // Exclude pending orders (unpaid QR or unconfirmed WA)

            if (error) throw error;

            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            let todaySales = 0;
            let totalSales = 0;
            let todayRevenue = 0;
            let totalRevenue = 0;

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

                // Total Stats
                totalSales++;
                totalRevenue += amount;

                // Today Stats
                if (orderDate === todayStr) {
                    todaySales++;
                    todayRevenue += amount;
                }

                // Chart Data (only if within last 7 days)
                if (dailyMap[orderDate]) {
                    dailyMap[orderDate].sales++;
                    dailyMap[orderDate].revenue += amount;
                }
            });

            setStats({
                todaySales,
                totalSales,
                todayRevenue,
                totalRevenue
            });

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

        return () => {
            supabase.removeChannel(channel);
        };
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

        // Calculate period totals
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
                    
                    table { w-full; border-collapse: collapse; width: 100%; font-size: 13px; margin-top: 20px; }
                    th { text-align: left; border-bottom: 2px solid #000; padding: 12px; font-weight: bold; text-transform: uppercase; background-color: #f3f4f6; }
                    td { border-bottom: 1px solid #eee; padding: 12px; vertical-align: middle; }
                    tr:last-child td { border-bottom: none; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    
                    .text-right { text-align: right; }
                    
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="company-name">SENTRA DIMSUM CIMAHI</h1>
                    <p class="report-title">LAPORAN PENJUALAN 7 HARI TERAKHIR</p>
                    <p class="meta-info">Periode: ${dateRange} | Dicetak pada: ${today}</p>
                </div>

                <div class="summary-box">
                    <div class="summary-item">
                        <div class="summary-label">Total Pendapatan (7 Hari)</div>
                        <div class="summary-value">${formatCurrency(periodRevenue)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Pesanan (7 Hari)</div>
                        <div class="summary-value">${periodSales}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Rata-rata / Hari</div>
                        <div class="summary-value">${formatCurrency(periodRevenue / 7)}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th class="text-right">Jumlah Pesanan</th>
                            <th class="text-right">Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chartData.map(data => `
                            <tr>
                                <td>${data.fullDate}</td>
                                <td class="text-right"><strong>${data.sales}</strong></td>
                                <td class="text-right"><strong>${formatCurrency(data.revenue)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #eee; font-weight: bold;">
                            <td style="border-top: 2px solid #000;">TOTAL</td>
                            <td class="text-right" style="border-top: 2px solid #000;">${periodSales}</td>
                            <td class="text-right" style="border-top: 2px solid #000;">${formatCurrency(periodRevenue)}</td>
                        </tr>
                    </tfoot>
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Overview kinerja bisnis Anda</p>
                </div>
                <button
                    onClick={handleProfessionalPrint}
                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                    Cetak Laporan 7 Hari
                </button>
            </div>

            {/* Stats Grid (4 Cards) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Today Sales */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Hari Ini</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Penjualan Hari Ini</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.todaySales} Pesanan</h3>
                </motion.div>

                {/* Total Sales */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-full bg-secondary/10 p-3 text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Total Penjualan</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalSales} Pesanan</h3>
                </motion.div>

                {/* Today Revenue */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-full bg-green-100 p-3 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Hari Ini</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Pendapatan Hari Ini</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</h3>
                </motion.div>

                {/* Total Revenue */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="rounded-full bg-red-100 p-3 text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
                </motion.div>
            </div>

            {/* Charts Grid (2 Columns) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Sales Report (Bar Chart) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Laporan Penjualan (7 Hari)</h3>
                    </div>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="displayDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="sales"
                                    name="Jumlah Pesanan"
                                    fill="#F97316"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right: Sales & Revenue (Area Chart) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Tren Pendapatan</h3>
                    </div>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="displayDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => new Intl.NumberFormat("id-ID", { notation: "compact", compactDisplay: "short" }).format(value)}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    hide
                                    display="none"
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name) => [
                                        name === 'revenue' ? formatCurrency(value) : value,
                                        name === 'revenue' ? 'Pendapatan' : 'Pesanan'
                                    ]}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="revenue"
                                    stroke="#F97316"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={3}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="sales"
                                    name="sales"
                                    stroke="#FBBF24"
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
