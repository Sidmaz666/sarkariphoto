import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable etags in dev so browsers always fetch fresh content
  generateEtags: false,
  // Ensure we don't cache HTML responses
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
        { key: "Pragma", value: "no-cache" },
        { key: "Expires", value: "0" },
      ],
    },
  ],
  // React strict mode for catching side-effect bugs
  reactStrictMode: true,
};

export default nextConfig;
