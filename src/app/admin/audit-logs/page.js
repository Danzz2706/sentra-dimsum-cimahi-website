"use client";

import { useState, useEffect } from "react";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        try {
            const response = await fetch("/api/admin/audit-logs");
            const data = await response.json();

            if (Array.isArray(data)) {
                setLogs(data);
            } else {
                console.error("Failed to fetch logs:", data);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
                    <p className="text-gray-500">Riwayat aktivitas pengguna</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                    Refresh
                </button>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Waktu</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Aksi</th>
                                <th className="px-6 py-4 font-medium">IP Address</th>
                                <th className="px-6 py-4 font-medium">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Memuat data log...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Belum ada aktivitas tercatat.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(log.created_at).toLocaleString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit"
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {log.user_email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${log.action.includes('LOGIN') ? 'bg-green-100 text-green-800' :
                                                    log.action.includes('ORDER') ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {log.ip_address}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
