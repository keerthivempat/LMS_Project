import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessAlert from '../components/SuccessAlert';
import FailAlert from '../components/FailAlert';

export default function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple verification attempts
      if (verificationAttempted.current) {
        return;
      }
      verificationAttempted.current = true;

      try {
       
        
        const verificationUrl = `${process.env.REACT_APP_BACKEND}/api/auth/verify-email/${token}`;
        // console.log("Full verification URL:", verificationUrl);

        const response = await fetch(verificationUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        // console.log("Response status:", response.status);
        const data = await response.json();
        // console.log("Verification response:", data);

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now login.');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        } else {
          throw new Error(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
        setMessage(error.message || 'Something went wrong. Please try again later.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Verification token is missing');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-brown text-center mb-6">
          Email Verification
        </h2>
        
        <div className="mt-8 space-y-6">
          {status === 'verifying' && (
            <div className="flex flex-col items-center justify-center">
              <LoadingSpinner />
              <p className="mt-4 text-sm text-gray-600">
                Verifying your email address...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <p className="font-medium">{message}</p>
                <p className="text-sm mt-2">Redirecting to login page...</p>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center">
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-medium">Verification Failed</p>
                <p className="text-sm mt-2">{message}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Need a new verification link?
                  </p>
                  <Link
                    to="/login"
                    className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-center transition-colors"
                  >
                    Go to Login
                  </Link>
                </div>

                <p className="text-sm text-gray-600">
                  From there, you can request a new verification link or create a new account.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 