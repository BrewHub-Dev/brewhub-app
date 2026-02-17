import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: false, // Desactiva el doble render en desarrollo
};

export default nextConfig;
