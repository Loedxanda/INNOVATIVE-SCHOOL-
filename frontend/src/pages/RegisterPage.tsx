import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types/auth';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      setLoading(true);
      setError('');
      
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              {t('auth.registerTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.welcome')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              id="fullName"
              label={t('auth.fullName')}
              autoComplete="name"
              {...register('full_name')}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">{t('auth.role')}</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                label={t('auth.role')}
                {...register('role', { required: 'Role is required' })}
                error={!!errors.role}
              >
                <MenuItem value="student">{t('roles.student')}</MenuItem>
                <MenuItem value="teacher">{t('roles.teacher')}</MenuItem>
                <MenuItem value="parent">{t('roles.parent')}</MenuItem>
                <MenuItem value="admin">{t('roles.admin')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('auth.confirmPassword')}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value: string) =>
                  value === password || 'Passwords do not match',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.registerButton')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                {t('auth.hasAccount')}{' '}
                <Link href="/login" variant="body2">
                  {t('auth.login')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;

