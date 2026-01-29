"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("sentra-dimsum-cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("sentra-dimsum-cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, note = "") => {
        setCart((prevCart) => {
            // Create a unique ID for the cart item based on product ID and note
            // If note is empty, we can just use the product ID, but consistent handling is better.
            // Let's use a composite ID: productID-note
            const uniqueId = `${product.id}-${note.trim()}`;

            const existingItem = prevCart.find((item) => item.uniqueId === uniqueId);

            if (existingItem) {
                return prevCart.map((item) =>
                    item.uniqueId === uniqueId
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            }

            return [...prevCart, {
                ...product,
                uniqueId,
                note: note.trim(),
                quantity: product.quantity || 1
            }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (uniqueId) => {
        setCart((prevCart) => prevCart.filter((item) => item.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(uniqueId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.uniqueId === uniqueId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isCartOpen,
                setIsCartOpen,
                toggleCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
