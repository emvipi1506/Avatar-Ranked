import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Có package-lock.json khác ở thư mục cha, chỉ định root để Next không đoán sai
  outputFileTracingRoot: process.cwd(),
  images: {
    // Ảnh avatar Roblox được phục vụ từ CDN *.rbxcdn.com
    remotePatterns: [{ protocol: "https", hostname: "**.rbxcdn.com" }],
  },
};

export default nextConfig;
