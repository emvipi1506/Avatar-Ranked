import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Có lockfile ở thư mục home; neo tracing root vào app để tránh cảnh báo.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Ảnh avatar Roblox được phục vụ từ CDN *.rbxcdn.com
    remotePatterns: [{ protocol: "https", hostname: "**.rbxcdn.com" }],
  },
};

export default nextConfig;
