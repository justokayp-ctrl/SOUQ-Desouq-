/**
 * ============================================================================
 * SOUQ DESOQ UNIFIED DESIGN SYSTEM — CENTRAL DESIGN TOKENS
 * ============================================================================
 * Official Visual Language & Brand Geometry:
 * - Brand Palette: Royal Burgundy, Egyptian Linen Cream/Ivory, Antique Gold, Charcoal
 * - Geometric Identity: Pentagonal Shield Emblem & Trust Seal ("ختم التوثيق الدسوقي")
 * - Typographic Hierarchy: Cairo (Headings & Display), Tajawal (Body & Interface)
 * - Modes: Light, Dark, System Theme
 * ============================================================================
 */

export const DESIGN_TOKENS = {
  brand: {
    name: 'SOUQ DESOQ',
    nameAr: 'سوق دسوق',
    tagline: 'نبض التجارة والصناعة في قلب الدلتا',
    taglineEn: 'The Artisan & Industrial Heart of the Nile Delta',
    location: 'دسوق، محافظة كفر الشيخ 🇪🇬',
  },

  colors: {
    // 1. Royal Egyptian Burgundy (Primary Brand Anchor)
    burgundy: {
      50: '#FDF2F4',
      100: '#FBE4E8',
      200: '#F7CBD3',
      300: '#EFA4B2',
      400: '#DF6982',
      500: '#9E1B32',
      DEFAULT: '#800020', // Official Deep Burgundy
      600: '#800020',
      700: '#66001A',
      800: '#520015',
      900: '#3D0010',
      950: '#26000A',
      hover: '#66001A',
      active: '#520015',
      light: 'rgba(128, 0, 32, 0.08)',
      subtle: 'rgba(128, 0, 32, 0.04)',
      border: 'rgba(128, 0, 32, 0.16)',
    },

    // 2. Antique Nile Gold (Prestige & Trust Accent)
    gold: {
      50: '#FBF8EE',
      100: '#F6EED4',
      200: '#EDDC9F',
      300: '#E4CA6A',
      400: '#DBB840',
      DEFAULT: '#D4AF37', // Official Imperial Gold
      500: '#D4AF37',
      600: '#B89628',
      700: '#997B20',
      800: '#7A621B',
      900: '#5C4A17',
      hover: '#B89628',
      active: '#997B20',
      light: 'rgba(212, 175, 55, 0.12)',
      subtle: 'rgba(212, 175, 55, 0.06)',
      border: 'rgba(212, 175, 55, 0.28)',
      glow: 'rgba(212, 175, 55, 0.35)',
    },

    // 3. Egyptian Linen Cream & Ivory (Light Canvas)
    cream: {
      50: '#FFFFFF',
      100: '#FDFBF7', // Primary Canvas Light
      200: '#FAF7F2', // Secondary Surface Light
      300: '#F5EFEB', // Tertiary Surface Light
      400: '#ECE3DB', // Divider / Border Light
      500: '#DFD4C8',
      600: '#C8B9A6',
      DEFAULT: '#FDFBF7',
      surface: '#FAF7F2',
      card: '#FFFFFF',
      border: '#EBE5D8',
    },

    // 4. Obsidian & Basalt Charcoal (Dark Canvas & High-Contrast Ink)
    charcoal: {
      50: '#F4F4F5',
      100: '#E4E4E7',
      200: '#D4D4D8',
      300: '#A1A1AA',
      400: '#71717A',
      500: '#52525B',
      600: '#3F3F46',
      700: '#27272A',
      800: '#1F1F23',
      900: '#141416',
      950: '#0B0B0D', // Deep Obsidian Dark Canvas
      DEFAULT: '#141416',
      ink: '#1A1A1A',
      muted: '#52525B',
    },

    // 5. Dark Mode Specialized Surfaces
    dark: {
      bg: '#0B0B0D',       // Main viewport background
      surface: '#141416',  // Primary elevated container
      card: '#1A1A1E',     // Secondary card surface
      cardHover: '#222228',// Hover state
      border: '#2A2A32',   // Refined low-contrast border
      borderSubtle: '#1F1F26',
      text: '#F4F4F5',
      textMuted: '#9CA3AF',
    },

    // 6. Semantic Status Colors (Egyptian Legal & Market States)
    semantic: {
      success: {
        DEFAULT: '#10B981',
        light: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.25)',
        text: '#065F46',
        textDark: '#34D399',
      },
      warning: {
        DEFAULT: '#F59E0B',
        light: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.25)',
        text: '#92400E',
        textDark: '#FBBF24',
      },
      danger: {
        DEFAULT: '#EF4444',
        light: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.25)',
        text: '#991B1B',
        textDark: '#F87171',
      },
      info: {
        DEFAULT: '#3B82F6',
        light: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.25)',
        text: '#1E40AF',
        textDark: '#60A5FA',
      },
      desoqLocal: {
        DEFAULT: '#800020',
        accent: '#D4AF37',
        badgeBg: 'rgba(128, 0, 32, 0.08)',
        badgeBgDark: 'rgba(212, 175, 55, 0.15)',
      },
    },
  },

  // Brand Symbol Geometry (Superman-inspired shield polygon parameters)
  geometry: {
    shieldClipPath: 'polygon(0% 0%, 100% 0%, 100% 72%, 50% 100%, 0% 72%)',
    shieldAngleTop: 'polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)',
    chamferCorner: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
    aspectRatios: {
      shield: '5 / 6',
      productCard: '1 / 1',
      heroBanner: '21 / 9',
    },
  },

  typography: {
    fontFamilyHeading: "'Cairo', system-ui, -apple-system, sans-serif",
    fontFamilyBody: "'Tajawal', 'Cairo', system-ui, -apple-system, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Courier New', monospace",
    sizes: {
      '2xs': '0.6875rem', // 11px
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',        // 16px (Baseline body)
      md: '1.125rem',     // 18px
      lg: '1.25rem',      // 20px
      xl: '1.5rem',       // 24px
      '2xl': '1.875rem',   // 30px
      '3xl': '2.25rem',    // 36px
      '4xl': '3rem',       // 48px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    lineHeights: {
      tight: '1.2',
      snug: '1.35',
      normal: '1.55',
      relaxed: '1.7',
    },
  },

  spacing: {
    0: '0px',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
  },

  borderRadius: {
    none: '0px',
    xs: '0.25rem',    // 4px
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px (Standard Card)
    '2xl': '1.25rem',  // 20px (Modal / Surface)
    '3xl': '1.5rem',   // 24px
    pill: '9999px',
  },

  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 8px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 20px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 30px -5px rgba(0, 0, 0, 0.14), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    card: '0 4px 16px -2px rgba(128, 0, 32, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
    cardHover: '0 12px 28px -4px rgba(128, 0, 32, 0.10), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
    cardDark: '0 4px 20px 0 rgba(0, 0, 0, 0.45)',
    goldGlow: '0 0 16px 0 rgba(212, 175, 55, 0.28)',
    burgundyGlow: '0 0 16px 0 rgba(128, 0, 32, 0.24)',
    modal: '0 24px 48px -12px rgba(0, 0, 0, 0.35)',
    drawer: '-12px 0 36px rgba(0, 0, 0, 0.18)',
  },

  borders: {
    subtle: '1px solid rgba(128, 0, 32, 0.08)',
    default: '1px solid rgba(128, 0, 32, 0.14)',
    gold: '1px solid rgba(212, 175, 55, 0.35)',
    goldThick: '2px solid #D4AF37',
    burgundyThick: '2px solid #800020',
    darkSubtle: '1px solid #1F1F26',
    darkDefault: '1px solid #2A2A32',
    darkGold: '1px solid rgba(212, 175, 55, 0.35)',
  },

  motion: {
    transitionFast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transitionNormal: '220ms cubic-bezier(0.4, 0, 0.2, 1)',
    transitionSlow: '320ms cubic-bezier(0.4, 0, 0.2, 1)',
    springGentle: { type: 'spring', damping: 20, stiffness: 300 },
  },

  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    dropdown: 10,
    sticky: 20,
    mobileNav: 30,
    modalBackdrop: 40,
    modal: 50,
    drawer: 55,
    toast: 60,
    tooltip: 70,
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
