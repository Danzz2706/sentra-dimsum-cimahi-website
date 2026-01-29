"use client";

import Sidebar from "@/components/admin/Sidebar";
import { usePathname } from "next/navigation";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Toaster, toast } from "sonner";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoginPage) return;

        const channel = supabase
            .channel("admin-orders")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    // Play sound
                    const notificationSound = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
                    const audio = new Audio(notificationSound);
                    audio.play().catch(e => console.log("Audio play failed", e));

                    // Show toast
                    toast.success(`Pesanan Baru dari ${payload.new.customer_name}!`, {
                        duration: 5000,
                        action: {
                            label: "Lihat",
                            onClick: () => window.location.href = "/admin/orders"
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLoginPage]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
            <Toaster position="top-right" richColors />
        </div>
    );
}
