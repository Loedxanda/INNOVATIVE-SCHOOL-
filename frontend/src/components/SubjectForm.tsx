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
  Chip,
  OutlinedInput,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SubjectCreate, SubjectUpdate } from '../types/subject';

interface SubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectCreate | SubjectUpdate) => void;
  subject?: any; // For editing
  loading?: boolean;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  open,
  onClose,
  onSubmit,
  subject,
  loading = false,
}) => {
  const { t } = useTranslation();
  const isEdit = !!subject;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubjectCreate | SubjectUpdate>({
    defaultValues: subject || {
      name: '',
      code: '',
      description: '',
      grade_levels: [],
      credits: 1,
    },
  });

  const watchedGradeLevels = watch('grade_levels');

  React.useEffect(() => {
    if (subject) {
      reset(subject);
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        grade_levels: [],
        credits: 1,
      });
    }
  }, [subject, reset]);

  const handleFormSubmit = (data: SubjectCreate | SubjectUpdate) => {
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? t('subjects.editSubject') : t('subjects.addSubject')}
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
                    label={t('subjects.subjectName')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="code"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('subjects.subjectCode')}
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="credits"
                control={control}
                rules={{ 
                  required: t('common.required'),
                  min: { value: 1, message: t('subjects.minCredits') },
                  max: { value: 10, message: t('subjects.maxCredits') }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={t('subjects.credits')}
                    error={!!errors.credits}
                    helperText={errors.credits?.message}
                    disabled={loading}
                    inputProps={{ min: 1, max: 10 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="grade_levels"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.grade_levels}>
                    <InputLabel>{t('subjects.gradeLevels')}</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label={t('subjects.gradeLevels')} />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={t(`gradeLevels.${value}`)} />
                          ))}
                        </Box>
                      )}
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
                    label={t('subjects.description')}
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

export default SubjectForm;

