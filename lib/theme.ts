import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// ─── Color mode config ────────────────────────────────────────────────────────
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const colors = {
  bg:      { DEFAULT: '#FAFAFA', dark: '#0F0F0F' },
  surface: { DEFAULT: '#FFFFFF', dark: '#1A1A1A' },
  success:     '#059669',
  error:       '#DC2626',
  interactive: '#2563EB',
  accent: {
    DEFAULT: '#E8601C',
    hover:   '#D4521A',
    active:  '#C04818',
    light:   '#FEF0E8',
  },
  tint: {
    orange: '#FEF0E8',
    yellow: '#FFFBEB',
    blue:   '#EFF6FF',
    green:  '#F0FDF4',
    purple: '#F5F3FF',
  },
  // 12 learning track colors
  track: {
    foundations: '#6366F1',
    prompting:   '#0EA5E9',
    context:     '#8B5CF6',
    reasoning:   '#F59E0B',
    coding:      '#10B981',
    writing:     '#EC4899',
    data:        '#14B8A6',
    multimodal:  '#F97316',
    agents:      '#EF4444',
    evaluation:  '#A855F7',
    ethics:      '#84CC16',
    advanced:    '#06B6D4',
    // new tracks
    models:      '#7C3AED',
    interfaces:  '#0891B2',
    glossary:    '#059669',
  },
}

// ─── Semantic tokens (automatic dark/light switching) ─────────────────────────
const semanticTokens = {
  colors: {
    bg: {
      default: '#FAFAFA',
      _dark:   '#0F0F0F',
    },
    surface: {
      default: '#FFFFFF',
      _dark:   '#1A1A1A',
    },
    'text.primary': {
      default: '#1A1A1A',
      _dark:   '#F5F5F5',
    },
    'text.secondary': {
      default: '#6B7280',
      _dark:   '#9CA3AF',
    },
    'border.default': {
      default: '#E5E7EB',
      _dark:   '#2D2D2D',
    },
    interactive: {
      default: '#2563EB',
      _dark:   '#2563EB',
    },
    success: {
      default: '#059669',
      _dark:   '#059669',
    },
    error: {
      default: '#DC2626',
      _dark:   '#DC2626',
    },
  },
}

// ─── Typography ───────────────────────────────────────────────────────────────
const fonts = {
  heading: `var(--font-inter), system-ui, sans-serif`,
  body:    `var(--font-inter), system-ui, sans-serif`,
  mono:    `var(--font-jetbrains-mono), Menlo, Consolas, monospace`,
}

const fontSizes = {
  'xs':   '11px',
  'sm':   '13px',
  'body': '15px',
  'md':   '15px',
  'h4':   '16px',
  'lg':   '16px',
  'h3':   '18px',
  'xl':   '18px',
  'h2':   '22px',
  '2xl':  '22px',
  'h1':   '28px',
  '3xl':  '28px',
}

// ─── Sizes ────────────────────────────────────────────────────────────────────
const sizes = {
  sidebar: '240px',
  content: '720px',
}

// ─── Global styles + keyframes ────────────────────────────────────────────────
const styles = {
  global: {
    html: {
      fontSize: '15px',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    body: {
      bg: 'bg',
      color: 'text.primary',
      fontFamily: `var(--font-inter), system-ui, sans-serif`,
    },
    '*': {
      boxSizing: 'border-box',
    },
    '::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      borderRadius: '9999px',
      background: '#D1D5DB',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: '#9CA3AF',
    },
    '@keyframes skeleton': {
      '0%, 100%': { opacity: 1 },
      '50%':      { opacity: 0.4 },
    },
    '@keyframes nodePulse': {
      '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 96, 28, 0.4)' },
      '50%':      { boxShadow: '0 0 0 8px rgba(232, 96, 28, 0)' },
    },
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to:   { opacity: 1 },
    },
    '@keyframes slideUp': {
      from: { opacity: 0, transform: 'translateY(16px)' },
      to:   { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes slideIn': {
      from: { opacity: 0, transform: 'translateX(-8px)' },
      to:   { opacity: 1, transform: 'translateX(0)' },
    },
  },
}

// ─── Component theme overrides ────────────────────────────────────────────────
const components = {
  Button: {
    baseStyle: {
      fontWeight: '500',
      borderRadius: 'lg',
      _focusVisible: {
        boxShadow: '0 0 0 2px #2563EB',
        outline: 'none',
      },
      _disabled: {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
    sizes: {
      sm: { h: '32px', px: '12px', fontSize: 'sm' },
      md: { h: '40px', px: '16px', fontSize: 'body' },
      lg: { h: '44px', px: '24px', fontSize: 'body' },
    },
    variants: {
      primary: {
        bg: 'interactive',
        color: 'white',
        _hover: { bg: '#1D4ED8', _disabled: { bg: 'interactive' } },
        _active: { bg: '#1E40AF' },
      },
      secondary: {
        bg: 'surface',
        border: '1px solid',
        borderColor: 'border.default',
        color: 'text.primary',
        _hover: { borderColor: '#9CA3AF' },
      },
      ghost: {
        color: 'text.secondary',
        bg: 'transparent',
        _hover: { bg: '#F3F4F6', color: 'text.primary', _dark: { bg: '#2D2D2D' } },
      },
    },
    defaultProps: {
      variant: 'primary',
      size: 'md',
    },
  },

  Badge: {
    baseStyle: {
      borderRadius: 'full',
      fontSize: 'xs',
      fontWeight: '500',
      px: 2,
      py: 0.5,
      textTransform: 'none',
    },
    variants: {
      default:     { bg: '#F3F4F6', color: '#374151' },
      success:     { bg: '#D1FAE5', color: '#065F46' },
      error:       { bg: '#FEE2E2', color: '#991B1B' },
      interactive: { bg: '#DBEAFE', color: '#1E40AF' },
      muted:       { bg: '#F9FAFB', color: '#6B7280' },
    },
    defaultProps: { variant: 'default' },
  },

  Modal: {
    baseStyle: {
      overlay: {
        bg: 'blackAlpha.600',
        backdropFilter: 'blur(4px)',
      },
      dialog: {
        bg: 'surface',
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: 'border.default',
        shadow: 'xl',
      },
    },
  },

  Progress: {
    baseStyle: {
      filledTrack: {
        transition: 'width 0.3s',
      },
      track: {
        bg: '#E5E7EB',
        _dark: { bg: '#2D2D2D' },
        borderRadius: 'full',
      },
    },
    defaultProps: { size: 'sm', colorScheme: 'blue' },
  },

  Switch: {
    baseStyle: {
      track: {
        bg: '#D1D5DB',
        _checked: { bg: 'interactive' },
        _dark: { bg: '#3D3D3D', _checked: { bg: 'interactive' } },
      },
      thumb: { bg: 'white' },
    },
    defaultProps: { size: 'sm' },
  },

  Skeleton: {
    baseStyle: {
      borderRadius: 'lg',
      animation: 'skeleton 1.5s ease-in-out infinite',
    },
    defaultProps: {
      startColor: '#E5E7EB',
      endColor: '#F3F4F6',
    },
  },

  // Remove default focus ring on inputs — we handle manually
  Input: {
    baseStyle: {
      field: {
        _focusVisible: {
          borderColor: 'interactive',
          boxShadow: 'none',
          outline: 'none',
        },
      },
    },
  },

  Textarea: {
    baseStyle: {
      _focusVisible: {
        borderColor: 'interactive',
        boxShadow: 'none',
        outline: 'none',
      },
    },
  },
}

export const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  fonts,
  fontSizes,
  sizes,
  styles,
  components,
})
