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
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Memuat Peta...</div>
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

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
        };

        if (isCartOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isCartOpen, setIsCartOpen]);

    const router = useRouter();

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const [customerData, setCustomerData] = useState({
        name: "",
        phone: "",
        address: "",
    });
    const [orderType, setOrderType] = useState("takeaway"); // 'takeaway' or 'delivery'
    const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
    const [isShopClosed, setIsShopClosed] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
            const hour = jakartaTime.getHours();
            setIsShopClosed(hour >= 20 || hour < 10);
        };

        checkTime();
        // Update every minute
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Store Settings & Shipping Logic
    const [storeSettings, setStoreSettings] = useState(null);
    const [shippingCost, setShippingCost] = useState(0);
    const [deliveryDistance, setDeliveryDistance] = useState(0);
    const [deliveryCoords, setDeliveryCoords] = useState(null);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

    // Search & Geocoding Logic
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Search Address (Nominatim)
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
                // Prioritize Indonesia bounds: 95.0, -11.0, 141.0, 6.0
                const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&bbox=106.0,-8.0,109.0,-6.0&limit=5`);
                // Bounds focused on West Java for better local results, or remove bbox for global

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

    const handleSelectResult = (result) => {
        // MapTiler returns center as [lng, lat]
        const lng = result.center[0];
        const lat = result.center[1];

        // Update Map Center & Pin
        setDeliveryCoords({ lat, lng });

        // Update Address Text
        const formattedAddress = result.place_name;
        setCustomerData(prev => ({
            ...prev,
            address: formattedAddress
        }));

        // Clear search
        setSearchQuery(""); // Or keep it? Clearing looks cleaner for "selection made"
        setSearchResults([]);
    };

    useEffect(() => {
        // Fetch store settings
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').single();
            if (data) {
                setStoreSettings(data);
                // Set default shipping cost if not using map yet
                if (orderType === 'delivery') {
                    setShippingCost(data.shipping_cost || 10000);
                }
            }
        };
        fetchSettings();
    }, [orderType]);

    const handleLocationSelect = (location) => {
        if (!storeSettings) return;

        setDeliveryDistance(location.distance);
        setDeliveryCoords({ lat: location.lat, lng: location.lng });

        // Calculate Cost: Distance * Price/KM
        // If distance is very close (< 1km), use minimum shipping cost
        const calculatedCost = Math.max(
            storeSettings.shipping_cost,
            Math.ceil(location.distance * (storeSettings.price_per_km || 2000))
        );

        setShippingCost(calculatedCost);

        // Use specific address from geocoding if available, else standard fallback
        if (location.address) {
            setCustomerData(prev => ({
                ...prev,
                address: location.address
            }));
        } else if (!customerData.address) {
            setCustomerData(prev => ({
                ...prev,
                address: `Lokasi Map: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
            }));
        }
    };

    const finalTotal = cartTotal + (orderType === "delivery" ? shippingCost : 0);

    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check auth and auto-fill
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

    const handleCheckout = async () => {
        if (isShopClosed) {
            alert("Mohon maaf, pemesanan sudah ditutup (Tutup pukul 20:00 WIB). Silahkan datang lagi besok!");
            return;
        }
        if (!customerData.name || !customerData.phone) {
            alert("Mohon lengkapi Nama dan No. HP");
            return;
        }

        if (orderType === 'delivery' && !customerData.address) {
            alert("Mohon lengkapi Alamat Pengiriman");
            return;
        }

        if (orderType === 'delivery' && !deliveryCoords && storeSettings?.store_lat) {
            // If map is enabled but user hasn't picked location
            // You might want to enforce map selection, or just allow manual address
        }

        try {
            // 1. Save Order to Supabase
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert([
                    {
                        user_id: user?.id || null,
                        customer_name: customerData.name,
                        customer_phone: customerData.phone,
                        customer_address: orderType === 'takeaway'
                            ? `AMBIL SENDIRI: ${selectedBranch.name}`
                            : `${customerData.address} (Dikirim dari: ${selectedBranch.name})`,
                        total_price: finalTotal,
                        items: cart,
                        status: "pending",
                        order_type: orderType,
                        payment_method: "whatsapp",
                        // Store delivery details in metadata if needed, or just append to address
                    },
                ])
                .select()
                .single();

            if (orderError) {
                console.error("Order Error:", orderError);
                alert("Gagal membuat pesanan");
                return;
            }

            // 2. Clear Cart & Redirect
            clearCart();
            setIsCartOpen(false);
            router.push(`/order/${orderData.id}`);

        } catch (error) {
            console.error("Checkout error:", error);
            alert("Terjadi kesalahan sistem");
        }
    };

    const handlePayment = async () => {
        if (isShopClosed) {
            alert("Mohon maaf, pemesanan sudah ditutup (Tutup pukul 20:00 WIB).");
            return;
        }
        if (!customerData.name || !customerData.phone) {
            alert("Mohon lengkapi Nama dan No. HP");
            return;
        }

        if (orderType === 'delivery' && !customerData.address) {
            alert("Mohon lengkapi Alamat Pengiriman");
            return;
        }

        try {
            // 1. Save Order to Supabase
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert([
                    {
                        user_id: user?.id || null,
                        customer_name: customerData.name,
                        customer_phone: customerData.phone,
                        customer_address: orderType === 'takeaway'
                            ? `AMBIL SENDIRI: ${selectedBranch.name}`
                            : `${customerData.address} (Dikirim dari: ${selectedBranch.name})`,
                        total_price: finalTotal,
                        items: cart,
                        status: "pending",
                        order_type: orderType,
                        payment_method: "qris"
                    },
                ])
                .select()
                .single();

            if (orderError) {
                console.error("Order Error:", orderError);
                alert("Gagal membuat pesanan");
                return;
            }

            // 2. Process Payment with Midtrans
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
                        billing_address: {
                            address: customerData.address,
                        },
                    },
                }),
            });

            const data = await response.json();

            if (data.token) {
                window.snap.pay(data.token, {
                    onSuccess: async function (result) {
                        // Update status to paid
                        await supabase
                            .from("orders")
                            .update({ status: "paid" })
                            .eq("id", orderData.id);

                        clearCart();
                        setIsCartOpen(false);
                        router.push(`/order/${orderData.id}`);
                    },
                    onPending: function (result) {
                        router.push(`/order/${orderData.id}`);
                    },
                    onError: function (result) {
                        alert("Pembayaran Gagal!");
                    },
                    onClose: function () {
                        console.log("Customer closed the popup without finishing the payment");
                    },
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
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div
                ref={drawerRef}
                className="flex h-full w-full sm:max-w-md flex-col bg-surface/95 glass shadow-2xl transition-transform duration-300 animate-in slide-in-from-right"
            >
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-xl font-bold font-sans text-primary">Shopping Cart</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="rounded-full p-2 transition-colors hover:bg-red-50 text-text-secondary hover:text-primary"
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
                            className="h-6 w-6"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Customer Data Form */}
                    {cart.length > 0 && (
                        <div className="mb-6 space-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                            <h3 className="font-bold text-gray-900">Data Pemesan</h3>

                            {/* Order Type Selection */}
                            <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
                                <button
                                    onClick={() => setOrderType("takeaway")}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${orderType === "takeaway" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Ambil Sendiri
                                </button>
                                <button
                                    onClick={() => setOrderType("delivery")}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${orderType === "delivery" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Diantar (Delivery)
                                </button>
                            </div>

                            {/* Branch Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                    {orderType === "takeaway" ? "Pilih Lokasi Pengambilan" : "Dikirim dari Cabang"}
                                </label>
                                <select
                                    value={selectedBranch.id}
                                    onChange={(e) => {
                                        const branch = BRANCHES.find(b => b.id === parseInt(e.target.value));
                                        setSelectedBranch(branch);
                                    }}
                                    className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-primary bg-white"
                                >
                                    {BRANCHES.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                {orderType === "takeaway" && (
                                    <p className="text-xs text-gray-500">{selectedBranch.address}</p>
                                )}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={customerData.name}
                                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Nomor WhatsApp"
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-primary"
                                />
                            </div>

                            {/* Map for Delivery */}
                            {orderType === "delivery" && storeSettings && storeSettings.store_lat && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Cari Lokasi Pengantaran</label>
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative z-20">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Cari jalan, gedung, atau daerah..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {isSearching && (
                                                <div className="absolute right-3 top-2.5">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Search Results Dropdown */}
                                        {searchResults.length > 0 && (
                                            <ul className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                                {searchResults.map((result, index) => (
                                                    <li
                                                        key={result.id || index}
                                                        onClick={() => handleSelectResult(result)}
                                                        className="cursor-pointer border-b border-gray-50 px-4 py-3 hover:bg-gray-50 last:border-b-0"
                                                    >
                                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{result.text}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-2">{result.place_name}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <LocationPicker
                                        storeLocation={{ lat: selectedBranch.lat, lng: selectedBranch.lng }}
                                        onLocationSelect={handleLocationSelect}
                                        selectedPosition={deliveryCoords}
                                    />
                                </div>
                            )}

                            {orderType === "delivery" && (
                                <div>
                                    <textarea
                                        placeholder="Detail Alamat (Nomor Rumah, Blok, Patokan, dll)"
                                        value={customerData.address}
                                        onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-primary resize-none"
                                        rows="2"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">*Pastikan pin lokasi di peta sudah sesuai</p>
                                </div>
                            )}
                        </div>
                    )}

                    {cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
                            <div className="rounded-full bg-secondary/10 p-8 ring-1 ring-secondary/20">
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
                                    className="h-12 w-12 text-secondary"
                                >
                                    <circle cx="8" cy="21" r="1" />
                                    <circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-bold text-text-primary">
                                    Keranjang Kosong
                                </p>
                                <p className="text-base text-text-secondary max-w-[200px] mx-auto">
                                    Yuk, isi dengan dimsum favoritmu yang lezat!
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-lg active:scale-95"
                            >
                                Mulai Belanja
                            </button>
                        </div>
                    ) : (
                        <ul className="space-y-6">
                            {cart.map((item) => (
                                <li key={item.uniqueId} className="flex gap-4 group">
                                    <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-gray-100 border border-gray-200 shadow-sm shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-lg text-text-primary line-clamp-1">
                                                {item.name}
                                            </h3>
                                            <p className="font-semibold text-primary">
                                                {formatPrice(item.price)}
                                            </p>
                                            {item.note && (
                                                <p className="text-xs text-text-secondary bg-gray-50 p-1 rounded mt-1 border border-gray-100 italic">
                                                    Note: {item.note}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.uniqueId, item.quantity - 1)
                                                    }
                                                    className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-secondary transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.uniqueId, item.quantity + 1)
                                                    }
                                                    className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-secondary transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.uniqueId)}
                                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors underline decoration-red-200 hover:decoration-red-500"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="border-t bg-gray-50/50 p-6 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            {orderType === "delivery" && (
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Ongkos Kirim {deliveryDistance > 0 && `(${deliveryDistance.toFixed(1)} km)`}</span>
                                    <span>{formatPrice(shippingCost)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                <span className="text-text-secondary">Total</span>
                                <span className="text-primary text-xl">{formatPrice(finalTotal)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={isShopClosed}
                            className={`w-full rounded-full px-4 py-4 font-bold text-white transition-all flex items-center justify-center gap-2 ${isShopClosed ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 active:scale-95'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                            Bayar Sekarang (QRIS)
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={isShopClosed}
                            className={`w-full rounded-full px-4 py-4 font-bold text-white transition-all flex items-center justify-center gap-2 ${isShopClosed ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 active:scale-95'}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            Checkout via WhatsApp
                        </button>

                        {isShopClosed && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 mx-6 text-center">
                                <p className="font-bold text-red-800">Toko Tutup</p>
                                <p className="text-sm text-red-600">Pemesanan ditutup. Buka pukul 10:00 - 20:00 WIB.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
