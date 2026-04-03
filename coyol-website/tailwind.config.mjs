/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Classic Land Rover Heritage Palette
        landrover: {
          // Greens
          'keswick': '#3D4F3D',      // Deep heritage green
          'coniston': '#4A5D4A',     // Medium expedition green
          'bronze': '#4E5B4E',       // Muted green
          'moss': '#5C6B5C',         // Lighter moss
          
          // Neutrals
          'limestone': '#D4C9B5',    // Warm stone
          'alaska': '#F5F3EF',       // Off-white
          'pangea': '#E8E2D6',       // Light warm gray
          'arles': '#BFB8A8',        // Medium warm gray
          
          // Earths
          'sand': '#C4A67C',         // Desert sand
          'terracotta': '#A65D3F',   // Warm earth
          'sahara': '#D4A574',       // Light sand
          
          // Darks
          'marine': '#2C3E50',       // Deep blue-gray
          'santorini': '#1A1F16',    // Almost black green
          'beluga': '#2B2B2B',       // Rich black
        },
        
        // Simplified aliases for common use
        primary: {
          50: '#F5F3EF',   // alaska
          100: '#E8E2D6',  // pangea
          200: '#D4C9B5',  // limestone
          300: '#BFB8A8',  // arles
          400: '#5C6B5C',  // moss
          500: '#4E5B4E',  // bronze
          600: '#4A5D4A',  // coniston
          700: '#3D4F3D',  // keswick
          800: '#2C3E50',  // marine
          900: '#1A1F16',  // santorini
        },
        
        accent: {
          sand: '#C4A67C',
          terracotta: '#A65D3F',
          sahara: '#D4A574',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
