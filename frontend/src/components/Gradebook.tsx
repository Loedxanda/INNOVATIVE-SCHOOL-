import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Pagination,
  Grid,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Grade, GradeSummary, ClassGradeSummary, GradeBase, GradeCreate, GradeUpdate } from '../types/grade';
import { gradeService } from '../services/gradeService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { studentService } from '../services/studentService';
import GradeForm from './GradeForm';

interface GradebookProps {
  classId?: number;
  subjectId?: number;
  onGradeAdded?: () => void;
}

const Gradebook: React.FC<GradebookProps> = ({
  classId,
  subjectId,
  onGradeAdded,
}) => {
  const { t } = useTranslation();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | ''>(classId || '');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>(subjectId || '');
  const [gradeSummary, setGradeSummary] = useState<ClassGradeSummary | null>(null);

  const itemsPerPage = 20;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass || selectedSubject) {
      loadGrades();
    }
  }, [selectedClass, selectedSubject, page, searchQuery]);

  const loadInitialData = async () => {
    try {
      const [classesData, subjectsData, studentsData] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
        studentService.getStudents(),
      ]);
      
      setClasses(classesData);
      setSubjects(subjectsData);
      setStudents(studentsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load initial data');
    }
  };

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: any = {};
      if (selectedClass) filters.class_id = selectedClass;
      if (selectedSubject) filters.subject_id = selectedSubject;
      if (searchQuery) filters.search = searchQuery;
      
      const data = await gradeService.getGrades(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        filters
      );
      
      setGrades(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
      // Load grade summary if class is selected
      if (selectedClass) {
        const summary = await gradeService.getClassGradeSummary(selectedClass as number, selectedSubject as number);
        setGradeSummary(summary);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleAddGrade = () => {
    setEditingGrade(null);
    setFormOpen(true);
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setFormOpen(true);
  };

  const handleDeleteGrade = async (grade: Grade) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await gradeService.deleteGrade(grade.id);
        await loadGrades();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete grade');
      }
    }
  };

  const handleFormSubmit = async (data: GradeBase) => {
    try {
      if (editingGrade) {
        // For updates, we need to cast to GradeUpdate and add the id
        const updateData: GradeUpdate = {
          id: editingGrade.id,
          ...data
        };
        await gradeService.updateGrade(editingGrade.id, updateData);
      } else {
        // For creates, we need to cast to GradeCreate and ensure required fields
        const createData: GradeCreate = {
          student_id: data.student_id,
          subject_id: data.subject_id,
          class_id: data.class_id,
          grade_value: data.grade_value,
          max_grade: data.max_grade,
          grade_type: data.grade_type,
          description: data.description,
          date_given: data.date_given || new Date().toISOString().split('T')[0]
        };
        await gradeService.createGrade(createData);
      }
      setFormOpen(false);
      await loadGrades();
      if (onGradeAdded) {
        onGradeAdded();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save grade');
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
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>{t('classes.title')}</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as number)}
                  label={t('classes.title')}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {classes.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.id}>
                      {classItem.name} - {t(`gradeLevels.${classItem.grade_level}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>{t('subjects.title')}</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as number)}
                  label={t('subjects.title')}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddGrade}
                fullWidth
              >
                {t('grades.addGrade')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grade Summary */}
      {gradeSummary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {gradeSummary.class_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t(`gradeLevels.${gradeSummary.grade_level}`)}
                </Typography>
                <Typography variant="h4" color={`${getGradeColor(gradeSummary.average_percentage)}.main`}>
                  {gradeSummary.average_percentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('grades.averageGrade')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary.main">
                  {gradeSummary.total_students}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('grades.totalStudents')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {gradeSummary.grade_distribution.A}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A Grades
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="error.main">
                  {gradeSummary.grade_distribution.F}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  F Grades
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Grades Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('grades.title')}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('students.studentName')}</TableCell>
                  <TableCell>{t('subjects.subjectName')}</TableCell>
                  <TableCell>{t('grades.gradeValue')}</TableCell>
                  <TableCell>{t('grades.percentage')}</TableCell>
                  <TableCell>{t('grades.letterGrade')}</TableCell>
                  <TableCell>{t('grades.gradeType')}</TableCell>
                  <TableCell>{t('grades.dateGiven')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>{grade.student?.user?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{grade.subject?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {grade.grade_value} / {grade.max_grade}
                    </TableCell>
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
                        label={getLetterGrade(grade.percentage)}
                        color={getGradeColor(grade.percentage)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {grade.grade_type && (
                        <Chip
                          label={t(`grades.types.${grade.grade_type}`)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>{new Date(grade.date_given).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditGrade(grade)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGrade(grade)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Grade Form Dialog */}
      <GradeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        grade={editingGrade}
        students={students.map(s => ({
          id: s.id,
          name: s.user?.full_name || 'Unknown',
          student_id: s.student_id,
        }))}
        subjects={subjects}
        classes={classes}
      />
    </Box>
  );
};

export default Gradebook;

