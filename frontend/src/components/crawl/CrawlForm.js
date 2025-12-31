import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Language, PlayArrow } from '@mui/icons-material';
import { generateFAQs } from '../../services/api';

const CrawlForm = ({ onSuccess }) => {
  const [url, setUrl] = useState('');
  const [count, setCount] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const trimmedUrl = url.trim();
      const result = await generateFAQs(trimmedUrl, count);
      
      setSuccess(`Successfully generated ${result.faqs.count} FAQs!`);
      
      if (onSuccess) {
        onSuccess(trimmedUrl);
      }
      
     
      setTimeout(() => {
        setUrl('');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to generate FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generate FAQs from Website
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Website URL"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Language />
                  </InputAdornment>
                ),
              }}
              helperText="Enter the full URL of the website to crawl"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="FAQ Count"
              type="number"
              value={count}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 5;
                setCount(Math.min(Math.max(value, 5), 10));
              }}
              disabled={loading}
              inputProps={{ min: 5, max: 10 }}
              helperText="5-10 FAQs"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || !url.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              sx={{ height: '56px' }}
            >
              {loading ? 'Generating...' : 'Generate FAQs'}
            </Button>
          </Grid>
        </Grid>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default CrawlForm;


