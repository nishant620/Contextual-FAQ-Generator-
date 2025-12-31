import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Paper,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AutoAwesome as AutoAwesomeIcon,
  Web as WebIcon,
  QuestionAnswer as QuestionAnswerIcon,
  CloudDownload as CloudDownloadIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <WebIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Web Crawling',
      description: 'Automatically crawl and extract content from any website with advanced text cleaning and normalization.'
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI-Powered Generation',
      description: 'Generate high-quality FAQs using Claude AI, ensuring relevant and accurate question-answer pairs.'
    },
    {
      icon: <QuestionAnswerIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'FAQ Management',
      description: 'Edit, review, and manage your FAQs with an intuitive admin dashboard. Draft and publish workflow included.'
    },
    {
      icon: <CloudDownloadIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Export & Integrate',
      description: 'Export FAQs as JSON or CSV. Easy integration with your existing systems and applications.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Fast & Efficient',
      description: 'Quick processing with optimized crawling and AI generation. Generate 5-10 FAQs in seconds.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Reliable',
      description: 'Built with security best practices. Your data is safe and your API keys are protected.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Contextual FAQ Generator
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontSize: { xs: '1.1rem', md: '1.3rem' }
              }}
            >
              Transform any website into comprehensive FAQs using AI-powered content analysis
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                View Dashboard
              </Button>
            </Stack>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Powerful Features
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Everything you need to generate and manage FAQs efficiently
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Paper sx={{ bgcolor: 'grey.50', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Simple three-step process to generate FAQs
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  1
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Enter Website URL
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Simply paste the URL of the website you want to generate FAQs from
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  2
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  AI Generates FAQs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our AI analyzes the content and generates 5-10 relevant FAQs automatically
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  3
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Edit & Export
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Review, edit, and export your FAQs as JSON or CSV for use in your application
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Paper
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 6,
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Ready to Generate FAQs?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Start creating contextual FAQs for your website today
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;


