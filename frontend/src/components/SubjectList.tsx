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
  Book as BookIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Subject } from '../types/subject';
import { subjectService } from '../services/subjectService';
import SubjectForm from './SubjectForm';

interface SubjectListProps {
  onSubjectSelect?: (subject: Subject) => void;
  showActions?: boolean;
  gradeLevel?: string;
}

const SubjectList: React.FC<SubjectListProps> = ({
  onSubjectSelect,
  showActions = true,
  gradeLevel,
}) => {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSubject, setMenuSubject] = useState<Subject | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    loadSubjects();
  }, [page, searchQuery, gradeLevel]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: Subject[];
      if (searchQuery) {
        data = await subjectService.searchSubjects(searchQuery);
      } else if (gradeLevel) {
        data = await subjectService.getSubjectsByGradeLevel(gradeLevel);
      } else {
        data = await subjectService.getSubjects((page - 1) * itemsPerPage, itemsPerPage);
      }
      
      setSubjects(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setFormOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
    setAnchorEl(null);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        // Implement delete functionality
        await loadSubjects();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete subject');
      }
    }
    setAnchorEl(null);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, data);
      } else {
        await subjectService.createSubject(data);
      }
      setFormOpen(false);
      await loadSubjects();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save subject');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, subject: Subject) => {
    setAnchorEl(event.currentTarget);
    setMenuSubject(subject);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSubject(null);
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
          {t('subjects.title')}
        </Typography>
        {showActions && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSubject}
          >
            {t('subjects.addSubject')}
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

      {/* Subjects Grid */}
      <Grid container spacing={3}>
        {subjects.map((subject) => (
          <Grid item xs={12} sm={6} md={4} key={subject.id}>
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
                cursor: onSubjectSelect ? 'pointer' : 'default',
              }}
              onClick={() => onSubjectSelect && onSubjectSelect(subject)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <BookIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {subject.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subject.code}
                      </Typography>
                    </Box>
                  </Box>
                  {showActions && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, subject);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>

                <Box mb={2}>
                  <Chip
                    label={getStatusText(subject.is_active)}
                    color={getStatusColor(subject.is_active)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${subject.credits} ${t('subjects.credits')}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center">
                    <SchoolIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {subject.grade_levels.map(level => t(`gradeLevels.${level}`)).join(', ')}
                    </Typography>
                  </Box>
                  {subject.class_assignments && (
                    <Box display="flex" alignItems="center">
                      <AssignmentIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {t('subjects.assignments')}: {subject.class_assignments.length}
                      </Typography>
                    </Box>
                  )}
                  {subject.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {subject.description}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {!searchQuery && !gradeLevel && totalPages > 1 && (
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
        <MenuItem onClick={() => handleViewSubject(menuSubject!)}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('common.view')}
        </MenuItem>
        <MenuItem onClick={() => handleEditSubject(menuSubject!)}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleDeleteSubject(menuSubject!)}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Subject Form Dialog */}
      <SubjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        subject={editingSubject}
      />
    </Box>
  );
};

export default SubjectList;

