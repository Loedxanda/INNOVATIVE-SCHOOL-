// Color Palette
const colors = {
  oxblood: {
    main: '#4A0000',
    light: '#7A3030',
    dark: '#1A0000',
  },
  deepBlue: {
    main: '#001F3F',
    light: '#334A66',
    dark: '#000A1A',
  },
  lightBlue: {
    main: '#7FDBFF',
    light: '#B2E9FF',
    dark: '#4BA8CC',
  },
  offWhite: {
    main: '#F5F5F5',
    light: '#FFFFFF',
    dark: '#C2C2C2',
  },
};

// Custom Theme
const theme = {
  palette: {
    primary: {
      main: colors.oxblood.main,
      light: colors.oxblood.light,
      dark: colors.oxblood.dark,
    },
    secondary: {
      main: colors.lightBlue.main,
      light: colors.lightBlue.light,
      dark: colors.lightBlue.dark,
    },
    background: {
      default: colors.deepBlue.main,
      paper: colors.deepBlue.light,
    },
    text: {
      primary: colors.offWhite.main,
      secondary: colors.lightBlue.main,
    },
    divider: colors.lightBlue.main,
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Segoe UI',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.offWhite.main,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.offWhite.main,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.offWhite.main,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: colors.offWhite.main,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: colors.offWhite.main,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: colors.lightBlue.main,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: colors.lightBlue.main,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          backgroundColor: colors.oxblood.main,
          color: colors.offWhite.main,
          '&:hover': {
            backgroundColor: colors.oxblood.dark,
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 4px 12px rgba(74, 0, 0, 0.3)',
          },
        },
        containedSecondary: {
          backgroundColor: colors.lightBlue.main,
          color: colors.deepBlue.main,
          '&:hover': {
            backgroundColor: colors.lightBlue.dark,
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 4px 12px rgba(127, 219, 255, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 31, 63, 0.7)',
          border: '1px solid rgba(127, 219, 255, 0.2)',
          borderRadius: 8,
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: '0 4px 12px rgba(74, 0, 0, 0.2)',
            borderColor: 'rgba(127, 219, 255, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(127, 219, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: colors.lightBlue.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.lightBlue.main,
              boxShadow: '0 0 0 2px rgba(127, 219, 255, 0.2)',
            },
          },
          '& .MuiInputBase-input': {
            color: colors.offWhite.main,
          },
          '& .MuiInputLabel-root': {
            color: colors.lightBlue.main,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: colors.lightBlue.main,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to right, #4A0000 0%, #001F3F 100%)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(to bottom, #4A0000 0%, #001F3F 100%)',
          color: colors.offWhite.main,
          borderRight: 'none',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '4px 10px',
          transition: 'all 200ms ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderLeft: `3px solid ${colors.offWhite.main}`,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 31, 63, 0.5)',
          color: colors.lightBlue.main,
          border: '1px solid rgba(127, 219, 255, 0.3)',
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: {
          color: colors.oxblood.main,
        },
        iconEmpty: {
          color: 'rgba(127, 219, 255, 0.3)',
        },
      },
    },
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
};

export default theme;