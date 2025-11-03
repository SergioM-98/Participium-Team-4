import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Aumenta il limite se necessario
    },
  },
};



export default nextConfig;
