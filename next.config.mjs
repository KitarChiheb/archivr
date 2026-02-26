/** @type {import('next').NextConfig} */
// 📚 LEARN: next.config.mjs configures how Next.js builds and serves your app.
// We whitelist image domains so next/image can optimize remote images.
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'instagram.com' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
    ],
  },
};

export default nextConfig;
