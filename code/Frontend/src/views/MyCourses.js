"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Users, BookOpen, Search, X, GraduationCap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import HeadingWithEffect from "../components/HeadingWithEffects"
import GlitchText from "../components/GlitchText"
import LoadingSpinner from "../components/LoadingSpinner"
import { getCourseProgress } from '../utility/ProgressTracking';

const colorScheme = {
  cream: "#FFFCF4",
  brown: "#57321A",
  yellow: "#EFC815",
  white: "#FFFFFF",
};

export default function MyCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const coursesPerGridPage = 6
  const coursesPerListPage = 4
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCourses, setFilteredCourses] = useState([])
  const [courseProgress, setCourseProgress] = useState({});

  const coursesPerPage = viewMode === "grid" ? coursesPerGridPage : coursesPerListPage

  // Fetch courses and their progress from backend
  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND;
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          throw new Error("Please login to view your courses");
        }

        const response = await fetch(`${BACKEND_URL}/api/my-courses`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            window.location.href = "/auth";
            return;
          }
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to fetch courses");
        }

        const data = await response.json();
        const coursesData = data.data || [];
        setCourses(coursesData);

        // Fetch progress for each course
        const progressPromises = coursesData.map(async (course) => {
          try {
            const progress = await getCourseProgress(course._id);
            return { courseId: course._id, progress: progress.data };
          } catch (error) {
            console.error(`Error fetching progress for course ${course._id}:`, error);
            return { courseId: course._id, progress: null };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap = progressResults.reduce((acc, { courseId, progress }) => {
          acc[courseId] = progress;
          return acc;
        }, {});

        setCourseProgress(progressMap);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndProgress();
  }, []);

  // Filter courses when search term changes
  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.teachers.some((teacher) => teacher.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredCourses(filtered)
      setCurrentPage(0) // Reset to first page when search changes
    }
  }, [searchTerm, courses])

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

  // Update the grid view to show progress
  const renderGridCourse = (course) => {
    const gradient = gradients[course._id] || ["from-gray-300", "to-gray-400"];
    const teacherNames = course.teachers.map((t) => t.name).join(", ");
    const progress = courseProgress[course._id];
    const progressPercentage = progress?.progressPercentage || 0;

    return (
      <motion.div key={course._id} className="h-full">
        <Link to={`/MyCourses/${course._id}`} className="h-full block">
          <motion.div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg border-b-4 border-yellow transition-all duration-300 h-full flex flex-col">
            <div className="h-48 overflow-hidden relative">
              {course.organization?.logo ? (
                <img
                  src={course.organization.logo || "/placeholder.svg"}
                  alt={course.organization.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-r ${gradient[0]} ${gradient[1]}`}
                >
                  {course.organization?.name || course.name.substring(0, 2)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-brown mb-2 line-clamp-1">{course.name}</h2>
              <p className="text-brown/70 mb-4 text-sm leading-relaxed line-clamp-2 flex-grow">
                {course.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-brown/80">
                  <Users size={16} className="text-yellow mr-1.5" />
                  <span className="line-clamp-1 font-medium">{teacherNames}</span>
                </div>
                <div className="flex items-center text-sm text-brown/80">
                  <BookOpen size={16} className="text-yellow mr-1.5" />
                  <span>{course.lessons?.length || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  };

  // Update the list view to show progress
  const renderListCourse = (course, index) => {
    const gradient = gradients[course._id] || ["from-gray-300", "to-gray-400"];
    const teacherNames = course.teachers.map((t) => t.name).join(", ");
    const progress = courseProgress[course._id];
    const progressPercentage = progress?.progressPercentage || 0;

    return (
      <motion.div
        key={course._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Link to={`/MyCourses/${course._id}`}>
          <motion.div
            whileHover={{ scale: 1.01, x: 5 }}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg border-l-4 border-yellow transition-all duration-300"
          >
            <div className="flex p-4">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  {course.organization?.logo ? (
                    <img
                      src={course.organization.logo || "/placeholder.svg"}
                      alt={course.organization.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-r ${gradient[0]} ${gradient[1]}`}
                    >
                      {course.organization?.name || course.name.substring(0, 2)}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 sm:ml-6 flex-grow">
                <h2 className="text-xl font-bold text-brown mb-2">{course.name}</h2>
                <p className="text-brown/70 mb-4 text-sm leading-relaxed line-clamp-2">
                  {course.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${progressPercentage}%`, 
                        backgroundColor: colorScheme.yellow,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-brown/80 mt-1">
                    {progressPercentage}% Complete
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 mt-2">
                  <div className="flex items-center text-sm">
                    <Users size={16} className="text-yellow mr-1.5" />
                    <span className="text-brown/80 font-medium">{teacherNames}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <BookOpen size={16} className="text-yellow mr-1.5" />
                    <span className="text-brown/80 font-medium">
                      {course.lessons?.length || 0} lessons
                    </span>
                  </div>

                  <div className="flex items-center text-sm ml-auto">
                    <span className="text-yellow font-medium">Continue Learning →</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <LoadingSpinner/>
    )
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
    )
  }

  if (courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-cream flex flex-col p-4 md:p-16 ml-50"
      >
        <div className="max-w-5xl ml-50">
          <HeadingWithEffect className="flex items-center mb-12">
            <GraduationCap size={32} className="mr-3 text-yellow" />
            My Learning Journey
          </HeadingWithEffect>
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-md shadow-md text-center">
            <div className="w-24 h-24 bg-yellow/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen size={40} className="text-yellow" />
            </div>
            <h3 className="text-2xl font-bold text-brown mb-4">Your Course Library is Empty</h3>
            <p className="text-brown/80 mb-8 max-w-md">
              Discover and enroll in courses from our partner organizations to begin your learning journey.
            </p>
            <Link to="/organisations">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-yellow text-brown font-medium rounded-lg shadow-md hover:bg-brown hover:text-yellow transition-all duration-300 flex items-center"
              >
                <Users className="mr-2" size={18} />
                Explore Organizations
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col p-4 md:p-16 ">
      <HeadingWithEffect className="flex items-center mb-8">
        <GraduationCap size={32} className="mr-3 text-yellow" />
        My Learning Journey
      </HeadingWithEffect>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by course name, description or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border-2 border-[#EFC815] focus:outline-none focus:border-[#57321A] bg-white/50 shadow-sm transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#57321A]" size={20} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#57321A] hover:text-[#EFC815] transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2 bg-cream p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-5 py-2.5 rounded-md transition-all duration-300 flex items-center ${
                viewMode === "grid"
                  ? "bg-yellow text-brown font-medium shadow-sm"
                  : "bg-white text-brown hover:bg-gray-100"
              }`}
            >
              <div className="grid grid-cols-2 gap-1 mr-2">
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
              </div>
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-5 py-2.5 rounded-md transition-all duration-300 flex items-center ${
                viewMode === "list"
                  ? "bg-yellow text-brown font-medium shadow-sm"
                  : "bg-white text-brown hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col gap-1 mr-2">
                <div className="w-4 h-1 bg-current rounded-sm"></div>
                <div className="w-4 h-1 bg-current rounded-sm"></div>
                <div className="w-4 h-1 bg-current rounded-sm"></div>
              </div>
              List
            </button>
          </div>
        </div>

        {/* Course Count */}
        <div className="mt-6 mb-2">
          <p className="text-brown/80 text-sm font-medium">
            {searchTerm
              ? `Found ${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} matching "${searchTerm}"`
              : `You're enrolled in ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Grid View */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" && (
          <motion.div key="grid-view" className="mb-8">
            {currentCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCourses.map(renderGridCourse)}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-brown">No courses match your search criteria.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* List View */}
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
                {currentCourses.map((course, index) => renderListCourse(course, index))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-brown">No courses match your search criteria.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 mb-4 gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevPage}
            disabled={currentPage === 0}
            className="p-2 bg-white text-brown border border-yellow rounded-full shadow-sm hover:bg-yellow hover:text-brown transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div className="flex space-x-2 px-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              // Show current page, first, last, and one page before and after current
              const showPage =
                idx === 0 ||
                idx === totalPages - 1 ||
                idx === currentPage ||
                idx === currentPage - 1 ||
                idx === currentPage + 1

              // Show ellipsis for skipped pages
              const showEllipsis =
                (idx === currentPage - 2 && currentPage > 2) ||
                (idx === currentPage + 2 && currentPage < totalPages - 3)

              if (showEllipsis) {
                return (
                  <span key={`ellipsis-${idx}`} className="flex items-center justify-center w-8 h-8 text-brown">
                    ...
                  </span>
                )
              }

              if (showPage) {
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => goToPage(idx)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentPage === idx
                        ? "bg-yellow text-brown font-bold shadow-sm"
                        : "bg-white text-brown hover:bg-brown hover:text-yellow border border-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </motion.button>
                )
              }

              return null
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className="p-2 bg-white text-brown border border-yellow rounded-full shadow-sm hover:bg-yellow hover:text-brown transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      )}
    </div>
  )
}

