export default function manifest() {
    return {
        name: 'Sentra Dimsum Cimahi',
        short_name: 'Sentra Dimsum',
        description: 'Dimsum enak, halal, dan bikin nagih di Cimahi.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#F97316',
        icons: [
            {
                src: '/logo.jpeg',
                sizes: '192x192',
                type: 'image/jpeg',
            },
            {
                src: '/logo.jpeg',
                sizes: '512x512',
                type: 'image/jpeg',
            },
        ],
    }
}
