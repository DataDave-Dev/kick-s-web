import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel";
import tailwindcss from '@tailwindcss/vite';

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