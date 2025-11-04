/**
 * Example: Health Records Module Using Centralized System
 * This shows how to migrate existing components to use shared config
 */

import React, { useState, useEffect } from 'react';
import { api } from '../shared/services/api.service';
import { COLORS, BLOOD_GROUPS, FILE_UPLOAD } from '../shared/constants/app.constants';
import type { HealthRecord } from '../shared/services/api.service';

export default function HealthRecordsExample() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch records using centralized API
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Use centralized API - no axios needed!
      const data = await api.healthRecords.getAll();
      setRecords(data);
    } catch (err) {
      setError('Failed to fetch health records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (formData: Partial<HealthRecord>) => {
    try {
      setLoading(true);
      
      // ✅ Use centralized API
      const newRecord = await api.healthRecords.create(formData);
      setRecords([...records, newRecord]);
      
      alert(`Health ID created: ${newRecord.healthId}`);
    } catch (err) {
      alert('Failed to create health record');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (recordId: string, file: File) => {
    // ✅ Use centralized file upload settings
    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
      alert(`File size must be less than ${FILE_UPLOAD.MAX_SIZE_MB}MB`);
      return;
    }

    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      alert(`File type must be one of: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document', file);

      // ✅ Use centralized API
      await api.healthRecords.uploadDocument(recordId, formData);
      alert('Document uploaded successfully');
      fetchRecords(); // Refresh
    } catch (err) {
      alert('Failed to upload document');
      console.error(err);
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: COLORS.GRAY_LIGHT // ✅ Use centralized colors
    }}>
      <h1 style={{ color: COLORS.HEALTH_RECORDS }}>
        Health Records
      </h1>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: COLORS.ERROR }}>{error}</div>}

      {/* Blood Group Selector */}
      <div>
        <label>Blood Group:</label>
        <select>
          {/* ✅ Use centralized blood groups */}
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {/* Records List */}
      <div style={{ marginTop: '20px' }}>
        {records.map((record) => (
          <div 
            key={record._id} 
            style={{ 
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: COLORS.WHITE,
              borderRadius: '8px',
              border: `2px solid ${COLORS.HEALTH_RECORDS}`
            }}
          >
            <h3 style={{ color: COLORS.HEALTH_RECORDS }}>
              {record.healthId}
            </h3>
            <p><strong>Name:</strong> {record.fullName}</p>
            <p><strong>Blood Group:</strong> 
              <span style={{ 
                backgroundColor: COLORS.ERROR,
                color: COLORS.WHITE,
                padding: '2px 8px',
                borderRadius: '12px',
                marginLeft: '8px'
              }}>
                {record.bloodGroup}
              </span>
            </p>
            <p><strong>DOB:</strong> {record.dateOfBirth}</p>
            
            {record.allergies.length > 0 && (
              <p style={{ color: COLORS.WARNING }}>
                <strong>Allergies:</strong> {record.allergies.join(', ')}
              </p>
            )}

            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = FILE_UPLOAD.ALLOWED_EXTENSIONS.join(',');
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file && record._id) {
                    uploadDocument(record._id, file);
                  }
                };
                input.click();
              }}
              style={{ 
                backgroundColor: COLORS.SUCCESS,
                color: COLORS.WHITE,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Upload Document
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
