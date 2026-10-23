import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Ảnh avatar Roblox được phục vụ từ CDN *.rbxcdn.com
    remotePatterns: [{ protocol: "https", hostname: "**.rbxcdn.com" }],
  },
};

export default nextConfig;
