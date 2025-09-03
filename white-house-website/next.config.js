/** @type {import('next').NextConfig} */
const nextConfig = {
  // 優化建置性能
  experimental: {
    turbo: {
      // 減少記憶體使用
      memoryLimit: 1024
    }
  },
  // 減少建置輸出
  output: 'standalone',
  // 關閉 source map 以減少記憶體使用
  productionBrowserSourceMaps: false
};

module.exports = nextConfig;