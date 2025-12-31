const express = require('express');
const router = express.Router();
const {
  generateFaqsController,
  generateFaqsFromContentController,
  saveFaqsController,
  listFaqsController,
  updateFAQController,
  publishFAQController,
  exportFaqsController
} = require('../controllers/faqController');

router.post('/generate', generateFaqsController);

router.post('/generate-faqs', generateFaqsFromContentController);

router.post('/save', saveFaqsController);


router.get('/', listFaqsController);

router.get('/export', exportFaqsController);


router.put('/:id', updateFAQController);

router.post('/:id/publish', publishFAQController);

module.exports = router;
