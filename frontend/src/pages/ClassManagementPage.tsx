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
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Class, ClassAssignment, Enrollment } from '../types/class';
import { classService } from '../services/classService';
import ClassList from '../components/ClassList';
import ClassForm from '../components/ClassForm';

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
      id={`class-tabpanel-${index}`}
      aria-labelledby={`class-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ClassManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classAssignments, setClassAssignments] = useState<ClassAssignment[]>([]);
  const [classEnrollments, setClassEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [gradeLevelFilter, setGradeLevelFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClassSelect = async (classData: Class) => {
    setSelectedClass(classData);
    setDetailsOpen(true);
    await loadClassDetails(classData.id);
  };

  const loadClassDetails = async (classId: number) => {
    try {
      setLoading(true);
      setError('');

      const [assignments, enrollments] = await Promise.all([
        classService.getClassAssignments(classId),
        classService.getClassEnrollments(classId),
      ]);

      setClassAssignments(assignments);
      setClassEnrollments(enrollments);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  const gradeLevels = [
    'nursery', 'kindergarten', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5',
    'grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'
  ];

  const academicYears = [
    '2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028'
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('classes.title')}
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="class management tabs">
            <Tab
              icon={<SchoolIcon />}
              label={t('classes.title')}
              id="class-tab-0"
              aria-controls="class-tabpanel-0"
            />
            <Tab
              icon={<PeopleIcon />}
              label={t('nav.students')}
              id="class-tab-1"
              aria-controls="class-tabpanel-1"
            />
            <Tab
              icon={<AssignmentIcon />}
              label={t('nav.teachers')}
              id="class-tab-2"
              aria-controls="class-tabpanel-2"
            />
            <Tab
              icon={<AssessmentIcon />}
              label={t('nav.subjects')}
              id="class-tab-3"
              aria-controls="class-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Box display="flex" gap={2} mb={3}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t('classes.gradeLevel')}</InputLabel>
              <Select
                value={gradeLevelFilter}
                onChange={(e) => setGradeLevelFilter(e.target.value)}
                label={t('classes.gradeLevel')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {gradeLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {t(`gradeLevels.${level}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t('classes.academicYear')}</InputLabel>
              <Select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                label={t('classes.academicYear')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {academicYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <ClassList 
            onClassSelect={handleClassSelect} 
            showActions={true}
            gradeLevel={gradeLevelFilter || undefined}
            academicYear={academicYearFilter || undefined}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Student Enrollments
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('students.studentName')}</TableCell>
                  <TableCell>{t('students.studentId')}</TableCell>
                  <TableCell>{t('classes.className')}</TableCell>
                  <TableCell>{t('classes.enrollmentDate')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>{enrollment.student?.user?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{enrollment.student?.student_id || 'N/A'}</TableCell>
                    <TableCell>{selectedClass?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={enrollment.is_active ? t('common.active') : t('common.inactive')}
                        color={enrollment.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Teacher Assignments
          </Typography>
          <Grid container spacing={2}>
            {classAssignments.map((assignment) => (
              <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {assignment.teacher?.user?.full_name || 'Unknown Teacher'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {assignment.subject?.name || 'Unknown Subject'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {assignment.subject?.code || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {assignment.academic_year}
                    </Typography>
                    <Chip
                      label={assignment.is_active ? t('common.active') : t('common.inactive')}
                      color={assignment.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Subject Assignments
          </Typography>
          <Grid container spacing={2}>
            {classAssignments.map((assignment) => (
              <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {assignment.subject?.name || 'Unknown Subject'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {assignment.subject?.code || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('classes.taughtBy')}: {assignment.teacher?.user?.full_name || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {assignment.academic_year}
                    </Typography>
                    <Chip
                      label={assignment.is_active ? t('common.active') : t('common.inactive')}
                      color={assignment.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Class Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedClass?.name || 'Class Details'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedClass && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Class Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Name:</strong> {selectedClass.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Grade Level:</strong> {t(`gradeLevels.${selectedClass.grade_level}`)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Academic Year:</strong> {selectedClass.academic_year}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Capacity:</strong> {selectedClass.capacity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> {selectedClass.is_active ? t('common.active') : t('common.inactive')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Statistics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Current Enrollments:</strong> {classEnrollments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Teacher Assignments:</strong> {classAssignments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Available Spots:</strong> {selectedClass.capacity - classEnrollments.length}
                </Typography>
                {selectedClass.description && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedClass.description}
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

export default ClassManagementPage;

