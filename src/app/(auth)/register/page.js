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

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            }
        });

        if (error) {
            toast.error(error.message);
        }
    };

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

                        <div className="relative mt-6 flex items-center justify-center">
                            <span className="absolute bg-white px-2 text-sm text-gray-500">atau</span>
                            <div className="w-full border-t border-gray-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Daftar dengan Google
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
