"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

const CATEGORIES = ["Semua", "Mentai", "Kukus", "Goreng", "Frozen", "Minuman", "Cimol"];


const LOCATIONS = [
    {
        id: 0,
        title: "Kantor Pusat",
        address: "Jl. Cibaligo Cluster Pintu Air Kavling No. 03",
        time: "10:00 - 19:00 WIB",
        map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31686.04997575213!2d107.55205045465941!3d-6.919717096382213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5daa8471cbf%3A0x673b0abcb7153ab!2sSentra%20Dimsum%20Cimahi%20(%20Pusat%20)!5e0!3m2!1sid!2sid!4v1769713096009!5m2!1sid!2sid",
        theme: "bg-white text-slate-900 border-slate-200",
        tag: "Production Hub"
    },
    {
        id: 1,
        title: "Cabang Melong",
        address: "Jl. Melong 3 No.30, Melong, Cimahi Selatan",
        time: "10:00 - 19:00 WIB",
        map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.724770055309!2d107.5584244749966!3d-6.923467993076258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5003cfebfc3%3A0x7d8c6b11490c9bf8!2sSentra%20Dimsum%20Cimahi%203!5e0!3m2!1sid!2sid!4v1769711917409!5m2!1sid!2sid",
        theme: "bg-orange-500 text-white border-orange-400",
        tag: "Kitchen Branch"
    },
    {
        id: 2,
        title: "Cabang Cibaligo",
        address: "Jl. Cigugur Tengah No.13, Cigugur Tengah, Cimahi Tengah",
        time: "10:00 - 19:00 WIB",
        map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.928551898608!2d107.55321771160152!3d-6.899148693071311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e5288e9df909%3A0x1825d20010709361!2sSentra%20Dimsum%20Cimahi%202!5e0!3m2!1sid!2sid!4v1769711951166!5m2!1sid!2sid",
        theme: "bg-[#111] text-white border-[#222]",
        tag: "Quick Service"
    }
];
export default function Home() {
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error } = await supabase.from("products").select("*");
            if (error) console.error("Error fetching products:", error);
            else setProducts(data || []);
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery, products]);

    return (
        <div className="min-h-screen bg-[#FDFCF9] text-slate-900 selection:bg-orange-500 selection:text-white font-sans">

            {/* 1. HERO SECTION (Premium Editorial) */}
            <section className="relative h-[90svh] flex items-center justify-center overflow-hidden bg-[#0a0a0a] rounded-b-[2.5rem] md:rounded-b-[4rem] lg:rounded-b-[5rem] shadow-2xl">
                <motion.div style={{ y: yHero, opacity: opacityHero }} className="container mx-auto px-4 z-10 text-center w-full">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <p className="text-orange-500 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs mb-6 md:mb-8">
                            Premium Taste • Halal
                        </p>
                        <h1 className="text-[16vw] sm:text-[14vw] md:text-[11vw] font-black leading-[0.8] tracking-tighter text-white flex flex-col items-center justify-center">
                            <span>SENTRA</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 italic mt-2">DIMSUM</span>
                        </h1>

                        <div className="mt-12 md:mt-16 flex items-center justify-center">
                            <button
                                onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-3.5 md:px-10 md:py-4 bg-white text-slate-900 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-xl hover:shadow-orange-500/25 active:scale-95"
                            >
                                Jelajahi Menu
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/30 via-transparent to-transparent opacity-80"></div>
            </section>

            {/* 2. MENU SECTION (Aesthetic Mesh Gradient Background) */}
            <section id="menu" className="relative pt-12 md:pt-20 pb-24 md:pb-32 px-4 sm:px-6 z-10 overflow-hidden">

                {/* --- BACKGROUND ESTETIK (Kelihatan & Elegan) --- */}
                {/* Base color: Bukan putih, tapi perpaduan Cream, Beige, dan Soft Orange */}
                <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#FDFBF7] via-[#F3EFE6] to-[#EBE5D8]"></div>

                {/* Blur Blobs / Mesh Gradient */}
                <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden opacity-60">
                    {/* Bola warna Oranye Hangat di Kiri Atas */}
                    <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-orange-200/60 rounded-full mix-blend-multiply filter blur-[120px]"></div>

                    {/* Bola warna Kuning/Amber di Kanan Tengah */}
                    <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-amber-100/70 rounded-full mix-blend-multiply filter blur-[100px]"></div>

                    {/* Bola warna Sand/Batu di Kiri Bawah */}
                    <div className="absolute -bottom-[10%] left-[10%] w-[70vw] h-[50vw] bg-stone-200/80 rounded-full mix-blend-multiply filter blur-[120px]"></div>
                </div>
                {/* ----------------------------------------------- */}

                <div className="container mx-auto max-w-7xl relative">

                    {/* Floating Category & Search Bar - Glassmorphism */}
                    <div className="sticky top-4 md:top-6 z-40 mb-12 md:mb-20">
                        <motion.div
                            className="bg-white/60 backdrop-blur-2xl p-4 md:p-5 rounded-[2rem] border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col gap-4"
                        >
                            {/* Search Input */}
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Cari menu dimsum favoritmu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/80 border border-slate-200 rounded-full px-5 py-3.5 pl-12 text-sm font-medium text-slate-900 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 focus:bg-white shadow-inner placeholder:text-slate-400"
                                />
                                <span className="absolute left-4 top-3.5 text-lg grayscale opacity-40">🔍</span>
                            </div>

                            {/* Horizontal Scrollable Categories */}
                            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide snap-x">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`snap-center shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === cat
                                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-100'
                                                : 'bg-white/50 text-slate-600 border border-white hover:bg-white hover:text-slate-900 hover:shadow-sm scale-95 hover:scale-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Judul Kategori */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-12 gap-4 px-2">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900 drop-shadow-sm">
                            {activeCategory}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-orange-400/50 hidden md:block"></span>
                            <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/60">
                                {filteredProducts.length} Items
                            </p>
                        </div>
                    </div>

                    {/* Grid Produk */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="aspect-[4/5] bg-white/40 rounded-[2rem] animate-pulse border border-white/50" />
                            ))}
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (idx % 4) * 0.05 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                    >
                                        <ProductCard product={product} onSelect={setSelectedProduct} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* State Kosong */}
                    {!loading && filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 md:py-40 px-4 text-center">
                            <div className="w-24 h-24 bg-white/50 backdrop-blur-md border border-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-4xl grayscale opacity-40">🥟</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-black text-slate-400 uppercase tracking-widest">Menu Tidak Ditemukan</p>
                            <p className="text-slate-500 mt-3 font-medium text-sm">Coba gunakan kata kunci atau kategori lain.</p>
                        </div>
                    )}
                </div>
            </section>
            {/* 3. LOCATION SECTION (The Bento) */}
            <section className="bg-slate-100 py-20 md:py-32 rounded-[2.5rem] md:rounded-[4rem] lg:rounded-[5rem] mx-4 sm:mx-6 my-12 md:my-20">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-12 md:mb-20 gap-6 lg:gap-8">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] uppercase">
                            Kunjungi <br /> <span className="text-orange-500 italic">Outlet Kami.</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-xs text-sm md:text-base lg:text-right">
                            Datang langsung untuk mendapatkan rasa dan pengalaman yang paling fresh.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {LOCATIONS.map((loc) => (
                            <motion.div
                                key={loc.id}
                                whileHover={{ y: -5 }}
                                className={`rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-sm border ${loc.theme} ${loc.gridSpan}`}
                            >
                                <div className="mb-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                                            {loc.tag}
                                        </span>
                                        <span className={`text-[10px] font-bold opacity-80 px-2.5 py-1 rounded-md ${loc.id === 0 ? 'bg-black/5' : 'bg-white/10'}`}>
                                            {loc.time}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black uppercase italic leading-none mb-3">
                                        {loc.title}
                                    </h3>
                                    <p className="text-sm opacity-80 leading-relaxed max-w-md font-medium">
                                        {loc.address}
                                    </p>
                                </div>
                                <div className="mt-auto h-48 sm:h-64 rounded-2xl md:rounded-[1.5rem] overflow-hidden bg-black/5 border border-white/10 relative">
                                    <iframe
                                        src={loc.map}
                                        className={`absolute inset-0 w-full h-full border-0 transition-all duration-700 ${loc.id === 2 ? 'grayscale invert opacity-50 hover:opacity-100 hover:grayscale-0' : 'grayscale hover:grayscale-0'}`}
                                        loading="lazy"
                                        allowFullScreen
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. MODAL & FOOTER */}
            <footer className="py-16 md:py-24 px-4 text-center border-t border-slate-100 overflow-hidden">
                <h2 className="text-[15vw] md:text-[12vw] font-black text-slate-100 leading-none select-none tracking-tighter">
                    SENTRA
                </h2>
                <p className="text-slate-400 font-bold tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[10px] uppercase mt-4 md:mt-2">
                    Premium Dimsum Experience Cimahi
                </p>
            </footer>

            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}