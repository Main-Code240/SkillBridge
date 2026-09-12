/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1143A3',
          strong: '#02277A',
          medium: '#1747A6',
          secondary: '#006FFF',
          accent: '#3E70FF',
          light: '#5186CD',
        },
        surface: {
          bg: '#F4F8FF',
          white: '#FFFFFF',
          border: '#E5E7EB',
        },
        ink: {
          DEFAULT: '#111827',
          muted: '#667085',
        },
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(17, 67, 163, 0.06)',
        card: '0 1px 3px rgba(17, 67, 163, 0.08), 0 1px 2px rgba(17, 67, 163, 0.04)',
        elevated: '0 4px 16px rgba(17, 67, 163, 0.10)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
