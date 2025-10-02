import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../../App';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'auth-provider' }, children),
}));

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    React.createElement(BrowserRouter, null,
      React.createElement(ThemeProvider, { theme: theme },
        component
      )
    )
  );
};

describe('App Performance', () => {
  test('renders without crashing', () => {
    const startTime = performance.now();
    renderWithProviders(React.createElement(App, null));
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
  });

  test('component rendering performance', () => {
    const startTime = performance.now();
    renderWithProviders(React.createElement(App, null));
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(500); // Should render in less than 500ms
  });
});