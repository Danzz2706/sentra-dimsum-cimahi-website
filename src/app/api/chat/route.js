import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
Kamu adalah Customer Service Assistant untuk "Sentra Dimsum Cimahi".
Tugasmu adalah menjawab pertanyaan pelanggan dengan ramah, santai, dan membantu.
Gunakan Bahasa Indonesia yang baik namun tidak kaku.

INFORMASI TOKO:
- Nama: Sentra Dimsum Cimahi
- Jam Buka: Setiap hari, 10:00 - 19:00 WIB.
- Lokasi Pusat: Jl. Cibaligo Cluster Pintu Air Kavling No. 03, Cigugur Tengah.
- Cabang:
  1. Melong: Jl. Melong 3 No.30, Melong, Kec. Cimahi Sel.
  2. Cibaligo: Jl. Cigugur Tengah No.13.

KEBIJAKAN:
- Halal: YA, 100% Halal.
- Pemesanan: Bisa lewat website ini (masukkan keranjang -> checkout) atau WhatsApp.
- Pembayaran: QRIS & Transfer Bank.
- Pengiriman: Bisa Delivery (ongkir menyesuaikan jarak) atau Ambil Sendiri (Takeaway).

ATURAN MENJAWAB:
- Jawablah hanya pertanyaan seputar menu, pemesanan, lokasi, dan info toko.
- Jika ditanya hal di luar konteks (misal: coding, politik, matematika), jawab dengan sopan bahwa kamu hanya bisa membantu soal dimsum.
- Arahkan pelanggan untuk "Hubungi Admin via WhatsApp" jika pertanyaan terlalu spesifik atau komplain pesanan.
- Jangan berikan kode program.
`;

export async function POST(req) {
    try {
        const { message, history } = await req.json();

        // Mencegah error urutan peran: Kita abaikan pesan sapaan pertama dari asisten di frontend
        const filteredHistory = history.filter((msg, index) => {
            if (index === 0 && msg.role === "assistant") return false;
            return true;
        });

        // Konversi format history dari frontend ke format Gemini
        const chatHistory = filteredHistory.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text }],
        }));

        // Gunakan gemini-1.5-flash agar lebih cepat, dan gunakan systemInstruction langsung
        // Ubah dari 2.0 menjadi 2.5
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // <--- GANTI JADI INI
            systemInstruction: SYSTEM_PROMPT
        });
        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error) {
        console.error("Gemini AI API Error:", error);
        return NextResponse.json(
            { error: "Maaf, asisten sedang sibuk. Silakan coba lagi atau hubungi admin." },
            { status: 500 }
        );
    }
}