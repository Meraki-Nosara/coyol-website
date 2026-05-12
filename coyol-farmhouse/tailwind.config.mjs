/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'lr-keswick': '#3D4F3D',
        'lr-moss': '#4A5D4A',
        'lr-limestone': '#D4C9B5',
        'lr-alaska': '#F5F3EF',
        'lr-santorini': '#1A1F16',
        'lr-sand': '#C4A67C',
        'lr-terracotta': '#A65D3F',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
