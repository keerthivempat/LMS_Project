"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Mail, Phone, MapPin, BookOpen, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import HeadingWithEffect from "../components/HeadingWithEffects"
import LoadingSpinner from "../components/LoadingSpinner"
import GlitchText from "../components/GlitchText"
import CommonButton from "../components/CommonButton"

const MyOrganizations = () => {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredCard, setHoveredCard] = useState(null)
  const navigate = useNavigate()

  const orgsPerPage = 6

  useEffect(() => {
    const fetchJoinedOrganizations = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("accessToken")
        const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/org/my-orgs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const orgsData = response.data.data.organizations || []
        const orgDetailsPromises = orgsData.map((orgId) =>
          axios.get(`${process.env.REACT_APP_BACKEND}/api/org/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        )

        const orgDetailsResponses = await Promise.all(orgDetailsPromises)
        const fullOrganizations = orgDetailsResponses.map((response) => response.data.data)

        setOrganizations(fullOrganizations)
        setError(null)
      } catch (err) {
        setError("Failed to fetch organizations")
        setOrganizations([])
      } finally {
        setLoading(false)
      }
    }

    fetchJoinedOrganizations()
  }, [])

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredOrganizations.length / orgsPerPage)
  const indexOfLastOrg = currentPage * orgsPerPage
  const indexOfFirstOrg = indexOfLastOrg - orgsPerPage
  const currentOrgs = filteredOrganizations.slice(indexOfFirstOrg, indexOfLastOrg)

  const handleLearnMore = (orgId) => {
    navigate(`/joined-organization/${orgId}`)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF4] flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-[#57321A] font-medium animate-pulse">Loading your organizations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFCF4] flex flex-col items-center justify-center">
        <motion.div
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center"
        >
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <GlitchText>Failed To Fetch</GlitchText>
          <p className="text-[#57321A] mt-4">We couldn't load your organizations. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-[#EFC815] text-[#57321A] font-medium rounded-md hover:bg-[#57321A] hover:text-white transition-all duration-300"
          >
            Retry
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col p-4 md:p-16 ml-10">
      <HeadingWithEffect className="flex items-center justify-center gap-3 mb-12">
        <Building2 className="text-[#EFC815]" size={36} />
        My Organizations
      </HeadingWithEffect>
  
      {/* Search input section */}
      <motion.div
        className="relative mb-12 max-w-md mx-auto"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 rounded-lg border-2 border-[#EFC815] focus:outline-none focus:ring-2 focus:ring-[#57321A] focus:border-transparent bg-white text-[#57321A] transition-all duration-300 shadow-lg"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#57321A]" size={20} />
        </div>
        {searchTerm && (
          <motion.div
            className="absolute right-4 top-3 text-sm text-[#57321A]"
          >
            {filteredOrganizations.length} results
          </motion.div>
        )}
      </motion.div>
  
      {/* Organizations grid */}
      <AnimatePresence>
        {currentOrgs.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {currentOrgs.map((org, index) => (
              <motion.div
                key={org._id}
                custom={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl"
              >
                {/* Card Header with Logo/Image */}
                <div className="h-48 bg-gradient-to-br from-[#57321A] to-[#7A4D2E] relative overflow-hidden">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    transition={{ duration: 0.4 }} 
                    className="w-full h-full"
                  >
                    <img
                      src={org.logo || "/placeholder.svg"}
                      alt={org.name}
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://via.placeholder.com/150?text=Logo"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#57321A] via-[#57321A]/70 to-transparent" />
                  </motion.div>
                  
                  {/* Organization Badge */}
                  <div className="absolute top-4 right-4 bg-[#EFC815] text-[#57321A] px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    {org.courses.length} {org.courses.length === 1 ? 'Course' : 'Courses'}
                  </div>
                  
                  {/* Organization Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{org.name}</h2>
                  </div>
                </div>
  
                {/* Card Content */}
                <div className="p-6">
                  {/* Description */}
                  <div className="bg-[#FFFCF4] p-4 rounded-lg mb-5">
                    <p className="text-gray-700 line-clamp-2 h-12">{org.description || "No description available"}</p>
                  </div>
  
                  {/* Contact Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-700 group hover:text-[#57321A] transition-colors duration-200">
                      <div className="p-2 bg-[#FFFCF4] rounded-full group-hover:bg-[#EFC815] transition-colors duration-300">
                        <Mail size={16} className="text-[#57321A]" />
                      </div>
                      <span className="truncate text-sm">{org.contactDetails.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-700 group hover:text-[#57321A] transition-colors duration-200">
                      <div className="p-2 bg-[#FFFCF4] rounded-full group-hover:bg-[#EFC815] transition-colors duration-300">
                        <MapPin size={16} className="text-[#57321A]" />
                      </div>
                      <span className="truncate text-sm">{org.contactDetails.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-700 group hover:text-[#57321A] transition-colors duration-200">
                      <div className="p-2 bg-[#FFFCF4] rounded-full group-hover:bg-[#EFC815] transition-colors duration-300">
                        <BookOpen size={16} className="text-[#57321A]" />
                      </div>
                      <span className="text-sm font-medium">{org.courses.length} {org.courses.length === 1 ? 'Course' : 'Courses'}</span>
                    </div>
                  </div>
  
                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLearnMore(org._id)}
                    className="w-full py-3 bg-brown hover:bg-yellow text-yellow hover:bg-yellow hover:text-brown font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <span>View Courses</span>
                    <ChevronRight size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-xl shadow-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Building2 size={80} className="text-[#EFC815] mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-[#57321A] mb-3">
              {searchTerm ? "No matching organizations found" : "You haven't joined any organizations yet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search or check back later for new organizations."
                : "Join an organization to see it listed here. You can browse available organizations from the explore page."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-6 px-6 py-2 bg-[#EFC815] text-[#57321A] font-medium rounded-lg hover:bg-[#57321A] hover:text-white transition-all duration-300"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
  
      {/* Pagination Component */}
      {totalPages > 1 && (
        <motion.div
          className="flex justify-center items-center mt-12 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-full bg-[#57321A] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EFC815] hover:text-[#57321A] transition-all duration-300 shadow-md"
          >
            <ChevronLeft size={20} />
          </motion.button>
  
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            {totalPages <= 5 ? (
              // Show all page numbers if 5 or fewer
              [...Array(totalPages)].map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    currentPage === idx + 1
                      ? "bg-[#EFC815] text-[#57321A] font-bold"
                      : "bg-[#FFFCF4] text-[#57321A] hover:bg-[#EFC815]/30"
                  }`}
                >
                  {idx + 1}
                </motion.button>
              ))
            ) : (
              // Show limited page numbers with ellipsis for many pages
              <>
                {/* First page */}
                <motion.button
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    currentPage === 1
                      ? "bg-[#EFC815] text-[#57321A] font-bold"
                      : "bg-[#FFFCF4] text-[#57321A] hover:bg-[#EFC815]/30"
                  }`}
                >
                  1
                </motion.button>
  
                {/* Ellipsis or number */}
                {currentPage > 3 && <span className="text-[#57321A]">...</span>}
  
                {/* Current page and neighbors */}
                {currentPage > 2 && currentPage < totalPages && (
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(currentPage)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EFC815] text-[#57321A] font-bold"
                  >
                    {currentPage}
                  </motion.button>
                )}
  
                {/* Ellipsis or number */}
                {currentPage < totalPages - 2 && <span className="text-[#57321A]">...</span>}
  
                {/* Last page */}
                <motion.button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    currentPage === totalPages
                      ? "bg-[#EFC815] text-[#57321A] font-bold"
                      : "bg-[#FFFCF4] text-[#57321A] hover:bg-[#EFC815]/30"
                  }`}
                >
                  {totalPages}
                </motion.button>
              </>
            )}
          </div>
  
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-full bg-[#57321A] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EFC815] hover:text-[#57321A] transition-all duration-300 shadow-md"
          >
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default MyOrganizations

