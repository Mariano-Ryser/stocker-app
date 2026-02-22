/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplica a todo MENOS a /_next
        source: '/((?!_next).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      // Agrega aquí cualquier patrón remoto de imágenes que uses
    ],
    // Agrega las calidades que estás usando en tus componentes Image
    qualities: [75, 85, 90, 100],
    // Configuración adicional recomendada
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Si estás usando imágenes locales, asegúrate de tener esta configuración
    formats: ['image/webp'],
    // Deshabilita warnings si no los necesitas
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compress: true,
  reactStrictMode: true,

  // Si estás usando TypeScript, agrega esta configuración para mejorar el rendimiento
  typescript: {
    // Ignora errores de TypeScript durante la compilación en desarrollo
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  // Si estás usando ESLint, agrega esta configuración
  eslint: {
    // Ignora errores de ESLint durante la compilación
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },

  // Para optimización de bundles
  experimental: {
    // Si estás usando una versión antigua de Next.js, esta línea podría ayudar
    // optimizeCss: true,
  },


};

module.exports = nextConfig;