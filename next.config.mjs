// next.config.mjs
import withMDX from '@next/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // let Next treat .mdx as pages/components
  pageExtensions: ['ts', 'tsx', 'mdx'],
  outputFileTracingIncludes: {
    '/api/java-compiler': ['./bin/**/*'],
  },
};

export default withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
})(nextConfig);
