"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        store_name: "",
        store_address: "",
        store_phone: "",
        shipping_cost: 0
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data && !data.error) {
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to load settings");
            toast.error("Gagal memuat pengaturan");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Pengaturan berhasil disimpan!");
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error("Gagal menyimpan: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Memuat pengaturan...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Pengaturan Toko</h1>
                <p className="text-gray-500">Kelola profil toko dan konfigurasi sistem</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Store Profile Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        Profil Toko
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Toko</label>
                            <input
                                type="text"
                                value={settings.store_name}
                                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Akan muncul di header struk/nota.</p>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                            <textarea
                                value={settings.store_address}
                                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                rows="3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon / WhatsApp</label>
                            <input
                                type="text"
                                value={settings.store_phone}
                                onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Configuration Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Konfigurasi Penjualan
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Harga per KM (IDR)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    value={settings.price_per_km || 0}
                                    onChange={(e) => setSettings({ ...settings, price_per_km: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Digunakan untuk menghitung ongkir otomatis.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Ongkir Minimum (IDR)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    value={settings.shipping_cost}
                                    onChange={(e) => setSettings({ ...settings, shipping_cost: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Biaya minimum jika jarak sangat dekat.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude Toko</label>
                            <input
                                type="number"
                                step="any"
                                value={settings.store_lat || 0}
                                onChange={(e) => setSettings({ ...settings, store_lat: parseFloat(e.target.value) || 0 })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude Toko</label>
                            <input
                                type="number"
                                step="any"
                                value={settings.store_lng || 0}
                                onChange={(e) => setSettings({ ...settings, store_lng: parseFloat(e.target.value) || 0 })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                                Tip: Gunakan Google Maps untuk mendapatkan koordinat toko Anda (klik kanan di lokasi toko -&gt; pilih angka koordinat).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-primary px-8 py-3 font-bold text-white transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </button>
                </div>
            </motion.form>
            <Toaster position="top-right" richColors />
        </div>
    );
}
