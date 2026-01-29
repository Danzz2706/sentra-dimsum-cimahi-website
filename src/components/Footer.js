import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-text-primary text-white py-12 mt-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-secondary">
                                <Image
                                    src="/logo.jpeg"
                                    alt="Sentra Dimsum Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-secondary to-white bg-clip-text text-transparent">
                                Sentra Dimsum Cimahi
                            </h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed max-w-xs">
                            Menyajikan dimsum hangat dan lezat dengan cita rasa otentik. Halal, higienis, dan terjangkau.
                        </p>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-secondary">Lokasi Kami</h4>
                        <div className="space-y-2">
                            <p className="flex items-start gap-2 text-gray-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mt-1 shrink-0 text-secondary"
                                >
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>
                                    Jl. Cibaligo Cluster Pintu Air Kavling No. 03<br />
                                    Cigugur Tengah, Cimahi Tengah<br />
                                    Kota Cimahi, Jawa Barat 40522
                                </span>
                            </p>
                            <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-sm text-secondary hover:text-white transition-colors underline decoration-secondary"
                            >
                                Lihat di Google Maps
                            </a>
                        </div>
                    </div>

                    {/* Contact & Socials */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-secondary">Hubungi Kami</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>
                                <a
                                    href="https://wa.me/6281770697325"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    <span>+62-817-7069-7325</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.instagram.com/sentra_dimsum_cimahi/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                    <span>@sentra_dimsum_cimahi</span>
                                </a>
                            </li>
                        </ul>
                        <div className="pt-4 text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} Sentra Dimsum Cimahi. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
