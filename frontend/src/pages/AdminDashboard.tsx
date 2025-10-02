import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const quickActions = [
    {
      title: t('nav.students'),
      description: 'Manage student profiles and enrollments',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      onClick: () => navigate('/admin/students'),
    },
    {
      title: t('nav.teachers'),
      description: 'Manage teacher profiles and assignments',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#dc004e',
      onClick: () => navigate('/admin/teachers'),
    },
    {
      title: t('nav.classes'),
      description: 'Manage classes and enrollments',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      onClick: () => navigate('/admin/classes'),
    },
    {
      title: t('nav.subjects'),
      description: 'Manage subjects and curriculum',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      onClick: () => navigate('/admin/subjects'),
    },
    {
      title: t('nav.attendance'),
      description: 'Mark attendance and generate reports',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      onClick: () => navigate('/admin/attendance'),
    },
    {
      title: t('nav.grades'),
      description: 'Manage grades and generate report cards',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#ff5722',
      onClick: () => navigate('/admin/grades'),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('dashboard.adminTitle')}
          </Typography>
          
          <LanguageSwitcher />
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.full_name?.charAt(0) || user?.email.charAt(0)}
            </Avatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              {t('nav.profile')}
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              {t('nav.settings')}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              {t('nav.logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {t('dashboard.welcome')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('dashboard.adminTitle')} - {user?.full_name || user?.email}
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          {t('dashboard.quickActions')}
        </Typography>
        
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: action.color,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    variant="contained"
                    sx={{ backgroundColor: action.color }}
                    onClick={action.onClick}
                  >
                    {t('common.add')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Statistics Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            {t('dashboard.statistics')}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h4">
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Classes
                  </Typography>
                  <Typography variant="h4">
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Subjects
                  </Typography>
                  <Typography variant="h4">
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
