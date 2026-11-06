import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/ask", destination: "/", permanent: true },
      { source: "/display", destination: "/#display", permanent: true },
      { source: "/search", destination: "/#display", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  }
};

export default nextConfig;
