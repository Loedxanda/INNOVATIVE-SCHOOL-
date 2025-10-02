import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ClassCreate, ClassUpdate } from '../types/class';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClassCreate | ClassUpdate) => void;
  class?: any; // For editing
  loading?: boolean;
}

const ClassForm: React.FC<ClassFormProps> = ({
  open,
  onClose,
  onSubmit,
  class: classData,
  loading = false,
}) => {
  const { t } = useTranslation();
  const isEdit = !!classData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassCreate | ClassUpdate>({
    defaultValues: classData || {
      name: '',
      grade_level: '',
      academic_year: '',
      capacity: 30,
      description: '',
    },
  });

  React.useEffect(() => {
    if (classData) {
      reset(classData);
    } else {
      reset({
        name: '',
        grade_level: '',
        academic_year: '',
        capacity: 30,
        description: '',
      });
    }
  }, [classData, reset]);

  const handleFormSubmit = (data: ClassCreate | ClassUpdate) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const gradeLevels = [
    'nursery', 'kindergarten', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5',
    'grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'
  ];

  const academicYears = [
    '2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028'
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? t('classes.editClass') : t('classes.addClass')}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('classes.className')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="grade_level"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.grade_level}>
                    <InputLabel>{t('classes.gradeLevel')}</InputLabel>
                    <Select
                      {...field}
                      label={t('classes.gradeLevel')}
                      disabled={loading}
                    >
                      {gradeLevels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {t(`gradeLevels.${level}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="academic_year"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.academic_year}>
                    <InputLabel>{t('classes.academicYear')}</InputLabel>
                    <Select
                      {...field}
                      label={t('classes.academicYear')}
                      disabled={loading}
                    >
                      {academicYears.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="capacity"
                control={control}
                rules={{ 
                  required: t('common.required'),
                  min: { value: 1, message: t('classes.minCapacity') },
                  max: { value: 100, message: t('classes.maxCapacity') }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={t('classes.capacity')}
                    error={!!errors.capacity}
                    helperText={errors.capacity?.message}
                    disabled={loading}
                    inputProps={{ min: 1, max: 100 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label={t('classes.description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? t('common.loading') : (isEdit ? t('common.save') : t('common.add'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClassForm;

