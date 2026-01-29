# Sentra Dimsum Cimahi

Aplikasi web untuk manajemen dan pemesanan Dimsum, dibangun dengan Next.js 15, Supabase, dan Midtrans.

## Fitur Utama

- **Katalog Produk**: Menampilkan menu dimsum yang tersedia.
- **Pemesanan Online**: Integrasi dengan Midtrans untuk pembayaran.
- **Manajemen Lokasi**: Pengiriman berbasis lokasi menggunakan Leaflet map.
- **Admin Dashboard**: Manajemen produk, pesanan, dan pengaturan toko.
- **Autentikasi**: Login aman menggunakan Supabase Auth.

## Teknologi yang Digunakan

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Payment Gateway**: Midtrans
- **Maps**: Leaflet, React-Leaflet
- **UI Components**: Lucide React, Sonner (Toast)

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan, misal v18 atau v20)
- [npm](https://www.npmjs.com/) atau package manager lain (yarn/pnpm/bun)

## Cara Instalasi

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

1.  **Clone Repository**

    ```bash
    git clone https://github.com/username/sentra-dimsum-cimahi.git
    cd sentra-dimsum-cimahi
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    # atau
    yarn install
    # atau
    pnpm install
    ```

3.  **Konfigurasi Environment Variables**

    Buat file `.env.local` di direktori root proyek dan salin konfigurasi berikut. Isi nilai-nilainya sesuai dengan kredensial akun Supabase dan Midtrans Anda.

    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

    # Midtrans Configuration
    MIDTRANS_SERVER_KEY=your_midtrans_server_key
    MIDTRANS_CLIENT_KEY=your_midtrans_client_key
    ```

    > **Catatan**: `SUPABASE_SERVICE_ROLE_KEY` diperlukan untuk operasi admin tertentu yang mem-bypass RLS (Row Level Security). Jaga kerahasiaan key ini.

4.  **Jalankan Development Server**

    ```bash
    npm run dev
    ```

    Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi.

## Struktur Folder

- `src/app`: Halaman-halaman aplikasi (Next.js App Router).
- `src/components`: Komponen React yang dapat digunakan kembali.
- `src/lib`: Utilitas dan konfigurasi library (Supabase client, dll).
- `src/hooks`: Custom React hooks.
- `public`: Aset statis (gambar, icon).

## Deployment

Aplikasi ini dapat dengan mudah di-deploy ke [Vercel](https://vercel.com/).

1.  Push kode Anda ke repository Git (GitHub/GitLab/Bitbucket).
2.  Import project ke Vercel.
3.  Masukkan Environment Variables yang sama seperti di `.env.local` ke pengaturan project di Vercel.
4.  Deploy!
