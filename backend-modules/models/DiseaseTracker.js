const mongoose = require('mongoose');

const DiseaseTrackerSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    city: String,
    state: String,
    country: String
  },
  diseases: [{
    name: String,
    cases: Number,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    trend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing']
    },
    lastWeekCases: Number,
    changePercentage: Number
  }],
  reportDate: {
    type: Date,
    default: Date.now
  },
  dataSource: String
});

DiseaseTrackerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DiseaseTracker', DiseaseTrackerSchema);
