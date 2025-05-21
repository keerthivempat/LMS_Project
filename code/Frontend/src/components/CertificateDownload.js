import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileDown, Award, Check } from 'lucide-react';

const CertificateDownload = ({ courseId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Add useEffect to verify courseId is available when component mounts
  useEffect(() => {
    console.log('CertificateDownload mounted with courseId:', courseId);
  }, [courseId]);

  const downloadCertificate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make sure we have a courseId
      if (!courseId) {
        throw new Error('Course ID is missing');
      }
      
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      console.log('Requesting certificate for course:', courseId);
      console.log('Using token:', token ? 'Token available' : 'No token found');
      console.log('API URL:', `${process.env.REACT_APP_BACKEND}/api/certificates/${courseId}`);
      
      // Get certificate as blob
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/certificates/${courseId}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `course-certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      link.remove();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setError(`Failed to download certificate: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 mb-6" style={{border: '2px solid #FFB800', padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255, 184, 0, 0.05)'}}>
      <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-yellow/10 to-transparent">
        <div className="flex items-center mb-3">
          <Award className="text-yellow-600 mr-2" size={24} />
          <h3 className="text-lg font-medium text-brown">Course Certificate</h3>
        </div>
        
        <p className="text-brown/70 mb-4">
          Download your course completion certificate by clicking the button below.
        </p>
        
        <button
          onClick={downloadCertificate}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md flex items-center justify-center transition-all duration-300 ${
            isLoading 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-yellow hover:bg-yellow-600 text-white'
          }`}
          style={{backgroundColor: isLoading ? '#ccc' : '#FFB800', color: 'white'}}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : success ? (
            <span className="flex items-center">
              <Check size={16} className="mr-2" />
              Downloaded!
            </span>
          ) : (
            <span className="flex items-center">
              <FileDown size={16} className="mr-2" />
              Download Certificate
            </span>
          )}
        </button>
        
        {error && (
          <div className="mt-3 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateDownload;
