import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { parentService } from '../services/parentService';
import { attendanceService } from '../services/attendanceService';
import { gradeService } from '../services/gradeService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`parent-tabpanel-${index}`}
      aria-labelledby={`parent-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ParentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [childAttendance, setChildAttendance] = useState<any>(null);
  const [childGrades, setChildGrades] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load parent's children
      const childrenData = await parentService.getParentChildren(user?.id || 0);
      setChildren(childrenData);
      
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]);
        await loadChildData(childrenData[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load parent data');
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (childId: number) => {
    try {
      const [attendance, grades] = await Promise.all([
        attendanceService.getStudentAttendanceSummary(childId),
        gradeService.getStudentGradeSummary(childId),
      ]);
      
      setChildAttendance(attendance);
      setChildGrades(grades);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load child data');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChildSelect = async (child: any) => {
    setSelectedChild(child);
    await loadChildData(child.id);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      // Implement message sending
      console.log('Sending message:', messageText);
      setMessageText('');
      setMessageOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message');
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('parents.title')} - {user?.full_name}
      </Typography>

      {/* Children Selection */}
      {children.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('parents.selectChild')}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {children.map((child) => (
              <Card
                key={child.id}
                sx={{
                  cursor: 'pointer',
                  border: selectedChild?.id === child.id ? 2 : 1,
                  borderColor: selectedChild?.id === child.id ? 'primary.main' : 'divider',
                }}
                onClick={() => handleChildSelect(child)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      {child.user?.full_name?.charAt(0) || child.student_id.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {child.user?.full_name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {child.student_id}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {selectedChild && (
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="parent dashboard tabs">
              <Tab
                icon={<SchoolIcon />}
                label={t('parents.childProgress')}
                id="parent-tab-0"
                aria-controls="parent-tabpanel-0"
              />
              <Tab
                icon={<AssignmentIcon />}
                label={t('parents.childAttendance')}
                id="parent-tab-1"
                aria-controls="parent-tabpanel-1"
              />
              <Tab
                icon={<AssessmentIcon />}
                label={t('parents.childGrades')}
                id="parent-tab-2"
                aria-controls="parent-tabpanel-2"
              />
              <Tab
                icon={<MessageIcon />}
                label={t('parents.communication')}
                id="parent-tab-3"
                aria-controls="parent-tabpanel-3"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* Child Progress Overview */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('attendance.attendancePercentage')}
                    </Typography>
                    <Typography variant="h4" color={`${getAttendanceColor(childAttendance.attendance_percentage || 0)}.main`}>
                      {childAttendance.attendance_percentage?.toFixed(1) || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={childAttendance.attendance_percentage || 0}
                      color={getAttendanceColor(childAttendance.attendance_percentage || 0)}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('grades.averageGrade')}
                    </Typography>
                    <Typography variant="h4" color={`${getGradeColor(childGrades.average_percentage || 0)}.main`}>
                      {childGrades.average_percentage?.toFixed(1) || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={childGrades.average_percentage || 0}
                      color={getGradeColor(childGrades.average_percentage || 0)}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('attendance.present')}
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {childAttendance.present || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      out of {childAttendance.total_days || 0} days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('grades.totalGrades')}
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {childGrades.total_grades || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      grades recorded
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Attendance Details */}
            <Typography variant="h6" gutterBottom>
              {t('attendance.attendanceRecords')}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('attendance.date')}</TableCell>
                    <TableCell>{t('attendance.status')}</TableCell>
                    <TableCell>{t('attendance.notes')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {childAttendance.recent_attendance?.map((record: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`attendance.${record.status}`)}
                          color={record.status === 'present' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Grades Details */}
            <Typography variant="h6" gutterBottom>
              {t('grades.recentGrades')}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('subjects.subjectName')}</TableCell>
                    <TableCell>{t('grades.gradeValue')}</TableCell>
                    <TableCell>{t('grades.percentage')}</TableCell>
                    <TableCell>{t('grades.letterGrade')}</TableCell>
                    <TableCell>{t('grades.dateGiven')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {childGrades.recent_grades?.map((grade: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{grade.subject}</TableCell>
                      <TableCell>{grade.grade_value}/{grade.max_grade}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {grade.percentage.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={grade.percentage}
                            color={getGradeColor(grade.percentage)}
                            sx={{ width: 60, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={gradeService.calculateLetterGrade(grade.percentage)}
                          color={getGradeColor(grade.percentage)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Communication */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                {t('parents.communication')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<MessageIcon />}
                onClick={() => setMessageOpen(true)}
              >
                {t('parents.sendMessage')}
              </Button>
            </Box>

            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary">
                  {t('parents.communicationPlaceholder')}
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Paper>
      )}

      {/* Send Message Dialog */}
      <Dialog
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('parents.sendMessage')}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            label={t('parents.message')}
            placeholder={t('parents.messagePlaceholder')}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          >
            {t('common.send')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParentDashboard;

