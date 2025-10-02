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
import { StudentCreate, StudentUpdate } from '../types/student';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentCreate | StudentUpdate) => void;
  student?: any; // For editing
  loading?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSubmit,
  student,
  loading = false,
}) => {
  const { t } = useTranslation();
  const isEdit = !!student;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentCreate | StudentUpdate>({
    defaultValues: student || {
      student_id: '',
      date_of_birth: '',
      gender: 'male',
      address: '',
      phone_number: '',
      emergency_contact: '',
      emergency_phone: '',
    },
  });

  React.useEffect(() => {
    if (student) {
      reset(student);
    } else {
      reset({
        student_id: '',
        date_of_birth: '',
        gender: 'male',
        address: '',
        phone_number: '',
        emergency_contact: '',
        emergency_phone: '',
      });
    }
  }, [student, reset]);

  const handleFormSubmit = (data: StudentCreate | StudentUpdate) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? t('students.editStudent') : t('students.addStudent')}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="student_id"
                control={control}
                rules={{ required: t('common.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('students.studentId')}
                    error={!!errors.student_id}
                    helperText={errors.student_id?.message}
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
                    <InputLabel>{t('students.gender')}</InputLabel>
                    <Select
                      {...field}
                      label={t('students.gender')}
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
                    label={t('students.dateOfBirth')}
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
                    label={t('students.phoneNumber')}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
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
                    label={t('students.address')}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="emergency_contact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('students.emergencyContact')}
                    error={!!errors.emergency_contact}
                    helperText={errors.emergency_contact?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="emergency_phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('students.emergencyPhone')}
                    error={!!errors.emergency_phone}
                    helperText={errors.emergency_phone?.message}
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

export default StudentForm;

