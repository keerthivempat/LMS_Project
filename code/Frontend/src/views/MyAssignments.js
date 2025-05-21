import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAssignments, deleteAssignment } from '../utility/AssignmentStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import { File, Trash2 } from 'lucide-react';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await listAssignments();
        setAssignments(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load your assignments');
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        // Extract the actual assignmentId from the full ID
        const assignmentId = id.replace('assignment-', '');
        await deleteAssignment(assignmentId);
        
        // Update the state to reflect the deletion
        setAssignments(assignments.filter(a => a.id !== id));
      } catch (err) {
        console.error('Error deleting assignment:', err);
        setError('Failed to delete the assignment');
      }
    }
  };

  const downloadAssignment = (assignment) => {
    if (!assignment || !assignment.fileData) {
      alert('File data not available');
      return;
    }
    
    const blob = new Blob([assignment.fileData], { type: assignment.fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = assignment.fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Assignment Submissions</h1>

      {assignments.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">You haven't submitted any assignments yet.</p>
          <button 
            onClick={() => navigate('/courses')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Courses
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center">
                  <File className="text-blue-600 mr-2" size={20} />
                  <div className="truncate max-w-[200px]">
                    <p className="font-medium">{assignment.fileName}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Submitted:</span>{' '}
                  {new Date(assignment.submittedAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Size:</span>{' '}
                  {(assignment.fileSize / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => downloadAssignment(assignment)}
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssignments; 