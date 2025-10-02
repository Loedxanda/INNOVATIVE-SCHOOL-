import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  EventAvailable as ExcusedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Attendance, AttendanceSummary, ClassAttendanceSummary } from '../types/attendance';
import { attendanceService } from '../services/attendanceService';
import AttendanceMarking from '../components/AttendanceMarking';
import AttendanceReportComponent from '../components/AttendanceReport';

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
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AttendanceManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [classSummary, setClassSummary] = useState<ClassAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClassChange = (classId: number) => {
    setSelectedClass(classId);
    if (classId) {
      loadAttendanceData(classId);
    }
  };

  const loadAttendanceData = async (classId: number) => {
    try {
      setLoading(true);
      setError('');

      const [records, summary] = await Promise.all([
        attendanceService.getAttendance(0, 100, {
          class_id: classId,
          start_date: selectedDate.toISOString().split('T')[0],
          end_date: selectedDate.toISOString().split('T')[0],
        }),
        attendanceService.getClassAttendanceSummary(
          classId,
          selectedDate.toISOString().split('T')[0]
        ),
      ]);

      setAttendanceRecords(records);
      setClassSummary(summary);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'present':
        return <PresentIcon />;
      case 'absent':
        return <AbsentIcon />;
      case 'late':
        return <LateIcon />;
      case 'excused':
        return <ExcusedIcon />;
      default:
        return undefined;
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('attendance.title')}
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="attendance management tabs">
            <Tab
              icon={<AssignmentIcon />}
              label={t('attendance.markAttendance')}
              id="attendance-tab-0"
              aria-controls="attendance-tabpanel-0"
            />
            <Tab
              icon={<AssessmentIcon />}
              label={t('attendance.reports')}
              id="attendance-tab-1"
              aria-controls="attendance-tabpanel-1"
            />
            <Tab
              icon={<TrendingUpIcon />}
              label={t('attendance.summary')}
              id="attendance-tab-2"
              aria-controls="attendance-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AttendanceMarking 
            classId={selectedClass as number}
            onAttendanceMarked={() => {
              if (selectedClass) {
                loadAttendanceData(selectedClass as number);
              }
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AttendanceReportComponent classId={selectedClass as number} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            {t('attendance.summary')}
          </Typography>
          
          {/* Class Selection */}
          <FormControl sx={{ minWidth: 200, mb: 3 }}>
            <InputLabel>{t('classes.title')}</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value as number)}
              label={t('classes.title')}
            >
              <MenuItem value="">{t('common.selectClass')}</MenuItem>
              {/* Classes would be loaded from a service */}
            </Select>
          </FormControl>

          {/* Class Summary */}
          {classSummary && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {classSummary.class_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t(`gradeLevels.${classSummary.grade_level}`)}
                    </Typography>
                    <Typography variant="h4" color={`${getAttendanceColor(classSummary.attendance_percentage)}.main`}>
                      {classSummary.attendance_percentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('attendance.attendancePercentage')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {classSummary.present}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('attendance.present')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="error.main">
                      {classSummary.absent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('attendance.absent')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {classSummary.late}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('attendance.late')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Attendance Records Table */}
          {attendanceRecords.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('attendance.attendanceRecords')}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('students.studentName')}</TableCell>
                        <TableCell>{t('students.studentId')}</TableCell>
                        <TableCell>{t('attendance.status')}</TableCell>
                        <TableCell>{t('attendance.notes')}</TableCell>
                        <TableCell>{t('attendance.markedBy')}</TableCell>
                        <TableCell>{t('attendance.date')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.student?.user?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{record.student?.student_id || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={t(`attendance.${record.status}`)}
                              color={getStatusColor(record.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {record.notes && (
                              <Typography variant="body2" noWrap>
                                {record.notes}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{record.marked_by_user?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AttendanceManagementPage;

