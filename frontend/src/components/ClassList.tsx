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
  TextField,
  InputAdornment,
  Pagination,
  Grid,
  Alert,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Class } from '../types/class';
import { classService } from '../services/classService';
import ClassForm from './ClassForm';

interface ClassListProps {
  onClassSelect?: (classData: Class) => void;
  showActions?: boolean;
  gradeLevel?: string;
  academicYear?: string;
}

const ClassList: React.FC<ClassListProps> = ({
  onClassSelect,
  showActions = true,
  gradeLevel,
  academicYear,
}) => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuClass, setMenuClass] = useState<Class | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    loadClasses();
  }, [page, searchQuery, gradeLevel, academicYear]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: Class[];
      if (searchQuery) {
        data = await classService.searchClasses(searchQuery);
      } else if (gradeLevel) {
        data = await classService.getClassesByGradeLevel(gradeLevel);
      } else if (academicYear) {
        data = await classService.getClassesByAcademicYear(academicYear);
      } else {
        data = await classService.getClasses((page - 1) * itemsPerPage, itemsPerPage);
      }
      
      setClasses(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleAddClass = () => {
    setEditingClass(null);
    setFormOpen(true);
  };

  const handleEditClass = (classData: Class) => {
    setEditingClass(classData);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleViewClass = (classData: Class) => {
    setSelectedClass(classData);
    if (onClassSelect) {
      onClassSelect(classData);
    }
    setAnchorEl(null);
  };

  const handleDeleteClass = async (classData: Class) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        // Implement delete functionality
        await loadClasses();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete class');
      }
    }
    setAnchorEl(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingClass) {
        await classService.updateClass(editingClass.id, data);
      } else {
        await classService.createClass(data);
      }
      setFormOpen(false);
      await loadClasses();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save class');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, classData: Class) => {
    setAnchorEl(event.currentTarget);
    setMenuClass(classData);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuClass(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? t('common.active') : t('common.inactive');
  };

  const getGradeLevelColor = (gradeLevel: string) => {
    const colors: { [key: string]: string } = {
      'nursery': '#e91e63',
      'kindergarten': '#9c27b0',
      'grade_1': '#673ab7',
      'grade_2': '#3f51b5',
      'grade_3': '#2196f3',
      'grade_4': '#03a9f4',
      'grade_5': '#00bcd4',
      'grade_6': '#009688',
      'grade_7': '#4caf50',
      'grade_8': '#8bc34a',
      'grade_9': '#cddc39',
      'grade_10': '#ffeb3b',
      'grade_11': '#ffc107',
      'grade_12': '#ff9800',
    };
    return colors[gradeLevel] || '#757575';
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
          {t('classes.title')}
        </Typography>
        {showActions && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClass}
          >
            {t('classes.addClass')}
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

      {/* Classes Grid */}
      <Grid container spacing={3}>
        {classes.map((classData) => (
          <Grid item xs={12} sm={6} md={4} key={classData.id}>
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
                cursor: onClassSelect ? 'pointer' : 'default',
              }}
              onClick={() => onClassSelect && onClassSelect(classData)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: getGradeLevelColor(classData.grade_level) }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {classData.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t(`gradeLevels.${classData.grade_level}`)}
                      </Typography>
                    </Box>
                  </Box>
                  {showActions && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, classData);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>

                <Box mb={2}>
                  <Chip
                    label={getStatusText(classData.is_active)}
                    color={getStatusColor(classData.is_active)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={classData.academic_year}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center">
                    <PeopleIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {t('classes.capacity')}: {classData.capacity}
                    </Typography>
                  </Box>
                  {classData.enrollments && (
                    <Box display="flex" alignItems="center">
                      <AssignmentIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {t('classes.enrollments')}: {classData.enrollments.length}
                      </Typography>
                    </Box>
                  )}
                  {classData.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {classData.description}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {!searchQuery && !gradeLevel && !academicYear && totalPages > 1 && (
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
        <MenuItem onClick={() => handleViewClass(menuClass!)}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('common.view')}
        </MenuItem>
        <MenuItem onClick={() => handleEditClass(menuClass!)}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClass(menuClass!)}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Class Form Dialog */}
      <ClassForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        class={editingClass}
      />
    </Box>
  );
};

export default ClassList;

