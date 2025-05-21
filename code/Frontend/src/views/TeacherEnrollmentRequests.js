import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, AlertCircle, Search, Filter, ArrowLeft } from "lucide-react";
import HeadingWithEffect from "../components/HeadingWithEffects";
import LoadingSpinner from "../components/LoadingSpinner";
import SuccessAlert from "../components/SuccessAlert";

export default function TeacherEnrollmentRequests() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const colorScheme = {
    cream: "#FFFCF4",
    brown: "#57321A",
    yellow: "#EFC815",
    white: "#FFFFFF",
  };

  useEffect(() => {
    fetchRequests();
  }, [courseId]);

  const fetchRequests = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND;
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${BACKEND_URL}/api/teacher/enrollment-requests/${courseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch enrollment requests");
      }

      const data = await response.json();
      console.log("Enrollment requests:", data);
      setRequests(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, status) => {
    setLoadingRequestId(requestId);
    console.log("Updating request status:", requestId, status);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND;
      const accessToken = localStorage.getItem("accessToken");
    
      const response = await fetch(
        `${BACKEND_URL}/api/teacher/enrollment-requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status,requestId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update request status");
      }

      setSuccessMessage(
        status === "approved" 
          ? "Request approved successfully!" 
          : "Request rejected successfully!"
      );
      
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRequestId(null);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-cream p-8 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={32} />
          <p className="text-brown">{error}</p>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || request.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8 ml-10">
      <div className="max-w-7xl mx-auto">
        {successMessage && (
          <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />
        )}

        <button
          onClick={() => navigate(`/TeacherCourses/${courseId}`)}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-md hover:bg-brown/5"
          style={{ color: colorScheme.brown }}
        >
          <ArrowLeft size={20} />
          <span>Back to Course</span>
        </button>

        <HeadingWithEffect>Enrollment Requests</HeadingWithEffect>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mt-6 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              style={{ 
                borderColor: colorScheme.brown,
                backgroundColor: colorScheme.white
              }}
            />
            <Search 
              size={20} 
              className="absolute left-3 top-2.5"
              style={{ color: colorScheme.brown }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
            style={{ 
              borderColor: colorScheme.brown,
              backgroundColor: colorScheme.white,
              color: colorScheme.brown
            }}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-brown/20">
            <p className="text-brown">No matching enrollment requests found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between border border-brown/20"
              >
                <div>
                  <h3 className="text-xl font-semibold text-brown mb-2">
                    {request.user?.name || "Unknown User"}
                  </h3>
                  <p className="text-gray-600 mb-2">{request.user?.email || "No email"}</p>
                  <p className="text-sm text-gray-500">
                    Requested on: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className="capitalize">{request.status || "pending"}</span>
                  </p>
                </div>
                
                <div className="flex gap-3 mt-4 md:mt-0">
                  {(request.status === 'pending' || !request.status) && (
                    <>
                      <button
                        onClick={() => handleRequest(request._id, "approved")}
                        disabled={loadingRequestId === request._id}
                        className="flex items-center gap-2 px-4 py-2 rounded-md"
                        style={{ 
                          backgroundColor: colorScheme.yellow,
                          color: colorScheme.brown,
                          opacity: loadingRequestId === request._id ? 0.6 : 1,
                          cursor: loadingRequestId === request._id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {loadingRequestId === request._id ? 'Approving...' : (
                          <>
                            <Check size={20} />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRequest(request._id, "rejected")}
                        disabled={loadingRequestId === request._id}
                        className="flex items-center gap-2 px-4 py-2 rounded-md"
                        style={{ 
                          border: `1px solid ${colorScheme.brown}`,
                          color: colorScheme.brown,
                          opacity: loadingRequestId === request._id ? 0.6 : 1,
                          cursor: loadingRequestId === request._id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {loadingRequestId === request._id ? 'Rejecting...' : (
                          <>
                            <X size={20} />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}