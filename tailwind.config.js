/** @type {import('tailwindcss').Config} */
export default {
  content: ['./resources/views/**/*.blade.php', './resources/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      boxShadow: {
        soft: '0 18px 45px -18px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
};
