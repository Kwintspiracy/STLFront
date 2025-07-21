// next.config.ts

import type { NextConfig } from 'next';

/**
 * ✅ Configuration principale Next.js 15 avec variables d'environnement
 */

// Configuration dynamique basée sur l'environnement
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Variables d'environnement avec fallbacks
const apiHostname = process.env.NEXT_PUBLIC_API_HOSTNAME || '127.0.0.1';
const mediaPath = process.env.NEXT_PUBLIC_MEDIA_PATH || '/media';
const mediaPathProd = process.env.NEXT_PUBLIC_MEDIA_PATH_PROD;

// Génération des remotePatterns dynamiques
const generateRemotePatterns = (): Array<{
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname: string;
}> => {
  const patterns: Array<{
    protocol: 'http' | 'https';
    hostname: string;
    port?: string;
    pathname: string;
  }> = [
    // Images externes (toujours autorisées)
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'fbi.cults3d.com',
      pathname: '/**',
    },
    // Google Cloud Storage (toujours autorisé)
    {
      protocol: 'https',
      hostname: 'storage.googleapis.com',
      pathname: '/**',
    },
  ];

  // Google Cloud Storage pour les médias de production
  if (mediaPathProd) {
    try {
      const url = new URL(mediaPathProd);
      patterns.push({
        protocol: 'https',
        hostname: url.hostname,
        pathname: url.pathname === '/' ? '/**' : `${url.pathname}/**`,
      });
    } catch (error) {
      console.warn('Invalid NEXT_PUBLIC_MEDIA_PATH_PROD URL:', mediaPathProd);
    }
  }

  // Configuration API selon l'environnement
  if (isDevelopment) {
    // En développement : autoriser localhost HTTP
    patterns.push({
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '8000',
      pathname: `${mediaPath}/**`,
    });
  }

  if (isProduction || apiHostname !== '127.0.0.1') {
    // En production ou avec hostname personnalisé : HTTPS
    patterns.push({
      protocol: 'https',
      hostname: apiHostname,
      pathname: `${mediaPath}/**`,
    });
    
    // Aussi autoriser HTTP pour la compatibilité (si nécessaire)
    if (!isProduction) {
      patterns.push({
        protocol: 'http',
        hostname: apiHostname,
        pathname: `${mediaPath}/**`,
      });
    }
  }

  return patterns;
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: generateRemotePatterns(),
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Rewrites seulement en développement local
    if (isDevelopment && apiHostname === '127.0.0.1') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
