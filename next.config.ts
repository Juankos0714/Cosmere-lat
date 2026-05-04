import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['three', '@react-three/fiber', 'three-mesh-bvh'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  webpack(cfg) {
    cfg.module.rules.push({
      test: /\.glsl$/,
      type: 'asset/source',
    })
    return cfg
  },
}

export default config
