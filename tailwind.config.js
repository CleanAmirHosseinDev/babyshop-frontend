/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // پالت اصلی برند: خنثی و مینیمال (الهام از Zara Kids)
        brand: {
          50: '#FAFAF8',
          100: '#F1F1ED',
          200: '#E3E3DC',
          300: '#CDCDC4',
          400: '#A8A89F',
          500: '#1F1F1D',
          600: '#151513',
          700: '#0D0D0C',
          800: '#070707',
          900: '#000000',
        },
        cream: '#FFF8F0',
        mint: '#E7F6F0',
        lavender: {
          50: '#F6F4FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
        },
        ink: {
          DEFAULT: '#191919',
          soft: '#63635E',
          light: '#97958D',
        },
        // سازگاری با کلاس‌های قدیمی پروژه
        primary: {
          soft: '#F1F1ED',
          warm: '#1F1F1D',
          DEFAULT: '#1F1F1D',
        },
        secondary: {
          cream: '#FFF8F0',
          mint: '#E7F6F0',
          lavender: '#EDE9FE',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'system-ui', 'sans-serif'],
        soft: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        playful: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        rounded: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        'extra-large': '3rem',
        soft: '2rem',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        float: 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(31, 31, 29, 0.18)',
        warmer: '0 20px 40px -15px rgba(31, 31, 29, 0.22)',
        cute: '0 5px 15px rgba(227, 227, 220, 0.5)',
        card: '0 8px 30px -12px rgba(25, 25, 25, 0.12)',
      },
    },
  },
  plugins: [],
};
