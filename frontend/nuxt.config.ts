import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: ['@nuxtjs/tailwindcss', '@primevue/nuxt-module', 'nuxt-security', '@pinia/nuxt'],
  
  // Configuration du serveur de développement
  // devServer: {
  //   port: 3000,
  //   host: 'localhost'
  // },
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },
  
  // Configuration sécurisée pour les cookies cross-origin
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          // Autoriser le backend à communiquer avec ce frontend
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
            ? 'https://pointage-back.onrender.com' 
            : 'http://localhost:3001',
          // Permissions Policy pour l'accès caméra (plus direct)
          'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self)',
        },
      },
    },
  },
  
  // Configuration de sécurité avec nuxt-security
  security: {
    nonce: true, // Activer le mode Nonce pour CSP
    headers: {
      // Content Security Policy (Simple et Stable)
      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'img-src': process.env.NODE_ENV === 'production' 
          ? ["'self'", 'data:', 'https:', 'https://api.iconify.design']
          : ["'self'", 'data:', 'https:', 'http://localhost:3001', 'https://api.iconify.design'],
        'media-src': ["'self'", 'blob:', 'data:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'script-src': ["'self'", "'nonce-{{nonce}}'", "'unsafe-eval'", "https://vercel.live"],
        'upgrade-insecure-requests': true,
      },
      // Protection contre le clickjacking
      xFrameOptions: 'DENY',
      // Prévention du sniffing de type MIME
      xContentTypeOptions: 'nosniff',
      // Protection XSS intégrée du navigateur
      xXSSProtection: '1; mode=block',
      // Référer policy
      referrerPolicy: 'no-referrer',
      // HSTS (HTTPS uniquement)
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
        preload: true
      },
      // Permissions Policy pour autoriser l'accès à la caméra
      permissionsPolicy: {
        camera: '(self)',
        microphone: '(self)',
        geolocation: '(self)'
      }
    },
    // Rate limiting
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 300000, // 5 minutes
      headers: false,
    },
    // Limitation de la taille des requêtes
    requestSizeLimiter: {
      maxRequestSizeInBytes: 2000000, // 2MB
      maxUploadFileRequestInBytes: 8000000, // 8MB
    },
    // Validation XSS
    xssValidator: {
      methods: ['POST', 'PUT', 'PATCH']
    },
    // CORS sécurisé
    corsHandler: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://pointage-back.onrender.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
    // Masquer les headers révélateurs
    hidePoweredBy: true,
    // Supprimer les console.log en production
    removeLoggers: {
      external: [],
      consoleType: ['log', 'debug'],
      include: [/\.[jt]sx?$/, /\.vue\??/],
      exclude: [/node_modules/, /\.git/]
    }
  },
  
  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  },
  
  css: [
    'primeicons/primeicons.css',
    'flag-icons/css/flag-icons.min.css'
    
  ],
  
  app: {
    head: {
      title: 'Gestionnaire de Présence',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Application de gestion de présence avec QR codes' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
