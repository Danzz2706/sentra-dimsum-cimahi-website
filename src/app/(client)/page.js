"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import SearchFilter from "@/components/SearchFilter";
import ProductModal from "@/components/ProductModal";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Semua", "Mentai", "Kukus", "Goreng", "Frozen", "Minuman", "Cimol"];

export default function Home() {
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error } = await supabase.from("products").select("*");
            if (error) {
                console.error("Error fetching products:", error);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        }

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                activeCategory === "Semua" || product.category === activeCategory;
            const matchesSearch = product.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery, products]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="relative h-[300px] w-full overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 px-4 text-center text-white sm:h-[400px]">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.4, 0.6, 0.4]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/2 -left-1/2 h-[800px] w-[800px] rounded-full bg-white/20 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            x: [0, 100, 0],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-1/2 -right-1/2 h-[600px] w-[600px] rounded-full bg-yellow-300/20 blur-3xl"
                    />
                </div>

                <div className="relative z-10 flex h-full flex-col items-center justify-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl drop-shadow-md"
                    >
                        Sentra Dimsum Cimahi
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl text-lg font-medium text-white/95 sm:text-xl drop-shadow-sm"
                    >
                        Nikmati kelezatan dimsum premium dengan harga terjangkau. Halal,
                        enak, dan bikin nagih!
                    </motion.p>
                </div>
            </section>

            {/* Search & Filter Section */}
            <section className="sticky top-[70px] z-40 bg-white/80 px-4 py-4 backdrop-blur-md shadow-sm">
                <div className="container mx-auto max-w-6xl">
                    <SearchFilter
                        categories={CATEGORIES}
                        selectedCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>
            </section>

            {/* Product Grid */}
            <section className="container mx-auto max-w-6xl px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="mt-4 text-text-secondary animate-pulse">Memuat menu lezat...</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onSelect={setSelectedProduct}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="col-span-full flex flex-col items-center justify-center py-12 text-center text-text-secondary"
                                >
                                    <div className="rounded-full bg-gray-100 p-4 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    </div>
                                    <p className="text-lg font-medium">Menu tidak ditemukan</p>
                                    <p>Coba kata kunci lain atau pilih kategori berbeda.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Locations Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Lokasi Kami</h2>
                        <p className="mt-2 text-text-secondary">Kunjungi cabang terdekat kami di kota Anda</p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Cabang 1: Cimahi (Pusat) */}
                        <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-lg border border-gray-100">
                            <div className="relative h-48 w-full">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.033306969567!2d107.5544!3d-6.8925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJl.+Cibaligo+Cluster+Pintu+Air+Kavling+No.+03!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-primary">Cabang Cimahi (Pusat)</h3>
                                <p className="mt-2 text-sm text-gray-600">Jl. Cibaligo Cluster Pintu Air Kavling No. 03, Cigugur Tengah</p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span>10:00 - 20:00 WIB</span>
                                </div>
                            </div>
                        </div>

                        {/* Cabang 2: Melong */}
                        <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-lg border border-gray-100">
                            <div className="relative h-48 w-full">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.724770055309!2d107.5584244749966!3d-6.923467993076258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5003cfebfc3%3A0x7d8c6b11490c9bf8!2sSentra%20Dimsum%20Cimahi%203!5e0!3m2!1sid!2sid!4v1769711917409!5m2!1sid!2sid"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-primary">Cabang Melong</h3>
                                <p className="mt-2 text-sm text-gray-600">Jl. Melong 3 No.30, Melong, Kec. Cimahi Sel., Kota Cimahi</p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span>10:00 - 20:00 WIB</span>
                                </div>
                            </div>
                        </div>

                        {/* Cabang 3: Cibaligo */}
                        <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-lg border border-gray-100">
                            <div className="relative h-48 w-full">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.928551898608!2d107.55321771160152!3d-6.899148693071311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5288e9df909%3A0x1825d20010709361!2sSentra%20Dimsum%20Cimahi%202!5e0!3m2!1sid!2sid!4v1769711951166!5m2!1sid!2sid"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-primary">Cabang Cibaligo</h3>
                                <p className="mt-2 text-sm text-gray-600">Jl. Cigugur Tengah No.13, Cigugur Tengah, Cimahi Tengah</p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span>10:00 - 20:00 WIB</span>
                                </div>
                            </div>
                        </div>

                        {/* Cabang 4: Cimahi Utara (Cibabat) */}
                        <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-lg border border-gray-100">
                            <div className="relative h-48 w-full">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63378.38489543486!2d107.47866134863283!3d-6.872737299999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5006744d193%3A0x609f056dfbcdb69d!2sSentra%20Dimsum%20Cimahi%204!5e0!3m2!1sid!2sid!4v1769711886942!5m2!1sid!2sid"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-primary">Cabang Cimahi Utara</h3>
                                <p className="mt-2 text-sm text-gray-600">Jl. Raden Demang Hardjakusumah No.2, Cibabat, Cimahi Utara</p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span>10:00 - 20:00 WIB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}
