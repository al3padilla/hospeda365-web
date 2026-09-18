import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite HMR / assets de desarrollo al abrir desde la red local
  allowedDevOrigins: ["192.168.1.60"],
};

export default nextConfig;
