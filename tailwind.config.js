/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f8fc',
          100: '#eaeff8',
          200: '#d6deee',
          400: '#8592b0',
          500: '#5b6b8c',
          700: '#24365f',
          900: '#0b1a3a',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          500: '#2f6bff',
          600: '#1f55e6',
          700: '#1844bd',
        },
      },
    },
  },
  plugins: [],
};
