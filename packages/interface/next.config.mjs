import createMDX from '@next/mdx';

/*
 * CI 输出目标不同
 */
const basePath = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/').at(1)}` : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  experimental: {
    typedRoutes: true,
    webVitalsAttribution: ['CLS', 'LCP'],
    cssChunking: 'loose',
  },
  productionBrowserSourceMaps: false,
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
