/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')([
  '@square/web-sdk',
  'react-square-web-payments-sdk'
]);
const { withPlaiceholder } = require('@plaiceholder/next');

const nextConfig = withTM(
  withPlaiceholder({
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
      esmExternals: true
    },
    images: {
      domains: [
        'items-images-production.s3.us-west-2.amazonaws.com',
        'square-catalog-sandbox.s3.amazonaws.com',
        'shippo-static-v2.s3.amazonaws.com'
      ]
    }
  })
);

module.exports = nextConfig;
