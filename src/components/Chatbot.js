"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Halo! 👋 Saya asisten virtual **Sentra Dimsum**. Ada yang bisa saya bantu?\n\nTanya saja soal menu, lokasi, atau jam buka!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, text: m.text }))
                }),
            });

            const data = await response.json();
            if (data.text) {
                setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
            } else {
                setMessages((prev) => [...prev, { role: "assistant", text: "Maaf, saya sedang pusing. Coba tanya lagi ya." }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { role: "assistant", text: "Terjadi kesalahan koneksi. Silakan cek internet Anda." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-2xl hover:scale-110 active:scale-95 transition-all"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ rotate: 5 }}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.8, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.8 }}
                        className="fixed bottom-28 right-4 z-[9999] flex h-[70vh] max-h-[650px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:right-6"
                    >
                        {/* Glassmorphism Header */}
                        <div className="relative bg-primary/95 p-5 text-white backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary bg-green-400"></span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold leading-none">Sentra AI</h3>
                                    <p className="mt-1 text-xs text-white/70">Selalu siap membantu Anda</p>
                                </div>
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 p-5 space-y-6">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm transition-all ${msg.role === "user"
                                                ? "bg-primary text-white rounded-br-none shadow-blue-100"
                                                : "bg-white text-slate-700 rounded-bl-none shadow-sm ring-1 ring-slate-100"
                                            } shadow-md`}
                                    >
                                        {msg.role === "assistant" ? (
                                            <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-strong:text-primary">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex items-center gap-1 bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Action Footer */}
                        <div className="border-t border-slate-100 bg-white p-4">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Tulis pertanyaan..."
                                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:grayscale"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-45" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                </button>
                            </form>

                            <div className="mt-3 flex items-center gap-2">
                                <div className="h-px flex-1 bg-slate-100"></div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Atau hubungi admin</span>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            <button
                                onClick={() => window.open("https://wa.me/6281770697325", "_blank")}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 py-2.5 text-xs font-bold text-green-600 transition-all hover:bg-green-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" /></svg>
                                WhatsApp Admin
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}