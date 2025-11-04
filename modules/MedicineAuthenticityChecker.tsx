import { useState, useEffect } from 'react';
import { Scan, Check, X, AlertTriangle, Search, Clock, BarChart3 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function MedicineAuthenticityChecker() {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/medicine-checker/history/user123`);
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/medicine-checker/stats/overview`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleScan = async () => {
    if (!barcode.trim()) {
      alert('Please enter a barcode number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/medicine-checker/verify`, {
        barcode: barcode.trim(),
        scannedBy: 'user123'
      });

      setResult(response.data.data);
      setBarcode('');
      await fetchHistory();
      await fetchStats();
    } catch (error) {
      console.error('Error verifying medicine:', error);
      alert('Failed to verify medicine');
    } finally {
      setLoading(false);
    }
  };

  const simulateBarcodeScan = () => {
    setScanning(true);
    // Simulate camera scanning
    setTimeout(() => {
      const dummyBarcodes = ['8901234567890', '8901234567891', '8901234567892', '9999999999999'];
      const randomBarcode = dummyBarcodes[Math.floor(Math.random() * dummyBarcodes.length)];
      setBarcode(randomBarcode);
      setScanning(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authentic':
        return <Check className="w-6 h-6 text-green-500" />;
      case 'fake':
        return <X className="w-6 h-6 text-red-500" />;
      case 'suspicious':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authentic':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'fake':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Medicine Authenticity Checker</h1>
              <p className="text-gray-600 mt-1">Verify medicine authenticity instantly</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Scans</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalScans}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Authentic</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.authenticMedicines}</p>
                </div>
                <Check className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Fake/Unknown</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.fakeMedicines}</p>
                </div>
                <X className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.successRate}%</p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Scanner Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Scan Medicine Barcode</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter Barcode Number</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g., 8901234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            <div className="flex gap-3 items-end">
              <button
                onClick={simulateBarcodeScan}
                disabled={scanning || loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Scan className="w-5 h-5" />
                {scanning ? 'Scanning...' : 'Scan with Camera'}
              </button>
              <button
                onClick={handleScan}
                disabled={loading || !barcode.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>

          {scanning && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <div className="animate-pulse">
                <Scan className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <p className="text-purple-800 font-semibold">Scanning barcode...</p>
                <p className="text-purple-600 text-sm mt-2">Please align the barcode with camera</p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Result */}
        {result && (
          <div className={`rounded-2xl shadow-xl p-8 mb-6 border-4 ${getStatusColor(result.verificationStatus)}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {getStatusIcon(result.verificationStatus)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Verification Result</h2>
                  <p className="text-gray-600 mt-1">Scanned on {new Date(result.verificationDate).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <span className={`px-6 py-2 rounded-full font-bold text-lg ${
                result.isAuthentic ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {result.isAuthentic ? 'AUTHENTIC' : 'FAKE / UNKNOWN'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Medicine Name</p>
                  <p className="text-lg font-semibold text-gray-800">{result.medicineName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Manufacturer</p>
                  <p className="text-lg font-semibold text-gray-800">{result.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Batch Number</p>
                  <p className="text-lg font-semibold text-gray-800">{result.batchNumber}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Manufacturing Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {result.manufacturingDate ? new Date(result.manufacturingDate).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {result.expiryDate ? new Date(result.expiryDate).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Barcode</p>
                  <p className="text-lg font-semibold text-gray-800 font-mono">{result.barcode}</p>
                </div>
              </div>
            </div>

            {!result.isAuthentic && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">⚠️ Warning</p>
                <p className="text-red-700">
                  This medicine could not be verified in our database. It may be fake, expired, or not registered. 
                  Please consult a pharmacist or healthcare provider before use.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Scan History */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Scans</h2>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, 10).map((scan) => (
                <div key={scan._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(scan.verificationStatus)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{scan.medicineName}</h3>
                        <p className="text-sm text-gray-600">{scan.manufacturer}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scan.verificationStatus)}`}>
                          {scan.verificationStatus.toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(scan.verificationDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No scan history yet</p>
              <p className="text-sm text-gray-400 mt-2">Start scanning medicines to see your history</p>
            </div>
          )}
        </div>

        {/* Test Barcodes Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🧪 Test Barcodes (Demo Mode)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-blue-800"><span className="font-mono bg-white px-2 py-1 rounded">8901234567890</span> - Paracetamol (Authentic)</p>
            </div>
            <div>
              <p className="text-blue-800"><span className="font-mono bg-white px-2 py-1 rounded">8901234567891</span> - Amoxicillin (Authentic)</p>
            </div>
            <div>
              <p className="text-blue-800"><span className="font-mono bg-white px-2 py-1 rounded">8901234567892</span> - Azithromycin (Authentic)</p>
            </div>
            <div>
              <p className="text-blue-800"><span className="font-mono bg-white px-2 py-1 rounded">9999999999999</span> - Unknown (Fake)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
