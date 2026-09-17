import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/nile-packs",
  assetPrefix: "/nile-packs",
  trailingSlash: true,
};

export default nextConfig;
