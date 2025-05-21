import React, { useEffect, useState } from 'react';
import { saveAssignment, getAssignment } from '../utility/AssignmentStorage';
import LoadingSpinner from './LoadingSpinner';
import SuccessAlert from './SuccessAlert';
import ErrorMessage from './ErrorMessage';

const AssignmentCard = ({ assignmentId, assignment, colorScheme }) => {
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedFile, setSubmittedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if this assignment is already submitted
  useEffect(() => {
    const checkSubmission = async () => {
      try {
        const submission = await getAssignment(assignmentId);
        if (submission) {
          setIsSubmitted(true);
          setSubmittedFile(submission);
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
      }
    };
    
    checkSubmission();
  }, [assignmentId]);

  // Update the allowedFileTypes array with specific MIME types
  const allowedFileTypes = [
    'application/pdf',                                                           // PDF
    'application/msword',                                                       // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.oasis.opendocument.text',                               // ODT
    'text/plain'                                                            // TXT
  ];

  // Add a function to check file extension
  const isValidFileExtension = (filename) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.odt', '.txt'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.includes(ext);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  };
  
  const handleFile = async (file) => {
    // Check both MIME type and file extension
    if (!allowedFileTypes.includes(file.type) || !isValidFileExtension(file.name)) {
      setFileError('Invalid file type. Only PDF, Word documents, ODT, and text files are allowed.');
      return;
    }

    // Check file size (e.g., 20MB limit)
    // just change the number here to change the file max size
    // we took 20MB because moodle also uses 20MB as standard
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      setFileError('File size exceeds 20MB limit.');
      return;
    }

    setFileError('');
    setIsSubmitting(true);
    
    try {
      // Store the file in IndexedDB
      await saveAssignment(assignmentId, file);
      
      // Update UI state
      setIsSubmitted(true);
      setSubmittedFile({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        submittedAt: new Date().toISOString()
      });
      
      // Notify the user of success
      <SuccessAlert
        message="File submitted successfully!"
        onClose={() => setSubmittedFile(null)}
        duration={3000}
      />;
    } catch (error) {
      console.error('Error saving file:', error);
      setFileError('Error saving file: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };
  
  // Download the submitted file
  const downloadSubmission = () => {
    if (!submittedFile) {
      
      <ErrorMessage
        message="No file submitted yet."
        onClose={() => setSubmittedFile(null)}
        duration={3000}
      />;
      return;
    }
    
    // If file is stored on server (has a fileUrl)
    if (submittedFile.fileUrl) {
      // Open the file URL in a new tab
      window.open(submittedFile.fileUrl, '_blank');
      return;
    }
    
    // Legacy code for local files
    if (submittedFile.fileData) {
      const blob = new Blob([submittedFile.fileData], { type: submittedFile.fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = submittedFile.fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      <ErrorMessage
        message="File not available for download."
        onClose={() => setSubmittedFile(null)}
        duration={3000}
      />;
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2" style={{ color: colorScheme.brown }}>{assignment.title}</h3>
      <p className="text-gray-600 mb-3">{assignment.description}</p>
      
      {assignment.dueDate && (
        <p className="text-sm mb-4">
          <span className="font-medium">Due: </span>
          {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString()}
        </p>
      )}
      
      {/* Show submitted file info or upload option */}
      {isSubmitted && submittedFile ? (
        <div className="bg-green-50 p-3 rounded-md mb-4">
          <p className="text-green-700 font-medium mb-1">Assignment Submitted</p>
          <div className="flex items-center justify-between">
            <div>
              {/* <p className="text-sm">File: {submittedFile.fileName}</p> */}
              <p className="text-xs text-gray-500">
                Submitted on: {new Date(submittedFile.submittedAt).toLocaleString()}
              </p>
              {submittedFile.serverResponse?.review && (
                <div className="mt-2">
                  <p className="text-sm font-medium" style={{ color: colorScheme.brown }}>
                    Grade: {submittedFile.serverResponse.review.grade}
                  </p>
                  <p className="text-sm mt-1" style={{ color: colorScheme.brown }}>
                    Feedback: {submittedFile.serverResponse.review.comment}
                  </p>
                </div>
              )}
            </div>
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={downloadSubmission}
            >
              Download
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed p-6 rounded-md mb-4 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="mb-2">Drag and drop your file here, or</p>
          <label className="cursor-pointer inline-block px-4 py-2 rounded-md" style={{ backgroundColor: colorScheme.yellow, color: colorScheme.brown }}>
            <span>Choose File</span>
            <input 
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">Supported formats: PDF, Word (.doc, .docx)</p>
          {fileError && <p className="mt-2 text-red-500 text-sm">{fileError}</p>}
          {isSubmitting && <LoadingSpinner className="mt-2" />}
        </div>
      )}
      
      {/* Assignment links section */}
      {assignment.assignmentLinks && assignment.assignmentLinks.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2" style={{ color: colorScheme.brown }}>Resources:</h4>
          <ul className="list-disc pl-5">
            {assignment.assignmentLinks.map((link, index) => (
              <li key={index}>
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Resource {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard; 