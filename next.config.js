/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['hadith', 'sql.js'],
    outputFileTracingExcludes: {
      '/api/**': ['node_modules/hadith/data/**'],
    },
  },
};

const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

module.exports = withNextIntl(nextConfig);
