import { useState } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';

export default function CreateJobModal({ isOpen, onClose, onJobCreated }) {
  const [type, setType] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dynamic fields
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build data payload based on type
      let payloadData = {};
      if (type === 'email') payloadData = { to: formData.to, subject: formData.subject };
      if (type === 'report') payloadData = { format: formData.format || 'pdf', month: formData.month };
      if (type === 'image') payloadData = { imageId: formData.imageId, width: Number(formData.width), height: Number(formData.height) };
      if (type === 'simulation') payloadData = { delay: Number(formData.delay) || 1000, shouldFail: !!formData.shouldFail };

      await api.post('/jobs', { type, data: payloadData });
      
      onJobCreated();
      setFormData({});
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Create New Job</h2>
        
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); setFormData({}); }}
              className="w-full p-2 border rounded-md bg-white"
            >
              <option value="email">Email Notification</option>
              <option value="report">Generate Report</option>
              <option value="image">Resize Image</option>
              <option value="simulation">System Simulation</option>
            </select>
          </div>

          {/* Dynamic Fields */}
          {type === 'email' && (
            <>
              <div>
                <label className="block text-sm text-gray-600">Recipient Email</label>
                <input required type="email" onChange={e => handleFieldChange('to', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Subject</label>
                <input required type="text" onChange={e => handleFieldChange('subject', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
              </div>
            </>
          )}

          {type === 'report' && (
            <>
              <div>
                <label className="block text-sm text-gray-600">Format</label>
                <select onChange={e => handleFieldChange('format', e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Month</label>
                <input required type="month" onChange={e => handleFieldChange('month', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
              </div>
            </>
          )}

          {type === 'image' && (
            <>
              <div>
                <label className="block text-sm text-gray-600">Image ID</label>
                <input required type="text" onChange={e => handleFieldChange('imageId', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Width (px)</label>
                  <input required type="number" onChange={e => handleFieldChange('width', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Height (px)</label>
                  <input required type="number" onChange={e => handleFieldChange('height', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                </div>
              </div>
            </>
          )}

          {type === 'simulation' && (
            <>
              <div>
                <label className="block text-sm text-gray-600">Simulated Delay (ms)</label>
                <input required type="number" defaultValue={1000} onChange={e => handleFieldChange('delay', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="fail" onChange={e => handleFieldChange('shouldFail', e.target.checked)} />
                <label htmlFor="fail" className="text-sm text-gray-600">Force job to fail (for testing retries)</label>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
