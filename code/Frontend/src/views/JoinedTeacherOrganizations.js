import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CourseList from '../components/CourseList';
import axios from 'axios';
import SuccessAlert from '../components/SuccessAlert';
import ErrorMessage from '../components/FailAlert';
import { Building2, BookOpen, Clock, Users, CalendarDays, ArrowLeft, Globe } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const JoinedTeacherOrganizations = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        const orgResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/org/${orgId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setOrganization(orgResponse.data.data);

        // Fetch available courses
        const coursesResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/org/${orgId}/courses`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setAvailableCourses(coursesResponse.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch organization details');
        setLoading(false);
      }
    };

    if (orgId) {
      fetchOrganizationDetails();
    }
  }, [orgId]);

  useEffect(() => {
    let timeoutId;
    if (successMessage || errorMessage) {
      timeoutId = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [successMessage, errorMessage]);

  const handleJoinCourse = async (courseId) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/course/${courseId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setAvailableCourses(prev => prev.filter(course => course._id !== courseId));
        setSuccessMessage('Successfully joined the course!');
        console.log("fone for me");
        setTimeout(() => {
          navigate(`/teachercourses/${courseId}`);
        }, 2000);
      } else {
        setErrorMessage(response.data.message || 'Failed to join course');
      }
    } catch (err) {
      // Redirect to teacher course page
      navigate(`/teachercourses/${courseId}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-cream">
        <LoadingSpinner/>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#57321A] mb-2">Error Loading Organization</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#57321A] text-white px-6 py-2 rounded-lg hover:bg-[#442718] transition-colors duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Organization not found
  if (!organization) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-[#EFC815] mb-4">
            <Building2 size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-[#57321A] mb-2">Organization Not Found</h3>
          <p className="text-gray-600 mb-6">The organization you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/organizations')}
            className="bg-[#57321A] text-white px-6 py-2 rounded-lg hover:bg-[#442718] transition-colors duration-300"
          >
            Return to Organizations
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-cream"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Floating notification alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50"
            >
              <SuccessAlert message={successMessage} />
            </motion.div>
          )}
          
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 right-20 z-50"
            >
              <ErrorMessage message={errorMessage} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-[#57321A] hover:text-[#EFC815] transition-colors duration-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Organizations</span>
          </button>
        </div>
        
        {/* Organization Header */}
        <div className="bg-gradient-to-br from-[#57321A] to-[#7A4D2E] rounded-xl overflow-hidden shadow-lg mb-8">
          <div className="h-40 bg-[#57321A]/20 relative">
            {organization.coverImage ? (
              <img 
                src={organization.coverImage}
                alt={organization.name}
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 size={80} className="text-white/30" />
              </div>
            )}
          </div>
          
          <div className="p-6 relative">
            {/* Organization logo */}
            <div className="absolute -top-16 left-6 w-24 h-24 bg-white rounded-lg shadow-lg overflow-hidden border-4 border-white">
              {organization.logo ? (
                <img 
                  src={organization.logo} 
                  alt={`${organization.name} logo`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FFFCF4]">
                  <Building2 size={36} className="text-[#EFC815]" />
                </div>
              )}
            </div>
            
            <div className="ml-28">
              <h1 className="text-3xl font-bold text-white mb-2">
                {organization.name}
              </h1>
              
              <p className="text-white/80 mb-4">
                {organization.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                {organization.website && (
                  <a 
                    href={organization.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white/90 text-sm transition-colors duration-300"
                  >
                    <Globe size={14} />
                    Website
                  </a>
                )}
                
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-sm">
                  <BookOpen size={14} />
                  {availableCourses.length} Courses Available
                </div>
                
                {organization.founded && (
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-sm">
                    <CalendarDays size={14} />
                    Founded {organization.founded}
                  </div>
                )}
                
                {organization.memberCount && (
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-sm">
                    <Users size={14} />
                    {organization.memberCount} Members
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-[#57321A]/20">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-4 font-medium border-b-2 transition-colors duration-300 ${
                activeTab === 'courses' 
                  ? 'border-[#EFC815] text-[#57321A]' 
                  : 'border-transparent text-[#57321A]/60 hover:text-[#57321A]'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen size={18} />
                Courses
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-4 font-medium border-b-2 transition-colors duration-300 ${
                activeTab === 'about' 
                  ? 'border-[#EFC815] text-[#57321A]' 
                  : 'border-transparent text-[#57321A]/60 hover:text-[#57321A]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 size={18} />
                About
              </span>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-[#57321A] mb-6 flex items-center">
                  <BookOpen className="mr-2 text-[#EFC815]" size={24} />
                  Available Courses
                </h2>
                
                {availableCourses.length > 0 ? (
                  <CourseList courses={availableCourses} onJoinCourse={handleJoinCourse} join={false} />
                ) : (
                  <div className="text-center py-12 bg-[#FFFCF4] rounded-lg">
                    <Clock size={48} className="mx-auto mb-4 text-[#EFC815]" />
                    <h3 className="text-xl font-semibold text-[#57321A] mb-2">No Available Courses</h3>
                    <p className="text-gray-600">
                      There are currently no courses available for enrollment in this organization.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-[#57321A] mb-6 flex items-center">
                  <Building2 className="mr-2 text-[#EFC815]" size={24} />
                  About This Organization
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-[#57321A] mb-4">
                      Organization Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-[#FFFCF4] p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Organization Name</p>
                        <p className="font-medium text-[#57321A]">{organization.name}</p>
                      </div>
                      
                      {organization.contactDetails?.email && (
                        <div className="bg-[#FFFCF4] p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="font-medium text-[#57321A]">{organization.contactDetails.email}</p>
                        </div>
                      )}
                      
                      {organization.contactDetails?.phone && (
                        <div className="bg-[#FFFCF4] p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Phone</p>
                          <p className="font-medium text-[#57321A]">{organization.contactDetails.phone}</p>
                        </div>
                      )}
                      
                      {organization.contactDetails?.address && (
                        <div className="bg-[#FFFCF4] p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Address</p>
                          <p className="font-medium text-[#57321A]">{organization.contactDetails.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-[#57321A] mb-4">
                      Description
                    </h3>
                    <div className="bg-[#FFFCF4] p-4 rounded-lg">
                      <p className="text-[#57321A]">
                        {organization.description || "No detailed description available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default JoinedTeacherOrganizations;