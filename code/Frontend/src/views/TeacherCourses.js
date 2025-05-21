"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Users, BookOpen, Search, X, GraduationCap, Mail, Upload, Info, AlertCircle, UserPlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import HeadingWithEffect from "../components/HeadingWithEffects"
import GlitchText from "../components/GlitchText"
import LoadingSpinner from "../components/LoadingSpinner"
import StudentsCsvUpload from '../views/StudentsCsvUpload';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const coursesPerGridPage = 6
  const coursesPerListPage = 4
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCourses, setFilteredCourses] = useState([])
  // Add state for invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  const coursesPerPage = viewMode === "grid" ? coursesPerGridPage : coursesPerListPage

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND
        const accessToken = localStorage.getItem("accessToken")

        if (!accessToken) {
          throw new Error("Please login to view your courses")
        }

        const response = await fetch(`${BACKEND_URL}/api/teacher/courses`, {
          method: "GET",
          credentials: "include", // Important for cookies
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Using the correct token
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized error - redirect to login
            localStorage.removeItem("accessToken") // Clear invalid token
            window.location.href = "/auth"
            return
          }
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || "Failed to fetch courses")
        }

        const data = await response.json()
        console.log(data.data);
        setCourses(data.data || []) // Use empty array as fallback
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Filter courses when search term changes
  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCourses(filtered)
      setCurrentPage(0) // Reset to first page when search changes
    }
  }, [searchTerm, courses])

  // Function to open invite modal for a specific course
  const openInviteModal = (course) => {
    setSelectedCourse(course)
    setInviteModalOpen(true)
  }

  // Store gradients persistently per course ID
  const [gradients] = useState(() => {
    const generateRandomGradient = () => {
      const colors = [
        ["from-amber-400", "to-orange-500"],
        ["from-emerald-400", "to-teal-500"],
        ["from-sky-400", "to-indigo-500"],
        ["from-violet-400", "to-purple-500"],
        ["from-rose-400", "to-pink-500"],
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // Initialize gradients for courses without images
    return courses.reduce((acc, course) => {
      if (!course.organization?.logo) acc[course._id] = generateRandomGradient()
      return acc
    }, {})
  })

  const nextPage = () => {
    if (currentPage < Math.ceil(displayCourses.length / coursesPerPage) - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Get courses for the current page
  const displayCourses = searchTerm ? filteredCourses : courses
  const currentCourses = displayCourses.slice(currentPage * coursesPerPage, (currentPage + 1) * coursesPerPage)

  // Calculate total pages
  const totalPages = Math.ceil(displayCourses.length / coursesPerPage)

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <X size={48} className="mx-auto" />
          </div>
          <GlitchText>Failed To Fetch</GlitchText>
          <p className="mt-4 text-brown">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-cream flex flex-col p-4 md:p-16"
      >
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <GraduationCap size={64} className="text-yellow mb-4" />
          <h1 className="text-2xl font-bold text-brown mb-2">No Courses Yet</h1>
          <p className="text-brown/80 mb-6 max-w-md">You haven't created any courses yet. Create your first course to get started!</p>
          {/* <Link to="/create-course" className="px-6 py-3 bg-yellow text-white rounded-lg font-medium hover:bg-yellow/90 transition-colors">
            Create Your First Course
          </Link> */}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col p-4 md:p-16">
      {/* Header and search UI */}
      <HeadingWithEffect>Your Courses</HeadingWithEffect>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <p className="text-brown/80">Manage and track your teaching materials</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow/50 w-full"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                viewMode === "grid" ? "bg-yellow text-white" : "text-brown hover:bg-gray-100"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                viewMode === "list" ? "bg-yellow text-white" : "text-brown hover:bg-gray-100"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "grid" && (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {currentCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCourses.map((course, index) => {
                  const gradient = gradients[course._id] || ["from-gray-300", "to-gray-400"];
                  const lessonCount = course.lessons?.length || 0;

                  return (
                    <motion.div 
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.05 }
                      }}
                      className="h-full"
                    >
                      <Link to={`/TeacherCourses/${course._id}`} className="h-full block">
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-xl overflow-hidden shadow-sm h-full flex flex-col border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="relative h-40">
                            <div className={`h-full w-full bg-gradient-to-br ${gradient[0]} ${gradient[1]}`}>
                              {course.organization?.logo && (
                                <img 
                                  src={course.organization.logo} 
                                  alt={course.organization.name} 
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          <div className="p-5 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h2 className="text-xl font-bold text-brown line-clamp-1 hover:underline">{course.name}</h2>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault(); // Prevent navigation when clicking the button
                                  openInviteModal(course);
                                }}
                                className="p-1.5 bg-yellow/10 hover:bg-yellow/20 text-yellow rounded-lg transition-colors"
                                title="Invite students"
                              >
                                <UserPlus size={18} />
                              </button>
                            </div>
                            <p className="text-brown/70 text-sm mb-4 line-clamp-2">
                              {course.description || "No description available"}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                              <div className="flex items-center text-sm text-brown/80">
                                <Users size={16} className="text-yellow mr-1.5" />
                                <span>{course.students?.length || 0} students</span>
                              </div>
                              <div className="flex items-center text-sm text-brown/80">
                                <BookOpen size={16} className="text-yellow mr-1.5" />
                                <span>{lessonCount} lessons</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-brown">No courses match your search criteria.</p>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === "list" && (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {currentCourses.length > 0 ? (
              <div className="space-y-4">
                {currentCourses.map((course, index) => {
                  const gradient = gradients[course._id] || ["from-gray-300", "to-gray-400"];
                  const lessonCount = course.lessons?.length || 0;

                  return (
                    <motion.div 
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.05 }
                      }}
                    >
                  <Link to={`/TeacherCourses/${course._id}`}>
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex"
                      >
                        <div className={`w-24 sm:w-32 bg-gradient-to-br ${gradient[0]} ${gradient[1]}`}>
                          {course.organization?.logo && (
                            <img 
                              src={course.organization.logo} 
                              alt={course.organization.name} 
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start">
                              <h2 className="text-xl font-bold text-brown mb-2 hover:underline">{course.name}</h2>
                            <button 
                              onClick={() => openInviteModal(course)}
                              className="p-2 bg-yellow/10 hover:bg-yellow/20 text-yellow rounded-lg transition-colors flex items-center gap-1"
                              title="Invite students"
                            >
                              <UserPlus size={16} />
                              <span className="text-sm font-medium">Invite</span>
                            </button>
                          </div>
                          <p className="text-brown/70 text-sm mb-3 line-clamp-2">
                            {course.description || "No description available"}
                          </p>
                          
                          <div className="flex flex-wrap gap-6 mt-2">
                            <div className="flex items-center text-sm">
                              <Users size={16} className="text-yellow mr-1.5" />
                              <span className="text-brown/80 font-medium">{course.students?.length || 0} students</span>
                            </div>

                            <div className="flex items-center text-sm">
                              <BookOpen size={16} className="text-yellow mr-1.5" />
                              <span className="text-brown/80 font-medium">{lessonCount} lessons</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-brown">No courses match your search criteria.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`p-2 rounded-lg ${
                currentPage === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-brown hover:bg-yellow/10"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  currentPage === i
                    ? "bg-yellow text-white font-medium"
                    : "text-brown hover:bg-yellow/10"
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`p-2 rounded-lg ${
                currentPage === totalPages - 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-brown hover:bg-yellow/10"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Invite students modal */}
      {inviteModalOpen && selectedCourse && (
        <InviteStudentsModal 
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          courseId={selectedCourse._id}
          courseName={selectedCourse.name}
        />
      )}
    </div>
  );
}

const InviteStudentsModal = ({ isOpen, onClose, courseId, courseName }) => {
  const [activeTab, setActiveTab] = useState("email"); // "email" or "csv"
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emails.trim()) {
      setError("Please enter at least one email address");
      return;
    }
    
    // Simple validation for email format
    const emailList = emails.split(/[\s,;]+/).filter(email => email.trim());
    const invalidEmails = emailList.filter(email => !/^\S+@\S+\.\S+$/.test(email));
    
    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      const response = await fetch(`${BACKEND_URL}/api/teacher/invite-students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          courseId,
          emails: emailList
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send invitations");
      }
      
      setResults(data.data);
      setEmails("");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCsvSuccess = (data) => {
    setResults(data);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-brown">Invite Students to {courseName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`pb-3 px-4 text-sm font-medium ${
                activeTab === "email"
                  ? "border-b-2 border-yellow text-yellow"
                  : "text-brown/70 hover:text-brown"
              }`}
              onClick={() => setActiveTab("email")}
            >
              <div className="flex items-center">
                <Mail size={16} className="mr-2" />
                Email Addresses
              </div>
            </button>
            <button
              className={`pb-3 px-4 text-sm font-medium ${
                activeTab === "csv"
                  ? "border-b-2 border-yellow text-yellow"
                  : "text-brown/70 hover:text-brown"
              }`}
              onClick={() => setActiveTab("csv")}
            >
              <div className="flex items-center">
                <Upload size={16} className="mr-2" />
                CSV Upload
              </div>
            </button>
          </div>
          
          {/* Email tab content */}
          {activeTab === "email" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="emails" className="block text-sm font-medium text-brown mb-2">
                  Student Email Addresses
                </label>
                <div className="mb-2">
                  <textarea
                    id="emails"
                    rows={5}
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    placeholder="Enter email addresses, separated by commas, spaces, or new lines"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow/50"
                  />
                </div>
                <p className="text-sm text-brown/70 flex items-start">
                  <Info size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                  Enter multiple email addresses separated by commas, spaces, or new lines.
                </p>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start">
                  <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              {results && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Invitation Results</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between bg-white p-2 rounded">
                      <span className="text-brown/80">Total:</span>
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
                  
                  {results.alreadyInCourse?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-brown/80 mb-1">Already enrolled:</p>
                      <div className="text-sm text-brown/70 bg-white p-2 rounded">
                        {results.alreadyInCourse.map((student, i) => (
                          <div key={i} className="mb-1 last:mb-0">
                            {student.name} ({student.email})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.failedEmails?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-brown/80 mb-1">Failed to send:</p>
                      <div className="text-sm text-red-600 bg-white p-2 rounded">
                        {results.failedEmails.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-brown/70 font-medium hover:text-brown mr-3"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading || !emails.trim()}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                    loading || !emails.trim()
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={18} className="mr-2" />
                      Send Invitations
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {/* CSV tab content */}
          {activeTab === "csv" && (
            <StudentsCsvUpload 
              courseId={courseId} 
              onSuccess={handleCsvSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
