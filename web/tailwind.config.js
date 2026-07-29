/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBg: '#121212',
        brandWhite: '#FFFFFF',
        brandNeon: '#1DB954',
        brandDarkGray: '#121212',
        brandElevated: '#181818',
        brandHighlight: '#282828',
        brandMuted: '#B3B3B3',
        brandSecondary: '#8A8A8A',
        spotifyGreen: '#1DB954',
        spotifyGreenHover: '#1ED760',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
