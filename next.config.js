/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  env: {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  },
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
  // Disable static optimization for pages that need dynamic data
  async generateStaticParams() {
    return [];
  },
};

module.exports = nextConfig;
