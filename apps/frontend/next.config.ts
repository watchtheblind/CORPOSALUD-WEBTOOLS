import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mejora la velocidad de carga al ignorar errores de tipo durante el build 
  // (aunque en desarrollo es mejor mantenerlos, en CI/CD a veces ayuda)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Si planeas subir imágenes de tus PDFs procesados o avatares de usuario, 
  // aquí debes listar los dominios de donde Next.js puede cargar imágenes.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tu-bucket-en-s3-o-supabase.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Importante para el despliegue: habilita modo standalone para que 
  // tu contenedor Docker sea mucho más ligero y pequeño.
  output: 'standalone',

  // Configuración de headers para seguridad (Cabeceras CSP, etc.)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;