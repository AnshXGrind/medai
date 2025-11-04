const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');
const MedicineVerification = require('../models/MedicineVerification');
const MedicalNews = require('../models/MedicalNews');
const DiseaseTracker = require('../models/DiseaseTracker');

// Get unified dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Health Records Stats
    const totalHealthRecords = await HealthRecord.countDocuments();
    const recentHealthRecords = await HealthRecord.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('healthId fullName createdAt');

    // Medicine Verification Stats
    const totalScans = await MedicineVerification.countDocuments();
    const authenticMedicines = await MedicineVerification.countDocuments({ isAuthentic: true });
    const fakeMedicines = await MedicineVerification.countDocuments({ isAuthentic: false });
    const recentScans = await MedicineVerification.find()
      .sort({ verificationDate: -1 })
      .limit(5)
      .select('medicineName verificationStatus verificationDate');

    // Medical News Stats
    const totalNews = await MedicalNews.countDocuments();
    const latestNews = await MedicalNews.find()
      .sort({ publicationDate: -1 })
      .limit(3)
      .select('title summary publicationDate source');

    // Disease Tracker Stats
    const totalLocations = await DiseaseTracker.countDocuments();
    let totalDiseases = 0;
    let highRiskAreas = 0;
    
    const diseaseData = await DiseaseTracker.find();
    diseaseData.forEach(location => {
      totalDiseases += location.diseases.length;
      location.diseases.forEach(disease => {
        if (disease.severity === 'high' || disease.severity === 'critical') {
          highRiskAreas++;
        }
      });
    });

    res.json({
      success: true,
      data: {
        healthRecords: {
          total: totalHealthRecords,
          recent: recentHealthRecords
        },
        medicineVerification: {
          totalScans,
          authentic: authenticMedicines,
          fake: fakeMedicines,
          successRate: totalScans > 0 ? ((authenticMedicines / totalScans) * 100).toFixed(2) : 0,
          recentScans
        },
        medicalNews: {
          total: totalNews,
          latest: latestNews
        },
        diseaseTracker: {
          locationsTracked: totalLocations,
          totalDiseases,
          highRiskAreas
        },
        overview: {
          totalUsers: totalHealthRecords, // Assuming 1 user = 1 health record
          activeModules: 4,
          lastUpdated: new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user-specific dashboard
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user's health records
    const healthRecords = await HealthRecord.find({ userId })
      .sort({ lastUpdated: -1 })
      .limit(1);

    // Get user's medicine scans
    const medicineScans = await MedicineVerification.find({ scannedBy: userId })
      .sort({ verificationDate: -1 })
      .limit(10);

    // Get latest news (same for all users)
    const latestNews = await MedicalNews.find()
      .sort({ publicationDate: -1 })
      .limit(5);

    // Get disease data for user's location (if available)
    let nearbyDiseases = [];
    if (healthRecords.length > 0 && healthRecords[0].location) {
      nearbyDiseases = await DiseaseTracker.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: healthRecords[0].location.coordinates
            },
            $maxDistance: 50000 // 50km radius
          }
        }
      }).limit(5);
    }

    res.json({
      success: true,
      data: {
        healthRecord: healthRecords[0] || null,
        recentScans: medicineScans,
        latestNews,
        nearbyDiseases,
        summary: {
          hasHealthRecord: healthRecords.length > 0,
          totalScans: medicineScans.length,
          newsCount: latestNews.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get activity timeline
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Gather recent activities from all modules
    const activities = [];

    // Health Records
    const recentRecords = await HealthRecord.find()
      .sort({ createdAt: -1 })
      .limit(5);
    recentRecords.forEach(record => {
      activities.push({
        type: 'health_record',
        action: 'created',
        title: `New Health ID: ${record.healthId}`,
        description: `Health record created for ${record.fullName}`,
        timestamp: record.createdAt,
        icon: '🏥'
      });
    });

    // Medicine Scans
    const recentScans = await MedicineVerification.find()
      .sort({ verificationDate: -1 })
      .limit(5);
    recentScans.forEach(scan => {
      activities.push({
        type: 'medicine_scan',
        action: 'verified',
        title: `Medicine Verified: ${scan.medicineName}`,
        description: `Status: ${scan.verificationStatus}`,
        timestamp: scan.verificationDate,
        icon: scan.isAuthentic ? '✅' : '❌'
      });
    });

    // News Articles
    const recentNews = await MedicalNews.find()
      .sort({ fetchedAt: -1 })
      .limit(5);
    recentNews.forEach(news => {
      activities.push({
        type: 'medical_news',
        action: 'published',
        title: news.title,
        description: news.summary.substring(0, 100) + '...',
        timestamp: news.publicationDate,
        icon: '📰'
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: activities.slice(0, limit),
      count: activities.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
