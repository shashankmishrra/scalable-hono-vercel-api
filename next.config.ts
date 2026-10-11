import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Both application hostnames are served by this one dev server, so they must
  // be allowed to request dev assets/HMR (Next.js blocks cross-origin by default).
  allowedDevOrigins: ["app.localhost", "resource.localhost"],
};

export default nextConfig;
