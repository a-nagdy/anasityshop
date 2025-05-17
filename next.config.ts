import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "localhost",
      "res.cloudinary.com",
      "via.placeholder.com",
      "placehold.co",
      "example.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],

  },
};

export default nextConfig;
