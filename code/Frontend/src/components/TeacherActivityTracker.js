import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Video, User, X } from 'lucide-react';
import { format, formatDistanceToNow, isAfter, subDays } from 'date-fns';
import api from '../utility/api';
import LoadingSpinner from './LoadingSpinner';
import TeacherActivityVisualizer from './TeacherActivityVisualizer';
import Modal from './Modal';

const TeacherActivityTracker = () => {
  const [teacherActivity, setTeacherActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('lastActive');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeacherActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const orgId = localStorage.getItem('organizationid');
        
        const response = await api.get(`/api/v1/admin/teacher-activity/${orgId}`);
        setTeacherActivity(response.data.data);
      } catch (error) {
        console.error('Error fetching teacher activity data:', error);
        setError(error.response?.data?.message || 'Failed to load teacher activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherActivity();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTeacher(null);
  };

  const sortedTeachers = [...teacherActivity].sort((a, b) => {
    const dateA = a[sortBy] ? new Date(a[sortBy]) : new Date(0);
    const dateB = b[sortBy] ? new Date(b[sortBy]) : new Date(0);
    
    if (sortOrder === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  const getActivityStatus = (date) => {
    if (!date) return { text: 'No activity', color: 'bg-red-100 text-red-800' };
    
    const activityDate = new Date(date);
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);
    const oneMonthAgo = subDays(now, 30);
    
    if (isAfter(activityDate, oneWeekAgo)) {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    } else if (isAfter(activityDate, oneMonthAgo)) {
      return { text: 'Semi-active', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    
    try {
      const formattedDate = format(new Date(date), 'PPp');
      const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });
      return `${formattedDate} (${timeAgo})`;
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Teacher Activity Table */}
      <div className="bg-white rounded-lg shadow-sm border border-brown/20">
        <div className="p-4 border-b border-brown/10">
          <h3 className="text-lg font-medium text-brown">Teacher Activity Details</h3>
          <p className="text-sm text-brown/60">Click on a teacher to see detailed activity visualizations</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brown/10">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Teacher</th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastActive')}
                >
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>Last Active {sortBy === 'lastActive' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastContentUploaded')}
                >
                  <div className="flex items-center gap-1">
                    <Video size={14} />
                    <span>Last Upload {sortBy === 'lastContentUploaded' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastAssignmentReviewed')}
                >
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>Last Review {sortBy === 'lastAssignmentReviewed' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-brown/10">
              {sortedTeachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-brown/60">
                    No teacher activity data available
                  </td>
                </tr>
              ) : (
                sortedTeachers.map((teacher) => {
                  const activityStatus = getActivityStatus(teacher.lastActive);
                  
                  return (
                    <tr
                      key={teacher._id}
                      className="hover:bg-cream transition-colors cursor-pointer"
                      onClick={() => handleTeacherClick(teacher)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-cream flex items-center justify-center mr-3">
                            <User size={16} className="text-brown" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-brown truncate">{teacher.name}</div>
                            <div className="text-xs text-brown/60 truncate">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-brown/70">
                        {formatDate(teacher.lastActive)}
                      </td>
                      <td className="px-4 py-3 text-sm text-brown/70">
                        {formatDate(teacher.lastContentUploaded)}
                      </td>
                      <td className="px-4 py-3 text-sm text-brown/70">
                        {formatDate(teacher.lastAssignmentReviewed)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${activityStatus.color}`}>
                          {activityStatus.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Teacher Activity */}
      {modalOpen && selectedTeacher && (
        <Modal isOpen={modalOpen} onClose={closeModal} title={`Activity Details for ${selectedTeacher.name}`}>
          <TeacherActivityVisualizer teacherData={selectedTeacher} />
        </Modal>
      )}
    </div>
  );
};

export default TeacherActivityTracker; 