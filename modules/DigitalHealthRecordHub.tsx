import { useState, useEffect } from 'react';
import { FileText, Upload, Download, Calendar, User, Shield, Plus, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function DigitalHealthRecordHub() {
  const [healthRecord, setHealthRecord] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userId: 'user123', // In production, get from auth context
    fullName: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  const [uploadData, setUploadData] = useState({
    fileName: '',
    fileType: '',
    fileSize: 0,
    category: 'prescription',
    description: ''
  });

  // Create new Health ID
  const handleCreateHealthId = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a),
        chronicConditions: formData.chronicConditions.split(',').map(c => c.trim()).filter(c => c)
      };

      const response = await axios.post(`${API_URL}/health-records/create`, payload);
      setHealthRecord(response.data.data.record);
      setShowCreateModal(false);
      alert(`Health ID Created: ${response.data.data.healthId}`);
    } catch (error) {
      console.error('Error creating health ID:', error);
      alert('Failed to create health ID');
    } finally {
      setLoading(false);
    }
  };

  // Upload document
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!healthRecord) {
      alert('Please create a Health ID first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/health-records/${healthRecord.healthId}/upload`,
        uploadData
      );
      
      // Refresh health record
      const updatedRecord = await axios.get(`${API_URL}/health-records/${healthRecord.healthId}`);
      setHealthRecord(updatedRecord.data.data);
      setShowUploadModal(false);
      setUploadData({
        fileName: '',
        fileType: '',
        fileSize: 0,
        category: 'prescription',
        description: ''
      });
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  // Simulated file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({
        ...uploadData,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Digital Health Record Hub</h1>
                <p className="text-gray-600 mt-1">Secure & Encrypted Health Records</p>
              </div>
            </div>
            {!healthRecord && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Health ID
              </button>
            )}
          </div>
        </div>

        {/* Health Record Display */}
        {healthRecord ? (
          <>
            {/* Health ID Card */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-blue-100 text-sm mb-2">Your Unique Health ID</p>
                  <h2 className="text-4xl font-bold tracking-wider">{healthRecord.healthId}</h2>
                </div>
                <Shield className="w-16 h-16 text-white/30" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-blue-100 text-sm">Full Name</p>
                  <p className="text-xl font-semibold">{healthRecord.fullName}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Blood Group</p>
                  <p className="text-xl font-semibold">{healthRecord.bloodGroup || 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Date of Birth</p>
                  <p className="text-xl font-semibold">
                    {new Date(healthRecord.dateOfBirth).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  Upload Document
                </button>
              </div>
            </div>

            {/* Health Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-500" />
                  Allergies
                </h3>
                {healthRecord.allergies && healthRecord.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {healthRecord.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No allergies recorded</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Chronic Conditions
                </h3>
                {healthRecord.chronicConditions && healthRecord.chronicConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {healthRecord.chronicConditions.map((condition, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No chronic conditions recorded</p>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Uploaded Documents</h3>
              {healthRecord.documents && healthRecord.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {healthRecord.documents.map((doc, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.category === 'prescription' ? 'bg-blue-100 text-blue-700' :
                          doc.category === 'lab-report' ? 'bg-green-100 text-green-700' :
                          doc.category === 'scan' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {doc.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{doc.fileName}</h4>
                      <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString('en-IN')}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center justify-center gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upload Your First Document
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Shield className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Your Digital Health ID</h2>
            <p className="text-gray-600 mb-6">
              Get started by creating a unique Health ID to securely store all your medical records
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create Health ID Now
            </button>
          </div>
        )}

        {/* Create Health ID Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Health ID</h2>
              <form onSubmit={handleCreateHealthId} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Diabetes, Hypertension"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Emergency Contact</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value }})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Contact Phone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value }})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Relation"
                      value={formData.emergencyContact.relation}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relation: e.target.value }})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Health ID'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Document Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Document</h2>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {uploadData.fileName && (
                    <p className="text-sm text-gray-600 mt-2">Selected: {uploadData.fileName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="lab-report">Lab Report</option>
                    <option value="scan">Scan/X-Ray</option>
                    <option value="vaccination">Vaccination Record</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Brief description of the document"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !uploadData.fileName}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
