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
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Description as ReportCardIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Grade, GradeSummary, ClassGradeSummary, GradeStatistics } from '../types/grade';
import { gradeService } from '../services/gradeService';
import Gradebook from '../components/Gradebook';
import ReportCardComponent from '../components/ReportCard';

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
      id={`grade-tabpanel-${index}`}
      aria-labelledby={`grade-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GradeManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [gradeStatistics, setGradeStatistics] = useState<GradeStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClassChange = (classId: number) => {
    setSelectedClass(classId);
    if (classId) {
      loadGradeStatistics(classId);
    }
  };

  const loadGradeStatistics = async (classId: number) => {
    try {
      setLoading(true);
      setError('');

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
      const endDate = new Date();

      const statistics = await gradeService.getGradeStatistics(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        classId
      );

      setGradeStatistics(statistics);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load grade statistics');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getLetterGrade = (percentage: number) => {
    return gradeService.calculateLetterGrade(percentage);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('grades.title')}
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="grade management tabs">
            <Tab
              icon={<AssessmentIcon />}
              label={t('grades.gradebook')}
              id="grade-tab-0"
              aria-controls="grade-tabpanel-0"
            />
            <Tab
              icon={<ReportCardIcon />}
              label={t('grades.reportCard')}
              id="grade-tab-1"
              aria-controls="grade-tabpanel-1"
            />
            <Tab
              icon={<BarChartIcon />}
              label={t('grades.statistics')}
              id="grade-tab-2"
              aria-controls="grade-tabpanel-2"
            />
            <Tab
              icon={<TrendingUpIcon />}
              label={t('grades.analytics')}
              id="grade-tab-3"
              aria-controls="grade-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Gradebook 
            classId={selectedClass as number}
            subjectId={selectedSubject as number}
            onGradeAdded={() => {
              if (selectedClass) {
                loadGradeStatistics(selectedClass as number);
              }
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ReportCardComponent 
            studentId={undefined}
            classId={selectedClass as number}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            {t('grades.statistics')}
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

          {/* Grade Statistics */}
          {gradeStatistics && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('grades.totalGrades')}
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {gradeStatistics.total_grades}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('grades.averageGrade')}
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {gradeStatistics.class_summaries[0]?.average_percentage.toFixed(1) || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('grades.classes')}
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {gradeStatistics.class_summaries.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('grades.students')}
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {gradeStatistics.student_rankings.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Class Summaries */}
          {gradeStatistics && gradeStatistics.class_summaries.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('grades.classSummaries')}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('classes.className')}</TableCell>
                        <TableCell>{t('subjects.subjectName')}</TableCell>
                        <TableCell>{t('grades.averageGrade')}</TableCell>
                        <TableCell>{t('grades.averagePercentage')}</TableCell>
                        <TableCell>{t('grades.totalStudents')}</TableCell>
                        <TableCell>{t('grades.gradeDistribution')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gradeStatistics.class_summaries.map((summary) => (
                        <TableRow key={`${summary.class_id}-${summary.subject_name}`}>
                          <TableCell>{summary.class_name}</TableCell>
                          <TableCell>{summary.subject_name}</TableCell>
                          <TableCell>{summary.average_grade.toFixed(1)}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {summary.average_percentage.toFixed(1)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={summary.average_percentage}
                                color={getGradeColor(summary.average_percentage)}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{summary.total_students}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              <Chip label={`A: ${summary.grade_distribution.A}`} size="small" color="success" />
                              <Chip label={`B: ${summary.grade_distribution.B}`} size="small" color="info" />
                              <Chip label={`C: ${summary.grade_distribution.C}`} size="small" color="warning" />
                              <Chip label={`D: ${summary.grade_distribution.D}`} size="small" color="default" />
                              <Chip label={`F: ${summary.grade_distribution.F}`} size="small" color="error" />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Student Rankings */}
          {gradeStatistics && gradeStatistics.student_rankings.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('grades.studentRankings')}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('grades.rank')}</TableCell>
                        <TableCell>{t('students.studentName')}</TableCell>
                        <TableCell>{t('students.studentId')}</TableCell>
                        <TableCell>{t('classes.className')}</TableCell>
                        <TableCell>{t('grades.overallAverage')}</TableCell>
                        <TableCell>{t('grades.overallPercentage')}</TableCell>
                        <TableCell>{t('grades.letterGrade')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gradeStatistics.student_rankings.map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell>
                            <Chip
                              label={`#${student.rank}`}
                              color={student.rank <= 3 ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{student.student_name}</TableCell>
                          <TableCell>{student.student_id_number}</TableCell>
                          <TableCell>{student.class_name}</TableCell>
                          <TableCell>{student.overall_average.toFixed(1)}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {student.overall_percentage.toFixed(1)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={student.overall_percentage}
                                color={getGradeColor(student.overall_percentage)}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getLetterGrade(student.overall_percentage)}
                              color={getGradeColor(student.overall_percentage)}
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
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            {t('grades.analytics')}
          </Typography>
          
          {/* Analytics Placeholder */}
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary">
                {t('grades.analyticsPlaceholder')}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default GradeManagementPage;

