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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100"
        >
            {/* Image Container with Zoom Effect */}
            <div
                className="aspect-square relative overflow-hidden bg-gray-50 cursor-pointer"
                onClick={() => !isOutOfStock && onSelect(product)}
            >
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full relative"
                >
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={`object-cover ${isOutOfStock ? "grayscale opacity-70" : ""}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </motion.div>

                {/* Overlay Gradient on Hover */}
                {!isOutOfStock && (
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                )}

                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                    {product.is_popular && (
                        <div className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-black shadow-sm backdrop-blur-sm bg-opacity-90">
                            Top Seller 🔥
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="rounded-full bg-gray-800 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm bg-opacity-90">
                            Habis
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        onClick={() => !isOutOfStock && onSelect(product)}
                        disabled={isOutOfStock}
                        className={`relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold text-white transition-all shadow-md active:scale-95 group/btn ${isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-text-primary hover:bg-primary hover:shadow-lg"}`}
                    >
                        <span className="relative z-10 flex items-center gap-1">
                            {isOutOfStock ? "Habis" : (
                                <>Add <span className="text-xs">+</span></>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
