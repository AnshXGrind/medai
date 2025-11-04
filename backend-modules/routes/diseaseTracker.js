const express = require('express');
const router = express.Router();
const DiseaseTracker = require('../models/DiseaseTracker');

// Dummy disease data for Indian cities
const generateDummyDiseaseData = () => {
  return [
    {
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139], // Delhi
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India'
      },
      diseases: [
        { name: 'Dengue', cases: 450, severity: 'high', trend: 'increasing', lastWeekCases: 380, changePercentage: 18.4 },
        { name: 'Influenza', cases: 320, severity: 'medium', trend: 'stable', lastWeekCases: 315, changePercentage: 1.6 },
        { name: 'COVID-19', cases: 89, severity: 'low', trend: 'decreasing', lastWeekCases: 125, changePercentage: -28.8 }
      ],
      dataSource: 'Delhi Health Department'
    },
    {
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760], // Mumbai
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      diseases: [
        { name: 'Malaria', cases: 280, severity: 'high', trend: 'stable', lastWeekCases: 275, changePercentage: 1.8 },
        { name: 'Dengue', cases: 190, severity: 'medium', trend: 'decreasing', lastWeekCases: 245, changePercentage: -22.4 },
        { name: 'Typhoid', cases: 67, severity: 'medium', trend: 'stable', lastWeekCases: 65, changePercentage: 3.1 }
      ],
      dataSource: 'BMC Health Department'
    },
    {
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716], // Bangalore
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India'
      },
      diseases: [
        { name: 'Dengue', cases: 310, severity: 'high', trend: 'increasing', lastWeekCases: 260, changePercentage: 19.2 },
        { name: 'Chikungunya', cases: 145, severity: 'medium', trend: 'increasing', lastWeekCases: 120, changePercentage: 20.8 },
        { name: 'Influenza', cases: 98, severity: 'low', trend: 'stable', lastWeekCases: 95, changePercentage: 3.2 }
      ],
      dataSource: 'BBMP Health Department'
    },
    {
      location: {
        type: 'Point',
        coordinates: [78.4867, 17.3850], // Hyderabad
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India'
      },
      diseases: [
        { name: 'Dengue', cases: 220, severity: 'medium', trend: 'decreasing', lastWeekCases: 280, changePercentage: -21.4 },
        { name: 'Viral Fever', cases: 345, severity: 'medium', trend: 'stable', lastWeekCases: 340, changePercentage: 1.5 },
        { name: 'Gastroenteritis', cases: 178, severity: 'low', trend: 'increasing', lastWeekCases: 155, changePercentage: 14.8 }
      ],
      dataSource: 'GHMC Health Department'
    },
    {
      location: {
        type: 'Point',
        coordinates: [88.3639, 22.5726], // Kolkata
        city: 'Kolkata',
        state: 'West Bengal',
        country: 'India'
      },
      diseases: [
        { name: 'Dengue', cases: 185, severity: 'medium', trend: 'stable', lastWeekCases: 180, changePercentage: 2.8 },
        { name: 'Malaria', cases: 120, severity: 'medium', trend: 'decreasing', lastWeekCases: 150, changePercentage: -20.0 },
        { name: 'Japanese Encephalitis', cases: 34, severity: 'critical', trend: 'increasing', lastWeekCases: 22, changePercentage: 54.5 }
      ],
      dataSource: 'KMC Health Department'
    },
    {
      location: {
        type: 'Point',
        coordinates: [80.2707, 13.0827], // Chennai
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India'
      },
      diseases: [
        { name: 'Dengue', cases: 265, severity: 'high', trend: 'increasing', lastWeekCases: 210, changePercentage: 26.2 },
        { name: 'Leptospirosis', cases: 89, severity: 'medium', trend: 'stable', lastWeekCases: 85, changePercentage: 4.7 },
        { name: 'Typhoid', cases: 145, severity: 'medium', trend: 'decreasing', lastWeekCases: 170, changePercentage: -14.7 }
      ],
      dataSource: 'Chennai Corporation'
    }
  ];
};

// Get disease data for all locations
router.get('/all', async (req, res) => {
  try {
    let diseaseData = await DiseaseTracker.find().sort({ reportDate: -1 });

    // If no data exists, generate dummy data
    if (diseaseData.length === 0) {
      const dummyData = generateDummyDiseaseData();
      diseaseData = await DiseaseTracker.insertMany(dummyData);
    }

    res.json({
      success: true,
      data: diseaseData,
      count: diseaseData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get disease data by location (coordinates)
router.get('/location', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 50000 } = req.query; // maxDistance in meters (default 50km)

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const diseaseData = await DiseaseTracker.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(10);

    res.json({
      success: true,
      data: diseaseData,
      count: diseaseData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get disease data by city
router.get('/city/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    const diseaseData = await DiseaseTracker.find({
      'location.city': { $regex: cityName, $options: 'i' }
    });

    if (diseaseData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No disease data found for ${cityName}`
      });
    }

    res.json({
      success: true,
      data: diseaseData,
      count: diseaseData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific disease trends across all locations
router.get('/disease/:diseaseName', async (req, res) => {
  try {
    const diseaseName = req.params.diseaseName;
    
    const data = await DiseaseTracker.find({
      'diseases.name': { $regex: diseaseName, $options: 'i' }
    });

    // Extract only the specific disease from each location
    const diseaseData = data.map(location => ({
      city: location.location.city,
      state: location.location.state,
      coordinates: location.location.coordinates,
      disease: location.diseases.find(d => 
        d.name.toLowerCase().includes(diseaseName.toLowerCase())
      ),
      reportDate: location.reportDate
    })).filter(item => item.disease);

    res.json({
      success: true,
      data: diseaseData,
      count: diseaseData.length
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
    const allData = await DiseaseTracker.find();
    
    // Calculate total cases
    let totalCases = 0;
    let diseaseCount = {};
    let highRiskAreas = 0;

    allData.forEach(location => {
      location.diseases.forEach(disease => {
        totalCases += disease.cases;
        diseaseCount[disease.name] = (diseaseCount[disease.name] || 0) + disease.cases;
        
        if (disease.severity === 'high' || disease.severity === 'critical') {
          highRiskAreas++;
        }
      });
    });

    // Get top diseases
    const topDiseases = Object.entries(diseaseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, cases]) => ({ name, cases }));

    res.json({
      success: true,
      data: {
        totalCases,
        locationsTracked: allData.length,
        highRiskAreas,
        topDiseases
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh disease data
router.post('/refresh', async (req, res) => {
  try {
    // Clear old data
    await DiseaseTracker.deleteMany({});
    
    // Generate new dummy data
    const dummyData = generateDummyDiseaseData();
    const diseaseData = await DiseaseTracker.insertMany(dummyData);

    res.json({
      success: true,
      message: 'Disease tracker data refreshed successfully',
      data: diseaseData,
      count: diseaseData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
