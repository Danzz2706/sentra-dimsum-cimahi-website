import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { v4 as uuidv4 } from "uuid";

const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
    try {
        // Time Validation (Close at 20:00 WIB)
        const now = new Date();
        const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const currentHour = jakartaTime.getHours();

        if (currentHour >= 20 || currentHour < 10) {
            return NextResponse.json(
                { error: "Mohon maaf, pemesanan sudah ditutup. Kami buka pukul 10:00 - 20:00 WIB." },
                { status: 400 }
            );
        }

        const { items, gross_amount, customer_details } = await request.json();

        const parameter = {
            transaction_details: {
                order_id: `ORDER-${uuidv4()}`,
                gross_amount: gross_amount,
            },
            credit_card: {
                secure: true,
            },
            item_details: items.map((item) => ({
                id: item.uniqueId || item.id, // Use uniqueId if available
                price: item.price,
                quantity: item.quantity,
                name: item.name.substring(0, 50), // Midtrans name limit
            })),
            customer_details: {
                first_name: "Customer", // You can make this dynamic if you add a form
                last_name: "Sentra Dimsum",
                email: "customer@sentradimsum.com",
                phone: "081234567890",
                ...customer_details, // allow override
            },
        };

        const transaction = await snap.createTransaction(parameter);
        return NextResponse.json({ token: transaction.token });
    } catch (error) {
        console.error("Midtrans Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
