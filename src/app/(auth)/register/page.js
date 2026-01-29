"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.name,
                    phone: formData.phone,
                },
            },
        });

        if (authError) {
            toast.error(authError.message);
            setLoading(false);
            return;
        }

        toast.success("Pendaftaran berhasil! Silakan masuk.");
        router.push("/login");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            >
                <div className="bg-primary p-8 text-center text-white">
                    <h1 className="text-3xl font-bold">Daftar Akun</h1>
                    <p className="mt-2 text-white/90">Nikmati kemudahan memesan dimsum</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Nama Anda"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Nomor WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="0812..."
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Minimal 6 karakter"
                                minLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full rounded-lg bg-primary py-3 font-bold text-white transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-70"
                        >
                            {loading ? "Memproses..." : "Daftar"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="font-bold text-primary hover:underline">
                            Masuk
                        </Link>
                    </div>
                </div>
            </motion.div>
            <Toaster position="top-center" richColors />
        </div>
    );
}
