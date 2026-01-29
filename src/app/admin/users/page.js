"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const response = await fetch("/api/admin/users");
            const data = await response.json();

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error("Failed to fetch users:", data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen Pelanggan</h1>
                    <p className="text-gray-500">Total {users.length} pelanggan terdaftar</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari pelanggan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 rounded-lg border border-gray-300 pl-10 pr-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                                <th className="px-6 py-4 font-medium">Kontak</th>
                                <th className="px-6 py-4 font-medium">Bergabung</th>
                                <th className="px-6 py-4 font-medium">Terakhir Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Memuat data pelanggan...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada pelanggan ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900">{user.email}</span>
                                                <span className="text-xs text-gray-500">{user.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            }) : "-"}
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
