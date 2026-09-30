import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes de productos las sirve el backend desde `servidor/uploads`.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
