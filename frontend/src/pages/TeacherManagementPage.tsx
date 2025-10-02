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
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Teacher, TeacherClass, TeacherStudent, TeacherAttendance, TeacherGrade } from '../types/teacher';
import { teacherService } from '../services/teacherService';
import TeacherList from '../components/TeacherList';
import TeacherForm from '../components/TeacherForm';

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
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TeacherManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>([]);
  const [teacherGrades, setTeacherGrades] = useState<TeacherGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTeacherSelect = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailsOpen(true);
    await loadTeacherDetails(teacher.id);
  };

  const loadTeacherDetails = async (teacherId: number) => {
    try {
      setLoading(true);
      setError('');

      const [classes, students] = await Promise.all([
        teacherService.getTeacherClasses(teacherId),
        teacherService.getTeacherStudents(teacherId),
      ]);

      setTeacherClasses(classes);
      setTeacherStudents(students);
      // Note: Attendance and grades would need separate API calls
      setTeacherAttendance([]);
      setTeacherGrades([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load teacher details');
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
        {t('teachers.title')}
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="teacher management tabs">
            <Tab
              icon={<PeopleIcon />}
              label={t('teachers.title')}
              id="teacher-tab-0"
              aria-controls="teacher-tabpanel-0"
            />
            <Tab
              icon={<SchoolIcon />}
              label={t('nav.classes')}
              id="teacher-tab-1"
              aria-controls="teacher-tabpanel-1"
            />
            <Tab
              icon={<AssignmentIcon />}
              label={t('nav.attendance')}
              id="teacher-tab-2"
              aria-controls="teacher-tabpanel-2"
            />
            <Tab
              icon={<AssessmentIcon />}
              label={t('nav.grades')}
              id="teacher-tab-3"
              aria-controls="teacher-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TeacherList onTeacherSelect={handleTeacherSelect} showActions={true} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Teacher Classes
          </Typography>
          <Grid container spacing={2}>
            {teacherClasses.map((classItem) => (
              <Grid item xs={12} sm={6} md={4} key={classItem.assignment_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {classItem.class_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t(`gradeLevels.${classItem.grade_level}`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {classItem.subject_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {classItem.academic_year}
                    </Typography>
                    <Chip
                      label={classItem.is_active ? t('common.active') : t('common.inactive')}
                      color={classItem.is_active ? 'success' : 'default'}
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
            Attendance Management
          </Typography>
          <Grid container spacing={2}>
            {teacherAttendance.map((attendance) => (
              <Grid item xs={12} sm={6} md={4} key={attendance.attendance_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {attendance.student_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
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
            Grade Management
          </Typography>
          <Grid container spacing={2}>
            {teacherGrades.map((grade) => (
              <Grid item xs={12} sm={6} md={4} key={grade.grade_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {grade.student_name}
                    </Typography>
                    <Typography variant="h4" color={`${getGradeColor(grade.percentage)}.main`}>
                      {grade.percentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {grade.subject_name}
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

      {/* Teacher Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTeacher?.user?.full_name || selectedTeacher?.teacher_id}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedTeacher && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Teacher Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Teacher ID:</strong> {selectedTeacher.teacher_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Employee ID:</strong> {selectedTeacher.employee_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {selectedTeacher.user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {selectedTeacher.phone_number || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Gender:</strong> {selectedTeacher.gender ? t(`genders.${selectedTeacher.gender}`) : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Hire Date:</strong> {new Date(selectedTeacher.hire_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Professional Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Specialization:</strong> {selectedTeacher.specialization || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Qualification:</strong> {selectedTeacher.qualification || 'N/A'}
                </Typography>
                {selectedTeacher.address && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTeacher.address}
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

export default TeacherManagementPage;

