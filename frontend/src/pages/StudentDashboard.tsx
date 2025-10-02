import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const StudentDashboard: React.FC = () => {
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('dashboard.studentTitle')}
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
            {t('dashboard.studentTitle')} - {user?.full_name || user?.email}
          </Typography>
        </Box>

        {/* Quick Access */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Access
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
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
                    color: '#1976d2',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  My Classes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View your enrolled classes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
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
                    color: '#2e7d32',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  Attendance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View your attendance records
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
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
                    color: '#f57c00',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  Grades
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View your grades and progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Academic Summary */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Academic Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Current Class
                  </Typography>
                  <Typography variant="h6">
                    Not enrolled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Attendance Rate
                  </Typography>
                  <Typography variant="h6">
                    N/A
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Grade
                  </Typography>
                  <Typography variant="h6">
                    N/A
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
                  <Typography variant="h6">
                    0
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

export default StudentDashboard;

