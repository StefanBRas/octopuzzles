import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit({
      experimental: {
        prebundleSvelteLibraries: true
      }
    })
  ],
  experimental: {
    prebundleSvelteLibraries: true
  }
};

export default config;
