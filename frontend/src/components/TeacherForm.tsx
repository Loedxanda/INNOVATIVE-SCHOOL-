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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TeacherCreate, TeacherUpdate } from '../types/teacher';

interface TeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherCreate | TeacherUpdate) => void;
  teacher?: any; // For editing
  loading?: boolean;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  onClose,
  onSubmit,
  teacher,
  loading = false,
}) => {
  const { t } = useTranslation();
  const isEdit = !!teacher;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherCreate | TeacherUpdate>({
    defaultValues: teacher || {
      teacher_id: '',
      employee_id: '',
      date_of_birth: '',
      gender: 'male',
      address: '',
      phone_number: '',
      qualification: '',
      specialization: '',
    },
  });

  React.useEffect(() => {
    if (teacher) {
      reset(teacher);
    } else {
      reset({
        teacher_id: '',
        employee_id: '',
        date_of_birth: '',
        gender: 'male',
        address: '',
        phone_number: '',
        qualification: '',
        specialization: '',
      });
    }
  }, [teacher, reset]);

  const handleFormSubmit = (data: TeacherCreate | TeacherUpdate) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? t('teachers.editTeacher') : t('teachers.addTeacher')}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="teacher_id"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('teachers.teacherId')}
                    error={!!errors.teacher_id}
                    helperText={errors.teacher_id?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="employee_id"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('teachers.employeeId')}
                    error={!!errors.employee_id}
                    helperText={errors.employee_id?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('teachers.gender')}</InputLabel>
                    <Select
                      {...field}
                      label={t('teachers.gender')}
                      disabled={loading}
                    >
                      <MenuItem value="male">{t('genders.male')}</MenuItem>
                      <MenuItem value="female">{t('genders.female')}</MenuItem>
                      <MenuItem value="other">{t('genders.other')}</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label={t('teachers.dateOfBirth')}
                    disabled={loading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.date_of_birth,
                        helperText: errors.date_of_birth?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('teachers.phoneNumber')}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="specialization"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('teachers.specialization')}
                    error={!!errors.specialization}
                    helperText={errors.specialization?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="qualification"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label={t('teachers.qualification')}
                    error={!!errors.qualification}
                    helperText={errors.qualification?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label={t('teachers.address')}
                    error={!!errors.address}
                    helperText={errors.address?.message}
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

export default TeacherForm;

