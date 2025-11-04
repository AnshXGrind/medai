const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const HealthRecord = require('../models/HealthRecord');

// Generate unique Health ID
const generateHealthId = () => {
  const prefix = 'MHI'; // MedAid Health ID
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Create new Health ID and Record
router.post('/create', async (req, res) => {
  try {
    const { userId, fullName, dateOfBirth, bloodGroup, allergies, chronicConditions, emergencyContact } = req.body;

    const healthId = generateHealthId();

    const newRecord = new HealthRecord({
      healthId,
      userId,
      fullName,
      dateOfBirth,
      bloodGroup,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      emergencyContact,
      documents: []
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: 'Health ID created successfully',
      data: {
        healthId,
        record: newRecord
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Health Record by Health ID
router.get('/:healthId', async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ healthId: req.params.healthId });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload document
router.post('/:healthId/upload', async (req, res) => {
  try {
    const { fileName, fileType, fileSize, category, description } = req.body;

    const record = await HealthRecord.findOne({ healthId: req.params.healthId });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Simulate encryption path (in production, use actual encryption)
    const encryptedPath = `/encrypted/${crypto.randomBytes(16).toString('hex')}`;

    const newDocument = {
      fileName,
      fileType,
      fileSize,
      uploadDate: new Date(),
      encryptedPath,
      category,
      description
    };

    record.documents.push(newDocument);
    record.lastUpdated = new Date();
    await record.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: newDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all documents for a health ID
router.get('/:healthId/documents', async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ healthId: req.params.healthId });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.json({
      success: true,
      data: record.documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update health record
router.put('/:healthId', async (req, res) => {
  try {
    const { fullName, bloodGroup, allergies, chronicConditions, emergencyContact } = req.body;

    const record = await HealthRecord.findOne({ healthId: req.params.healthId });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    if (fullName) record.fullName = fullName;
    if (bloodGroup) record.bloodGroup = bloodGroup;
    if (allergies) record.allergies = allergies;
    if (chronicConditions) record.chronicConditions = chronicConditions;
    if (emergencyContact) record.emergencyContact = emergencyContact;
    
    record.lastUpdated = new Date();
    await record.save();

    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
