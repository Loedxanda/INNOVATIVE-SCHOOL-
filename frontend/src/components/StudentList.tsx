import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Pagination,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Student } from '../types/student';
import { studentService } from '../services/studentService';
import StudentForm from './StudentForm';

interface StudentListProps {
  onStudentSelect?: (student: Student) => void;
  showActions?: boolean;
  classId?: number; // Filter by class if provided
}

const StudentList: React.FC<StudentListProps> = ({
  onStudentSelect,
  showActions = true,
  classId,
}) => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuStudent, setMenuStudent] = useState<Student | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    loadStudents();
  }, [page, searchQuery, classId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: Student[];
      if (classId) {
        data = await studentService.getStudentsByClass(classId);
      } else if (searchQuery) {
        data = await studentService.searchStudents(searchQuery);
      } else {
        data = await studentService.getStudents((page - 1) * itemsPerPage, itemsPerPage);
      }
      
      setStudents(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    if (onStudentSelect) {
      onStudentSelect(student);
    }
    setAnchorEl(null);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        // Implement delete functionality
        await loadStudents();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete student');
      }
    }
    setAnchorEl(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, data);
      } else {
        await studentService.createStudent(data);
      }
      setFormOpen(false);
      await loadStudents();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save student');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, student: Student) => {
    setAnchorEl(event.currentTarget);
    setMenuStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuStudent(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? t('common.active') : t('common.inactive');
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {t('students.title')}
        </Typography>
        {showActions && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStudent}
          >
            {t('students.addStudent')}
          </Button>
        )}
      </Box>

      {/* Search */}
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
        sx={{ mb: 3 }}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Students Grid */}
      <Grid container spacing={3}>
        {students.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                cursor: onStudentSelect ? 'pointer' : 'default',
              }}
              onClick={() => onStudentSelect && onStudentSelect(student)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {student.user?.full_name?.charAt(0) || student.student_id.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {student.user?.full_name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.student_id}
                      </Typography>
                    </Box>
                  </Box>
                  {showActions && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, student);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>

                <Box mb={2}>
                  <Chip
                    label={getStatusText(student.is_active)}
                    color={getStatusColor(student.is_active)}
                    size="small"
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  {student.phone_number && (
                    <Box display="flex" alignItems="center">
                      <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {student.phone_number}
                      </Typography>
                    </Box>
                  )}
                  {student.user?.email && (
                    <Box display="flex" alignItems="center">
                      <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {student.user.email}
                      </Typography>
                    </Box>
                  )}
                  {student.gender && (
                    <Typography variant="body2" color="text.secondary">
                      {t(`genders.${student.gender}`)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {!searchQuery && !classId && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewStudent(menuStudent!)}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('common.view')}
        </MenuItem>
        <MenuItem onClick={() => handleEditStudent(menuStudent!)}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteStudent(menuStudent!)}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Student Form Dialog */}
      <StudentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        student={editingStudent}
      />
    </Box>
  );
};

export default StudentList;

