import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhoneAndroid as PushIcon,
  Announcement as AnnouncementIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Notification, NotificationStats } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const NotificationCenter: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, [filterType, filterStatus]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {};
      if (filterType) filters.type = filterType;
      if (filterStatus) filters.status = filterStatus;

      const data = await notificationService.getNotifications(0, 100, filters);
      setNotifications(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await notificationService.getNotificationStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load notification stats:', err);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await notificationService.markAsRead(notification.id);
      await loadNotifications();
      await loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark notification as read');
    }
  };

  const handleMarkAsUnread = async (notification: Notification) => {
    try {
      await notificationService.markAsUnread(notification.id);
      await loadNotifications();
      await loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark notification as unread');
    }
  };

  const handleArchive = async (notification: Notification) => {
    try {
      await notificationService.archiveNotification(notification.id);
      await loadNotifications();
      await loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to archive notification');
    }
  };

  const handleDelete = async (notification: Notification) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await notificationService.deleteNotification(notification.id);
        await loadNotifications();
        await loadStats();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete notification');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(0); // Assuming current user ID
      await loadNotifications();
      await loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark all as read');
    }
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailsOpen(true);
    
    // Mark as read if unread
    if (notification.status === 'unread') {
      handleMarkAsRead(notification);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'attendance':
        return <AssignmentIcon color="primary" />;
      case 'grade':
        return <AssessmentIcon color="secondary" />;
      case 'announcement':
        return <AnnouncementIcon color="info" />;
      case 'reminder':
        return <NotificationsIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <EmailIcon />;
      case 'sms':
        return <SmsIcon />;
      case 'push':
        return <PushIcon />;
      case 'in_app':
        return <NotificationsIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'primary';
      case 'read':
        return 'default';
      case 'archived':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (tabValue === 0) return notification.status !== 'archived';
    if (tabValue === 1) return notification.status === 'unread';
    if (tabValue === 2) return notification.status === 'read';
    if (tabValue === 3) return notification.status === 'archived';
    return true;
  });

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
        <Typography variant="h5" gutterBottom>
          {t('notifications.title')}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadNotifications}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<MarkReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={stats?.unread_count === 0}
          >
            {t('notifications.markAllRead')}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {stats.total_notifications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('notifications.total')}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.unread_count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('notifications.unread')}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.read_count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('notifications.read')}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.archived_count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('notifications.archived')}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t('notifications.type')}</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label={t('notifications.type')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="info">{t('notifications.types.info')}</MenuItem>
            <MenuItem value="success">{t('notifications.types.success')}</MenuItem>
            <MenuItem value="warning">{t('notifications.types.warning')}</MenuItem>
            <MenuItem value="error">{t('notifications.types.error')}</MenuItem>
            <MenuItem value="attendance">{t('notifications.types.attendance')}</MenuItem>
            <MenuItem value="grade">{t('notifications.types.grade')}</MenuItem>
            <MenuItem value="announcement">{t('notifications.types.announcement')}</MenuItem>
            <MenuItem value="reminder">{t('notifications.types.reminder')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t('notifications.status')}</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label={t('notifications.status')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="unread">{t('notifications.unread')}</MenuItem>
            <MenuItem value="read">{t('notifications.read')}</MenuItem>
            <MenuItem value="archived">{t('notifications.archived')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="notification tabs">
            <Tab
              icon={<NotificationsIcon />}
              label={t('notifications.all')}
              id="notification-tab-0"
              aria-controls="notification-tabpanel-0"
            />
            <Tab
              icon={<Badge badgeContent={stats?.unread_count} color="error" />}
              label={t('notifications.unread')}
              id="notification-tab-1"
              aria-controls="notification-tabpanel-1"
            />
            <Tab
              icon={<MarkReadIcon />}
              label={t('notifications.read')}
              id="notification-tab-2"
              aria-controls="notification-tabpanel-2"
            />
            <Tab
              icon={<ArchiveIcon />}
              label={t('notifications.archived')}
              id="notification-tab-3"
              aria-controls="notification-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <NotificationList
            notifications={filteredNotifications}
            onViewDetails={handleViewDetails}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getNotificationIcon={getNotificationIcon}
            getChannelIcon={getChannelIcon}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <NotificationList
            notifications={filteredNotifications}
            onViewDetails={handleViewDetails}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getNotificationIcon={getNotificationIcon}
            getChannelIcon={getChannelIcon}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <NotificationList
            notifications={filteredNotifications}
            onViewDetails={handleViewDetails}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getNotificationIcon={getNotificationIcon}
            getChannelIcon={getChannelIcon}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <NotificationList
            notifications={filteredNotifications}
            onViewDetails={handleViewDetails}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getNotificationIcon={getNotificationIcon}
            getChannelIcon={getChannelIcon}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabPanel>
      </Card>

      {/* Notification Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNotification?.title}
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedNotification.message}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  label={t(`notifications.types.${selectedNotification.type}`)}
                  color={getPriorityColor(selectedNotification.priority)}
                  size="small"
                />
                <Chip
                  label={t(`notifications.priorities.${selectedNotification.priority}`)}
                  color={getPriorityColor(selectedNotification.priority)}
                  size="small"
                />
                <Chip
                  label={t(`notifications.statuses.${selectedNotification.status}`)}
                  color={getStatusColor(selectedNotification.status)}
                  size="small"
                />
                <Chip
                  icon={getChannelIcon(selectedNotification.channel)}
                  label={t(`notifications.channels.${selectedNotification.channel}`)}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {t('notifications.createdAt')}: {new Date(selectedNotification.created_at).toLocaleString()}
              </Typography>
              {selectedNotification.sent_at && (
                <Typography variant="body2" color="text.secondary">
                  {t('notifications.sentAt')}: {new Date(selectedNotification.sent_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            {t('common.close')}
          </Button>
          {selectedNotification?.status === 'unread' && (
            <Button
              variant="contained"
              startIcon={<MarkReadIcon />}
              onClick={() => {
                handleMarkAsRead(selectedNotification!);
                setDetailsOpen(false);
              }}
            >
              {t('notifications.markAsRead')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Notification List Component
const NotificationList: React.FC<{
  notifications: Notification[];
  onViewDetails: (notification: Notification) => void;
  onMarkAsRead: (notification: Notification) => void;
  onMarkAsUnread: (notification: Notification) => void;
  onArchive: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  getChannelIcon: (channel: string) => React.ReactElement;
  getPriorityColor: (priority: string) => any;
  getStatusColor: (status: string) => any;
}> = ({
  notifications,
  onViewDetails,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  getNotificationIcon,
  getChannelIcon,
  getPriorityColor,
  getStatusColor,
}) => {
  const { t } = useTranslation();

  if (notifications.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          {t('notifications.noNotifications')}
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {notifications.map((notification) => (
        <ListItem
          key={notification.id}
          button
          onClick={() => onViewDetails(notification)}
          sx={{
            borderLeft: notification.status === 'unread' ? 4 : 0,
            borderLeftColor: notification.status === 'unread' ? 'primary.main' : 'transparent',
            bgcolor: notification.status === 'unread' ? 'action.hover' : 'transparent',
          }}
        >
          <Avatar sx={{ mr: 2 }}>
            {getNotificationIcon(notification.type)}
          </Avatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1" fontWeight={notification.status === 'unread' ? 'bold' : 'normal'}>
                  {notification.title}
                </Typography>
                <Chip
                  label={t(`notifications.priorities.${notification.priority}`)}
                  color={getPriorityColor(notification.priority)}
                  size="small"
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {notification.message}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Chip
                    icon={getChannelIcon(notification.channel)}
                    label={t(`notifications.channels.${notification.channel}`)}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Box display="flex" gap={0.5}>
              {notification.status === 'unread' ? (
                <Tooltip title={t('notifications.markAsRead')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification);
                    }}
                  >
                    <MarkReadIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t('notifications.markAsUnread')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsUnread(notification);
                    }}
                  >
                    <MarkReadIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('notifications.archive')}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(notification);
                  }}
                >
                  <ArchiveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.delete')}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default NotificationCenter;

