/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '430px',   // iPhone Pro Max et grands mobiles
      'sm': '640px',   // Tablettes portrait
      'md': '768px',   // Tablettes paysage
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Grands écrans
      '2xl': '1536px', // Très grands écrans
      '3xl': '1920px', // Ultra-larges écrans
      '4xl': '2560px', // 4K et plus
    },
    extend: {
      fontFamily: {
        'heading': ['Open Sans', 'sans-serif'],
        'base': ['Open Sans', 'sans-serif'],
      },
      spacing: {
        '7': '1.78rem',
      },
      maxWidth: {
        'content': '1280px',  // Contenu principal (remplace max-w-7xl)
        'wide': '1720px',     // Sections larges
        'full': '1920px',     // Pleine largeur
        'ultra': '2560px',    // 4K+
      },
      colors: {
        // Couleurs dynamiques basées sur les variables CSS
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-foreground': 'var(--color-primary-foreground)',
        
        accent: 'var(--color-accent, var(--color-primary))',
        'accent-hover': 'var(--color-accent-hover, var(--color-primary-hover))',
        'accent-foreground': 'var(--color-accent-foreground, var(--color-primary-foreground))',
        
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        'background-card': 'var(--color-background-card)',
        'background-hover': 'var(--color-background-hover)',
        
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-section-title': 'var(--color-text-section-title)',
        
        border: 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',

        // Couleurs legacy pour compatibilité
        primarybackground: 'var(--color-background)',
        secondarybackground: 'var(--color-background-secondary)',
        cardbackground: 'var(--color-background-card)',
        secondary: 'var(--color-text-primary)',
      },
      height: {
        'header': 'var(--header-height)',
      },
      borderWidth: {
        'custom': 'var(--border-width)',
      },
      gridTemplateColumns: {
        // Grilles responsives optimisées
        'auto-fit-xs': 'repeat(auto-fit, minmax(140px, 1fr))',  // Très petites cartes
        'auto-fit-sm': 'repeat(auto-fit, minmax(200px, 1fr))',  // Petites cartes
        'auto-fit-md': 'repeat(auto-fit, minmax(280px, 1fr))',  // Cartes moyennes
        'auto-fit-lg': 'repeat(auto-fit, minmax(320px, 1fr))',  // Grandes cartes
      },
    },
  },
  plugins: [],
}
