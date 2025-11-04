const express = require('express');
const router = express.Router();
const MedicineVerification = require('../models/MedicineVerification');

// Dummy medicine database for testing
const dummyMedicineDB = {
  '8901234567890': {
    medicineName: 'Paracetamol 500mg',
    manufacturer: 'Cipla Ltd',
    batchNumber: 'BATCH2024A',
    manufacturingDate: '2024-06-01',
    expiryDate: '2026-05-31',
    isAuthentic: true,
    verificationStatus: 'authentic'
  },
  '8901234567891': {
    medicineName: 'Amoxicillin 250mg',
    manufacturer: 'Sun Pharma',
    batchNumber: 'BATCH2024B',
    manufacturingDate: '2024-07-15',
    expiryDate: '2026-07-14',
    isAuthentic: true,
    verificationStatus: 'authentic'
  },
  '8901234567892': {
    medicineName: 'Azithromycin 500mg',
    manufacturer: 'Dr. Reddy\'s',
    batchNumber: 'BATCH2024C',
    manufacturingDate: '2024-08-20',
    expiryDate: '2026-08-19',
    isAuthentic: true,
    verificationStatus: 'authentic'
  },
  '9999999999999': {
    medicineName: 'Unknown Medicine',
    manufacturer: 'Unknown',
    batchNumber: 'FAKE001',
    manufacturingDate: '2020-01-01',
    expiryDate: '2021-01-01',
    isAuthentic: false,
    verificationStatus: 'fake'
  }
};

// Verify medicine by barcode
router.post('/verify', async (req, res) => {
  try {
    const { barcode, scannedBy } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    // Check in dummy database
    const medicineData = dummyMedicineDB[barcode] || {
      medicineName: 'Medicine Not Found',
      manufacturer: 'Unknown',
      batchNumber: 'N/A',
      manufacturingDate: null,
      expiryDate: null,
      isAuthentic: false,
      verificationStatus: 'unknown'
    };

    // Save verification record
    const verification = new MedicineVerification({
      barcode,
      ...medicineData,
      scannedBy
    });

    await verification.save();

    res.json({
      success: true,
      message: 'Medicine verification completed',
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get verification history
router.get('/history/:userId', async (req, res) => {
  try {
    const verifications = await MedicineVerification
      .find({ scannedBy: req.params.userId })
      .sort({ verificationDate: -1 })
      .limit(20);

    res.json({
      success: true,
      data: verifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific verification
router.get('/:id', async (req, res) => {
  try {
    const verification = await MedicineVerification.findById(req.params.id);
    
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification record not found'
      });
    }

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalScans = await MedicineVerification.countDocuments();
    const authenticMedicines = await MedicineVerification.countDocuments({ isAuthentic: true });
    const fakeMedicines = await MedicineVerification.countDocuments({ isAuthentic: false });

    res.json({
      success: true,
      data: {
        totalScans,
        authenticMedicines,
        fakeMedicines,
        successRate: totalScans > 0 ? ((authenticMedicines / totalScans) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
