import type { NextConfig } from 'next'

const config: NextConfig = {
  // Allow importing .glsl files as strings via raw-loader alternative
  webpack(cfg) {
    cfg.module.rules.push({
      test: /\.glsl$/,
      type: 'asset/source',
    })
    return cfg
  },
}

export default config
