
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import CrawlForm from '../components/crawl/CrawlForm';
import FAQList from '../components/faq/FAQList';
import { getFAQs } from '../services/api';

const Dashboard = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizeUrl = (url) => {
    if (!url) return '';
    return url.trim().replace(/\/+$/, '').toLowerCase();
  };

  const fetchFAQs = async (sourceUrl = null) => {
    try {
      setLoading(true);
      const data = await getFAQs();
      let allFaqs = data.faqs || [];

      if (sourceUrl) {
        const normalizedSourceUrl = normalizeUrl(sourceUrl);
        allFaqs = allFaqs.filter(faq =>
          normalizeUrl(faq.sourceUrl) === normalizedSourceUrl
        );
      }

      setFaqs(allFaqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUrl = localStorage.getItem('currentUrl');
    if (savedUrl) {
      setCurrentUrl(savedUrl);
    }
  }, []);

  useEffect(() => {
    fetchFAQs(currentUrl);
  }, [refreshKey, currentUrl]);

  const handleSuccess = (url) => {
    localStorage.setItem('currentUrl', url);
    setCurrentUrl(url);
    setRefreshKey(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          FAQ Generator Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crawl websites and generate contextual FAQs using AI
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <CrawlForm onSuccess={handleSuccess} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <FAQList
          faqs={faqs}
          loading={loading}
          onUpdate={handleRefresh}
          currentUrl={currentUrl}
        />
      </Paper>
    </Container>
  );
};

export default Dashboard;
