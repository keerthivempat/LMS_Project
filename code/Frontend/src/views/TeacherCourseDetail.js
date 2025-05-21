import { useState, useEffect } from "react";
import { useParams, useNavigate,Link} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';
import { 
  ArrowLeft, Book, Plus, FileText, Youtube, Upload, Edit, Trash2, 
  X, CheckSquare, AlertTriangle, File, Users, Calendar,BookOpen
} from "lucide-react";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import HeadingWithEffect from "../components/HeadingWithEffects";
import CommentSection from "../components/CommentSection";

const TeacherCourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentType, setContentType] = useState(""); // "video", "pdf", "resource"
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [contentFile, setContentFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [organizationStudents, setOrganizationStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add new state variables for assignment creation
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentFiles, setAssignmentFiles] = useState([]);
  const [selectedSectionForAssignment, setSelectedSectionForAssignment] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState({});
  
  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        
        // Fetch course details
        const courseResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/course/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setCourse(courseResponse.data.data);
        
        // Fetch sections for this course
        const sectionsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/course/${courseId}/sections`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // The sections now come with populated videos
        setSections(sectionsResponse.data.data);

        // Fetch details for all assignments
        sectionsResponse.data.data.forEach(section => {
          if (section.assignments && section.assignments.length > 0) {
            section.assignments.forEach(assignment => {
              fetchAssignmentDetails(assignment);
            });
          }
        });
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(err.response?.data?.message || "Failed to fetch course details");
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);
  
  // Add new section
  const handleAddSection = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/createSection`,
        {
          name: newSectionName,
          description: newSectionDescription,
          courseId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Add the new section to the state
      setSections([...sections, response.data.data]);
      
      // Reset form and close modal
      setNewSectionName("");
      setNewSectionDescription("");
      setShowAddSectionModal(false);
      
      // Show success message
      setSuccessMessage("Section added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error adding section:", err);
      setErrorMessage(err.response?.data?.message || "Failed to add section");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setModalLoading(false);
    }
  };
  
  // Delete section
  const handleDeleteSection = async (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        const token = localStorage.getItem("accessToken");
        
        await axios.delete(
          `${process.env.REACT_APP_BACKEND}/api/deleteSection/${sectionId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Remove the deleted section from state
        setSections(sections.filter(section => section._id !== sectionId));
        
        // Show success message
        setSuccessMessage("Section deleted successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting section:", err);
        setErrorMessage(err.response?.data?.message || "Failed to delete section");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };
  
  // Add content to section
  const handleAddContent = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      
      if (contentType === "video") {
        // Add video using the video endpoint
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/video`,
          {
            title: contentTitle,
            url: contentUrl,
            sectionId: selectedSection._id
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Update the section in state with the new video
        const updatedSections = sections.map(section => {
          if (section._id === selectedSection._id) {
            return {
              ...section,
              videos: [...(section.videos || []), response.data.data]
            };
          }
          return section;
        });
        
        setSections(updatedSections);
        setSuccessMessage("Video added successfully");
      } else if (contentType === "pdf") {
        console.log("trying for you");
        // For PDF files
        const formData = new FormData();
        formData.append("name", contentTitle);
        formData.append("file", contentFile);
        
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND}/api/section/${selectedSection._id}/pdf`,
            formData,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              }
            }
          );
          
          // Update the section in state with the new resource
          const updatedSections = sections.map(section => {
            if (section._id === selectedSection._id) {
              return {
                ...section,
                resources: [...(section.resources || []), response.data.data]
              };
            }
            return section;
          });
          
          setSections(updatedSections);
          setSuccessMessage("PDF uploaded successfully");
        } catch (error) {
          console.error("Error uploading file:", error);
          setErrorMessage("Failed to upload file");
        }
      } else if (contentType === "resource") {
        // For link resources
        const formData = new FormData();
        formData.append("name", contentTitle);
        formData.append("link", contentUrl);
        
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND}/api/section/${selectedSection._id}/resources`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        
        // Update the section in state with the new resource
        const updatedSections = sections.map(section => {
          if (section._id === selectedSection._id) {
            return {
              ...section,
              resources: [...(section.resources || []), response.data.data]
            };
          }
          return section;
        });
        
        setSections(updatedSections);
        setSuccessMessage("Resource added successfully");
      }
      
      // Reset form and close modal
      setContentTitle("");
      setContentUrl("");
      setContentFile(null);
      setContentType("");
      setShowContentModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error adding content:", err);
      setErrorMessage(err.response?.data?.message || "Failed to add content");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setModalLoading(false);
    }
  };
  
  // Fetch organization students for inviting
  const fetchOrganizationStudents = async () => {
    if (!course || !course.organization) return;
    
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/teacher/organization-students/${course.organization}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setOrganizationStudents(response.data.data);
    } catch (err) {
      console.error("Error fetching organization students:", err);
      setErrorMessage(err.response?.data?.message || "Failed to fetch students");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  // Send invites to selected students
  const handleInviteStudents = async (e) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      setErrorMessage("Please select at least one student to invite");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    setModalLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // Get emails of selected students
      const selectedStudentEmails = organizationStudents
        .filter(student => selectedStudents.includes(student._id))
        .map(student => student.email);
      
      // Send invites
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/teacher/invite-students`,
        {
          courseId,
          emails: selectedStudentEmails
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("data is ",response.data.data);
      const { alreadyInCourse = [] } = response.data.data;
      // Reset and close modal
      setSelectedStudents([]);
      setShowInviteModal(false);
      let message = "Invitations sent successfully";
      if (alreadyInCourse.length > 0) {
        message = '';
        message += `students already in course:\n`;
        message += alreadyInCourse.map(
          (s) => `(${s.email})`
        ).join("\n");
      }
      // Show success message
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err) {
      console.error("Error inviting students:", err);
      setErrorMessage(err.response?.data?.message || "Failed to send invitations");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setModalLoading(false);
    }
  };
  
  // Filter students based on search query
  const filteredStudents = organizationStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDeleteContent = async (sectionId, contentId, contentType) => {
    if (!window.confirm(`Are you sure you want to delete this ${contentType}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/section/${sectionId}/delete-content`,
        { contentId, contentType },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSections(sections.map(section => {
        if (section._id === sectionId) {
          switch (contentType) {
            case 'video':
              return {
                ...section,
                videos: section.videos.filter(video => video._id !== contentId)
              };
            case 'resource':
              return {
                ...section,
                resources: section.resources.filter(resource => resource._id !== contentId)
              };
            case 'assignment':
              return {
                ...section,
                assignments: section.assignments.filter(assignment => assignment._id !== contentId)
              };
            default:
              return section;
          }
        }
        return section;
      }));

      setSuccessMessage(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} deleted successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting content:", err);
      setErrorMessage(err.response?.data?.message || "Failed to delete content");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };
  
  // Add new function to handle assignment creation
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedSectionForAssignment) return;

    setModalLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      
      formData.append('title', assignmentTitle);
      formData.append('description', assignmentDescription);
      formData.append('dueDate', assignmentDueDate);
      formData.append('sectionId', selectedSectionForAssignment._id);
      
      // Append each file to the FormData
      assignmentFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/section/${selectedSectionForAssignment._id}/assignment`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update the sections state to include the new assignment
      setSections(sections.map(section => {
        if (section._id === selectedSectionForAssignment._id) {
          return {
            ...section,
            assignments: [...(section.assignments || []), response.data.data]
          };
        }
        return section;
      }));

      // Reset form and close modal
      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
      setAssignmentFiles([]);
      setShowAssignmentModal(false);
      setSelectedSectionForAssignment(null);

      // Show success message
      setSuccessMessage("Assignment created successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      window.location.href = `/TeacherCourses/${courseId}`;
    } catch (err) {
      console.error("Error creating assignment:", err);
      setErrorMessage(err.response?.data?.message || "Failed to create assignment");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setModalLoading(false);
    }
  };

  // Add function to handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAssignmentFiles(files);
  };

  // Add function to remove a file
  const handleRemoveFile = (index) => {
    setAssignmentFiles(assignmentFiles.filter((_, i) => i !== index));
  };
  
  // Add this new function
  const fetchAssignmentDetails = async (assignmentId) => {
    try {
      const token = localStorage.getItem("accessToken");
      // console.log("assignmrnt ius ",assignmentId);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/assignment/${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAssignmentDetails(prev => ({
        ...prev,
        [assignmentId.toString()]: response.data.data
      }));
      // console.log(response.data.data);
    } catch (err) {
      console.error("Error fetching assignment details:", err);
      setErrorMessage(err.response?.data?.message || "Failed to fetch assignment details");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };
  
  const handleViewSubmissions = (assignmentId) => {
    navigate(`/assignment/${assignmentId}/submissions`);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-brown mb-3">Error</h2>
          <p className="text-brown/80 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-yellow text-brown rounded-lg shadow hover:bg-brown hover:text-yellow transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-cream p-4 md:p-16">
      {/* Success and Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md z-50"
          >
            <div className="flex items-center">
              <CheckSquare size={20} className="mr-2" />
              <p>{successMessage}</p>
            </div>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md z-50"
          >
            <div className="flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              <p>{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/TeacherCourses')}
        className="mb-6 flex items-center gap-2 px-4 p-3 text-brown rounded-md hover:bg-brown/5"
      >
        <ArrowLeft size={20} className="mr-1" />
        <span>Back to My Courses</span>
      </button>
      
      {/* Course Title */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <HeadingWithEffect className="text-2xl md:text-3xl font-bold text-brown mb-4">
          {course?.name}
        </HeadingWithEffect>
        <p className="text-brown/80 mb-4">{course?.description}</p>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center bg-yellow/20 px-3 py-1 rounded-full">
            <Book size={16} className="text-yellow mr-2" />
            <span className="text-sm font-medium text-brown">
              {sections?.length || 0} Sections
            </span>
          </div>
          
          <div className="flex items-center bg-yellow/20 px-3 py-1 rounded-full">
            <Users size={16} className="text-yellow mr-2" />
            <span className="text-sm font-medium text-brown">
              {course?.students?.length || 0} Students
            </span>
          </div>
        </div>
      </div>
      
      {/* Sections and Add Section Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-brown">Course Sections</h2>
        <div className="flex space-x-3">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      setShowInviteModal(true);
      fetchOrganizationStudents();
    }}
    className="px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center"
  >
    <Users size={20} className="mr-2" />
    Invite Students
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setShowAddSectionModal(true)}
    className="px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center"
  >
    <Plus size={20} className="mr-2" />
    Add Section
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center"
    onClick={() => {
      window.location.href = `/teacher/course-requests/${course._id}`;
    }}
  >
    <BookOpen size={20} className="mr-2" />
    View Requests
  </motion.button>
</div>

      </div>
      
      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <div className="w-16 h-16 bg-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book size={24} className="text-yellow" />
          </div>
          <h3 className="text-lg font-semibold text-brown mb-2">No Sections Yet</h3>
          <p className="text-brown/70 mb-4">
            Start building your course by adding sections and content.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddSectionModal(true)}
            className="px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 inline-flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Your First Section
          </motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <Disclosure key={section._id}>
              {({ open }) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md"
                >
                  <Disclosure.Button className="flex justify-between items-center w-full p-6 text-left focus:outline-none">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brown">{section.name}</h3>
                      {section.description && (
                        <p className="text-brown/70 text-sm mt-1">{section.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section._id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronUpIcon
                        className={`${
                          open ? 'transform rotate-180' : ''
                        } w-5 h-5 text-brown transition-transform duration-200`}
                      />
                    </div>
                  </Disclosure.Button>
                  
                  <Disclosure.Panel className="px-6 pb-6">
                    {/* Section Content */}
                    <div className="mt-4 space-y-4">
                      {/* Videos */}
                      {section.videos && section.videos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-brown mb-2">Videos</h4>
                          <div className="space-y-2">
                            {section.videos.map((video) => (
                              <div
                                key={video._id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <Youtube size={18} className="text-red-500 mr-3" />
                                  <span className="text-brown">{video.title}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-yellow hover:text-brown text-sm font-medium"
                                  >
                                    View
                                  </a>
                                  <button
                                    onClick={() => handleDeleteContent(section._id, video._id, 'video')}
                                    className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                    title="Delete Video"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Resources */}
                      {section.resources && section.resources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-brown mb-2">Resources</h4>
                          <div className="space-y-2">
                            {section.resources.map((resource) => (
                              <div
                                key={resource._id || resource.name}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <File size={18} className="text-blue-500 mr-3" />
                                  <span className="text-brown">{resource.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={resource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-yellow hover:text-brown text-sm font-medium"
                                  >
                                    View
                                  </a>
                                  <button
                                    onClick={() => handleDeleteContent(section._id, resource._id, 'resource')}
                                    className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                    title="Delete Resource"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Assignments */}
                      {section.assignments && section.assignments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-brown mb-2">Assignments</h4>
                          <div className="space-y-2">
                            {section.assignments.map((assignment) => {
                              const details = assignmentDetails[assignment];
                              // console.log("details are", assignment);
                              return (
                                <div
                                  key={assignment}
                                  className="p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h5 className="font-medium text-brown">
                                        {details?.title || "Loading..."}
                                      </h5>
                                      <p className="text-sm text-brown/60">
                                        {details?.description || "Loading description..."}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleViewSubmissions(assignment)}
                                        className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 flex items-center"
                                        title="View Submissions"
                                      >
                                        <FileText size={16} className="mr-1" />
                                        <span className="text-sm">View Submissions</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(section._id, assignment, 'assignment')}
                                        className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                        title="Delete Assignment"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {details && (
                                    <>
                                      <div className="text-sm text-brown/60 mb-2">
                                        <div className="flex items-center gap-2">
                                          <Calendar size={14} />
                                          <span>Due: {new Date(details.dueDate).toLocaleString()}</span>
                                        </div>
                                      </div>

                                      {/* Assignment Files */}
                                      {details.assignmentFiles && details.assignmentFiles.length > 0 && (
                                        <div className="mt-2">
                                          <h6 className="text-xs font-medium text-brown/60 mb-1">Files:</h6>
                                          <div className="space-y-1">
                                            {details.assignmentFiles.map((file, index) => (
                                              <a
                                                key={index}
                                                href={file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
                                              >
                                                <File size={14} />
                                                <span className="truncate max-w-[200px]">
                                                  {file.split('/').pop()}
                                                </span>
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Add Content Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedSection(section);
                          setShowContentModal(true);
                        }}
                        className="w-full p-3 border-2 border-dashed border-yellow/50 rounded-lg text-center text-brown/60 hover:bg-yellow/10 hover:border-yellow transition-all duration-300 flex items-center justify-center"
                      >
                        <Plus size={18} className="mr-2" />
                        Add Content
                      </motion.button>

                      {/* Comments Section */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <CommentSection sectionId={section._id} />
                      </div>

                      {/* Add Assignment Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedSectionForAssignment(section);
                          setShowAssignmentModal(true);
                        }}
                        className="w-full p-3 border-2 border-dashed border-yellow/50 rounded-lg text-center text-brown/60 hover:bg-yellow/10 hover:border-yellow transition-all duration-300 flex items-center justify-center"
                      >
                        <Plus size={18} className="mr-2" />
                        Add Assignment
                      </motion.button>
                    </div>
                  </Disclosure.Panel>
                </motion.div>
              )}
            </Disclosure>
          ))}
        </div>
      )}
      
      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-brown">Add New Section</h3>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="p-1 text-brown/50 hover:text-brown"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSection}>
              <div className="mb-4">
                <label htmlFor="sectionName" className="block text-sm font-medium text-brown mb-1">
                  Section Name*
                </label>
                <input
                  id="sectionName"
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                  placeholder="Enter section name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="sectionDescription" className="block text-sm font-medium text-brown mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="sectionDescription"
                  value={newSectionDescription}
                  onChange={(e) => setNewSectionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                  placeholder="Enter section description"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 border border-gray-300 text-brown rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !newSectionName.trim()}
                  className={`px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center ${
                    modalLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {modalLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brown/20 border-t-brown/80 rounded-full animate-spin mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    "Add Section"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Add Content Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-brown">Add Content to Section</h3>
              <button
                onClick={() => {
                  setShowContentModal(false);
                  setContentType("");
                  setContentTitle("");
                  setContentUrl("");
                  setContentFile(null);
                }}
                className="p-1 text-brown/50 hover:text-brown"
              >
                <X size={24} />
              </button>
            </div>
            
            {!contentType ? (
              <div className="space-y-3 mb-4">
                <button
                  onClick={() => setContentType("video")}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-yellow/10 hover:border-yellow transition-all duration-300 flex items-center text-left"
                >
                  <Youtube size={24} className="text-red-500 mr-3" />
                  <div>
                    <span className="block font-medium text-brown">YouTube Video</span>
                    <span className="text-sm text-brown/60">Add a video from YouTube</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setContentType("pdf")}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-yellow/10 hover:border-yellow transition-all duration-300 flex items-center text-left"
                >
                  <FileText size={24} className="text-blue-500 mr-3" />
                  <div>
                    <span className="block font-medium text-brown">PDF Document</span>
                    <span className="text-sm text-brown/60">Upload a PDF document</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setContentType("resource")}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-yellow/10 hover:border-yellow transition-all duration-300 flex items-center text-left"
                >
                  <Upload size={24} className="text-green-500 mr-3" />
                  <div>
                    <span className="block font-medium text-brown">Other Links</span>
                    <span className="text-sm text-brown/60">Add an external link resource</span>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddContent}>
                <div className="mb-4">
                  <label htmlFor="contentTitle" className="block text-sm font-medium text-brown mb-1">
                    Title*
                  </label>
                  <input
                    id="contentTitle"
                    type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                    placeholder={`Enter ${contentType === "video" ? "video" : "resource"} title`}
                    required
                  />
                </div>
                
                {contentType === "video" && (
                  <div className="mb-6">
                    <label htmlFor="videoUrl" className="block text-sm font-medium text-brown mb-1">
                      YouTube URL*
                    </label>
                    <input
                      id="videoUrl"
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>
                )}
                
                {contentType === "pdf" && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-brown mb-1">
                      Upload PDF
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-yellow hover:text-yellow focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf"
                              onChange={(e) => setContentFile(e.target.files[0])}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      </div>
                    </div>
                    {contentFile && (
                      <p className="mt-2 text-sm text-green-600">
                        File selected: {contentFile.name}
                      </p>
                    )}
                  </div>
                )}
                
                {contentType === "resource" && (
                  <div className="mb-6">
                    <label htmlFor="resourceUrl" className="block text-sm font-medium text-brown mb-1">
                      Resource URL*
                    </label>
                    <input
                      id="resourceUrl"
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                      placeholder="https://example.com/resource"
                      required
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContentModal(false);
                      setContentType("");
                      setContentTitle("");
                      setContentUrl("");
                      setContentFile(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-brown rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      modalLoading ||
                      !contentTitle.trim() ||
                      (contentType === "video" && !contentUrl.trim()) ||
                      (contentType === "pdf" && !contentFile) ||
                      (contentType === "resource" && !contentUrl)
                    }
                    className={`px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center ${
                      modalLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {modalLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-brown/20 border-t-brown/80 rounded-full animate-spin mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      "Add Content"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
      
      {/* Invite Students Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-brown">Invite Students</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-brown/50 hover:text-brown"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Search input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
              />
            </div>
            
            {/* Students list */}
            <div className="mb-6 max-h-96 overflow-y-auto">
              {loadingStudents ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-6 h-6 border-2 border-yellow/20 border-t-yellow rounded-full animate-spin"></div>
                  <span className="ml-2 text-brown">Loading students...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-6 text-brown/60">
                  {organizationStudents.length === 0 ? 
                    "No students found in this organization." : 
                    "No students match your search criteria."}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedStudents.includes(student._id) ? 
                        "bg-yellow/10 border border-yellow" : 
                        "bg-gray-50 border border-transparent hover:border-yellow/30"
                      }`}
                      onClick={() => toggleStudentSelection(student._id)}
                    >
                      <div>
                        <div className="font-medium text-brown">{student.name}</div>
                        <div className="text-sm text-brown/70">{student.email}</div>
                      </div>
                      <div className={`w-5 h-5 border rounded flex items-center justify-center ${
                        selectedStudents.includes(student._id) ?
                        "bg-yellow border-yellow" :
                        "border-gray-300"
                      }`}>
                        {selectedStudents.includes(student._id) && (
                          <CheckSquare size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <div className="mr-auto text-sm text-brown/70">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-gray-300 text-brown rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteStudents}
                disabled={modalLoading || selectedStudents.length === 0}
                className={`px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center ${
                  modalLoading || selectedStudents.length === 0 ? 
                  "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {modalLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brown/20 border-t-brown/80 rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send Invites"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-brown">Create New Assignment</h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedSectionForAssignment(null);
                }}
                className="p-1 text-brown/50 hover:text-brown"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="mb-4">
                <label htmlFor="assignmentTitle" className="block text-sm font-medium text-brown mb-1">
                  Title*
                </label>
                <input
                  id="assignmentTitle"
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="assignmentDescription" className="block text-sm font-medium text-brown mb-1">
                  Description*
                </label>
                <textarea
                  id="assignmentDescription"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                  placeholder="Enter assignment description"
                  rows={4}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="assignmentDueDate" className="block text-sm font-medium text-brown mb-1">
                  Due Date*
                </label>
                <input
                  id="assignmentDueDate"
                  type="text"
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow"
                  placeholder="YYYY-MM-DD HH:MM"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-brown mb-1">
                  Assignment Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="assignment-files"
                  />
                  <label
                    htmlFor="assignment-files"
                    className="cursor-pointer flex flex-col items-center justify-center text-center"
                  >
                    <Upload size={24} className="text-yellow mb-2" />
                    <span className="text-sm text-brown/60">
                      Click to upload files or drag and drop
                    </span>
                    <span className="text-xs text-brown/40 mt-1">
                      PDF, DOC, DOCX, ZIP (up to 5 files)
                    </span>
                  </label>
                </div>
                
                {/* Display selected files */}
                {assignmentFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {assignmentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <File size={16} className="text-brown/60 mr-2" />
                          <span className="text-sm text-brown/80 truncate max-w-[200px]">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 text-red-500 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedSectionForAssignment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-brown rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className={`px-4 py-2 bg-yellow text-brown rounded-lg shadow-sm hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center ${
                    modalLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {modalLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brown/20 border-t-brown/80 rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    "Create Assignment"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourseDetail;