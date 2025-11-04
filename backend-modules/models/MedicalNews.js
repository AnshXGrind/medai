const mongoose = require('mongoose');

const MedicalNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  fullText: String,
  source: {
    type: String,
    enum: ['PubMed', 'arXiv', 'medRxiv', 'other']
  },
  authors: [String],
  publicationDate: Date,
  doi: String,
  url: String,
  keywords: [String],
  category: {
    type: String,
    enum: ['research', 'clinical-trial', 'review', 'case-study', 'general']
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicalNews', MedicalNewsSchema);
