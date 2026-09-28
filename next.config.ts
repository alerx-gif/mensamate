import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    // Images go straight to wsrv.nl instead of Vercel's optimizer — see
    // src/lib/imageLoader.ts. This is what keeps image transformations off the
    // Vercel quota.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    // The card image is at most 400px wide and 200px tall, so the default
    // ladder (which runs to 3840px) only ever produced oversized variants.
    // Widest realistic need is a ~430px viewport at DPR 3.
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wsrv.nl",
      },
      {
        protocol: "https",
        hostname: "app.food2050.ch",
      },
      {
        protocol: "https",
        hostname: "idapps.ethz.ch",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  turbopack: {},
};

export default withPWA(nextConfig);
