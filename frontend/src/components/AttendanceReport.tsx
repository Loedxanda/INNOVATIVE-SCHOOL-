import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  EventAvailable as ExcusedIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';
import { AttendanceReport, AttendanceSummary, ClassAttendanceSummary } from '../types/attendance';
import { attendanceService } from '../services/attendanceService';
import { classService } from '../services/classService';
import { Class } from '../types/class';

interface AttendanceReportProps {
  classId?: number;
  studentId?: number;
}

const AttendanceReportComponent: React.FC<AttendanceReportProps> = ({
  classId,
  studentId,
}) => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | ''>(classId || '');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classes');
    }
  };

  const generateReport = async () => {
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      setError('');
      
      const data = await attendanceService.getAttendanceReport(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        selectedClass as number
      );
      
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    
    // Create CSV content
    const csvContent = generateCSVContent(report);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVContent = (report: AttendanceReport): string => {
    let csv = 'Student Name,Student ID,Class,Attendance %,Total Days,Present,Absent,Late,Excused\n';
    
    report.student_summaries.forEach(student => {
      csv += `${student.student_name},${student.student_id_number},${student.class_name},${student.attendance_percentage.toFixed(1)}%,${student.total_days},${student.present},${student.absent},${student.late},${student.excused}\n`;
    });
    
    return csv;
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUpIcon color="success" />;
    return <TrendingDownIcon color="error" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Report Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>{t('classes.title')}</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as number)}
                  label={t('classes.title')}
                >
                  {classes.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.id}>
                      {classItem.name} - {t(`gradeLevels.${classItem.grade_level}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label={t('attendance.startDate')}
                value={startDate}
                onChange={(newValue) => newValue && setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label={t('attendance.endDate')}
                value={endDate}
                onChange={(newValue) => newValue && setEndDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={generateReport}
                disabled={!selectedClass}
                fullWidth
              >
                {t('attendance.generateReport')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Report Summary */}
      {report && (
        <Box>
          {/* Class Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {report.class_summaries.map((classSummary) => (
              <Grid item xs={12} sm={6} md={4} key={classSummary.class_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {classSummary.class_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t(`gradeLevels.${classSummary.grade_level}`)}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="h4" color={`${getAttendanceColor(classSummary.average_attendance)}.main`}>
                        {classSummary.average_attendance.toFixed(1)}%
                      </Typography>
                      {getTrendIcon(classSummary.average_attendance)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('attendance.averageAttendance')}
                    </Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Chip
                        icon={<PresentIcon />}
                        label={`${classSummary.attendance_breakdown.present} ${t('attendance.present')}`}
                        color="success"
                        size="small"
                      />
                      <Chip
                        icon={<AbsentIcon />}
                        label={`${classSummary.attendance_breakdown.absent} ${t('attendance.absent')}`}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Download Button */}
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
            >
              {t('attendance.downloadReport')}
            </Button>
          </Box>

          {/* Student Details Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('attendance.studentDetails')}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('students.studentName')}</TableCell>
                      <TableCell>{t('students.studentId')}</TableCell>
                      <TableCell>{t('classes.className')}</TableCell>
                      <TableCell>{t('attendance.attendancePercentage')}</TableCell>
                      <TableCell>{t('attendance.totalDays')}</TableCell>
                      <TableCell>{t('attendance.present')}</TableCell>
                      <TableCell>{t('attendance.absent')}</TableCell>
                      <TableCell>{t('attendance.late')}</TableCell>
                      <TableCell>{t('attendance.excused')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.student_summaries.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell>{student.student_name}</TableCell>
                        <TableCell>{student.student_id_number}</TableCell>
                        <TableCell>{student.class_name}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {student.attendance_percentage.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.attendance_percentage}
                              color={getAttendanceColor(student.attendance_percentage)}
                              sx={{ width: 60, height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{student.total_days}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<PresentIcon />}
                            label={student.present}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<AbsentIcon />}
                            label={student.absent}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<LateIcon />}
                            label={student.late}
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<ExcusedIcon />}
                            label={student.excused}
                            color="info"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AttendanceReportComponent;

