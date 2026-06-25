export const theme = {
  colors: {
    // Primary brand color
    primary: '#0F766E', // Civic Teal
    primaryLight: '#14B8A6',
    primaryDark: '#0B534D',
    
    // Backgrounds
    background: '#F9FAFB', // Off-white light mode background
    surface: '#FFFFFF', // Pure white for cards/surfaces
    
    // Semantic colors (Earthy & Trustworthy)
    success: '#15803D', // Earthy Green
    warning: '#B45309', // Terracotta/Amber
    error: '#C2410C', // Earthy Red/Orange (not blinding bright red)
    info: '#0369A1', // Earthy Blue
    
    // Text colors
    textPrimary: '#111827', // Slate 900
    textSecondary: '#4B5563', // Slate 600
    textMuted: '#9CA3AF', // Slate 400
    
    // Borders
    border: '#E5E7EB', // Slate 200
  },
  typography: {
    // Assuming Inter or Plus Jakarta Sans is loaded, otherwise falls back to system fonts
    fontFamily: {
      regular: 'System', // React Native will use San Francisco on iOS and Roboto on Android
      medium: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16, // rounded-2xl
    xl: 24,
    full: 9999,
  },
  shadows: {
    // Subtle drop shadows for a premium feel
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    }
  }
};
