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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ReportCard as ReportCardType } from '../types/grade';
import { gradeService } from '../services/gradeService';
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';

interface ReportCardProps {
  studentId?: number;
  classId?: number;
}

const ReportCardComponent: React.FC<ReportCardProps> = ({
  studentId,
  classId,
}) => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | ''>(studentId || '');
  const [selectedClass, setSelectedClass] = useState<number | ''>(classId || '');
  const [academicYear, setAcademicYear] = useState<string>('2024-2025');
  const [term, setTerm] = useState<string>('1');
  const [reportCard, setReportCard] = useState<ReportCardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [studentsData, classesData] = await Promise.all([
        studentService.getStudents(),
        classService.getClasses(),
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load initial data');
    }
  };

  const generateReportCard = async () => {
    if (!selectedStudent || !selectedClass) return;
    
    try {
      setLoading(true);
      setError('');
      
      const data = await gradeService.generateReportCard(
        selectedStudent as number,
        selectedClass as number,
        academicYear,
        term
      );
      
      setReportCard(data);
      setPreviewOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate report card');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reportCard) return;
    
    // Create PDF content (simplified version)
    const content = generatePDFContent(reportCard);
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-card-${reportCard.student_name}-${academicYear}-term-${term}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!reportCard) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePDFContent(reportCard));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePDFContent = (reportCard: ReportCardType): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${reportCard.student_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .student-info { margin-bottom: 20px; }
          .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .grades-table th, .grades-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .grades-table th { background-color: #f2f2f2; }
          .summary { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORT CARD</h1>
          <h2>${reportCard.class_name} - ${t(`gradeLevels.${reportCard.grade_level}`)}</h2>
          <p>Academic Year: ${reportCard.academic_year} | Term: ${reportCard.term}</p>
        </div>
        
        <div class="student-info">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> ${reportCard.student_name}</p>
          <p><strong>Student ID:</strong> ${reportCard.student_id_number}</p>
          <p><strong>Class:</strong> ${reportCard.class_name}</p>
        </div>
        
        <table class="grades-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th>Credits</th>
              <th>Average Grade</th>
              <th>Percentage</th>
              <th>Letter Grade</th>
            </tr>
          </thead>
          <tbody>
            ${reportCard.subjects.map(subject => `
              <tr>
                <td>${subject.subject_name}</td>
                <td>${subject.subject_code}</td>
                <td>${subject.credits}</td>
                <td>${subject.average_grade.toFixed(1)}</td>
                <td>${subject.average_percentage.toFixed(1)}%</td>
                <td>${subject.letter_grade}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Overall Average:</strong> ${reportCard.overall_average.toFixed(1)} (${reportCard.overall_percentage.toFixed(1)}%)</p>
          <p><strong>Overall Letter Grade:</strong> ${reportCard.overall_letter_grade}</p>
          <p><strong>Total Credits:</strong> ${reportCard.total_credits}</p>
          <p><strong>Attendance:</strong> ${reportCard.attendance_summary.attendance_percentage.toFixed(1)}%</p>
        </div>
      </body>
      </html>
    `;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const academicYears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
  const terms = ['1', '2', '3'];

  return (
    <Box>
      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>{t('students.title')}</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value as number)}
                  label={t('students.title')}
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.user?.full_name || 'Unknown'} ({student.student_id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  label="Academic Year"
                >
                  {academicYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  label="Term"
                >
                  {terms.map((termValue) => (
                    <MenuItem key={termValue} value={termValue}>
                      Term {termValue}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={generateReportCard}
                disabled={loading || !selectedStudent || !selectedClass}
                fullWidth
              >
                {loading ? t('common.loading') : t('grades.generateReportCard')}
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

      {/* Report Card Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('grades.reportCard')} - {reportCard?.student_name}
        </DialogTitle>
        <DialogContent>
          {reportCard && (
            <Box>
              {/* Header */}
              <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  {t('grades.reportCard')}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {reportCard.class_name} - {t(`gradeLevels.${reportCard.grade_level}`)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Academic Year: {reportCard.academic_year} | Term: {reportCard.term}
                </Typography>
              </Paper>

              {/* Student Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('students.studentInformation')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>{t('students.studentName')}:</strong> {reportCard.student_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>{t('students.studentId')}:</strong> {reportCard.student_id_number}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>{t('classes.className')}:</strong> {reportCard.class_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>{t('classes.gradeLevel')}:</strong> {t(`gradeLevels.${reportCard.grade_level}`)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Grades Table */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('grades.subjectGrades')}
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('subjects.subjectName')}</TableCell>
                          <TableCell>{t('subjects.subjectCode')}</TableCell>
                          <TableCell>{t('subjects.credits')}</TableCell>
                          <TableCell>{t('grades.averageGrade')}</TableCell>
                          <TableCell>{t('grades.percentage')}</TableCell>
                          <TableCell>{t('grades.letterGrade')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportCard.subjects.map((subject) => (
                          <TableRow key={subject.subject_id}>
                            <TableCell>{subject.subject_name}</TableCell>
                            <TableCell>{subject.subject_code}</TableCell>
                            <TableCell>{subject.credits}</TableCell>
                            <TableCell>{subject.average_grade.toFixed(1)}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2">
                                  {subject.average_percentage.toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={subject.average_percentage}
                                  color={getGradeColor(subject.average_percentage)}
                                  sx={{ width: 60, height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={subject.letter_grade}
                                color={getGradeColor(subject.average_percentage)}
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

              {/* Summary */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('grades.summary')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>{t('grades.overallAverage')}:</strong> {reportCard.overall_average.toFixed(1)} ({reportCard.overall_percentage.toFixed(1)}%)
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>{t('grades.overallLetterGrade')}:</strong> {reportCard.overall_letter_grade}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>{t('grades.totalCredits')}:</strong> {reportCard.total_credits}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>{t('attendance.attendancePercentage')}:</strong> {reportCard.attendance_summary.attendance_percentage.toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Comments */}
              {reportCard.comments && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('grades.comments')}
                    </Typography>
                    <Typography variant="body2">
                      {reportCard.comments}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            {t('common.close')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            {t('common.download')}
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            {t('common.print')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportCardComponent;

