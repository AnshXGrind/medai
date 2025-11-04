const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  healthId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  bloodGroup: String,
  allergies: [String],
  chronicConditions: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  documents: [{
    fileName: String,
    fileType: String,
    fileSize: Number,
    uploadDate: Date,
    encryptedPath: String,
    category: {
      type: String,
      enum: ['prescription', 'lab-report', 'scan', 'vaccination', 'other']
    },
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
