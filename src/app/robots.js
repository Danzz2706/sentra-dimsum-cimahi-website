export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'],
        },
        sitemap: 'https://sentra-dimsum-cimahi.vercel.app/sitemap.xml', // Adjust domain if needed
    }
}
