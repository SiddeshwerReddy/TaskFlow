import { useState, useEffect, useContext } from 'react';
import { Plus, RefreshCw, XCircle, RotateCcw } from 'lucide-react';
import { io } from 'socket.io-client';
import CreateJobModal from '../components/CreateJobModal';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

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
  const { user } = useContext(AuthContext);
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

  // Real-time WebSocket connection
  useEffect(() => {
    fetchJobs(); // Initial fetch
    
    if (!user) return;

    // Connect to Socket.io server
    const socket = io('http://localhost:5000', {
      query: { userId: user.id }
    });

    socket.on('job-updated', (update) => {
      console.log('Real-time job update received:', update);
      // We can directly mutate the specific job in state, 
      // but re-fetching ensures perfect sync for simplicity
      fetchJobs();
    });

    return () => socket.disconnect();
  }, [user]);

  const handleJobCreated = () => {
    fetchJobs();
  };

  const handleCancel = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/cancel`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel job');
    }
  };

  const handleRetry = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/retry`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retry job');
    }
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
                  <th className="p-4 font-semibold text-gray-600 text-sm">Actions</th>
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
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex gap-3">
                        {['queued', 'retrying'].includes(job.status) && (
                          <button 
                            onClick={() => handleCancel(job._id)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-medium transition-colors"
                            title="Cancel Job"
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        )}
                        {['failed', 'cancelled'].includes(job.status) && (
                          <button 
                            onClick={() => handleRetry(job._id)}
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs font-medium transition-colors"
                            title="Retry Job"
                          >
                            <RotateCcw size={16} /> Retry
                          </button>
                        )}
                        {['processing', 'completed'].includes(job.status) && (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </div>
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
