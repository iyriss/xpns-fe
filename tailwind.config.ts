import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#9333ea', // purple-600
          active: '#7e22ce', // purple-700
        },
        accent: {
          DEFAULT: '#38917D',
        },
        border: {
          DEFAULT: '#eaeaea',
        },
        muted: {
          DEFAULT: '#6b7280',
        },
        'light-silver': {
          DEFAULT: '#D8D8D8',
        },
        error: {
          DEFAULT: '#c13615',
        },
        lead: {
          DEFAULT: '#1f1f1f',
        },

      },
    },
  },
  plugins: [],
} satisfies Config;
