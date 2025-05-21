import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessAlert from '../components/SuccessAlert';

const JoinOrganization = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    const joinOrganization = async () => {
      try {
        // Check if user is logged in
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          // Redirect to login page with a return URL
          const returnUrl = encodeURIComponent(`/organizations/${orgId}/join`);
          navigate(`/login?redirect=${returnUrl}`);
          return;
        }

        // First, get organization details to show the name
        const detailsResponse = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${orgId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!detailsResponse.ok) {
          const detailsError = await detailsResponse.json();
          throw new Error(detailsError.message || 'Organization not found');
        }

        const detailsData = await detailsResponse.json();
        setOrganizationName(detailsData.data.name);

        // Now join the organization
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${orgId}/join`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // Special handling for already joined error
          if (data.message?.includes('already a student of this organization')) {
            setSuccess(true);
            setTimeout(() => {
              navigate('/my-organizations');
            }, 3000);
            return;
          }
          
          throw new Error(data.message || 'Failed to join organization');
        }

        setSuccess(true);
        
        // Set role to student if not already an admin or teacher
        const currentRole = localStorage.getItem('role');
        if (currentRole !== 'admin' && currentRole !== 'teacher' && currentRole !== 'superadmin') {
          localStorage.setItem('role', 'student');
        }

        // Redirect after successful join
        setTimeout(() => {
          navigate('/my-organizations');
        }, 3000);
      } catch (err) {
        console.error('Error joining organization:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      joinOrganization();
    }
  }, [orgId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-cream">
        <LoadingSpinner />
        <p className="mt-4 text-brown text-lg">Joining organization...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-cream">
      {error ? (
        <div className="w-full max-w-md">
          <ErrorMessage 
            message={error}
            onClose={() => navigate('/organizations')}
          />
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/organizations')}
              className="px-4 py-2 bg-yellow text-white rounded-lg hover:bg-yellow/90 transition-colors"
            >
              Browse Organizations
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <SuccessAlert 
            message={`Successfully joined ${organizationName}! Redirecting to your organizations...`}
          />
        </div>
      )}
    </div>
  );
};

export default JoinOrganization; 