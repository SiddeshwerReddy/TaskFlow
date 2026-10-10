import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import CreateJobModal from '../components/CreateJobModal';
import api from '../api/axios';

const StatusBadge = ({ status }) => {
  const styles = {
    queued: 'bg-gray-100 text-gray-800',
    processing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    retrying: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-gray-200 text-gray-600'
  };

  const style = styles[status] || styles.queued;
  
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.jobs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and automatic background polling
  useEffect(() => {
    fetchJobs();
    
    // Poll every 3 seconds to mimic real-time updates (Real Socket.io comes in Day 15)
    const intervalId = setInterval(fetchJobs, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const handleJobCreated = () => {
    fetchJobs(); // Instantly refresh table when new job is submitted
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchJobs}
            className="flex items-center gap-2 bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            New Job
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading && jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No jobs found. Create one to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Job ID</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-600">...{job._id.slice(-6)}</td>
                    <td className="p-4 text-sm font-medium text-gray-800 capitalize">{job.type}</td>
                    <td className="p-4 text-sm"><StatusBadge status={job.status} /></td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onJobCreated={handleJobCreated} 
      />
    </div>
  );
}
