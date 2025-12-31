import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import EditFAQModal from './EditFAQModal';
import { publishFAQ, exportFAQs, updateFAQ } from '../../services/api';

const FAQList = ({ faqs, loading, onUpdate, currentUrl }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handleEdit = (faq) => {
    setSelectedFAQ(faq);
    setEditModalOpen(true);
  };

  const handlePublish = async (faq) => {
    try {
      if (faq.status === 'draft') {
        await publishFAQ(faq._id);
      } else {
        await updateFAQ(faq._id, { status: 'draft' });
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating FAQ status:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportError(null);
      
      const data = await exportFAQs('json');
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `faqs-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error.message || 'Failed to export FAQs');
    } finally {
      setExporting(false);
    }
  };

  const publishedCount = faqs.filter(faq => faq.status === 'published').length;
  const draftCount = faqs.filter(faq => faq.status === 'draft').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            FAQs ({faqs.length})
            {currentUrl && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontStyle: 'italic' }}>
                for {currentUrl}
              </Typography>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Published: {publishedCount} | Draft: {draftCount}
            {currentUrl && (
              <span> | Showing only current website</span>
            )}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={exporting || faqs.length === 0}
        >
          Export JSON
        </Button>
      </Box>

      {exportError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setExportError(null)}>
          {exportError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : faqs.length === 0 ? (
        <Alert severity="info">
          {currentUrl 
            ? `No FAQs found for ${currentUrl}. Generate FAQs by crawling the website above.`
            : 'No FAQs found. Generate some FAQs by crawling a website above.'}
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Answer</TableCell>
                <TableCell>Source URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq._id} hover>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" noWrap>
                      {faq.question}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    <Typography variant="body2" noWrap>
                      {faq.answer}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                      {faq.sourceUrl}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={faq.status}
                      color={faq.status === 'published' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(faq.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit FAQ">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(faq)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={faq.status === 'draft' ? 'Publish' : 'Unpublish'}>
                      <IconButton
                        size="small"
                        onClick={() => handlePublish(faq)}
                        color={faq.status === 'draft' ? 'success' : 'default'}
                      >
                        {faq.status === 'draft' ? (
                          <PublishIcon fontSize="small" />
                        ) : (
                          <UnpublishIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <EditFAQModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedFAQ(null);
        }}
        faq={selectedFAQ}
        onUpdate={onUpdate}
      />
    </Box>
  );
};

export default FAQList;

