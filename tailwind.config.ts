import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#020b1f',
        royal: '#075fe8',
        yellow: '#ffc107',
        ink: '#071327'
      },
      fontFamily: {
        display: ['Arial Black', 'Impact', 'sans-serif'],
        body: ['Inter', 'Arial', 'sans-serif']
      },
      boxShadow: { glow: '0 0 40px rgba(7,95,232,.25)' }
    }
  },
  plugins: []
}
export default config
