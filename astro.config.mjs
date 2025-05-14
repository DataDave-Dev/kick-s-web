// @ts-check
import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel";
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', '@studio-freight/lenis']
    },
  },
  output: "server",
  adapter: vercel(),
});