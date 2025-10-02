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
  Book as BookIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Subject, ClassAssignment } from '../types/subject';
import { subjectService } from '../services/subjectService';
import SubjectList from '../components/SubjectList';
import SubjectForm from '../components/SubjectForm';

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
      id={`subject-tabpanel-${index}`}
      aria-labelledby={`subject-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SubjectManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectAssignments, setSubjectAssignments] = useState<ClassAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [gradeLevelFilter, setGradeLevelFilter] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setDetailsOpen(true);
    await loadSubjectDetails(subject.id);
  };

  const loadSubjectDetails = async (subjectId: number) => {
    try {
      setLoading(true);
      setError('');

      const assignments = await subjectService.getSubjectClassAssignments(subjectId);
      setSubjectAssignments(assignments);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const gradeLevels = [
    'nursery', 'kindergarten', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5',
    'grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('subjects.title')}
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="subject management tabs">
            <Tab
              icon={<BookIcon />}
              label={t('subjects.title')}
              id="subject-tab-0"
              aria-controls="subject-tabpanel-0"
            />
            <Tab
              icon={<SchoolIcon />}
              label={t('nav.classes')}
              id="subject-tab-1"
              aria-controls="subject-tabpanel-1"
            />
            <Tab
              icon={<PeopleIcon />}
              label={t('nav.teachers')}
              id="subject-tab-2"
              aria-controls="subject-tabpanel-2"
            />
            <Tab
              icon={<AssessmentIcon />}
              label={t('nav.grades')}
              id="subject-tab-3"
              aria-controls="subject-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Box display="flex" gap={2} mb={3}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t('subjects.gradeLevels')}</InputLabel>
              <Select
                value={gradeLevelFilter}
                onChange={(e) => setGradeLevelFilter(e.target.value)}
                label={t('subjects.gradeLevels')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {gradeLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {t(`gradeLevels.${level}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <SubjectList 
            onSubjectSelect={handleSubjectSelect} 
            showActions={true}
            gradeLevel={gradeLevelFilter || undefined}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Class Assignments
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('subjects.subjectName')}</TableCell>
                  <TableCell>{t('subjects.subjectCode')}</TableCell>
                  <TableCell>{t('classes.className')}</TableCell>
                  <TableCell>{t('classes.gradeLevel')}</TableCell>
                  <TableCell>{t('nav.teachers')}</TableCell>
                  <TableCell>{t('classes.academicYear')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjectAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.subject?.name || 'Unknown'}</TableCell>
                    <TableCell>{assignment.subject?.code || 'N/A'}</TableCell>
                    <TableCell>{assignment.class?.name || 'Unknown'}</TableCell>
                    <TableCell>{assignment.class?.grade_level ? t(`gradeLevels.${assignment.class.grade_level}`) : 'N/A'}</TableCell>
                    <TableCell>{assignment.teacher?.user?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{assignment.academic_year}</TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.is_active ? t('common.active') : t('common.inactive')}
                        color={assignment.is_active ? 'success' : 'default'}
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
            {subjectAssignments.map((assignment) => (
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
                      {assignment.class?.name || 'Unknown Class'}
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
            Grade Statistics
          </Typography>
          <Grid container spacing={2}>
            {subjectAssignments.map((assignment) => (
              <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {assignment.subject?.name || 'Unknown Subject'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {assignment.class?.name || 'Unknown Class'}
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {/* Placeholder for average grade */}
                      85.5%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Grade
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.academic_year}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Subject Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSubject?.name || 'Subject Details'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedSubject && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Subject Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Name:</strong> {selectedSubject.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Code:</strong> {selectedSubject.code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Credits:</strong> {selectedSubject.credits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> {selectedSubject.is_active ? t('common.active') : t('common.inactive')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Grade Levels
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedSubject.grade_levels.map((level) => (
                    <Chip
                      key={level}
                      label={t(`gradeLevels.${level}`)}
                      size="small"
                    />
                  ))}
                </Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Statistics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Class Assignments:</strong> {subjectAssignments.length}
                </Typography>
                {selectedSubject.description && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSubject.description}
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

export default SubjectManagementPage;

