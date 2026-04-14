import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWAConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /^\/_next\/static\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'next-static',
                expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
        },
        {
            urlPattern: /^\/_next\/image\?.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'next-image',
                expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
            },
        },
    ],
});

export default process.env.NODE_ENV === 'production' ? withPWAConfig(nextConfig) : nextConfig;
