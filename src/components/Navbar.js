"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";

export default function Navbar() {
    const { cartCount, toggleCart } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);

        // Check auth
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20" : "bg-transparent"}`}>
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110">
                        <Image
                            src="/logo.jpeg"
                            alt="Sentra Dimsum Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled ? "text-primary" : "text-white drop-shadow-md"}`}>
                        Sentra Dimsum
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <Link
                            href="/profile"
                            className={`group relative inline-flex items-center justify-center rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md h-12 w-12 ${isScrolled ? "bg-white text-gray-700 hover:bg-gray-50" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 transition-transform group-hover:scale-110"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className={`group relative inline-flex items-center justify-center rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md h-12 w-12 ${isScrolled ? "bg-white text-gray-700 hover:bg-gray-50" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 transition-transform group-hover:scale-110"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                        </Link>
                    )}
                    <button
                        onClick={toggleCart}
                        className={`group relative inline-flex items-center justify-center rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md h-12 w-12 ${isScrolled ? "bg-white text-gray-700 hover:bg-gray-50" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 transition-transform group-hover:scale-110"
                        >
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        <span className="sr-only">Open cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-black border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}
