# MedAid Search Service - Python Backend

## Overview
Intelligent medical search system powered by Python Flask with fuzzy matching and AI-driven recommendations for symptoms, doctors, hospitals, medicines, and health records.

## Features
✅ **Universal Search** - Search across all medical categories simultaneously  
✅ **Fuzzy Matching** - Find results even with typos using similarity scoring  
✅ **Category-Specific Search** - Target specific categories (symptoms, doctors, hospitals, medicines, records)  
✅ **Autocomplete Suggestions** - Real-time search suggestions as you type  
✅ **Relevance Scoring** - Results ranked by match quality (0-100%)  
✅ **CORS Enabled** - Works seamlessly with frontend on different ports  

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Install Dependencies
```powershell
cd backend-modules
pip install -r requirements.txt
```

This will install:
- `Flask==3.0.0` - Web framework
- `flask-cors==4.0.0` - Cross-origin resource sharing
- `Werkzeug==3.0.1` - WSGI utility library

### Step 2: Start the Server
```powershell
python search_service.py
```

You should see:
```
============================================================
🔍 MedAid Search Service Starting...
============================================================
📍 Endpoints:
   POST /api/search - Universal search
   POST /api/search/symptoms - Search symptoms
   POST /api/search/doctors - Search doctors
   POST /api/search/hospitals - Search hospitals
   POST /api/search/medicines - Search medicines
   POST /api/search/suggestions - Get autocomplete suggestions
   GET  /api/health - Health check
============================================================
🚀 Server running on http://localhost:5000
============================================================
```

## API Endpoints

### 1. Universal Search
**POST** `/api/search`

Search across all categories or a specific category.

**Request Body:**
```json
{
  "query": "fever",
  "category": "all",
  "limit": 10
}
```

**Parameters:**
- `query` (string, required): Search query
- `category` (string, optional): "all", "symptoms", "doctors", "hospitals", "medicines", "records"
- `limit` (number, optional): Maximum results per category (default: 10)

**Response:**
```json
{
  "success": true,
  "query": "fever",
  "category": "all",
  "total_results": 15,
  "timestamp": "2024-11-03T10:30:00",
  "results": {
    "symptoms": [
      {
        "id": 1,
        "name": "Fever",
        "category": "General",
        "severity": "Medium",
        "relevance_score": 100.0,
        "matched_field": "name"
      }
    ],
    "doctors": [...],
    "hospitals": [...],
    "medicines": [...],
    "health_records": [...]
  }
}
```

### 2. Category-Specific Search
**POST** `/api/search/symptoms`  
**POST** `/api/search/doctors`  
**POST** `/api/search/hospitals`  
**POST** `/api/search/medicines`  

Search within a specific category only.

**Request Body:**
```json
{
  "query": "cardiologist"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "name": "Dr. Rajesh Kumar",
      "specialty": "Cardiologist",
      "location": "Delhi",
      "rating": 4.8,
      "experience": 15,
      "languages": ["Hindi", "English"],
      "relevance_score": 95.5,
      "matched_field": "specialty"
    }
  ],
  "count": 1
}
```

### 3. Autocomplete Suggestions
**POST** `/api/search/suggestions`

Get real-time search suggestions for autocomplete.

**Request Body:**
```json
{
  "query": "heart",
  "limit": 5
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "text": "Heart Attack",
      "category": "Symptom",
      "icon": "🩺"
    },
    {
      "text": "Dr. Rajesh Kumar - Cardiologist",
      "category": "Doctor",
      "icon": "👨‍⚕️"
    },
    {
      "text": "Apollo Heart Hospital",
      "category": "Hospital",
      "icon": "🏥"
    }
  ]
}
```

### 4. Health Check
**GET** `/api/health`

