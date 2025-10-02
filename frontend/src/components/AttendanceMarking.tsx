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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  EventAvailable as ExcusedIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';
import { Attendance, BulkAttendanceCreate, ClassAttendanceSummary } from '../types/attendance';
import { attendanceService } from '../services/attendanceService';
import { classService } from '../services/classService';
import { Class } from '../types/class';

interface AttendanceMarkingProps {
  classId?: number;
  onAttendanceMarked?: () => void;
}

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({
  classId,
  onAttendanceMarked,
}) => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | ''>(classId || '');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Array<{
    student_id: number;
    student_name: string;
    student_id_number: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudentsForAttendance();
    }
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classes');
    }
  };

  const loadStudentsForAttendance = async () => {
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      setError('');
      
      const students = await attendanceService.getStudentsForAttendance(
        selectedClass as number,
        selectedDate.toISOString().split('T')[0]
      );
      
      setAttendanceData(students.map(student => ({
        student_id: student.id,
        student_name: student.user?.full_name || 'Unknown',
        student_id_number: student.student_id,
        status: student.attendance_status || 'present',
        notes: student.attendance_notes || '',
      })));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.student_id === studentId 
          ? { ...item, status }
          : item
      )
    );
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.student_id === studentId 
          ? { ...item, notes }
          : item
      )
    );
  };

  const handleEditNotes = (studentId: number) => {
    setEditingStudent(studentId);
    const student = attendanceData.find(s => s.student_id === studentId);
    setNotes(student?.notes || '');
  };

  const handleSaveNotes = () => {
    if (editingStudent) {
      handleNotesChange(editingStudent, notes);
      setEditingStudent(null);
      setNotes('');
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const bulkData: BulkAttendanceCreate = {
        class_id: selectedClass as number,
        date: selectedDate.toISOString().split('T')[0],
        attendance_data: attendanceData.map(item => ({
          student_id: item.student_id,
          status: item.status,
          notes: item.notes,
        })),
      };
      
      await attendanceService.markBulkAttendance(bulkData);
      setSuccess(t('attendance.attendanceMarkedSuccessfully'));
      
      if (onAttendanceMarked) {
        onAttendanceMarked();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save attendance');
    } finally {
      setSaving(false);
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

  const getStatusCounts = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };
    
    attendanceData.forEach(item => {
      counts[item.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <DatePicker
                label={t('attendance.date')}
                value={selectedDate}
                onChange={(newValue) => newValue && setSelectedDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveAttendance}
                disabled={saving || !selectedClass || attendanceData.length === 0}
                fullWidth
              >
                {saving ? t('common.loading') : t('attendance.saveAttendance')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {attendanceData.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {statusCounts.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('attendance.present')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {statusCounts.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('attendance.absent')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {statusCounts.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('attendance.late')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {statusCounts.excused}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('attendance.excused')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Attendance Table */}
      {attendanceData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('attendance.markAttendance')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('students.studentName')}</TableCell>
                    <TableCell>{t('students.studentId')}</TableCell>
                    <TableCell>{t('attendance.status')}</TableCell>
                    <TableCell>{t('attendance.notes')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell>{student.student_id_number}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                            <Chip
                              key={status}
                              label={t(`attendance.${status}`)}
                              color={student.status === status ? getStatusColor(status) : 'default'}
                              icon={student.status === status ? getStatusIcon(status) : undefined}
                              onClick={() => handleStatusChange(student.student_id, status)}
                              clickable
                              size="small"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {student.notes && (
                          <Typography variant="body2" noWrap>
                            {student.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditNotes(student.student_id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Notes Dialog */}
      <Dialog
        open={editingStudent !== null}
        onClose={() => setEditingStudent(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('attendance.addNotes')}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            label={t('attendance.notes')}
            placeholder={t('attendance.notesPlaceholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingStudent(null)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveNotes} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceMarking;

