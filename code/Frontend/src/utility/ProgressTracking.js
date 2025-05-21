import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND;

// Initialize progress for a course
export const initializeProgress = async (courseId) => {
  try {
    console.log('Initializing progress for course:', courseId);
    const response = await axios.post(
      `${BACKEND_URL}/api/progress/initialize/${courseId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    console.log('Progress initialized:', response.data);
    return response;
  } catch (error) {
    console.error('Error initializing progress:', error);
    throw error;
  }
};

// Mark a video as complete
export const markVideoComplete = async (courseId, sectionId, videoId) => {
  try {
    console.log('Marking video as complete:', { courseId, sectionId, videoId });
    const response = await axios.post(
      `${BACKEND_URL}/api/progress/video/${courseId}/${sectionId}/${videoId}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    console.log('Video marked as complete:', response.data);
    return response;
  } catch (error) {
    console.error('Error marking video as complete:', error);
    throw error;
  }
};

// Mark an assignment as complete
export const markAssignmentComplete = async (courseId, sectionId, assignmentId) => {
  try {
    console.log('Marking assignment as complete:', { courseId, sectionId, assignmentId });
    const response = await axios.post(
      `${BACKEND_URL}/api/progress/assignment/${courseId}/${sectionId}/${assignmentId}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    console.log('Assignment marked as complete:', response.data);
    return response;
  } catch (error) {
    console.error('Error marking assignment as complete:', error);
    throw error;
  }
};

// Mark resources as complete
export const markResourcesComplete = async (courseId, sectionId) => {
  try {
    console.log('Marking resources as complete:', { courseId, sectionId });
    const response = await axios.post(
      `${BACKEND_URL}/api/progress/resource/${courseId}/${sectionId}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    console.log('Resources marked as complete:', response.data);
    return response;
  } catch (error) {
    console.error('Error marking resources as complete:', error);
    throw error;
  }
};

// Mark a section as complete
export const markSectionComplete = async (courseId, sectionId) => {
  try {
    console.log('Marking section as complete:', { courseId, sectionId });
    const response = await axios.post(
      `${BACKEND_URL}/api/progress/section/${courseId}/${sectionId}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    console.log('Section marked as complete:', response.data);
    return response;
  } catch (error) {
    console.error('Error marking section as complete:', error);
    
    // Log more details about the error
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    
    throw error;
  }
};

// Get course progress
export const getCourseProgress = async (courseId) => {
  try {
    console.log('Fetching course progress:', courseId);
    const response = await axios.get(
      `${BACKEND_URL}/api/progress/course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    console.log('Raw response:', response);
    console.log('Response data:', response.data);
    console.log('Response data.data:', response.data.data);
    console.log('Response data.data.progress:', response.data.data.progress);
    return response;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
}; 