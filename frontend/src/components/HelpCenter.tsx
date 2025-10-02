import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  ContactSupport as ContactIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Map as MapIcon,
  Chat as ChatIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  views: number;
}

interface HelpVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  thumbnail: string;
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

interface HelpCenterProps {
  userRole: 'admin' | 'teacher' | 'student' | 'parent';
}

const HelpCenter: React.FC<HelpCenterProps> = ({ userRole }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [videos, setVideos] = useState<HelpVideo[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setArticles([
        {
          id: '1',
          title: t('help.articles.gettingStarted.title'),
          content: t('help.articles.gettingStarted.content'),
          category: 'getting-started',
          tags: ['setup', 'basics'],
          lastUpdated: '2024-01-15',
          views: 1250
        },
        {
          id: '2',
          title: t('help.articles.managingStudents.title'),
          content: t('help.articles.managingStudents.content'),
          category: 'students',
          tags: ['students', 'management'],
          lastUpdated: '2024-01-10',
          views: 890
        },
        {
          id: '3',
          title: t('help.articles.gradingSystem.title'),
          content: t('help.articles.gradingSystem.content'),
          category: 'grades',
          tags: ['grades', 'assessment'],
          lastUpdated: '2024-01-12',
          views: 756
        }
      ]);

      setVideos([
        {
          id: '1',
          title: t('help.videos.platformOverview.title'),
          description: t('help.videos.platformOverview.description'),
          url: 'https://example.com/video1',
          duration: '5:30',
          thumbnail: '/thumbnails/video1.jpg',
          category: 'getting-started'
        },
        {
          id: '2',
          title: t('help.videos.attendanceTracking.title'),
          description: t('help.videos.attendanceTracking.description'),
          url: 'https://example.com/video2',
          duration: '8:15',
          thumbnail: '/thumbnails/video2.jpg',
          category: 'attendance'
        }
      ]);

      setFaqs([
        {
          id: '1',
          question: t('help.faqs.howToAddStudent.question'),
          answer: t('help.faqs.howToAddStudent.answer'),
          category: 'students',
          helpful: 45
        },
        {
          id: '2',
          question: t('help.faqs.howToMarkAttendance.question'),
          answer: t('help.faqs.howToMarkAttendance.answer'),
          category: 'attendance',
          helpful: 38
        },
        {
          id: '3',
          question: t('help.faqs.howToGenerateReport.question'),
          answer: t('help.faqs.howToGenerateReport.answer'),
          category: 'reports',
          helpful: 42
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [t]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleFAQChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'students':
        return <PeopleIcon />;
      case 'grades':
        return <AssessmentIcon />;
      case 'attendance':
        return <SchoolIcon />;
      case 'settings':
        return <SettingsIcon />;
      case 'notifications':
        return <NotificationsIcon />;
      case 'maps':
        return <MapIcon />;
      default:
        return <HelpIcon />;
    }
  };

  const getRoleSpecificContent = () => {
    switch (userRole) {
      case 'admin':
        return {
          quickActions: [
            { title: t('help.quickActions.manageUsers'), icon: <PeopleIcon />, href: '/admin/users' },
            { title: t('help.quickActions.systemSettings'), icon: <SettingsIcon />, href: '/admin/settings' },
            { title: t('help.quickActions.reports'), icon: <AssessmentIcon />, href: '/admin/reports' }
          ],
          categories: ['getting-started', 'students', 'teachers', 'grades', 'attendance', 'settings']
        };
      case 'teacher':
        return {
          quickActions: [
            { title: t('help.quickActions.myClasses'), icon: <SchoolIcon />, href: '/teacher/classes' },
            { title: t('help.quickActions.markAttendance'), icon: <SchoolIcon />, href: '/teacher/attendance' },
            { title: t('help.quickActions.gradebook'), icon: <AssessmentIcon />, href: '/teacher/grades' }
          ],
          categories: ['getting-started', 'classes', 'attendance', 'grades', 'students']
        };
      case 'student':
        return {
          quickActions: [
            { title: t('help.quickActions.myGrades'), icon: <AssessmentIcon />, href: '/student/grades' },
            { title: t('help.quickActions.myAttendance'), icon: <SchoolIcon />, href: '/student/attendance' },
            { title: t('help.quickActions.myClasses'), icon: <SchoolIcon />, href: '/student/classes' }
          ],
          categories: ['getting-started', 'grades', 'attendance', 'classes']
        };
      case 'parent':
        return {
          quickActions: [
            { title: t('help.quickActions.childProgress'), icon: <AssessmentIcon />, href: '/parent/progress' },
            { title: t('help.quickActions.childAttendance'), icon: <SchoolIcon />, href: '/parent/attendance' },
            { title: t('help.quickActions.communication'), icon: <ChatIcon />, href: '/parent/communication' }
          ],
          categories: ['getting-started', 'child-progress', 'attendance', 'communication']
        };
      default:
        return { quickActions: [], categories: [] };
    }
  };

  const roleContent = getRoleSpecificContent();

  const TabPanel = ({ children, value, index, ...other }: any) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('help.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('help.subtitle')}
        </Typography>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder={t('help.searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('help.quickActions.title')}
        </Typography>
        <Grid container spacing={2}>
          {roleContent.quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {action.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {action.title}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" href={action.href}>
                    {t('common.learnMore')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label={t('help.tabs.articles')} />
          <Tab label={t('help.tabs.videos')} />
          <Tab label={t('help.tabs.faq')} />
          <Tab label={t('help.tabs.contact')} />
        </Tabs>
      </Box>

      {/* Articles Tab */}
      <TabPanel value={selectedTab} index={0}>
        <Grid container spacing={3}>
          {filteredArticles.map((article) => (
            <Grid item xs={12} md={6} key={article.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getCategoryIcon(article.category)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {article.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {article.content.substring(0, 150)}...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {article.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('help.article.views', { count: article.views })} • {t('help.article.lastUpdated', { date: article.lastUpdated })}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">
                    {t('common.readMore')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Videos Tab */}
      <TabPanel value={selectedTab} index={1}>
        <Grid container spacing={3}>
          {filteredVideos.map((video) => (
            <Grid item xs={12} md={6} key={video.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VideoIcon />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {video.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {video.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('help.video.duration', { duration: video.duration })}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" href={video.url} target="_blank">
                    {t('common.watch')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* FAQ Tab */}
      <TabPanel value={selectedTab} index={2}>
        {filteredFAQs.map((faq) => (
          <Accordion
            key={faq.id}
            expanded={expandedFAQ === faq.id}
            onChange={handleFAQChange(faq.id)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {faq.answer}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('help.faq.helpful', { count: faq.helpful })}
                </Typography>
                <Button size="small" variant="outlined">
                  {t('help.faq.wasHelpful')}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      {/* Contact Tab */}
      <TabPanel value={selectedTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('help.contact.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('help.contact.description')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('help.contact.email')}
                      secondary="support@innovativeschool.cm"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('help.contact.phone')}
                      secondary="+237 6XX XXX XXX"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChatIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('help.contact.chat')}
                      secondary={t('help.contact.chatDescription')}
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button variant="contained" startIcon={<EmailIcon />}>
                  {t('help.contact.sendEmail')}
                </Button>
                <Button variant="outlined" startIcon={<ChatIcon />}>
                  {t('help.contact.startChat')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('help.contact.officeHours')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary={t('help.contact.weekdays')}
                      secondary="8:00 AM - 6:00 PM"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t('help.contact.weekends')}
                      secondary="9:00 AM - 2:00 PM"
                    />
                  </ListItem>
                </List>
                <Alert severity="info" sx={{ mt: 2 }}>
                  {t('help.contact.responseTime')}
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default HelpCenter;

