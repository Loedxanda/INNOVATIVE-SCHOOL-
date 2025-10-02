import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import StudentForm from '../../components/StudentForm';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('StudentForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form when open', () => {
    renderWithProviders(<StudentForm {...defaultProps} />);
    
    expect(screen.getByText('Add Student')).toBeInTheDocument();
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('renders edit form when student is provided', () => {
    const student = {
      id: 1,
      student_id: 'STU001',
      user: {
        full_name: 'John Doe',
        email: 'john@example.com',
      },
      date_of_birth: '2010-01-01',
      gender: 'male',
      address: '123 Main St',
      phone_number: '+237123456789',
      emergency_contact: 'Jane Doe',
      emergency_phone: '+237987654321',
      enrollment_date: '2023-09-01',
    };

    renderWithProviders(<StudentForm {...defaultProps} student={student} />);
    
    expect(screen.getByText('Edit Student')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('STU001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  test('calls onSubmit when form is submitted with valid data', async () => {
    renderWithProviders(<StudentForm {...defaultProps} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/student name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/student id/i), {
      target: { value: 'STU001' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: '2010-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: 'male' },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+237123456789' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/emergency phone/i), {
      target: { value: '+237987654321' },
    });
    fireEvent.change(screen.getByLabelText(/enrollment date/i), {
      target: { value: '2023-09-01' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          student_id: 'STU001',
          email: 'john@example.com',
          full_name: 'John Doe',
          password: 'password123',
          date_of_birth: '2010-01-01',
          gender: 'male',
          address: '123 Main St',
          phone_number: '+237123456789',
          emergency_contact: 'Jane Doe',
          emergency_phone: '+237987654321',
          enrollment_date: '2023-09-01',
        })
      );
    });
  });

  test('shows validation errors for required fields', async () => {
    renderWithProviders(<StudentForm {...defaultProps} />);
    
    // Try to submit empty form
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  test('calls onClose when cancel button is clicked', () => {
    renderWithProviders(<StudentForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('disables form when loading', () => {
    renderWithProviders(<StudentForm {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });
});

