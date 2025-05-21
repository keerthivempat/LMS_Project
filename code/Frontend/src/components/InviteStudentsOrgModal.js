import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const InviteStudentsOrgModal = ({ isOpen, onClose, organizationId, organizationName }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidEmail(value === '' || validateEmail(value));
  };

  const handleInvite = async () => {
    console.log("trying");
    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/invite-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, organizationId })
      });

      const data = await response.json();
      console.log("fetched",data);
      if (response.ok) {
        setMessage(data.message || 'Student invited successfully');
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.message || 'Error inviting student');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
      setMessageType('');
      setUploadResults(null);
      setShowResults(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
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
      formData.append('file', file);
      formData.append('organizationId', organizationId);

      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/invite-students-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
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
        setFile(null);
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-brown">Invite Students to {organizationName}</h2>
        
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Invite Individual Student</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="student@example.com"
                className={`w-full px-3 py-2 border rounded-md ${!isValidEmail ? 'border-red-500' : 'border-gray-300'}`}
              />
              {!isValidEmail && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
              )}
            </div>
            
            <button
              onClick={handleInvite}
              disabled={loading || !email || !isValidEmail}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                loading || !email || !isValidEmail
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
            
            {message && (
              <div className={`p-3 rounded-md ${
                messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-lg mb-2">Bulk Invite Students</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV or Excel file with email addresses of students to invite.
          </p>
          
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
              disabled={uploadLoading || !file}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                uploadLoading || !file
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploadLoading ? 'Uploading...' : 'Upload and Invite Students'}
            </button>
            
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
        </div>
      </div>
    </div>
  );
};

export default InviteStudentsOrgModal; 