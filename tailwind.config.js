export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 30px rgba(251, 191, 36, 0.45)'
      },
      colors: {
        sky: {
          950: '#0b1120'
        }
      }
    }
  },
  plugins: []
};
