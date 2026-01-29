"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: 100,
        category: "Mentai",
        image: "",
        is_popular: false,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("id", { ascending: false });

        if (!error) setProducts(data || []);
        setLoading(false);
    }

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock || 0,
            category: product.category,
            image: product.image,
            is_popular: product.is_popular || false,
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            stock: 100,
            category: "Mentai",
            image: "",
            is_popular: false,
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus produk ini?")) return;

        const { error } = await supabase.from("products").delete().eq("id", id);
        if (!error) {
            fetchProducts();
        } else {
            alert("Gagal menghapus produk");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseInt(formData.price),
            stock: parseInt(formData.stock),
        };

        if (currentProduct) {
            // Update
            const { error } = await supabase
                .from("products")
                .update(payload)
                .eq("id", currentProduct.id);
            if (error) alert("Gagal update produk");
        } else {
            // Create
            const { error } = await supabase.from("products").insert([payload]);
            if (error) alert("Gagal tambah produk");
        }

        setIsEditing(false);
        fetchProducts();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Produk</h1>
                <button
                    onClick={handleAddNew}
                    className="rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary-dark"
                >
                    + Tambah Produk
                </button>
            </div>

            {/* Product List */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Produk</th>
                            <th className="px-6 py-4 font-medium">Kategori</th>
                            <th className="px-6 py-4 font-medium">Harga</th>
                            <th className="px-6 py-4 font-medium">Stok</th>
                            <th className="px-6 py-4 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    Rp {product.price.toLocaleString("id-ID")}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {product.stock}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="mr-2 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                        >
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                {currentProduct ? "Edit Produk" : "Tambah Produk Baru"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                        rows="2"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Harga</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Stok</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                    >
                                        {["Mentai", "Kukus", "Goreng", "Frozen", "Minuman", "Cimol"].map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Gambar</label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_popular"
                                        checked={formData.is_popular}
                                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="is_popular" className="text-sm font-medium text-gray-700">Produk Unggulan (Top Seller)</label>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 rounded-lg bg-gray-100 py-2 font-medium text-gray-700 hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-lg bg-primary py-2 font-bold text-white hover:bg-primary-dark"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
