"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        // Simple hardcoded check
        if (code === "SentraDimsumCimahi2026") {
            // Log activity
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: 'admin@sentradimsum.com',
                    action: 'ADMIN_LOGIN',
                    details: { role: 'admin' }
                })
            });

            // In a real app, you'd set a cookie/token here
            router.push("/admin/dashboard");
        } else {
            setError("Kode akses salah!");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-primary">Owner Login</h1>
                    <p className="text-gray-500">Masukkan kode akses untuk masuk.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Kode Akses
                        </label>
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-dark active:scale-95"
                    >
                        Masuk
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
