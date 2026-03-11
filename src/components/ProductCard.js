"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductCard({ product, onSelect }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const isOutOfStock = (product.stock || 0) <= 0;

    return (
        <motion.div
            className="group relative flex flex-col gap-4 cursor-pointer w-full"
            onClick={() => !isOutOfStock && onSelect(product)}
        >
            {/* Image Container (Editorial Style 4/5 Aspect Ratio) */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-orange-500/10">
                <motion.div
                    className="h-full w-full relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={`object-cover ${isOutOfStock ? "grayscale opacity-50" : ""}`}
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                </motion.div>

                {/* Subtle Gradient Overlay */}
                {!isOutOfStock && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    {product.is_popular ? (
                        <div className="rounded-full bg-white/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 shadow-sm">
                            Signature
                        </div>
                    ) : <div></div>}

                    {isOutOfStock && (
                        <div className="rounded-full bg-slate-900/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                            Sold Out
                        </div>
                    )}
                </div>

                {/* Hover Quick Add Button (Desktop Only) */}
                {!isOutOfStock && (
                    <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden md:flex">
                        <div className="w-full rounded-full bg-white/90 backdrop-blur-md py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-900 shadow-lg">
                            + Tambah Pesanan
                        </div>
                    </div>
                )}
            </div>

            {/* Content / Typography */}
            <div className="flex flex-col px-2">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 leading-none group-hover:text-orange-500 transition-colors">
                        {product.name}
                    </h3>
                    <span className="text-base md:text-lg font-bold text-slate-900 whitespace-nowrap">
                        {formatPrice(product.price)}
                    </span>
                </div>
                <p className="mt-2 text-xs md:text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {product.description}
                </p>
            </div>
        </motion.div>
    );
}