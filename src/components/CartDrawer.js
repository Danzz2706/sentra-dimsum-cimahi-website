"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { BRANCHES } from "@/data/branches";

// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] w-full bg-slate-100 animate-pulse rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Memuat Peta...</span>
        </div>
    )
});

export default function CartDrawer() {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        cartTotal,
        clearCart,
    } = useCart();
    const drawerRef = useRef(null);
    const router = useRouter();

    const [customerData, setCustomerData] = useState({ name: "", phone: "", address: "" });
    const [orderType, setOrderType] = useState("takeaway");
    const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
    const [isShopClosed, setIsShopClosed] = useState(false);

    const [storeSettings, setStoreSettings] = useState(null);
    const [shippingCost, setShippingCost] = useState(0);
    const [deliveryDistance, setDeliveryDistance] = useState(0);
    const [deliveryCoords, setDeliveryCoords] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
        };
        if (isCartOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCartOpen, setIsCartOpen]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
            const hour = jakartaTime.getHours();
            setIsShopClosed(hour >= 19 || hour < 10);
        };
        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
                const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&bbox=106.0,-8.0,109.0,-6.0&limit=5`);
                const data = await response.json();
                setSearchResults(data.features || []);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').single();
            if (data) {
                setStoreSettings(data);
                if (orderType === 'delivery') setShippingCost(data.shipping_cost || 10000);
            }
        };
        fetchSettings();
    }, [orderType]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                setCustomerData(prev => ({
                    ...prev,
                    name: session.user.user_metadata?.full_name || "",
                    phone: session.user.user_metadata?.phone || "",
                }));
            }
        };
        checkUser();
    }, []);

    const handleSelectResult = (result) => {
        const lng = result.center[0];
        const lat = result.center[1];
        setDeliveryCoords({ lat, lng });
        setCustomerData(prev => ({ ...prev, address: result.place_name }));
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleLocationSelect = (location) => {
        if (!storeSettings) return;
        setDeliveryDistance(location.distance);
        setDeliveryCoords({ lat: location.lat, lng: location.lng });
        const calculatedCost = Math.max(
            storeSettings.shipping_cost,
            Math.ceil(location.distance * (storeSettings.price_per_km || 2000))
        );
        setShippingCost(calculatedCost);

        if (location.address) {
            setCustomerData(prev => ({ ...prev, address: location.address }));
        } else if (!customerData.address) {
            setCustomerData(prev => ({ ...prev, address: `Lokasi Map: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` }));
        }
    };

    const finalTotal = cartTotal + (orderType === "delivery" ? shippingCost : 0);

    const validateOrder = () => {
        if (isShopClosed) {
            alert("Mohon maaf, pemesanan sudah ditutup (Tutup pukul 19:00 WIB). Silahkan datang lagi besok!");
            return false;
        }
        if (!customerData.name || !customerData.phone) {
            alert("Mohon lengkapi Nama dan No. HP");
            return false;
        }
        if (orderType === 'delivery' && !customerData.address) {
            alert("Mohon lengkapi Alamat Pengiriman");
            return false;
        }
        return true;
    };

    const prepareOrderItems = () => {
        const orderItems = [...cart];
        if (orderType === 'delivery' && shippingCost > 0) {
            orderItems.push({
                uniqueId: 'shipping-cost',
                name: 'Ongkos Kirim',
                price: shippingCost,
                quantity: 1,
                note: deliveryDistance ? `${deliveryDistance.toFixed(1)} km` : ''
            });
        }
        return orderItems;
    };

    const handleCheckout = async () => {
        if (!validateOrder()) return;
        const orderItems = prepareOrderItems();

        try {
            const { data: orderData, error: orderError } = await supabase.from("orders").insert([{
                user_id: user?.id || null,
                customer_name: customerData.name,
                customer_phone: customerData.phone,
                customer_address: orderType === 'takeaway' ? `AMBIL SENDIRI: ${selectedBranch.name}` : `${customerData.address} (Dikirim dari: ${selectedBranch.name})`,
                total_price: finalTotal,
                items: orderItems,
                status: "pending",
                order_type: orderType,
                payment_method: "whatsapp",
            }]).select().single();

            if (orderError) throw orderError;

            clearCart();
            setIsCartOpen(false);
            router.push(`/order/${orderData.id}`);
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Terjadi kesalahan sistem");
        }
    };

    const handlePayment = async () => {
        if (!validateOrder()) return;
        const orderItems = prepareOrderItems();

        try {
            const { data: orderData, error: orderError } = await supabase.from("orders").insert([{
                user_id: user?.id || null,
                customer_name: customerData.name,
                customer_phone: customerData.phone,
                customer_address: orderType === 'takeaway' ? `AMBIL SENDIRI: ${selectedBranch.name}` : `${customerData.address} (Dikirim dari: ${selectedBranch.name})`,
                total_price: finalTotal,
                items: orderItems,
                status: "pending",
                order_type: orderType,
                payment_method: "qris"
            }]).select().single();

            if (orderError) throw orderError;

            const response = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [...cart, {
                        id: "shipping",
                        name: "Ongkos Kirim",
                        price: orderType === "delivery" ? shippingCost : 0,
                        quantity: 1
                    }],
                    gross_amount: finalTotal,
                    customer_details: {
                        first_name: customerData.name,
                        phone: customerData.phone,
                        billing_address: { address: customerData.address },
                    },
                }),
            });

            const data = await response.json();

            if (data.token) {
                window.snap.pay(data.token, {
                    onSuccess: async function () {
                        await supabase.from("orders").update({ status: "paid" }).eq("id", orderData.id);
                        clearCart();
                        setIsCartOpen(false);
                        router.push(`/order/${orderData.id}`);
                    },
                    onPending: function () { router.push(`/order/${orderData.id}`); },
                    onError: function () { alert("Pembayaran Gagal!"); },
                });
            } else {
                alert("Gagal memproses pembayaran: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Terjadi kesalahan sistem");
        }
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
            <div
                ref={drawerRef}
                className="flex h-full w-full sm:w-[480px] flex-col bg-[#FDFCF9] shadow-2xl transition-transform duration-500 animate-in slide-in-from-right sm:rounded-l-[2rem] overflow-hidden"
            >
                {/* Header (Sticky Glassmorphism) */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-[#FDFCF9]/90 backdrop-blur-xl px-6 py-5">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">
                        Keranjang
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="rounded-full bg-slate-100 p-2.5 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="p-6">
                        {cart.length > 0 && (
                            <div className="mb-10 space-y-8">

                                {/* Order Type Segmented Control (Pill Style) */}
                                <div className="flex p-1.5 bg-slate-100 rounded-full border border-slate-200/50">
                                    <button
                                        onClick={() => setOrderType("takeaway")}
                                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${orderType === "takeaway" ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Ambil Sendiri
                                    </button>
                                    <button
                                        onClick={() => setOrderType("delivery")}
                                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${orderType === "delivery" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Delivery
                                    </button>
                                </div>

                                {/* Form Section */}
                                <div className="space-y-5">
                                    {/* Branch Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            {orderType === "takeaway" ? "Lokasi Pengambilan" : "Kirim dari Cabang"}
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedBranch.id}
                                                onChange={(e) => setSelectedBranch(BRANCHES.find(b => b.id === parseInt(e.target.value)))}
                                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 cursor-pointer shadow-sm"
                                            >
                                                {BRANCHES.map((branch) => (
                                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {orderType === "takeaway" && (
                                            <p className="text-[11px] text-slate-500 ml-1 font-medium flex items-start gap-1.5">
                                                <span className="text-orange-500 mt-0.5">📍</span>
                                                {selectedBranch.address}
                                            </p>
                                        )}
                                    </div>

                                    {/* Personal Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pemesan</label>
                                            <input
                                                type="text"
                                                placeholder="Nama Lengkap"
                                                value={customerData.name}
                                                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                            <input
                                                type="tel"
                                                placeholder="0812..."
                                                value={customerData.phone}
                                                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Map Delivery Section */}
                                    {orderType === "delivery" && storeSettings?.store_lat && (
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tujuan Pengantaran</label>

                                            {/* Search Input */}
                                            <div className="relative z-20">
                                                <input
                                                    type="text"
                                                    placeholder="Cari jalan, gedung, daerah..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm"
                                                />
                                                <span className="absolute left-4 top-3.5 text-base grayscale opacity-60">📍</span>
                                                {isSearching && (
                                                    <div className="absolute right-4 top-4">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500"></div>
                                                    </div>
                                                )}

                                                {/* Search Results */}
                                                {searchResults.length > 0 && (
                                                    <ul className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-xl ring-1 ring-black/5">
                                                        {searchResults.map((result, index) => (
                                                            <li
                                                                key={result.id || index}
                                                                onClick={() => handleSelectResult(result)}
                                                                className="cursor-pointer px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                                                            >
                                                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{result.text}</p>
                                                                <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-0.5">{result.place_name}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-50">
                                                <LocationPicker
                                                    storeLocation={{ lat: selectedBranch.lat, lng: selectedBranch.lng }}
                                                    onLocationSelect={handleLocationSelect}
                                                    selectedPosition={deliveryCoords}
                                                />
                                            </div>

                                            <textarea
                                                placeholder="Detail Alamat Lengkap (Nomor Rumah, Patokan, dll)"
                                                value={customerData.address}
                                                onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 resize-none shadow-sm min-h-[90px]"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cart Items List */}
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center pt-32 text-center opacity-70">
                                <span className="text-6xl mb-6 grayscale">🥡</span>
                                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900">Keranjang Kosong</h3>
                                <p className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Silakan pilih menu terlebih dahulu.</p>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="mt-8 rounded-full bg-slate-900 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-500 hover:shadow-lg active:scale-95"
                                >
                                    Tutup
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Daftar Pesanan</h3>
                                <ul className="space-y-4">
                                    {cart.map((item) => (
                                        <li key={item.uniqueId} className="flex gap-4 rounded-[1.5rem] bg-white p-3 shadow-sm border border-slate-100 transition-all hover:shadow-md group">
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between py-0.5">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 line-clamp-1">{item.name}</h4>
                                                        <p className="font-bold text-orange-500 text-xs mt-0.5">{formatPrice(item.price)}</p>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.uniqueId)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                                {item.note && <p className="text-[10px] font-medium text-slate-500 mt-1 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">Catatan: {item.note}</p>}
                                                <div className="mt-2.5">
                                                    <div className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-white shadow-sm">
                                                        <button onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)} className="px-3 text-slate-500 hover:text-orange-500 transition-colors font-bold">-</button>
                                                        <span className="w-4 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)} className="px-3 text-slate-500 hover:text-orange-500 transition-colors font-bold">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Checkout Section (Sticky Glassmorphism) */}
                {cart.length > 0 && (
                    <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-[#FDFCF9]/90 backdrop-blur-xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                        {isShopClosed && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-lg">
                                <span className="text-xl">🌙</span>
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-wider">Toko Tutup</p>
                                    <p className="text-slate-400 text-xs font-medium mt-1">Pemesanan di luar jam operasional (10:00 - 19:00 WIB) tidak dapat diproses.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span>Subtotal</span>
                                <span className="text-slate-900">{formatPrice(cartTotal)}</span>
                            </div>
                            {orderType === "delivery" && (
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Ongkir {deliveryDistance > 0 && <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded ml-1 lowercase">{deliveryDistance.toFixed(1)} km</span>}</span>
                                    <span className="text-slate-900">{formatPrice(shippingCost)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 mt-2">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Bayar</span>
                                <span className="text-2xl font-black text-orange-500 tracking-tight">{formatPrice(finalTotal)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handlePayment}
                                disabled={isShopClosed}
                                className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 ${isShopClosed ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-slate-900 hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-500/20 active:scale-[0.98]'}`}
                            >
                                Bayar via QRIS / VA
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={isShopClosed}
                                className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isShopClosed ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-[#25D366] text-white hover:bg-[#1ebd5a] hover:shadow-xl hover:shadow-[#25D366]/20 active:scale-[0.98]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                Pesan via WhatsApp
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}