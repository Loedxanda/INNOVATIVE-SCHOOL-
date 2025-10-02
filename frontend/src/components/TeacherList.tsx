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
  Work as WorkIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Teacher } from '../types/teacher';
import { teacherService } from '../services/teacherService';
import TeacherForm from './TeacherForm';

interface TeacherListProps {
  onTeacherSelect?: (teacher: Teacher) => void;
  showActions?: boolean;
}

const TeacherList: React.FC<TeacherListProps> = ({
  onTeacherSelect,
  showActions = true,
}) => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTeacher, setMenuTeacher] = useState<Teacher | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    loadTeachers();
  }, [page, searchQuery]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: Teacher[];
      if (searchQuery) {
        data = await teacherService.searchTeachers(searchQuery);
      } else {
        data = await teacherService.getTeachers((page - 1) * itemsPerPage, itemsPerPage);
      }
      
      setTeachers(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    if (onTeacherSelect) {
      onTeacherSelect(teacher);
    }
    setAnchorEl(null);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        // Implement delete functionality
        await loadTeachers();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete teacher');
      }
    }
    setAnchorEl(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.id, data);
      } else {
        await teacherService.createTeacher(data);
      }
      setFormOpen(false);
      await loadTeachers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save teacher');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, teacher: Teacher) => {
    setAnchorEl(event.currentTarget);
    setMenuTeacher(teacher);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTeacher(null);
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
          {t('teachers.title')}
        </Typography>
        {showActions && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTeacher}
          >
            {t('teachers.addTeacher')}
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

      {/* Teachers Grid */}
      <Grid container spacing={3}>
        {teachers.map((teacher) => (
          <Grid item xs={12} sm={6} md={4} key={teacher.id}>
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
                cursor: onTeacherSelect ? 'pointer' : 'default',
              }}
              onClick={() => onTeacherSelect && onTeacherSelect(teacher)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                      {teacher.user?.full_name?.charAt(0) || teacher.teacher_id.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {teacher.user?.full_name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {teacher.teacher_id}
                      </Typography>
                    </Box>
                  </Box>
                  {showActions && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, teacher);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>

                <Box mb={2}>
                  <Chip
                    label={getStatusText(teacher.is_active)}
                    color={getStatusColor(teacher.is_active)}
                    size="small"
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  {teacher.phone_number && (
                    <Box display="flex" alignItems="center">
                      <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {teacher.phone_number}
                      </Typography>
                    </Box>
                  )}
                  {teacher.user?.email && (
                    <Box display="flex" alignItems="center">
                      <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {teacher.user.email}
                      </Typography>
                    </Box>
                  )}
                  {teacher.specialization && (
                    <Box display="flex" alignItems="center">
                      <WorkIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {teacher.specialization}
                      </Typography>
                    </Box>
                  )}
                  {teacher.qualification && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {teacher.qualification}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {!searchQuery && totalPages > 1 && (
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
        <MenuItem onClick={() => handleViewTeacher(menuTeacher!)}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('common.view')}
        </MenuItem>
        <MenuItem onClick={() => handleEditTeacher(menuTeacher!)}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTeacher(menuTeacher!)}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Teacher Form Dialog */}
      <TeacherForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        teacher={editingTeacher}
      />
    </Box>
  );
};

export default TeacherList;

