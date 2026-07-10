export const colors = {
  // ── Turquoise palette (base: #99E1D9 / RGB 153,225,217) ──────────────────────
  teal900: '#0d4a46',   // rich deep turquoise (appointment cards, dark surfaces)
  teal800: '#135e59',   // dark turquoise
  teal700: '#1a7a73',   // primary action / buttons
  teal600: '#22968d',   // medium turquoise
  teal500: '#2eb8ae',   // standard turquoise
  teal200: '#99e1d9',   // THE turquoise (#99E1D9) — borders, highlights
  teal100: '#c2ede9',   // light turquoise (badges, bg tints)
  teal50:  '#edfaf8',   // almost white mint

  // ── Amber (warm accent — unchanged) ──────────────────────────────────────────
  amber700: '#b37d1f',
  amber600: '#d59528',
  amber500: '#e6a63b',
  amber100: '#fcefd3',
  amber50:  '#fdf6e6',

  // ── Ink / neutral (shifted slightly towards turquoise) ────────────────────────
  ink900: '#0c1e1d',   // deepest text
  ink700: '#244947',   // dark text
  ink500: '#4d706d',   // secondary text
  ink400: '#7fa09d',   // placeholder / disabled
  ink300: '#aecbc9',   // borders, dividers
  ink200: '#d5e8e7',   // subtle borders
  ink100: '#eaf3f3',   // very light backgrounds

  // ── App backgrounds (white-based, turquoise is accent only) ─────────────────
  bg:      '#F8FAFA',   // main background — near white
  surface: '#ffffff',   // card surface — pure white

  // ── Semantic ─────────────────────────────────────────────────────────────────
  green500: '#17a673',
  green100: '#d6f1e4',
  red500:   '#d9534a',
  red100:   '#fadfdc',
  orange500: '#e88a3b',
  orange100: '#fbe6d1',

  // ── Glassmorphism tokens ──────────────────────────────────────────────────────
  glass:        'rgba(153, 225, 217, 0.18)',   // frosted card background
  glassBorder:  'rgba(153, 225, 217, 0.35)',   // glass border
  glassDark:    'rgba(13, 59, 56, 0.55)',      // dark glass (overlays)
  glassWhite:   'rgba(255, 255, 255, 0.65)',   // white glass
};

export const shadows = {
  card: {
    shadowColor: '#1a7a73',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  float: {
    shadowColor: '#1a7a73',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    shadowColor: '#1a7a73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
};

// ── Glassmorphism style presets ───────────────────────────────────────────────
export const glass = {
  /** Frosted mint card */
  card: {
    backgroundColor: 'rgba(153, 225, 217, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(153, 225, 217, 0.4)',
    borderRadius: 20,
  },
  /** White-tinted glass card */
  white: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  /** Dark turquoise glass */
  dark: {
    backgroundColor: 'rgba(13, 59, 56, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(153, 225, 217, 0.2)',
    borderRadius: 20,
  },
};
