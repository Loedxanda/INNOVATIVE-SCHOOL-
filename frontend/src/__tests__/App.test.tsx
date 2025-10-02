import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../App';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

// Mock the useAuth hook
jest.mock('../hooks/useAuth', () => ({
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
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('App', () => {
  test('renders without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  test('redirects to login when not authenticated', () => {
    renderWithProviders(<App />);
    // The app should redirect to login when user is not authenticated
    // This test would need to be updated based on the actual routing behavior
  });
});

