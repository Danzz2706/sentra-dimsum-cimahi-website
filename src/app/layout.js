import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: "Sentra Dimsum Cimahi",
  description: "Dimsum enak, halal, dan bikin nagih di Cimahi. Pesan sekarang!",
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${jakarta.variable} scroll-smooth`}>
      <body
        className={`antialiased font-sans flex flex-col min-h-screen bg-background text-text-primary selection:bg-primary selection:text-white`}
      >
        <script
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        ></script>
        {children}
      </body>
    </html>
  );
}

