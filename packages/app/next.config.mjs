import mdx from "@next/mdx";
const withMDX = mdx();

// const isProduction = process.env.NODE_ENV === "production";

const output = process.argv[2] === "build" ? "export" : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    // typedRoutes: true,
    webVitalsAttribution: ["CLS", "LCP"],
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // ssg 不支持
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/page",
  //       permanent: true,
  //     },
  //   ];
  // },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "z.wiki",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default withMDX(nextConfig);
