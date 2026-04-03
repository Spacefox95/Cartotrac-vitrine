export const typography = {
  fontFamily: ['Avenir Next', 'Aptos', 'Segoe UI', 'sans-serif'].join(','),
  h1: {
    fontSize: '2.45rem',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1.08,
  },
  h2: {
    fontSize: '1.95rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    lineHeight: 1.12,
  },
  h3: {
    fontSize: '1.45rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.18,
  },
  h4: {
    fontSize: '1.18rem',
    fontWeight: 700,
    lineHeight: 1.24,
  },
  h5: {
    fontSize: '1.02rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
    textTransform: 'uppercase' as const,
  },
  button: {
    fontWeight: 700,
    letterSpacing: '0.01em',
    textTransform: 'none' as const,
  },
  body1: {
    lineHeight: 1.7,
  },
  body2: {
    lineHeight: 1.6,
  },
};
