import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import OnboardingWizard from '../components/OnboardingWizard';
import { useAuth } from '../contexts/AuthContext';

const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (hasCompletedOnboarding) {
      // Redirect to appropriate dashboard
      navigate(`/${user?.role}/dashboard`);
    } else {
      setShowOnboarding(true);
    }
  }, [navigate, user?.role]);

  const handleOnboardingComplete = (data: any) => {
    // Save onboarding data
    localStorage.setItem('onboarding_data', JSON.stringify(data));
    localStorage.setItem('onboarding_completed', 'true');
    
    // Redirect to appropriate dashboard
    navigate(`/${user?.role}/dashboard`);
  };

  const handleSkipOnboarding = () => {
    // Mark onboarding as completed without data
    localStorage.setItem('onboarding_completed', 'true');
    
    // Redirect to appropriate dashboard
    navigate(`/${user?.role}/dashboard`);
  };

  if (!showOnboarding) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('onboarding.welcome')}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {t('onboarding.welcomeDescription')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setShowOnboarding(true)}
            size="large"
          >
            {t('common.start')}
          </Button>
          <Button
            variant="outlined"
            onClick={handleSkipOnboarding}
            size="large"
          >
            {t('common.skip')}
          </Button>
        </Box>
      </Paper>
      
      {showOnboarding && user && (
        <OnboardingWizard
          userRole={user.role as 'admin' | 'teacher' | 'student' | 'parent'}
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}
    </Container>
  );
};

export default OnboardingPage;

