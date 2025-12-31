const mongoose = require('mongoose');

const crawledPageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  rawText: {
    type: String,
    required: true
  },
  cleanedText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false 
});

crawledPageSchema.index({ url: 1, createdAt: -1 });

module.exports = mongoose.model('CrawledPage', crawledPageSchema);
