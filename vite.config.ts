import glsl from './src';
import { defineConfig } from 'vite';

export default defineConfig({
  build: { sourcemap: true },
  plugins: [glsl(undefined, /\.(glsl|wgsl|vert|frag|vs|fs|shader\.js)$/i)],

  server: {
    port: 8080,
    open: true
  }
});
