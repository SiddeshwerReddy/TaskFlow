import { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateJobModal from '../components/CreateJobModal';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleJobCreated = () => {
    // Show a success toast or alert for now
    alert('Job submitted successfully to the queue!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          New Job
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <p className="text-gray-500">Welcome to TaskFlow! Job list will appear here soon.</p>
      </div>

      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onJobCreated={handleJobCreated} 
      />
    </div>
  );
}
