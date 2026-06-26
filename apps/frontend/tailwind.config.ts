import type {Config} from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        // Esto reemplaza la tipografía sans-serif por defecto de Tailwind por Poppins
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'), // <--- Solo esta línea
  ],
  // Opcional: Configura un tema predeterminado
  daisyui: {
    themes: ['light', 'dark', 'corporate'],
  },
};
export default config;
