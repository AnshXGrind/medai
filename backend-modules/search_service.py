"""
MedAid Search Service - Python Backend
Intelligent medical search system with fuzzy matching and AI-powered recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from difflib import SequenceMatcher
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Sample medical data (in production, this would come from database)
MEDICAL_DATA = {
    "symptoms": [
        {"id": 1, "name": "Fever", "category": "General", "severity": "Medium", "keywords": ["high temperature", "pyrexia", "body heat"]},
        {"id": 2, "name": "Headache", "category": "Neurological", "severity": "Low", "keywords": ["head pain", "migraine", "cephalalgia"]},
        {"id": 3, "name": "Cough", "category": "Respiratory", "severity": "Medium", "keywords": ["tussis", "dry cough", "wet cough"]},
        {"id": 4, "name": "Chest Pain", "category": "Cardiac", "severity": "High", "keywords": ["chest discomfort", "angina", "thoracic pain"]},
        {"id": 5, "name": "Shortness of Breath", "category": "Respiratory", "severity": "High", "keywords": ["dyspnea", "breathlessness", "difficulty breathing"]},
        {"id": 6, "name": "Abdominal Pain", "category": "Gastrointestinal", "severity": "Medium", "keywords": ["stomach ache", "belly pain", "gastric pain"]},
        {"id": 7, "name": "Nausea", "category": "Gastrointestinal", "severity": "Low", "keywords": ["vomiting sensation", "queasiness", "sick feeling"]},
        {"id": 8, "name": "Dizziness", "category": "Neurological", "severity": "Medium", "keywords": ["vertigo", "lightheadedness", "spinning sensation"]},
        {"id": 9, "name": "Fatigue", "category": "General", "severity": "Low", "keywords": ["tiredness", "weakness", "lethargy", "exhaustion"]},
        {"id": 10, "name": "Joint Pain", "category": "Musculoskeletal", "severity": "Medium", "keywords": ["arthralgia", "joint ache", "knee pain", "elbow pain"]},
    ],
    "doctors": [
        {"id": 1, "name": "Dr. Rajesh Kumar", "specialty": "Cardiologist", "location": "Delhi", "rating": 4.8, "experience": 15, "languages": ["Hindi", "English"]},
        {"id": 2, "name": "Dr. Priya Sharma", "specialty": "Pediatrician", "location": "Mumbai", "rating": 4.9, "experience": 12, "languages": ["Hindi", "English", "Marathi"]},
        {"id": 3, "name": "Dr. Amit Patel", "specialty": "General Physician", "location": "Ahmedabad", "rating": 4.7, "experience": 10, "languages": ["Hindi", "English", "Gujarati"]},
        {"id": 4, "name": "Dr. Sunita Reddy", "specialty": "Gynecologist", "location": "Hyderabad", "rating": 4.9, "experience": 18, "languages": ["Hindi", "English", "Telugu"]},
        {"id": 5, "name": "Dr. Vikram Singh", "specialty": "Orthopedic", "location": "Jaipur", "rating": 4.6, "experience": 14, "languages": ["Hindi", "English"]},
        {"id": 6, "name": "Dr. Neha Gupta", "specialty": "Dermatologist", "location": "Bangalore", "rating": 4.8, "experience": 8, "languages": ["Hindi", "English", "Kannada"]},
        {"id": 7, "name": "Dr. Arjun Mehta", "specialty": "ENT Specialist", "location": "Pune", "rating": 4.7, "experience": 11, "languages": ["Hindi", "English", "Marathi"]},
        {"id": 8, "name": "Dr. Kavita Iyer", "specialty": "Psychiatrist", "location": "Chennai", "rating": 4.9, "experience": 16, "languages": ["Hindi", "English", "Tamil"]},
        {"id": 9, "name": "Dr. Rahul Verma", "specialty": "Neurologist", "location": "Kolkata", "rating": 4.8, "experience": 13, "languages": ["Hindi", "English", "Bengali"]},
        {"id": 10, "name": "Dr. Sanjana Das", "specialty": "Ophthalmologist", "location": "Lucknow", "rating": 4.7, "experience": 9, "languages": ["Hindi", "English"]},
    ],
    "hospitals": [
        {"id": 1, "name": "AIIMS Delhi", "location": "New Delhi", "type": "Government", "rating": 4.9, "beds": 2500, "specialties": ["Cardiology", "Neurology", "Oncology"]},
        {"id": 2, "name": "Apollo Hospital", "location": "Chennai", "type": "Private", "rating": 4.8, "beds": 500, "specialties": ["Cardiology", "Orthopedics", "Gastroenterology"]},
        {"id": 3, "name": "Fortis Healthcare", "location": "Mumbai", "type": "Private", "rating": 4.7, "beds": 400, "specialties": ["Cardiology", "Neurology", "Pediatrics"]},
        {"id": 4, "name": "Safdarjung Hospital", "location": "Delhi", "type": "Government", "rating": 4.5, "beds": 1500, "specialties": ["General Medicine", "Surgery", "Emergency"]},
        {"id": 5, "name": "Narayana Health", "location": "Bangalore", "type": "Private", "rating": 4.8, "beds": 600, "specialties": ["Cardiology", "Oncology", "Nephrology"]},
        {"id": 6, "name": "Medanta Hospital", "location": "Gurugram", "type": "Private", "rating": 4.9, "beds": 1250, "specialties": ["Cardiology", "Neurology", "Robotic Surgery"]},
        {"id": 7, "name": "Christian Medical College", "location": "Vellore", "type": "Private", "rating": 4.9, "beds": 2200, "specialties": ["All Specialties"]},
        {"id": 8, "name": "PGI Chandigarh", "location": "Chandigarh", "type": "Government", "rating": 4.8, "beds": 1900, "specialties": ["Neurology", "Cardiology", "Transplant"]},
        {"id": 9, "name": "Tata Memorial Hospital", "location": "Mumbai", "type": "Government", "rating": 4.9, "beds": 629, "specialties": ["Oncology", "Cancer Research"]},
        {"id": 10, "name": "Max Healthcare", "location": "Delhi", "type": "Private", "rating": 4.7, "beds": 800, "specialties": ["Cardiology", "Orthopedics", "Neurology"]},
    ],
    "medicines": [
        {"id": 1, "name": "Paracetamol", "generic": "Acetaminophen", "category": "Analgesic", "common_uses": ["Fever", "Pain", "Headache"], "prescription": False},
        {"id": 2, "name": "Amoxicillin", "generic": "Amoxicillin", "category": "Antibiotic", "common_uses": ["Bacterial Infection", "Respiratory Infection"], "prescription": True},
        {"id": 3, "name": "Ibuprofen", "generic": "Ibuprofen", "category": "NSAID", "common_uses": ["Pain", "Inflammation", "Fever"], "prescription": False},
        {"id": 4, "name": "Metformin", "generic": "Metformin", "category": "Antidiabetic", "common_uses": ["Type 2 Diabetes", "Blood Sugar Control"], "prescription": True},
        {"id": 5, "name": "Omeprazole", "generic": "Omeprazole", "category": "Proton Pump Inhibitor", "common_uses": ["Acidity", "GERD", "Ulcer"], "prescription": False},
        {"id": 6, "name": "Atorvastatin", "generic": "Atorvastatin", "category": "Statin", "common_uses": ["High Cholesterol", "Heart Disease Prevention"], "prescription": True},
        {"id": 7, "name": "Amlodipine", "generic": "Amlodipine", "category": "Antihypertensive", "common_uses": ["High Blood Pressure", "Hypertension"], "prescription": True},
        {"id": 8, "name": "Cetirizine", "generic": "Cetirizine", "category": "Antihistamine", "common_uses": ["Allergy", "Hay Fever", "Itching"], "prescription": False},
        {"id": 9, "name": "Azithromycin", "generic": "Azithromycin", "category": "Antibiotic", "common_uses": ["Bacterial Infection", "Pneumonia", "Bronchitis"], "prescription": True},
        {"id": 10, "name": "Salbutamol", "generic": "Salbutamol", "category": "Bronchodilator", "common_uses": ["Asthma", "COPD", "Breathing Difficulty"], "prescription": True},
    ],
    "health_records": [
        {"id": 1, "type": "Lab Report", "name": "Blood Test", "date": "2024-10-15", "keywords": ["CBC", "hemoglobin", "blood count"]},
        {"id": 2, "type": "Prescription", "name": "Diabetes Medication", "date": "2024-10-20", "keywords": ["metformin", "diabetes", "blood sugar"]},
        {"id": 3, "type": "X-Ray", "name": "Chest X-Ray", "date": "2024-09-10", "keywords": ["lungs", "chest", "radiography"]},
        {"id": 4, "type": "ECG", "name": "Electrocardiogram", "date": "2024-08-25", "keywords": ["heart", "cardiac", "ECG"]},
        {"id": 5, "type": "MRI", "name": "Brain MRI Scan", "date": "2024-07-12", "keywords": ["brain", "neurological", "imaging"]},
        {"id": 6, "type": "Vaccination", "name": "COVID-19 Vaccine", "date": "2024-06-05", "keywords": ["vaccine", "immunization", "covid"]},
        {"id": 7, "type": "Lab Report", "name": "Lipid Profile", "date": "2024-05-18", "keywords": ["cholesterol", "lipids", "triglycerides"]},
        {"id": 8, "type": "Ultrasound", "name": "Abdominal Ultrasound", "date": "2024-04-22", "keywords": ["abdomen", "ultrasound", "imaging"]},
    ],
}


def calculate_similarity(a, b):
    """Calculate similarity score between two strings using fuzzy matching"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def search_items(query, items, search_fields):
    """
    Generic search function with fuzzy matching
    Args:
        query: Search query string
        items: List of items to search
        search_fields: List of field names to search in
    Returns:
        List of matching items with relevance scores
    """
    query_lower = query.lower()
    results = []
    
    for item in items:
        max_score = 0
        matched_field = ""
        
        # Search in specified fields
        for field in search_fields:
            if field in item:
                value = item[field]
                
                # Handle string fields
                if isinstance(value, str):
                    score = calculate_similarity(query_lower, value.lower())
                    if score > max_score:
                        max_score = score
                        matched_field = field
                
                # Handle list fields (like keywords, specialties)
                elif isinstance(value, list):
                    for list_item in value:
                        if isinstance(list_item, str):
                            score = calculate_similarity(query_lower, list_item.lower())
                            if score > max_score:
                                max_score = score
                                matched_field = field
        
        # Add item if it meets minimum threshold
        if max_score > 0.3:  # 30% similarity threshold
            result_item = item.copy()
            result_item['relevance_score'] = round(max_score * 100, 2)
            result_item['matched_field'] = matched_field
            results.append(result_item)
    
    # Sort by relevance score (highest first)
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    return results


