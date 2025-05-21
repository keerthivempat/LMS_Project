import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';
import ShiningButton from '../components/ShiningButton';
import CommentSection from '../components/CommentSection';
import CourseProgress from '../components/CourseProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import { saveAssignment, getAssignment } from '../utility/AssignmentStorage';
import AssignmentCard from '../components/AssignmentCard';
import HeadingWithEffect from '../components/HeadingWithEffects';
import CertificateDownload from '../components/CertificateDownload';
import GlitchText from '../components/GlitchText';
import SuccessAlert from '../components/SuccessAlert';
import FailAlert from '../components/FailAlert';

import { 
  initializeProgress, 
  markVideoComplete, 
  markAssignmentComplete, 
  markResourcesComplete, 
  markSectionComplete, 
  getCourseProgress 
} from '../utility/ProgressTracking';

const colorScheme = {
  cream: "#FFFCF4",
  brown: "#57321A",
  yellow: "#EFC815",
  white: "#FFFFFF",
  green: "#4CAF50"
};

export default function CourseDet() {
  const { id } = useParams();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrls, setVideoUrls] = useState({});
  const [activeTab, setActiveTab] = useState({});
  const [assignments, setAssignments] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState({});
  const [org, setOrgs] = useState({});
  const [courseProgress, setCourseProgress] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [sectionStates, setSectionStates] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch course progress and initialize if needed
  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoadingProgress(true);
      try {
        // Try to get existing progress
        const response = await getCourseProgress(id);
        // console.log('Fetched progress response:', response);
        if (response && response.data && response.data.data && response.data.data.progress) {
          setCourseProgress(response.data.data);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // If progress doesn't exist, initialize it
          // console.log('Initializing new progress for course:', id);
          const response = await initializeProgress(id);
          if (response && response.data && response.data.data) {
            setCourseProgress(response.data.data);
          }
        } else {
          console.error('Error fetching progress:', error);
        }
      } finally {
        setIsLoadingProgress(false);
      }
    };

    if (id) {
      fetchProgress();
    }
  }, [id]);

  // Refresh progress after any completion action
  const refreshProgress = async () => {
    try {
      const response = await getCourseProgress(id);
      // console.log('Refreshed progress response:', response);
      if (response && response.data && response.data.data) {
        setCourseProgress(response.data.data);
      }
    } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  };

  // Check if a video is completed
  const isVideoCompleted = (videoId) => {
    if (!courseProgress || !courseProgress.progress) return false;
    return courseProgress.progress.videosWatched?.includes(videoId) || false;
  };


const isAssignmentCompleted = (assignmentId) => {
  if (!courseProgress || !courseProgress.progress || !courseProgress.progress.assignmentsSubmitted) return false;
  // console.log("Checking assignment completion for ID:", assignmentId);
  // console.log("Assignments submitted:", courseProgress.progress.assignmentsSubmitted);
  return courseProgress.progress.assignmentsSubmitted.some(id => id === assignmentId || id.toString() === assignmentId);
};


  const isSectionCompleted = (sectionId) => {
    if (!courseProgress || !courseProgress.progress) return false;
    return courseProgress.progress.sectionsCompleted?.includes(sectionId) || false;
  };

  // Check if all assignments in a section are completed
  // Check if all assignments in a section are completed
const areAllAssignmentsCompleted = (section) => {
  if (!section || !section.assignments || section.assignments.length === 0) {
    return true;
  }
  
  // Add debugging information
  // console.log("Checking assignments for section:", section._id);
  // console.log("Assignments:", section.assignments);
  // console.log("Completed assignments:", courseProgress?.progress?.assignmentsSubmitted);
  
  return section.assignments.every(assignmentId => {
    const completed = isAssignmentCompleted(assignmentId);
    // console.log(`Assignment ${assignmentId} completed:`, completed);
    return completed;
  });
};

  // Handle video playback ended
  const handleVideoEnded = async (videoId, sectionId) => {
    try {
      // console.log('Marking video as complete:', { videoId, sectionId });
      const response = await markVideoComplete(id, sectionId, videoId);
      // console.log('Backend response for video completion:', response);
      await refreshProgress();
      setSuccessMessage('Video marked as completed successfully!');
    } catch (error) {
      console.error('Error marking video as complete:', error);
      setErrorMessage('Failed to mark video as complete. Please try again.');
    }
  };

  // Handle section completion
  const handleSectionComplete = async (sectionId) => {
    try {
      // console.log('Marking section as complete:', sectionId);
      setSectionStates(prev => ({ ...prev, [sectionId]: { loading: true } }));
      
      const response = await markSectionComplete(id, sectionId);
      // console.log('Backend response for section completion:', response);
      
      await refreshProgress();
      setSuccessMessage('Section marked as completed successfully!');
    } catch (error) {
      console.error('Error marking section as complete:', error);
      
      // Check if the error is due to incomplete assignments
      if (error.response && error.response.status === 400) {
        setErrorMessage('Cannot mark section as complete: ' + (error.response.data?.message || 'All assignments must be completed first.'));
      } else {
        setErrorMessage('Failed to mark section as complete. Please try again.');
      }
    } finally {
      setSectionStates(prev => ({ ...prev, [sectionId]: { loading: false } }));
    }
  };

  // Fetch assignment data
  const fetchAssignment = async (assignmentId, sectionId) => {
    if (assignments[assignmentId]) return; // Already fetched
    
    setLoadingAssignments(prev => ({ ...prev, [assignmentId]: true }));
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/assignment/${assignmentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch assignment`);
      }

      const data = await response.json();
      // console.log("assignment is ", data.data);
      setAssignments(prev => ({ ...prev, [assignmentId]: data.data }));
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoadingAssignments(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  // Handle tab change
  const handleTabChange = (sectionId, tab) => {
    setActiveTab(prev => ({ ...prev, [sectionId]: tab }));
    
    // If switching to assignment tab, fetch assignment data if needed
    if (tab === 'assignment') {
      const section = sections.find(s => s._id === sectionId);
      if (section && section.assignments && section.assignments.length > 0) {
        section.assignments.forEach(assignmentId => {
          fetchAssignment(assignmentId, sectionId);
        });
      }
    }
  };

  useEffect(() => {
    const fetchOrg = async () => {
      const courseId = id;
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/course/${courseId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          // console.log('data is ', data);
          setOrgs(data.data);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };

    const fetchSections = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/course/${id}/sections`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch sections`);
        }

        const data = await response.json();
        const sectionsData = data?.data || [];
        setSections(sectionsData);
        // console.log("Sections data:", sectionsData);

        // Initialize active tabs for all sections to 'content'
        const initialTabs = {};
        sectionsData.forEach(section => {
          initialTabs[section._id] = 'content';
        });
        setActiveTab(initialTabs);

        // Extract all videos from sections
        const allVideos = sectionsData.flatMap(section => section.videos) || [];
        
        // Create a map of video objects by their ID
        const videoMap = {};
        allVideos.forEach(video => {
          if (video && video._id) {
            videoMap[video._id] = video;
          }
        });
        
        setVideoUrls(videoMap);
        // console.log("Video Map:", videoMap);

      } catch (error) {
        console.error('Error fetching sections:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrg();
      fetchSections();
    }
  }, [id]);

  if (loading || isLoadingProgress) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;

  // Calculate progress stats
  const totalSections = sections.length;
  const completedSections = courseProgress?.progress?.sectionsCompleted?.length || 0;
  const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  return (
    <div className="min-h-screen p-8 md:pl-20" style={{ backgroundColor: colorScheme.cream }}>
      {/* Success and Error Alerts */}
      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}
      {errorMessage && (
        <FailAlert
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {org && <HeadingWithEffect>{org.name}</HeadingWithEffect>}

      {/* Course Progress Component */}
      <CourseProgress 
        progress={{
          progress: courseProgress?.progress,
          totalSections: totalSections,
          completedSections: completedSections,
          progressPercentage: progressPercentage
        }} 
        colorScheme={colorScheme} 
      />
      
      {/* Certificate Download Section - Only show when course is completed */}
      {progressPercentage === 100 && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colorScheme.brown }}>
            Course Certificate
          </h3>
          <div className="mb-4">
            <p className="text-gray-700">
              Download your course completion certificate by clicking the button below.
            </p>
          </div>
          <CertificateDownload courseId={id} />
        </div>
      )}

      {sections.length === 0 ? (
        <p className="text-center text-gray-700">No sections available.</p>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Disclosure key={section._id}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left rounded-lg hover:bg-yellow focus:outline-none focus-visible:ring focus-visible:ring-opacity-75" style={{ backgroundColor: colorScheme.white, color: colorScheme.brown }}>
                    <span>{section.name}</span>
                    <div className="flex items-center">
                      {isSectionCompleted(section._id) && (
                        <span className="mr-2 text-green-600">✓</span>
                      )}
                      <ChevronUpIcon className={`${open ? 'transform rotate-180' : ''} w-5 h-5`} style={{ color: colorScheme.brown }} />
                    </div>
                  </Disclosure.Button>
                  
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700">
                    {/* Section Description */}
                    <p>{section.description}</p>
                    
                    {/* Tabs */}
                    <div className="mt-6 border-b border-gray-200">
                      <div className="flex -mb-px">
                        <button
                          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                            activeTab[section._id] === 'content'
                              ? 'border-b-2 border-yellow-500 text-yellow-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => handleTabChange(section._id, 'content')}
                          style={activeTab[section._id] === 'content' ? { borderColor: colorScheme.yellow, color: colorScheme.brown } : {}}
                        >
                          Content
                        </button>
                        <button
                          className={`ml-8 py-2 px-4 font-medium text-sm focus:outline-none ${
                            activeTab[section._id] === 'assignment'
                              ? 'border-b-2 border-yellow-500 text-yellow-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => handleTabChange(section._id, 'assignment')}
                          style={activeTab[section._id] === 'assignment' ? { borderColor: colorScheme.yellow, color: colorScheme.brown } : {}}
                        >
                          Assignment
                          {section.assignments && section.assignments.length > 0 && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                              {section.assignments.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="mt-4">
                      {activeTab[section._id] === 'content' ? (
                        <>
                          {/* Display Videos */}
                          <div className="mt-4">
                            <h2 className="text-lg font-semibold" style={{ color: colorScheme.brown }}>Videos:</h2>
                            {section.videos && section.videos.length > 0 ? (
                              section.videos.map((video) => (
                                <div key={video._id} className="mb-10">
                                  {/* Display video title */}
                                  <h3 className="text-lg font-medium mb-3" style={{ color: colorScheme.brown }}>
                                    {video.title}
                                    {isVideoCompleted(video._id) && (
                                      <span className="ml-2 text-green-600">✓</span>
                                    )}
                                  </h3>
                                  
                                  {/* Video container with 16:9 aspect ratio */}
                                  <div className="relative w-full md:w-3/5 lg:w-1/2 mb-4">
                                    {video.url ? (
                                      <div className="relative" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
                                        <iframe
                                          src={video.url}
                                          title={video.title}
                                          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                                          frameBorder="0"
                                          allowFullScreen
                                          onEnded={() => handleVideoEnded(video._id, section._id)}
                                        />
                                      </div>
                                    ) : (
                                      <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                        <div className="absolute top-0 left-0 w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                          <p>Video URL not available</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p>No videos available</p>
                            )}
                          </div>

                          {/* Display Resources */}
                          <div className="mt-4">
                            <h2 className="text-lg font-semibold" style={{ color: colorScheme.brown }}>Resources:</h2>
                            {section.resources && section.resources.length > 0 ? (
                              <div>
                                {section.resources.map((resource) => (
                                  <div key={resource._id} className="mb-2">
                                    <a 
                                      href={resource.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 hover:text-blue-800 underline"
                                    >
                                      {resource.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p>No resources available</p>
                            )}
                          </div>

                          {/* Single Section Completion Button */}
                          <div className="mt-8 pt-4 border-t border-gray-200">
                            {isSectionCompleted(section._id) ? (
                              // Already completed message
                              <div className="w-full px-4 py-3 bg-green-50 text-center rounded-md">
                                <span className="text-green-600 font-medium">
                                  ✓ Section Completed
                                </span>
                              </div>
                            ) : (
                              // Section completion button - Only enabled when all assignments are completed
                              <button
                                onClick={() => handleSectionComplete(section._id)}
                                disabled={!areAllAssignmentsCompleted(section) || sectionStates[section._id]?.loading}
                                className={`w-full px-4 py-3 rounded-md text-white font-medium transition-colors ${
                                  areAllAssignmentsCompleted(section) 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {sectionStates[section._id]?.loading ? (
                                  'Processing...'
                                ) : (
                                  areAllAssignmentsCompleted(section) 
                                    ? 'Mark Section as Completed' 
                                    : 'Complete All Assignments to Mark Section'
                                )}
                              </button>
                            )}
                            
                            {/* Show warning message if assignments are not completed */}
                            {section.assignments && section.assignments.length > 0 && !areAllAssignmentsCompleted(section) && !isSectionCompleted(section._id) && (
                              <p className="mt-2 text-sm text-orange-600">
                                Complete all assignments in the assignment tab before marking this section as complete.
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        // Assignment Tab Content
                        <div className="px-4 py-5 sm:p-6">
                          {section.assignments && section.assignments.length > 0 ? (
                            section.assignments.map((assignmentId) => (
                              <AssignmentCard 
                              key={assignmentId}
                              assignmentId={assignmentId}
                              assignment={assignments[assignmentId] || {}}
                              colorScheme={colorScheme}
                              isCompleted={isAssignmentCompleted(assignmentId)}
                              onComplete={async () => {
                                await refreshProgress();
                              }}
                              />
                            ))
                          ) : (
                            <p>No assignments available</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Comments - shown in both tabs */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <CommentSection sectionId={section._id} />
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      )}
    </div>
  );
}
