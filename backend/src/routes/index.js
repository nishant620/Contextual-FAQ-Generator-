const express = require('express');
const router = express.Router();
const faqRoutes = require('./faqRoutes');
const { crawlWebsiteController } = require('../controllers/faqController');


router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

router.post('/crawl', crawlWebsiteController);

router.use('/faqs', faqRoutes);

module.exports = router;

