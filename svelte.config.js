import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true
    })
  ],
  kit: {
    adapter: adapter(),
    alias: {
      $constants: 'src/constants.ts',
      $types: 'src/types.ts',
      $ui: 'src/ui',
      $utils: 'src/utils',
      $icons: 'src/icons',
      $components: 'src/components',
      $stores: 'src/stores',
      $server: 'src/server',
      $models: 'src/models'
    }
  }
};

export default config;
