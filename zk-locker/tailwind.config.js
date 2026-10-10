/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F1B3D', // Ink Navy — primary dark surface / text
          800: '#16234C',
          700: '#1D2E5E'
        },
        paper: '#F7F5F0', // Paper — light background
        signal: {
          DEFAULT: '#E8873A', // Saffron Signal — primary accent
          600: '#D3752A'
        },
        vault: {
          DEFAULT: '#1F7A5C', // Vault Green — verified / sealed states
          100: '#E4F2ED'
        },
        slate: {
          DEFAULT: '#5B6478', // secondary text
          100: '#EDEBE3'
        },
        line: '#D8D4C8' // hairline borders
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      backgroundImage: {
        seal: 'radial-gradient(circle at 30% 20%, rgba(232,135,58,0.14), transparent 55%)'
      }
    }
  },
  plugins: []
}
