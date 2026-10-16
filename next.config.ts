import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Origen autorizado para desarrollo en red local. */
  allowedDevOrigins: ["192.168.1.60"],
};

export default nextConfig;
