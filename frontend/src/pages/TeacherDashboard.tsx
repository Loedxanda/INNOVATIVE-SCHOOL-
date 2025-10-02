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
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
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
      title: t('nav.classes'),
      description: 'View and manage your classes',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      href: '/teacher/classes',
    },
    {
      title: t('nav.students'),
      description: 'View your students',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#dc004e',
      href: '/teacher/students',
    },
    {
      title: t('nav.attendance'),
      description: 'Mark and view attendance',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      href: '/teacher/attendance',
    },
    {
      title: t('nav.grades'),
      description: 'Manage grades and assessments',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      href: '/teacher/grades',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('dashboard.teacherTitle')}
          </Typography>
          
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
            {t('dashboard.teacherTitle')} - {user?.full_name || user?.email}
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
                    href={action.href}
                  >
                    {t('common.add')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Today's Schedule */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Today's Schedule
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Morning Classes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No classes scheduled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Afternoon Classes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No classes scheduled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            {t('dashboard.recentActivity')}
          </Typography>
          
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                No recent activity
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default TeacherDashboard;

