import type { NextConfig } from "next";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "..", ".env") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', 
    },
  },
};



export default nextConfig;
