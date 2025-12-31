import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { updateFAQ } from '../../services/api';

const EditFAQModal = ({ open, onClose, faq, onUpdate }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question || '');
      setAnswer(faq.answer || '');
      setError(null);
    }
  }, [faq]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      setError('Question and answer are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await updateFAQ(faq._id, {
        question: question.trim(),
        answer: answer.trim(),
      });

      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setQuestion('');
      setAnswer('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit FAQ</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Source URL
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {faq?.sourceUrl}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            required
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading}
            required
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !question.trim() || !answer.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditFAQModal;



