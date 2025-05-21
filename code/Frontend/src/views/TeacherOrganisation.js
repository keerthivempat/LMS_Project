"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Mail, MapPin, BookOpen, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import HeadingWithEffect from "../components/HeadingWithEffects";
import LoadingSpinner from "../components/LoadingSpinner";
import GlitchText from "../components/GlitchText";
import CommonButton from "../components/CommonButton";

const TeacherOrganisation = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const orgsPerPage = 6;

  useEffect(() => {
    const fetchJoinedOrganizations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // Fetch organizations for the teacher
        const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/teacher/organizations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("data is ", response.data.data);
        const orgsData = response.data.data || []; // Ensure it's an array
        console.log("orgsData is ", orgsData);

        // Directly set the organizations state if orgsData contains full details
        setOrganizations(orgsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Failed to fetch organizations");
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrganizations.length / orgsPerPage);
  const indexOfLastOrg = currentPage * orgsPerPage;
  const indexOfFirstOrg = indexOfLastOrg - orgsPerPage;
  const currentOrgs = filteredOrganizations.slice(indexOfFirstOrg, indexOfLastOrg);

  const handleLearnMore = (orgId) => {
    navigate(`/teacher-joined-organization/${orgId}`);
  };

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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF4] flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFCF4] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
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
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col p-4 md:p-16">
      <HeadingWithEffect className="flex items-center justify-center gap-3 mb-12">
        <Building2 className="text-[#EFC815]" size={36} />
        My Organizations
      </HeadingWithEffect>

      {/* Search input section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mb-12 max-w-md mx-auto"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 rounded border-2 border-[#EFC815] focus:outline-none focus:ring-2 focus:ring-[#57321A] focus:border-transparent bg-white text-[#57321A] transition-all duration-300 shadow-md"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#57321A]" size={20} />
        </div>
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {currentOrgs.map((org, index) => (
              <motion.div
                key={org._id}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                variants={cardVariants}
                className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="h-52 bg-[#57321A] relative overflow-hidden">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} className="w-full h-full">
                    <img
                      src={org.logo || "/placeholder.svg"}
                      alt={org.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Logo";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#57321A]/80 to-transparent" />
                  </motion.div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{org.name}</h2>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-5 line-clamp-2 h-12">{org.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600 group">
                      <div className="p-2 bg-[#FFFCF4] rounded-full group-hover:bg-[#EFC815] transition-colors duration-300">
                        <Mail size={16} className="text-[#57321A]" />
                      </div>
                      <span className="truncate text-sm">{org.contactDetails?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 group">
                      <div className="p-2 bg-[#FFFCF4] rounded-full group-hover:bg-[#EFC815] transition-colors duration-300">
                        <MapPin size={16} className="text-[#57321A]" />
                      </div>
                      <span className="truncate text-sm">{org.contactDetails?.address || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 group">
                      <div className="p-2 bg-[#FFFCF4] rounded-full group-hover:bg-[#EFC815] transition-colors duration-300">
                        <BookOpen size={16} className="text-[#57321A]" />
                      </div>
                      <span className="text-sm">{org.courses?.length || 0} Courses Available</span>
                    </div>
                  </div>

                  <CommonButton onClick={() => handleLearnMore(org._id)} className="w-full justify-center">
                    View Details
                  </CommonButton>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded shadow-md"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.2,
              }}
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
                className="mt-6 px-6 py-2 bg-[#EFC815] text-[#57321A] font-medium rounded hover:bg-[#57321A] hover:text-white transition-all duration-300"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
              [...Array(totalPages)].map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
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
              <>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    currentPage === 1
                      ? "bg-[#EFC815] text-[#57321A] font-bold"
                      : "bg-[#FFFCF4] text-[#57321A] hover:bg-[#EFC815]/30"
                  }`}
                >
                  1
                </motion.button>

                {currentPage > 3 && <span className="text-[#57321A]">...</span>}

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

                {currentPage < totalPages - 2 && <span className="text-[#57321A]">...</span>}

                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
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
  );
};

export default TeacherOrganisation;

