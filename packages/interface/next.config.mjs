/*
 * CI 输出目标不同
 */
const basePath = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/').at(1)}` : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
