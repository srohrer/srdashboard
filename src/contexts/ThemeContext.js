import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Define different theme options
const themeOptions = {
  light: {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
  },
  blue: {
    palette: {
      mode: 'light',
      primary: {
        main: '#0d47a1',
      },
      secondary: {
        main: '#2196f3',
      },
      background: {
        default: '#e3f2fd',
        paper: '#ffffff',
      },
    },
  }
};

const ThemeContext = createContext({
  currentTheme: 'light',
  setTheme: () => {},
  themeNames: ['light', 'dark', 'blue'],
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  const themeNames = Object.keys(themeOptions);
  
  const setTheme = (themeName) => {
    if (themeOptions[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const theme = useMemo(() => 
    createTheme(themeOptions[currentTheme]), 
    [currentTheme]
  );

  const contextValue = {
    currentTheme,
    setTheme,
    themeNames,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 