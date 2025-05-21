import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OrganizationHeader from '../components/OrganizationHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessAlert from '../components/SuccessAlert';

const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        const [orgResponse, coursesResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND}/api/org/${id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
          fetch(`${process.env.REACT_APP_BACKEND}/api/org/${id}/courses`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          })
        ]);

        const [orgData, coursesData] = await Promise.all([
          orgResponse.json(),
          coursesResponse.json()
        ]);

        setOrganization(orgData.data);
        setCourses(coursesData.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganizationDetails();
    }
  }, [id]);

  const handleJoinOrganization = async () => {
    try {
      setJoining(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${id}/join`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to join organization');
      }
      <SuccessAlert message="Joined successfully" ></SuccessAlert>
      // alert('Successfully joined the organization!');
      
      window.location.href = '/organisations';
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-cream px-4 mt-20 py-8"
    >
      <div className="container mx-auto">
        <OrganizationHeader organization={organization} />
        
        {/* Join Organization Button */}
        <div className="flex justify-center my-6">
          <button
            onClick={handleJoinOrganization}
            disabled={joining}
            className="bg-[#EFC815] text-[#57321A] px-6 py-3 rounded 
                     hover:bg-[#57321A] hover:text-[#FFFFFF] 
                     transition-colors duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-semibold text-lg shadow-md"
          >
            {joining ? 'Joining...' : 'Join Organization'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrganizationDetails;
