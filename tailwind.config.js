/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // پالت مونوکروم الهام‌گرفته از Zara: سفید، مشکی و خاکستری‌های خیلی ملایم
        brand: {
          50: '#f7f7f7',
          100: '#efefef',
          200: '#e4e4e4',
          300: '#c7c7c7',
          400: '#9a9a9a',
          500: '#111111',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        lavender: {
          50: '#f7f7f7',
          100: '#efefef',
          200: '#e4e4e4',
          300: '#c7c7c7',
          400: '#8a8a8a',
          500: '#111111',
        },
        cream: '#fafafa',
        mint: '#fafafa',
        ink: {
          DEFAULT: '#111111',
          soft: '#5a5a5a',
          light: '#8f8f8f',
        },
        line: '#e5e5e5',
        // سازگاری با کلاس‌های قدیمی پروژه
        primary: {
          soft: '#efefef',
          warm: '#111111',
          DEFAULT: '#111111',
        },
        secondary: {
          cream: '#fafafa',
          mint: '#fafafa',
          lavender: '#efefef',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'system-ui', 'sans-serif'],
        soft: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        playful: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        rounded: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        'extra-large': '0',
        soft: '0',
        full: '9999px',
      },
      letterSpacing: {
        editorial: '0.28em',
        label: '0.16em',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      // Zara: بدون سایه؛ همه‌چیز تخت و خط‌محور
      boxShadow: {
        soft: 'none',
        warmer: 'none',
        cute: 'none',
        card: 'none',
      },
    },
  },
  plugins: [],
};
