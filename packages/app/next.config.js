/** @type {import('next').NextConfig} */

const isBuild = process.argv[2] === 'build';

const nextConfig = {
  output: isBuild ? 'export' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        // port: '',
        // pathname: '/account123/**',
      },
    ],
  },
}

module.exports = nextConfig
