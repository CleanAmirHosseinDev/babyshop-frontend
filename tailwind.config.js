/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // پالت اصلی برند: صورتی ملایم نوزادی
        brand: {
          50: '#FFF5F8',
          100: '#FFE3ED',
          200: '#FFC9DC',
          300: '#FFA6C4',
          400: '#FF85AC',
          500: '#F76C9B',
          600: '#E25584',
          700: '#C13F6D',
          800: '#9E3056',
          900: '#7E2847',
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
          DEFAULT: '#3F3D46',
          soft: '#6B6873',
          light: '#9B98A3',
        },
        // سازگاری با کلاس‌های قدیمی پروژه
        primary: {
          soft: '#FFE3ED',
          warm: '#F76C9B',
          DEFAULT: '#F76C9B',
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
        soft: '0 10px 30px -15px rgba(247, 108, 155, 0.3)',
        warmer: '0 20px 40px -15px rgba(247, 108, 155, 0.4)',
        cute: '0 5px 15px rgba(255, 227, 237, 0.5)',
        card: '0 8px 30px -12px rgba(63, 61, 70, 0.15)',
      },
    },
  },
  plugins: [],
};
