import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["tutacall.com", "*.tutacall.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "8t3tvxukef.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
