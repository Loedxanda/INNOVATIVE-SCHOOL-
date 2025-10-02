import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface OnboardingWizardProps {
  userRole: 'admin' | 'teacher' | 'student' | 'parent';
  onComplete: (data: any) => void;
  onSkip: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  userRole,
  onComplete,
  onSkip
}) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step validation functions
  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex];
    const newErrors: Record<string, string> = {};

    switch (step.id) {
      case 'profile':
        if (!formData.firstName?.trim()) {
          newErrors.firstName = t('onboarding.errors.firstNameRequired');
        }
        if (!formData.lastName?.trim()) {
          newErrors.lastName = t('onboarding.errors.lastNameRequired');
        }
        if (!formData.email?.trim()) {
          newErrors.email = t('onboarding.errors.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = t('onboarding.errors.emailInvalid');
        }
        break;

      case 'preferences':
        if (!formData.language) {
          newErrors.language = t('onboarding.errors.languageRequired');
        }
        if (!formData.timezone) {
          newErrors.timezone = t('onboarding.errors.timezoneRequired');
        }
        break;

      case 'setup':
        if (userRole === 'teacher' && !formData.subjects?.length) {
          newErrors.subjects = t('onboarding.errors.subjectsRequired');
        }
        if (userRole === 'student' && !formData.gradeLevel) {
          newErrors.gradeLevel = t('onboarding.errors.gradeLevelRequired');
        }
        break;

      case 'notifications':
        // No required fields for notifications step
        break;

      case 'tutorial':
        // No required fields for tutorial step
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setCompletedSteps(prev => new Set([...Array.from(prev), activeStep]));
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleComplete = () => {
    if (validateStep(activeStep)) {
      setCompletedSteps(prev => new Set([...Array.from(prev), activeStep]));
      onComplete(formData);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Profile Step Component
  const ProfileStep = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('onboarding.profile.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('onboarding.profile.description')}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label={t('onboarding.profile.firstName')}
          value={formData.firstName || ''}
          onChange={(e) => updateFormData('firstName', e.target.value)}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        <TextField
          fullWidth
          label={t('onboarding.profile.lastName')}
          value={formData.lastName || ''}
          onChange={(e) => updateFormData('lastName', e.target.value)}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </Box>
      
      <TextField
        fullWidth
        label={t('onboarding.profile.email')}
        type="email"
        value={formData.email || ''}
        onChange={(e) => updateFormData('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        sx={{ mb: 3 }}
      />
      
      <TextField
        fullWidth
        label={t('onboarding.profile.phone')}
        value={formData.phone || ''}
        onChange={(e) => updateFormData('phone', e.target.value)}
        sx={{ mb: 3 }}
      />
      
      <TextField
        fullWidth
        multiline
        rows={3}
        label={t('onboarding.profile.bio')}
        value={formData.bio || ''}
        onChange={(e) => updateFormData('bio', e.target.value)}
        placeholder={t('onboarding.profile.bioPlaceholder')}
      />
    </Box>
  );

  // Preferences Step Component
  const PreferencesStep = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('onboarding.preferences.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('onboarding.preferences.description')}
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.language}>
        <InputLabel>{t('onboarding.preferences.language')}</InputLabel>
        <Select
          value={formData.language || ''}
          onChange={(e) => updateFormData('language', e.target.value)}
        >
          <MenuItem value="en">{t('languages.english')}</MenuItem>
          <MenuItem value="fr">{t('languages.french')}</MenuItem>
        </Select>
        {errors.language && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            {errors.language}
          </Typography>
        )}
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.timezone}>
        <InputLabel>{t('onboarding.preferences.timezone')}</InputLabel>
        <Select
          value={formData.timezone || ''}
          onChange={(e) => updateFormData('timezone', e.target.value)}
        >
          <MenuItem value="Africa/Douala">{t('onboarding.preferences.timezones.douala')}</MenuItem>
          <MenuItem value="UTC">{t('onboarding.preferences.timezones.utc')}</MenuItem>
        </Select>
        {errors.timezone && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            {errors.timezone}
          </Typography>
        )}
      </FormControl>
      
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t('onboarding.preferences.theme')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {['light', 'dark', 'auto'].map((theme) => (
          <Chip
            key={theme}
            label={t(`onboarding.preferences.themes.${theme}`)}
            onClick={() => updateFormData('theme', theme)}
            color={formData.theme === theme ? 'primary' : 'default'}
            variant={formData.theme === theme ? 'filled' : 'outlined'}
          />
        ))}
      </Box>
    </Box>
  );

  // Setup Step Component
  const SetupStep = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('onboarding.setup.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('onboarding.setup.description')}
      </Typography>
      
      {userRole === 'teacher' && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {t('onboarding.setup.subjects')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {['Mathematics', 'English', 'French', 'Science', 'History', 'Geography'].map((subject) => (
              <Chip
                key={subject}
                label={subject}
                onClick={() => {
                  const subjects = formData.subjects || [];
                  const newSubjects = subjects.includes(subject)
                    ? subjects.filter((s: string) => s !== subject)
                    : [...subjects, subject];
                  updateFormData('subjects', newSubjects);
                }}
                color={formData.subjects?.includes(subject) ? 'primary' : 'default'}
                variant={formData.subjects?.includes(subject) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
          {errors.subjects && (
            <Typography variant="caption" color="error">
              {errors.subjects}
            </Typography>
          )}
        </>
      )}
      
      {userRole === 'student' && (
        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.gradeLevel}>
          <InputLabel>{t('onboarding.setup.gradeLevel')}</InputLabel>
          <Select
            value={formData.gradeLevel || ''}
            onChange={(e) => updateFormData('gradeLevel', e.target.value)}
          >
            {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((grade) => (
              <MenuItem key={grade} value={grade}>{grade}</MenuItem>
            ))}
          </Select>
          {errors.gradeLevel && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {errors.gradeLevel}
            </Typography>
          )}
        </FormControl>
      )}
      
      <TextField
        fullWidth
        multiline
        rows={3}
        label={t('onboarding.setup.goals')}
        value={formData.goals || ''}
        onChange={(e) => updateFormData('goals', e.target.value)}
        placeholder={t('onboarding.setup.goalsPlaceholder')}
      />
    </Box>
  );

  // Notifications Step Component
  const NotificationsStep = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('onboarding.notifications.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('onboarding.notifications.description')}
      </Typography>
      
      {[
        { key: 'emailNotifications', label: t('onboarding.notifications.email') },
        { key: 'smsNotifications', label: t('onboarding.notifications.sms') },
        { key: 'pushNotifications', label: t('onboarding.notifications.push') },
        { key: 'weeklyReports', label: t('onboarding.notifications.weeklyReports') },
        { key: 'eventReminders', label: t('onboarding.notifications.eventReminders') }
      ].map((notification) => (
        <Box key={notification.key} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl>
            <Select
              value={formData[notification.key] || 'enabled'}
              onChange={(e) => updateFormData(notification.key, e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="enabled">{t('onboarding.notifications.enabled')}</MenuItem>
              <MenuItem value="disabled">{t('onboarding.notifications.disabled')}</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ ml: 2 }}>
            {notification.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  // Tutorial Step Component
  const TutorialStep = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('onboarding.tutorial.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('onboarding.tutorial.description')}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[
          {
            icon: <PersonIcon color="primary" />,
            title: t('onboarding.tutorial.steps.profile.title'),
            description: t('onboarding.tutorial.steps.profile.description')
          },
          {
            icon: <SchoolIcon color="primary" />,
            title: t('onboarding.tutorial.steps.dashboard.title'),
            description: t('onboarding.tutorial.steps.dashboard.description')
          },
          {
            icon: <ClassIcon color="primary" />,
            title: t('onboarding.tutorial.steps.classes.title'),
            description: t('onboarding.tutorial.steps.classes.description')
          },
          {
            icon: <AssessmentIcon color="primary" />,
            title: t('onboarding.tutorial.steps.grades.title'),
            description: t('onboarding.tutorial.steps.grades.description')
          }
        ].map((step, index) => (
          <Card key={index} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {step.icon}
              <Box>
                <Typography variant="subtitle1">{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: t('onboarding.steps.profile'),
      description: t('onboarding.steps.profileDescription'),
      icon: <PersonIcon />,
      component: <ProfileStep />
    },
    {
      id: 'preferences',
      title: t('onboarding.steps.preferences'),
      description: t('onboarding.steps.preferencesDescription'),
      icon: <SchoolIcon />,
      component: <PreferencesStep />
    },
    {
      id: 'setup',
      title: t('onboarding.steps.setup'),
      description: t('onboarding.steps.setupDescription'),
      icon: <ClassIcon />,
      component: <SetupStep />
    },
    {
      id: 'notifications',
      title: t('onboarding.steps.notifications'),
      description: t('onboarding.steps.notificationsDescription'),
      icon: <AssessmentIcon />,
      component: <NotificationsStep />
    },
    {
      id: 'tutorial',
      title: t('onboarding.steps.tutorial'),
      description: t('onboarding.steps.tutorialDescription'),
      icon: <CheckCircleIcon />,
      component: <TutorialStep />
    }
  ];

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('onboarding.welcome')}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          {t('onboarding.welcomeDescription')}
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={(activeStep / steps.length) * 100} 
          sx={{ mb: 3 }}
        />
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.id} completed={completedSteps.has(index)}>
              <StepLabel
                StepIconComponent={({ active, completed }) => (
                  <Avatar
                    sx={{
                      bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                      color: 'white'
                    }}
                  >
                    {completed ? <CheckCircleIcon /> : step.icon}
                  </Avatar>
                )}
              >
                <Typography variant="h6">{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {step.component}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  {!isFirstStep && (
                    <Button
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
                    >
                      {t('common.back')}
                    </Button>
                  )}
                  <Box sx={{ flexGrow: 1 }} />
                  <Button onClick={handleSkip} color="inherit">
                    {t('common.skip')}
                  </Button>
                  {isLastStep ? (
                    <Button
                      onClick={handleComplete}
                      variant="contained"
                      endIcon={<CheckCircleIcon />}
                    >
                      {t('common.complete')}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                    >
                      {t('common.next')}
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default OnboardingWizard;

