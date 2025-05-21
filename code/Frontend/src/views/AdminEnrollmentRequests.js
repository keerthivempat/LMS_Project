import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, 
  Check, 
  X,
  Search,
  Upload,
  UserMinus,
  Mail,
  Loader2,
  Download,
  Trash2
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import HeadingWithEffect from '../components/HeadingWithEffects';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminStudentsPage = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const fileInputRef = useRef(null);

  const colorScheme = {
    cream: "#FFFCF4",
    brown: "#57321A",
    yellow: "#EFC815",
    white: "#FFFFFF",
    red:"#FF0000",
  };

  useEffect(() => {
    fetchRequests();
    fetchStudents();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/enrollment-requests/${localStorage.getItem('organizationid')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setErrorMessage('Failed to fetch enrollment requests');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const orgId = localStorage.getItem('organizationid');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setErrorMessage('Failed to fetch students list');
    }
  };

  const handleApprove = async (requestId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/enrollment-request/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        setSuccessMessage('Request approved successfully!');
        fetchRequests();
        fetchStudents();
      }
    } catch (error) {
      setErrorMessage('Failed to approve request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/enrollment-request/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        setSuccessMessage('Request rejected successfully!');
        fetchRequests();
      }
    } catch (error) {
      setErrorMessage('Failed to reject request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const orgId = localStorage.getItem('organizationid');
      const studentId = studentToRemove;
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/organization/${orgId}/student/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccessMessage('Student removed successfully');
        fetchStudents();
      } else {
        setErrorMessage('Failed to remove student');
      }
    } catch (error) {
      setErrorMessage('Failed to remove student');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      setStudentToRemove(null);
    }
  };

  const openConfirmModal = (studentId) => {
    setStudentToRemove(studentId);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setStudentToRemove(null);
  };

  const handleInviteStudent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/invite-student`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail,organizationId:localStorage.getItem('organizationid') })
      });

      if (response.ok) {
        setSuccessMessage('Invitation sent successfully!');
        setInviteEmail('');
        setShowInviteModal(false);
      }
    } catch (error) {
      setErrorMessage('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setUploadFile(selectedFile);
      setMessage('');
      setMessageType('');
      setUploadResults(null);
      setShowResults(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setMessage('Please select a file first');
      setMessageType('error');
      return;
    }

    setUploadLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('organizationId', localStorage.getItem('organizationid'));

      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/invite-students-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResults(data.data);
        setShowResults(true);
        setMessageType('success');
        setMessage('File processed successfully');

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setUploadFile(null);
      } else {
        setMessage(data.message || 'Error processing file');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadTemplateCSV = () => {
    const csvData = [['email'], ['student1@example.com'], ['student2@example.com']];
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'student_invite_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplateExcel = () => {
    const data = [['email'], ['student1@example.com'], ['student2@example.com']];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_invite_template.xlsx');
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="ml-0 md:ml-[200px] p-6">
        {/* Success/Error Messages */}
        <HeadingWithEffect>Students</HeadingWithEffect>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {successMessage}
            <button onClick={() => setSuccessMessage('')} className="absolute top-0 right-0 px-4 py-3">×</button>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errorMessage}
            <button onClick={() => setErrorMessage('')} className="absolute top-0 right-0 px-4 py-3">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-brown/20 mb-6">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'requests' ? 'text-brown border-b-2 border-yellow' : 'text-brown/60'}`}
            onClick={() => setActiveTab('requests')}
          >
            Enrollment Requests
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'students' ? 'text-brown border-b-2 border-yellow' : 'text-brown/60'}`}
            onClick={() => setActiveTab('students')}
          >
            Students List
          </button>
        </div>

        {/* Content */}
        {activeTab === 'requests' ? (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm border border-brown/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-brown">{request.user.name}</h3>
                    <p className="text-brown/60">{request.user.email}</p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request._id)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow text-brown rounded-md hover:bg-yellow/90"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 border border-brown/20 text-brown rounded-md hover:bg-brown/5"
                      >
                        <X size={18} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-12 text-brown/60">
                No pending enrollment requests
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Students List Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-brown/20"
                />
                <Search className="absolute left-3 top-2.5 text-brown/40" size={20} />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow text-brown rounded-md hover:bg-yellow/90"
                >
                  <Mail size={18} />
                  Invite Student
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow text-brown rounded-md hover:bg-yellow/90"
                >
                  <Upload size={18} />
                  Bulk Invite
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-lg shadow-sm border border-brown/20 overflow-hidden">
              {filteredStudents.map(student => (
                <div key={student._id} className="flex items-center justify-between p-4 border-b border-brown/10 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center text-brown font-medium">
                      {student.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h3 className="font-medium text-brown">{student.name}</h3>
                      <p className="text-sm text-brown/60">{student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openConfirmModal(student._id)}
                    className="text-red"
                  >
                    <Trash2 size={20} classname="text-red-600"/>
                  </button>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-brown/60">
                  No students found
                </div>
              )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-medium text-brown mb-4">Confirm Removal</h2>
                  <p className="text-brown/60 mb-6">
                    Are you sure you want to remove this student from the organization?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={closeConfirmModal}
                      className="px-4 py-2 text-brown"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveStudent}
                      disabled={isLoading}
                      className="px-4 py-2 bg-yellow text-brown rounded-md hover:bg-yellow/90"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        'Remove'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-medium text-brown mb-4">Invite Student</h2>
              <form onSubmit={handleInviteStudent}>
                <input
                  type="email"
                  placeholder="Student's email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-brown/20 mb-4"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-brown"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-yellow text-brown rounded-md hover:bg-yellow/90"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      'Send Invitation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold text-brown mb-4">Bulk Invite Students</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV or Excel file with email addresses of students to invite.
              </p>

              {/* Template Download Buttons */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={downloadTemplateCSV}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Download CSV Template
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={downloadTemplateExcel}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Download Excel Template
                </button>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    ref={fileInputRef}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Accepted formats: .csv, .xlsx, .xls
                  </p>
                </div>

                <button
                  onClick={handleFileUpload}
                  disabled={uploadLoading || !uploadFile}
                  className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                    uploadLoading || !uploadFile
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload and Invite Students'}
                </button>

                {/* Upload Results */}
                {showResults && uploadResults && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Upload Results</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Total emails processed: {uploadResults.total}</li>
                      <li>New students added: {uploadResults.newUsers}</li>
                      <li>Existing users added: {uploadResults.added - uploadResults.newUsers}</li>
                      <li>Already in organization: {uploadResults.alreadyInOrg}</li>
                      {uploadResults.invalidRows.length > 0 && (
                        <li className="text-amber-600">
                          Invalid rows: {uploadResults.invalidRows.length}
                        </li>
                      )}
                      {uploadResults.failedEmails.length > 0 && (
                        <li className="text-red-600">
                          Failed emails: {uploadResults.failedEmails.length}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`mt-4 p-3 rounded-md ${
                    messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
            <Loader2 className="animate-spin text-brown" size={40} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentsPage;