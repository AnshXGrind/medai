const mongoose = require('mongoose');

const MedicineVerificationSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    index: true
  },
  medicineName: String,
  manufacturer: String,
  batchNumber: String,
  manufacturingDate: Date,
  expiryDate: Date,
  isAuthentic: Boolean,
  verificationStatus: {
    type: String,
    enum: ['authentic', 'fake', 'suspicious', 'unknown']
  },
  verificationDate: {
    type: Date,
    default: Date.now
  },
  scannedBy: String
});

module.exports = mongoose.model('MedicineVerification', MedicineVerificationSchema);
