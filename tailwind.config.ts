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
          DEFAULT: '#38917d',
        },
        accent: {
          DEFAULT: '#604ab0',
        },
        border: {
          DEFAULT: '#eaeaea',
        },
        muted: {
          DEFAULT: '#afafaf',
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
