import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Upload, X, FileText, Send, AlertCircle, Check } from "lucide-react";

const StudentFileUpload = ({ courseId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showTemplateInfo, setShowTemplateInfo] = useState(false);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND;
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();
      
      if (
        fileType === "text/csv" || 
        fileName.endsWith(".csv") || 
        fileType === "application/vnd.ms-excel" ||
        fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls")
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a CSV or Excel file");
        setFile(null);
      }
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileType = droppedFile.type;
      const fileName = droppedFile.name.toLowerCase();
      
      if (
        fileType === "text/csv" || 
        fileName.endsWith(".csv") || 
        fileType === "application/vnd.ms-excel" ||
        fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls")
      ) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a CSV or Excel file");
        setFile(null);
      }
    }
  };
  
  const downloadTemplate = (format) => {
    if (format === 'csv') {
      // Create CSV content
      const csvContent = "email\njohn.doe@example.com\njane.smith@example.com";
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", "student_invitation_template.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (format === 'xlsx') {
      // For Excel template, we'll use a static URL to a pre-created Excel file
      // In a real implementation, you might generate this on the server or use a library like xlsx
      // This is a simplified example
      window.open(`${BACKEND_URL}/templates/student_invitation_template.xlsx`, '_blank');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      const response = await fetch(`${BACKEND_URL}/api/teacher/invite-students-file`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload file");
      }
      
      setResults(data.data);
      setFile(null);
      if (onSuccess) onSuccess(data.data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h3 className="text-lg font-bold text-brown mb-4">Invite Students via File Upload</h3>
      
      <div className="mb-6">
        <button 
          onClick={() => setShowTemplateInfo(!showTemplateInfo)}
          className="text-sm flex items-center text-yellow hover:text-yellow-600 font-medium"
        >
          <FileText size={16} className="mr-1.5" /> 
          {showTemplateInfo ? "Hide template info" : "Show template info"}
        </button>
        
        {showTemplateInfo && (
          <div className="mt-3 p-4 bg-cream/50 rounded-lg border border-yellow/20">
            <p className="text-sm text-brown mb-2">
              Please use the following format for inviting students:
            </p>
            <pre className="text-xs bg-gray-100 p-2 rounded mb-3 text-brown/80">
              email<br/>
              student1@example.com<br/>
              student2@example.com
            </pre>
            <div className="flex gap-3">
              <button 
                onClick={() => downloadTemplate('csv')}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FileText size={14} className="mr-1" /> Download CSV template
              </button>
              <button 
                onClick={() => downloadTemplate('xlsx')}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FileText size={14} className="mr-1" /> Download Excel template
              </button>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-yellow/70"
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-2 rounded-full mb-2">
                <FileText size={24} className="text-green-600" />
              </div>
              <p className="font-medium text-green-700">{file.name}</p>
              <p className="text-sm text-green-600">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="mt-2 text-red-500 text-sm flex items-center"
              >
                <X size={14} className="mr-1" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-yellow/10 p-3 rounded-full mb-3">
                <Upload size={24} className="text-yellow" />
              </div>
              <p className="text-brown font-medium">
                Drag & drop your CSV or Excel file here
              </p>
              <p className="text-brown/60 text-sm mb-4">or</p>
              <label className="bg-yellow text-white py-2 px-4 rounded-lg text-sm font-medium cursor-pointer hover:bg-yellow/90 transition-colors">
                Browse Files
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start">
            <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {results && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <Check size={18} className="text-green-600 mr-2" />
              <h4 className="font-medium text-green-800">Upload Results</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between bg-white p-2 rounded">
                <span className="text-brown/80">Total emails:</span>
                <span className="font-medium text-brown">{results.total}</span>
              </div>
              <div className="flex justify-between bg-white p-2 rounded">
                <span className="text-brown/80">Sent:</span>
                <span className="font-medium text-green-600">{results.sent}</span>
              </div>
              <div className="flex justify-between bg-white p-2 rounded">
                <span className="text-brown/80">Already in course:</span>
                <span className="font-medium text-yellow">{results.skipped}</span>
              </div>
              <div className="flex justify-between bg-white p-2 rounded">
                <span className="text-brown/80">Failed:</span>
                <span className="font-medium text-red-500">{results.failed}</span>
              </div>
            </div>
            
            {results.invalidRows && results.invalidRows.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-brown/80 mb-1">Invalid entries:</p>
                <div className="text-sm text-red-600 bg-white p-2 rounded max-h-24 overflow-y-auto">
                  {results.invalidRows.length} rows had missing or invalid email addresses
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={!file || loading}
            className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center ${
              !file || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-yellow text-white hover:bg-yellow/90"
            }`}
          >
            {loading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Upload and Invite Students
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentFileUpload;