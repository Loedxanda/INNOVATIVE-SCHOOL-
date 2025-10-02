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
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GradeCreate, GradeUpdate, GradeBase } from '../types/grade';
import { gradeService } from '../services/gradeService';

interface GradeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GradeBase) => void;
  grade?: any; // For editing
  loading?: boolean;
  students?: Array<{ id: number; name: string; student_id: string }>;
  subjects?: Array<{ id: number; name: string; code: string }>;
  classes?: Array<{ id: number; name: string; grade_level: string }>;
}

const GradeForm: React.FC<GradeFormProps> = ({
  open,
  onClose,
  onSubmit,
  grade,
  loading = false,
  students = [],
  subjects = [],
  classes = [],
}) => {
  const { t } = useTranslation();
  const isEdit = !!grade;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GradeBase>({
    defaultValues: grade || {
      student_id: 0,
      subject_id: 0,
      class_id: 0,
      grade_value: 0,
      max_grade: 100,
      grade_type: 'assignment',
      description: '',
      date_given: new Date().toISOString().split('T')[0],
    },
  });

  const watchedGradeValue = Number(watch('grade_value') ?? 0);
  const watchedMaxGrade = Number(watch('max_grade') ?? 0);
  const percentage = watchedMaxGrade > 0 ? (watchedGradeValue / watchedMaxGrade) * 100 : 0;

  React.useEffect(() => {
    if (grade) {
      reset(grade);
    } else {
      reset({
        student_id: 0,
        subject_id: 0,
        class_id: 0,
        grade_value: 0,
        max_grade: 100,
        grade_type: 'assignment',
        description: '',
        date_given: new Date().toISOString().split('T')[0],
      });
    }
  }, [grade, reset]);

  const handleFormSubmit = (data: GradeBase) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const gradeTypes = [
    'assignment',
    'quiz',
    'test',
    'exam',
    'project',
    'homework',
    'participation',
    'lab',
    'presentation',
    'other',
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? t('grades.editGrade') : t('grades.addGrade')}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!isEdit && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="student_id"
                    control={control}
                    rules={{ required: t('common.required') }}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.student_id)}>
                        <InputLabel>{t('students.title')}</InputLabel>
                        <Select
                          {...field}
                          label={t('students.title')}
                          disabled={loading}
                        >
                          {students.map((student) => (
                            <MenuItem key={student.id} value={student.id}>
                              {student.name} ({student.student_id})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="subject_id"
                    control={control}
                    rules={{ required: t('common.required') }}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.subject_id)}>
                        <InputLabel>{t('subjects.title')}</InputLabel>
                        <Select
                          {...field}
                          label={t('subjects.title')}
                          disabled={loading}
                        >
                          {subjects.map((subject) => (
                            <MenuItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="class_id"
                    control={control}
                    rules={{ required: t('common.required') }}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.class_id)}>
                        <InputLabel>{t('classes.title')}</InputLabel>
                        <Select
                          {...field}
                          label={t('classes.title')}
                          disabled={loading}
                        >
                          {classes.map((classItem) => (
                            <MenuItem key={classItem.id} value={classItem.id}>
                              {classItem.name} - {t(`gradeLevels.${classItem.grade_level}`)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name="grade_value"
                control={control}
                rules={{ 
                  required: t('common.required'),
                  min: { value: 0, message: t('grades.minGradeValue') },
                  max: { value: 1000, message: t('grades.maxGradeValue') }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={t('grades.gradeValue')}
                    error={!!errors.grade_value}
                    helperText={errors.grade_value?.message}
                    disabled={loading}
                    inputProps={{ min: 0, max: 1000, step: 0.1 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="max_grade"
                control={control}
                rules={{ 
                  required: t('common.required'),
                  min: { value: 1, message: t('grades.minMaxGrade') },
                  max: { value: 1000, message: t('grades.maxMaxGrade') }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={t('grades.maxGrade')}
                    error={!!errors.max_grade}
                    helperText={errors.max_grade?.message}
                    disabled={loading}
                    inputProps={{ min: 1, max: 1000, step: 0.1 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="grade_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('grades.gradeType')}</InputLabel>
                    <Select
                      {...field}
                      label={t('grades.gradeType')}
                      disabled={loading}
                    >
                      {gradeTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {t(`grades.types.${type}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="date_given"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label={t('grades.dateGiven')}
                    disabled={loading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.date_given,
                        helperText: errors.date_given?.message,
                      },
                    }}
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
                    label={t('grades.description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Grade Preview */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('grades.gradePreview')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('grades.gradeValue')}: {watchedGradeValue} / {watchedMaxGrade}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('grades.percentage')}: {percentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('grades.letterGrade')}: {gradeService.calculateLetterGrade(percentage)}
                </Typography>
              </Box>
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

export default GradeForm;
