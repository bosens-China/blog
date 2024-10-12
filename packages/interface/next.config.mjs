/*
 * CI 输出目标不同
 */
const basePath = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/').at(1)}` : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  output: 'export',
  basePath,
};

export default nextConfig;
