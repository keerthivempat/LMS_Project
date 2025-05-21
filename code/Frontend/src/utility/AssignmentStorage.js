// IndexedDB utility to store assignment submissions
const DB_NAME = 'assignments_db';
const STORE_NAME = 'submissions';
const DB_VERSION = 1;

// Initialize the database
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Could not open assignments database');
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('Assignments store created');
      }
    };
  });
};

// Save assignment submission
export const saveAssignment = async (assignmentId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated. Please log in.');
    }
    
    const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/assignment/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit assignment');
    }
    
    const data = await response.json();
    console.log(data.data);
    // Return a submission data object with similar structure to maintain compatibility
    return {
      id: `assignment-${assignmentId}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      submittedAt: new Date().toISOString(),
      // Add server response data
      serverResponse: data
    };
  } catch (error) {
    console.error('Error in saveAssignment:', error);
    throw error;
  }
};

// Get assignment submission status from server
export const getAssignment = async (assignmentId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated. Please log in.');
    }
    
    const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/assignment/${assignmentId}/my-submission`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch submission status');
    }
    
    const data = await response.json();
    
    // If no submission found
    if (!data.data) {
      return null;
    }
    console.log("fetched details are ",data.data);
    // Get the first file URL (assuming there's at least one)
    const fileUrl = data.data.files && data.data.files.length > 0 ? data.data.files[0] : null;
    if(data.data.review)
    console.log(data.data.review.comment);
    // Extract filename from URL
    const fileName = fileUrl ? fileUrl.split('/').pop() : 'Submitted file';
    
    // Return submission in a format compatible with the component
    return {
      id: `assignment-${assignmentId}`,
      fileName: fileName,
      fileType: 'application/pdf', // Default type
      submittedAt: data.data.submittedAt,
      fileUrl: fileUrl, // Add the URL for download
      // Store the full response
      serverResponse: data.data
    };
  } catch (error) {
    console.error('Error in getAssignment:', error);
    // Return null instead of throwing to prevent UI errors
    return null;
  }
};

// Delete stored assignment
export const deleteAssignment = async (assignmentId) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(`assignment-${assignmentId}`);
      
      request.onsuccess = () => {
        console.log(`Assignment ${assignmentId} deleted successfully`);
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error deleting assignment:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error in deleteAssignment:', error);
    throw error;
  }
};

// List all stored assignments
export const listAssignments = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error listing assignments:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error in listAssignments:', error);
    throw error;
  }
}; 