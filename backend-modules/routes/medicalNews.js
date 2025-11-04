const express = require('express');
const router = express.Router();
const MedicalNews = require('../models/MedicalNews');

// Dummy medical research papers for testing
const generateDummyNews = () => {
  return [
    {
      title: 'Novel AI Algorithm Detects Early Alzheimer\'s Disease with 95% Accuracy',
      summary: 'Researchers developed a deep learning model that analyzes MRI scans to detect Alzheimer\'s disease up to 6 years before clinical diagnosis. The algorithm outperforms traditional diagnostic methods.',
      fullText: 'Full research paper content...',
      source: 'PubMed',
      authors: ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Williams'],
      publicationDate: new Date('2025-10-28'),
      doi: '10.1001/jama.2025.12345',
      url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
      keywords: ['Alzheimer', 'AI', 'Deep Learning', 'MRI', 'Early Detection'],
      category: 'research'
    },
    {
      title: 'Breakthrough in Cancer Immunotherapy Shows 80% Remission Rate in Clinical Trials',
      summary: 'Phase III clinical trials of a new CAR-T cell therapy demonstrate unprecedented success in treating advanced melanoma. Patients showed sustained remission with minimal side effects.',
      fullText: 'Full research paper content...',
      source: 'medRxiv',
      authors: ['Dr. Robert Anderson', 'Dr. Lisa Kumar', 'Dr. James Wilson'],
      publicationDate: new Date('2025-10-30'),
      doi: '10.1101/2025.10.30.123456',
      url: 'https://medrxiv.org/example2',
      keywords: ['Cancer', 'Immunotherapy', 'CAR-T', 'Clinical Trial', 'Melanoma'],
      category: 'clinical-trial'
    },
    {
      title: 'Plant-Based Diet Reduces Heart Disease Risk by 40% in 10-Year Study',
      summary: 'Comprehensive longitudinal study involving 50,000 participants shows significant cardiovascular benefits of plant-based nutrition. Results challenge conventional dietary guidelines.',
      fullText: 'Full research paper content...',
      source: 'PubMed',
      authors: ['Dr. Maria Rodriguez', 'Dr. David Kim', 'Dr. Anna Petrov'],
      publicationDate: new Date('2025-11-01'),
      doi: '10.1016/lancet.2025.11.001',
      url: 'https://pubmed.ncbi.nlm.nih.gov/example3',
      keywords: ['Nutrition', 'Heart Disease', 'Prevention', 'Plant-Based Diet'],
      category: 'research'
    },
    {
      title: 'CRISPR Gene Editing Successfully Treats Sickle Cell Disease in Human Patients',
      summary: 'First successful human application of CRISPR technology for sickle cell anemia shows complete symptom reversal. All 12 patients remain disease-free after 2-year follow-up.',
      fullText: 'Full research paper content...',
      source: 'arXiv',
      authors: ['Dr. Jennifer Lee', 'Dr. Thomas Brown', 'Dr. Patricia Garcia'],
      publicationDate: new Date('2025-11-02'),
      doi: '10.1038/nature.2025.56789',
      url: 'https://arxiv.org/example4',
      keywords: ['CRISPR', 'Gene Editing', 'Sickle Cell', 'Genetic Disease'],
      category: 'clinical-trial'
    },
    {
      title: 'New Antibiotic Compound Effective Against Drug-Resistant Bacteria',
      summary: 'Scientists discover novel antibiotic derived from soil bacteria that kills MRSA and other superbugs. Laboratory tests show no resistance development after 30 generations.',
      fullText: 'Full research paper content...',
      source: 'PubMed',
      authors: ['Dr. Ahmed Hassan', 'Dr. Sophie Martin', 'Dr. Kevin O\'Brien'],
      publicationDate: new Date('2025-11-03'),
      doi: '10.1126/science.2025.abcd1234',
      url: 'https://pubmed.ncbi.nlm.nih.gov/example5',
      keywords: ['Antibiotics', 'Drug Resistance', 'MRSA', 'Microbiology'],
      category: 'research'
    }
  ];
};

// Fetch latest medical news (with dummy data)
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Check if we have recent news in database
    let news = await MedicalNews
      .find()
      .sort({ fetchedAt: -1 })
      .limit(limit);

    // If no news or old news, generate dummy data
    if (news.length < limit) {
      const dummyNews = generateDummyNews();
      
      // Clear old dummy data
      await MedicalNews.deleteMany({});
      
      // Insert new dummy data
      news = await MedicalNews.insertMany(dummyNews);
    }

    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get news by ID
router.get('/:id', async (req, res) => {
  try {
    const news = await MedicalNews.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search news by keyword
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const news = await MedicalNews.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
        { keywords: { $in: [new RegExp(keyword, 'i')] } }
      ]
    }).sort({ publicationDate: -1 });

    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const news = await MedicalNews
      .find({ category: req.params.category })
      .sort({ publicationDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh news data
router.post('/refresh', async (req, res) => {
  try {
    // In production, this would call actual APIs (PubMed, arXiv)
    // For now, regenerate dummy data
    
    await MedicalNews.deleteMany({});
    const dummyNews = generateDummyNews();
    const news = await MedicalNews.insertMany(dummyNews);

    res.json({
      success: true,
      message: 'News data refreshed successfully',
      data: news,
      count: news.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
