"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: ""
    });
    const router = useRouter();

    useEffect(() => {
        async function fetchProfile() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            setUser(session.user);
            setFormData({
                full_name: session.user.user_metadata?.full_name || "",
                phone: session.user.user_metadata?.phone || ""
            });

            // Fetch orders
            const { data: ordersData, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
                toast.error("Gagal memuat riwayat pesanan");
            } else {
                setOrders(ordersData || []);
            }

            setLoading(false);
        }

        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);

        console.log("Updating profile with:", formData);

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone
                }
            });

            if (error) {
                console.error("Supabase Update Error:", error);
                throw error;
            }

            console.log("Update Success:", data);

            // Force refresh session to ensure metadata is up to date
            const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
            if (sessionError) console.error("Session Refresh Error:", sessionError);

            if (session) {
                setUser(session.user);
            } else {
                setUser(data.user);
            }

            setIsEditing(false);
            toast.success("Profil berhasil diperbarui");
            router.refresh();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Gagal memperbarui profil: " + error.message);
        } finally {
            setUpdateLoading(false);
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
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "paid": return "bg-green-100 text-green-800";
            case "processed": return "bg-blue-100 text-blue-800";
            case "completed": return "bg-gray-100 text-gray-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
                >
                    <div className="bg-primary px-6 py-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || "Pelanggan"}</h1>
                                <p className="text-white/90">{user?.email}</p>
                                {user?.user_metadata?.phone && (
                                    <p className="text-sm text-white/80 mt-1">{user.user_metadata.phone}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/30 backdrop-blur-sm"
                                >
                                    Edit Profil
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600/80 backdrop-blur-sm"
                                >
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                            >
                                <h2 className="mb-4 text-xl font-bold text-gray-900">Edit Profil</h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nomor WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 rounded-lg bg-gray-100 py-2 font-medium text-gray-700 hover:bg-gray-200"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="flex-1 rounded-lg bg-primary py-2 font-bold text-white hover:bg-primary-dark disabled:opacity-70"
                                        >
                                            {updateLoading ? "Menyimpan..." : "Simpan"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Order History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Riwayat Pesanan</h2>

                    {orders.length === 0 ? (
                        <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Belum ada pesanan</h3>
                            <p className="mt-1 text-gray-500">Yuk mulai pesan dimsum favoritmu!</p>
                            <Link
                                href="/"
                                className="mt-6 inline-block rounded-full bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-dark"
                            >
                                Pesan Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/order/${order.id}`}
                                    className="block overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-primary/30"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                    Order #{order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">{order.items.length} Item</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="font-bold text-primary">{formatPrice(order.total_price)}</span>
                                            </div>
                                            <div className="text-sm font-medium text-primary flex items-center gap-1">
                                                Lihat Detail
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
            <Toaster position="top-center" richColors />
        </div>
    );
}
