import mdx from "@next/mdx";
const withMDX = mdx();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // typedRoutes: true,
    webVitalsAttribution: ["CLS", "LCP"],
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/page",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default withMDX(nextConfig);
