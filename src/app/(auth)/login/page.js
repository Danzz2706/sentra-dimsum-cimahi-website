"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            // Log activity
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: email,
                    action: 'LOGIN',
                    details: { role: 'customer' }
                })
            });

            toast.success("Berhasil masuk!");
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            >
                <div className="bg-primary p-8 text-center text-white">
                    <h1 className="text-3xl font-bold">Selamat Datang</h1>
                    <p className="mt-2 text-white/90">Masuk untuk melihat riwayat pesananmu</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-primary py-3 font-bold text-white transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-70"
                        >
                            {loading ? "Memproses..." : "Masuk"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Belum punya akun?{" "}
                        <Link href="/register" className="font-bold text-primary hover:underline">
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </motion.div>
            <Toaster position="top-center" richColors />
        </div>
    );
}
