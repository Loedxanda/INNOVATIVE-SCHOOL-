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
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Student, StudentEnrollment, StudentAttendance, StudentGrade } from '../types/student';
import { studentService } from '../services/studentService';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';

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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
    await loadStudentDetails(student.id);
  };

  const loadStudentDetails = async (studentId: number) => {
    try {
      setLoading(true);
      setError('');

      const [enrollments, attendance, grades] = await Promise.all([
        studentService.getStudentEnrollments(studentId),
        studentService.getStudentAttendance(studentId),
        studentService.getStudentGrades(studentId),
      ]);

      setStudentEnrollments(enrollments);
      setStudentAttendance(attendance);
      setStudentGrades(grades);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatusColor = (status: string) => {
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

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('students.title')}
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="student management tabs">
            <Tab
              icon={<PeopleIcon />}
              label={t('students.title')}
              id="student-tab-0"
              aria-controls="student-tabpanel-0"
            />
            <Tab
              icon={<SchoolIcon />}
              label={t('nav.classes')}
              id="student-tab-1"
              aria-controls="student-tabpanel-1"
            />
            <Tab
              icon={<AssignmentIcon />}
              label={t('nav.attendance')}
              id="student-tab-2"
              aria-controls="student-tabpanel-2"
            />
            <Tab
              icon={<AssessmentIcon />}
              label={t('nav.grades')}
              id="student-tab-3"
              aria-controls="student-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <StudentList onStudentSelect={handleStudentSelect} showActions={true} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Class Enrollments
          </Typography>
          <Grid container spacing={2}>
            {studentEnrollments.map((enrollment) => (
              <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {enrollment.class_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t(`gradeLevels.${enrollment.grade_level}`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {enrollment.academic_year}
                    </Typography>
                    <Chip
                      label={enrollment.is_active ? t('common.active') : t('common.inactive')}
                      color={enrollment.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Attendance Records
          </Typography>
          <Grid container spacing={2}>
            {studentAttendance.map((attendance) => (
              <Grid item xs={12} sm={6} md={4} key={attendance.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {attendance.class_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {new Date(attendance.date).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={t(`attendance.${attendance.status}`)}
                      color={getAttendanceStatusColor(attendance.status)}
                      size="small"
                    />
                    {attendance.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {attendance.notes}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Grade Records
          </Typography>
          <Grid container spacing={2}>
            {studentGrades.map((grade) => (
              <Grid item xs={12} sm={6} md={4} key={grade.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {grade.subject_name}
                    </Typography>
                    <Typography variant="h4" color={`${getGradeColor(grade.percentage)}.main`}>
                      {grade.percentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {grade.grade_value}/{grade.max_grade}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(grade.date_given).toLocaleDateString()}
                    </Typography>
                    {grade.grade_type && (
                      <Chip
                        label={grade.grade_type}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Student Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStudent?.user?.full_name || selectedStudent?.student_id}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedStudent && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Student Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Student ID:</strong> {selectedStudent.student_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {selectedStudent.user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {selectedStudent.phone_number || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Gender:</strong> {selectedStudent.gender ? t(`genders.${selectedStudent.gender}`) : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Enrollment Date:</strong> {new Date(selectedStudent.enrollment_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Emergency Contact
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Contact:</strong> {selectedStudent.emergency_contact || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {selectedStudent.emergency_phone || 'N/A'}
                </Typography>
                {selectedStudent.address && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudent.address}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentManagementPage;