Check if the service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "MedAid Search Service",
  "version": "1.0.0",
  "timestamp": "2024-11-03T10:30:00"
}
```

## How It Works

### Fuzzy Matching Algorithm
The search service uses Python's `difflib.SequenceMatcher` for intelligent fuzzy matching:

1. **Query Processing**: Convert query and data to lowercase
2. **Field Scanning**: Check all searchable fields (name, category, keywords, etc.)
3. **Similarity Scoring**: Calculate match percentage (0-100%)
4. **Threshold Filtering**: Return results with ≥30% similarity
5. **Ranking**: Sort by relevance score (highest first)

### Sample Data
The service includes mock data for testing:
- **10 Symptoms**: Fever, Headache, Cough, Chest Pain, etc.
- **10 Doctors**: Various specialties across major Indian cities
- **10 Hospitals**: AIIMS, Apollo, Fortis, etc.
- **10 Medicines**: Paracetamol, Amoxicillin, Metformin, etc.
- **8 Health Records**: Lab reports, prescriptions, imaging

### Data Structure Example
```python
MEDICAL_DATA = {
    "symptoms": [
        {
            "id": 1,
            "name": "Fever",
            "category": "General",
            "severity": "Medium",
            "keywords": ["high temperature", "pyrexia", "body heat"]
        }
    ],
    "doctors": [...],
    "hospitals": [...],
    "medicines": [...],
    "health_records": [...]
}
```

## Frontend Integration

The React frontend (`SearchBar.tsx`) connects to this API:

```typescript
const PYTHON_SEARCH_API = "http://localhost:5000";

// Universal search
const response = await fetch(`${PYTHON_SEARCH_API}/api/search`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    query: searchQuery, 
    category: 'all',
    limit: 10 
  })
});
```

## Testing

### Test with curl (PowerShell)
```powershell
# Universal search
curl -X POST http://localhost:5000/api/search `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"fever\", \"category\": \"all\", \"limit\": 5}'

# Doctor search
curl -X POST http://localhost:5000/api/search/doctors `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"cardiologist\"}'

# Autocomplete suggestions
curl -X POST http://localhost:5000/api/search/suggestions `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"heart\", \"limit\": 3}'

# Health check
curl http://localhost:5000/api/health
```

### Test with Frontend
1. Start Python backend: `python search_service.py`
2. Start React frontend: `npm run dev`
3. Navigate to Patient Dashboard
4. Use the search bar at the top
5. Try searches like:
   - "fever" → Find symptoms and medicines
   - "cardiologist" → Find heart doctors
   - "Apollo" → Find Apollo hospitals
   - "diabetes" → Find medicines and doctors

## Troubleshooting

### Port Already in Use
If port 5000 is occupied, change it in `search_service.py`:
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)  # Change to 5001
```

Also update `SearchBar.tsx`:
```typescript
const PYTHON_SEARCH_API = "http://localhost:5001";
```

### CORS Errors
If you see CORS errors in browser console, ensure `flask-cors` is installed:
```powershell
pip install flask-cors
```

### No Results Found
- Check that query has at least 3 characters
- Try different keywords
- Verify data exists in `MEDICAL_DATA` dictionary
- Check similarity threshold (currently 30%)

### Connection Refused
- Verify Python server is running: Check for "Server running" message
- Check firewall settings
- Ensure correct URL: `http://localhost:5000`

## Production Deployment

### For Production Use:
1. **Replace mock data** with real database (PostgreSQL, MongoDB)
2. **Add authentication** (JWT tokens, API keys)
3. **Use production WSGI server** (Gunicorn, uWSGI)
4. **Enable SSL/HTTPS** for secure communication
5. **Add rate limiting** to prevent abuse
6. **Implement caching** (Redis) for faster responses
7. **Add logging** for monitoring and debugging

### Production Start Command:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 search_service:app
```

## Features Roadmap

🔜 **Coming Soon:**
- [ ] Natural Language Processing (NLP) for better query understanding
- [ ] Machine Learning for personalized recommendations
- [ ] Multi-language support (Hindi, Tamil, Bengali, etc.)
- [ ] Voice search integration
- [ ] Image-based search for medicines
- [ ] Integration with real hospital databases
- [ ] Appointment booking through search
- [ ] Pharmacy stock availability check

## Support

For issues or questions:
- Check server logs in terminal
- Verify all dependencies are installed
- Ensure frontend and backend URLs match
- Test API endpoints with curl/Postman first

## License
MIT License - Free to use and modify

---

**MedAid Search Service v1.0.0**  
Built with ❤️ using Python + Flask + AI
