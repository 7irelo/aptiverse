import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Strip console.* from production bundles (errors kept so real failures still
  // surface in monitoring). Smaller payload for metered mobile data.
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
  experimental: {
    // Tree-shake barrel imports so pulling two icons or one hook does not drag
    // in the whole package. Biggest first-load win for this MUI-heavy app.
    // Only packages that are real dependencies are listed here.
    optimizePackageImports: [
      "@mui/material",
      "@mui/system",
      "@mui/icons-material",
      "@mui/x-charts",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "lucide-react",
      "@tanstack/react-query",
      "notistack",
    ],
  },
  images: {
    // Prefer AVIF then WebP; both are far smaller than JPEG/PNG on the same
    // quality, which matters most on mid-range Android over mobile data.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