@app.route('/api/search', methods=['POST'])
def universal_search():
    """
    Universal search endpoint that searches across all categories
    """
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        category = data.get('category', 'all')  # all, symptoms, doctors, hospitals, medicines, records
        limit = data.get('limit', 10)
        
        if not query:
            return jsonify({"error": "Query parameter is required"}), 400
        
        results = {}
        
        # Search in symptoms
        if category in ['all', 'symptoms']:
            symptom_results = search_items(
                query, 
                MEDICAL_DATA['symptoms'],
                ['name', 'category', 'keywords']
            )
            results['symptoms'] = symptom_results[:limit]
        
        # Search in doctors
        if category in ['all', 'doctors']:
            doctor_results = search_items(
                query,
                MEDICAL_DATA['doctors'],
                ['name', 'specialty', 'location', 'languages']
            )
            results['doctors'] = doctor_results[:limit]
        
        # Search in hospitals
        if category in ['all', 'hospitals']:
            hospital_results = search_items(
                query,
                MEDICAL_DATA['hospitals'],
                ['name', 'location', 'type', 'specialties']
            )
            results['hospitals'] = hospital_results[:limit]
        
        # Search in medicines
        if category in ['all', 'medicines']:
            medicine_results = search_items(
                query,
                MEDICAL_DATA['medicines'],
                ['name', 'generic', 'category', 'common_uses']
            )
            results['medicines'] = medicine_results[:limit]
        
        # Search in health records
        if category in ['all', 'records']:
            record_results = search_items(
                query,
                MEDICAL_DATA['health_records'],
                ['name', 'type', 'keywords']
            )
            results['health_records'] = record_results[:limit]
        
        # Calculate total results
        total_results = sum(len(v) for v in results.values())
        
        return jsonify({
            "success": True,
            "query": query,
            "category": category,
            "total_results": total_results,
            "timestamp": datetime.now().isoformat(),
            "results": results
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/search/symptoms', methods=['POST'])
def search_symptoms():
    """Search specifically for symptoms"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        results = search_items(
            query,
            MEDICAL_DATA['symptoms'],
            ['name', 'category', 'keywords']
        )
        
        return jsonify({
            "success": True,
            "results": results,
            "count": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/search/doctors', methods=['POST'])
def search_doctors():
    """Search specifically for doctors"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        results = search_items(
            query,
            MEDICAL_DATA['doctors'],
            ['name', 'specialty', 'location', 'languages']
        )
        
        return jsonify({
            "success": True,
            "results": results,
            "count": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/search/hospitals', methods=['POST'])
def search_hospitals():
    """Search specifically for hospitals"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        results = search_items(
            query,
            MEDICAL_DATA['hospitals'],
            ['name', 'location', 'type', 'specialties']
        )
        
        return jsonify({
            "success": True,
            "results": results,
            "count": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/search/medicines', methods=['POST'])
def search_medicines():
    """Search specifically for medicines"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        results = search_items(
            query,
            MEDICAL_DATA['medicines'],
            ['name', 'generic', 'category', 'common_uses']
        )
        
        return jsonify({
            "success": True,
            "results": results,
            "count": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/search/suggestions', methods=['POST'])
def get_suggestions():
    """Get autocomplete suggestions for search"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        limit = data.get('limit', 5)
        
        suggestions = []
        
        # Get suggestions from all categories
        for symptom in MEDICAL_DATA['symptoms']:
            if query in symptom['name'].lower():
                suggestions.append({
                    "text": symptom['name'],
                    "category": "Symptom",
                    "icon": "🩺"
                })
        
        for doctor in MEDICAL_DATA['doctors']:
            if query in doctor['name'].lower() or query in doctor['specialty'].lower():
                suggestions.append({
                    "text": f"{doctor['name']} - {doctor['specialty']}",
                    "category": "Doctor",
                    "icon": "👨‍⚕️"
                })
        
        for hospital in MEDICAL_DATA['hospitals']:
            if query in hospital['name'].lower():
                suggestions.append({
                    "text": hospital['name'],
                    "category": "Hospital",
                    "icon": "🏥"
                })
        
        for medicine in MEDICAL_DATA['medicines']:
            if query in medicine['name'].lower():
                suggestions.append({
                    "text": medicine['name'],
                    "category": "Medicine",
                    "icon": "💊"
                })
        
        return jsonify({
            "success": True,
            "suggestions": suggestions[:limit]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "MedAid Search Service",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("=" * 60)
    print("🔍 MedAid Search Service Starting...")
    print("=" * 60)
    print("📍 Endpoints:")
    print("   POST /api/search - Universal search")
    print("   POST /api/search/symptoms - Search symptoms")
    print("   POST /api/search/doctors - Search doctors")
    print("   POST /api/search/hospitals - Search hospitals")
    print("   POST /api/search/medicines - Search medicines")
    print("   POST /api/search/suggestions - Get autocomplete suggestions")
    print("   GET  /api/health - Health check")
    print("=" * 60)
    print("🚀 Server running on http://localhost:5000")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
