import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Explicitně nastavit class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './admin-kit/**/*.{js,ts,jsx,tsx,mdx}',
    './adminfunctions/**/*.{js,ts,jsx,tsx,mdx}', // Přidáno pro admin CMS
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-montserrat)', 'Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'salon': {
          gold: '#B8A876',
          'gold-dark': '#A39566',
          dark: '#212121',
          light: '#FAFAFA',
        }
      },
      letterSpacing: {
        'extra-wide': '0.3em',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config