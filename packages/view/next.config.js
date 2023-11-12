// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = require("@blog/user-data/src/data.json");

const argv = process.argv[2];

process.env["NEXT_PUBLIC_BASE_PATH"] =
  process.env.NODE_ENV === "production" ? `/${data.user.REPO}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: ["dev", "build"].includes(argv) ? "export" : undefined,
  experimental: {
    webpackBuildWorker: true,
  },
  // 添加部署路径
  basePath: process.env["NEXT_PUBLIC_BASE_PATH"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "user-images.githubusercontent.com",
        port: "",
        pathname: "/**/*",
      },
      // https:/p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/2/11/17033a0f5ed87f6c~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp
      {
        protocol: "https",
        hostname: "pic3.zhimg.com",
        port: "",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "*.byteimg.com",
        port: "",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "*.zhimg.com",
        port: "",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "user-gold-cdn.xitu.io",
        port: "",
        pathname: "/**/*",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.module.rules.push({
      test: /\.md$/i,
      type: "asset/source",
    });
    return config;
  },
};

module.exports = nextConfig;
