import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          pressed: 'var(--color-primary-pressed)',
          tint: 'var(--color-primary-tint)',
          ink: 'var(--color-primary-ink)',
        },
        ink: {
          900: 'var(--color-ink-900)',
          700: 'var(--color-ink-700)',
          500: 'var(--color-ink-500)',
          300: 'var(--color-ink-300)',
          100: 'var(--color-ink-100)',
        },
        bg: {
          DEFAULT: 'var(--color-bg)',
          subtle: 'var(--color-bg-subtle)',
          inset: 'var(--color-bg-inset)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          tint: 'var(--color-success-tint)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          tint: 'var(--color-warning-tint)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          tint: 'var(--color-muted-tint)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          tint: 'var(--color-danger-tint)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        display: ['var(--text-display)', { lineHeight: 'var(--lh-tight)', letterSpacing: 'var(--tracking-heading)' }],
        h1: ['var(--text-h1)', { lineHeight: 'var(--lh-tight)', letterSpacing: 'var(--tracking-heading)' }],
        h2: ['var(--text-h2)', { lineHeight: 'var(--lh-tight)', letterSpacing: 'var(--tracking-heading)' }],
        h3: ['var(--text-h3)', { lineHeight: 'var(--lh-tight)' }],
        body: ['var(--text-body)', { lineHeight: 'var(--lh-normal)' }],
        small: ['var(--text-small)', { lineHeight: 'var(--lh-normal)' }],
        caption: ['var(--text-caption)', { lineHeight: '1.4' }],
      },
      spacing: {
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '48px',
        8: '64px',
        9: '96px',
      },
      borderRadius: {
        none: '0',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        card: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        focus: 'var(--shadow-focus)',
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      maxWidth: {
        content: '1120px',
        column: '480px',
        card: '540px',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      letterSpacing: {
        label: 'var(--tracking-label)',
      },
    },
  },
  plugins: [],
};

export default config;
