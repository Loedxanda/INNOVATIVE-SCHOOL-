import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  TextField,
  Typography,
  Rating,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab
} from '@mui/material';
import {
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const ResourceHub = () => {
  const [resources, setResources] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Mock data for demonstration
  const mockResources = [
    {
      id: 1,
      title: "Mathematics Lesson Plan - Algebra Basics",
      description: "Comprehensive lesson plan for introducing algebra concepts to 8th grade students",
      subject: "Mathematics",
      grade_level: "secondary_2",
      category: "lesson_plan",
      tags: "algebra, equations, variables",
      rating: 4.5,
      upload_date: "2023-10-15",
      uploader: "John Smith"
    },
    {
      id: 2,
      title: "Science Experiment Worksheet - Chemical Reactions",
      description: "Worksheet for students to record observations during chemical reactions lab",
      subject: "Science",
      grade_level: "secondary_3",
      category: "worksheet",
      tags: "chemistry, experiments, reactions",
      rating: 4.2,
      upload_date: "2023-10-10",
      uploader: "Sarah Johnson"
    },
    {
      id: 3,
      title: "English Literature Presentation - Shakespeare",
      description: "Interactive presentation on the works of William Shakespeare",
      subject: "English",
      grade_level: "secondary_4",
      category: "presentation",
      tags: "shakespeare, literature, drama",
      rating: 4.8,
      upload_date: "2023-10-05",
      uploader: "Michael Brown"
    }
  ];

  useEffect(() => {
    // In a real implementation, this would fetch from the backend
    setResources(mockResources);
  }, []);

  const handleUploadResource = () => {
    // In a real implementation, this would open a form to upload a resource
    setOpenUploadDialog(true);
  };

  const handleSearch = () => {
    // In a real implementation, this would filter resources based on search criteria
    console.log("Searching for:", searchTerm, selectedSubject, selectedGrade);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teacher Resource Hub</Typography>
        <Button 
          variant="contained" 
          startIcon={<UploadIcon />}
          onClick={handleUploadResource}
        >
          Upload Resource
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Resources" />
        <Tab label="My Uploads" />
        <Tab label="Favorites" />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
        <Button variant="outlined" startIcon={<FilterIcon />}>
          Filters
        </Button>
      </Box>

      <Grid container spacing={3}>
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                sx={{ pt: '56.25%' }}
                image={`https://source.unsplash.com/random/800x600/?${resource.subject}`}
                title={resource.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {resource.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {resource.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={resource.subject} size="small" />
                  <Chip label={resource.grade_level} size="small" />
                  <Chip label={resource.category} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Rating value={resource.rating} precision={0.5} readOnly />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small">
                      <CommentIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ThumbUpIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Uploaded by {resource.uploader} on {resource.upload_date}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Resource</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select label="Subject">
                <MenuItem value="mathematics">Mathematics</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="history">History</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Grade Level</InputLabel>
              <Select label="Grade Level">
                <MenuItem value="primary_1">Primary 1</MenuItem>
                <MenuItem value="primary_2">Primary 2</MenuItem>
                <MenuItem value="secondary_1">Secondary 1</MenuItem>
                <MenuItem value="secondary_2">Secondary 2</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select label="Category">
                <MenuItem value="lesson_plan">Lesson Plan</MenuItem>
                <MenuItem value="worksheet">Worksheet</MenuItem>
                <MenuItem value="presentation">Presentation</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="assessment">Assessment</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Tags (comma separated)"
              margin="normal"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Make this resource public"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenUploadDialog(false)}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ResourceHub;