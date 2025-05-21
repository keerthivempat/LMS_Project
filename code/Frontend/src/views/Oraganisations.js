"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { School, ChevronLeft, ChevronRight, Search, X, Mail, MapPin, Phone } from "lucide-react"
import Org from "../GET/Org.js"
import LoadingSpinner from "../components/LoadingSpinner"
import HeadingWithEffect from "../components/HeadingWithEffects"
import CommonButton from "../components/CommonButton.js"
import SuccessAlert from "../components/SuccessAlert.js"
import GlitchText from "../components/GlitchText.js"

// Organization Details Modal Component
export const OrganizationDetailsModal = ({ isOpen, onClose, organization }) => {
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false);

  // Early return after all hooks are called
  if (!organization) return null

  const handleJoinOrganization = async () => {
    try {
      setJoining(true)
      setError(null)
      setSuccess(false);

      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${organization._id.toString()}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()
      // console.log("data", data.data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to join organization")
      }
      setSuccess(true);
      // ;<SuccessAlert message="request sent successfully"></SuccessAlert>
      localStorage.setItem("role",'student')
      setTimeout(() => {
        window.location.href = "/organisations";
      }, 1500);
    } catch (err) {
      setError(err.message)
    } finally {
      setJoining(false)
    }
  }
  if (error) {
    return (
      <div className="min-h-screen flex mt-20">
        <GlitchText>Failed To Fetch</GlitchText>
      </div>
    )
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
                {success && <SuccessAlert message="Request sent successfully" />}
          {/* Modal Content */}
          <motion.div
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-cream rounded-xl shadow-xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Image */}
            <div className="relative">
              <div className="h-48 bg-[#57321A] flex items-center justify-center overflow-hidden">
                {organization.logo ? (
                  <img
                    src={organization.logo || "/placeholder.svg"}
                    alt={`${organization.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 bg-[#EFC815] rounded flex items-center justify-center">
                    <span className="text-4xl font-bold text-[#57321A]">{organization.name?.charAt(0) || "O"}</span>
                  </div>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full bg-cream text-[#57321A] hover:bg-[#EFC815] transition-colors duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#57321A] mb-4">{organization.name}</h2>

              <div className="space-y-4">
                {/* Description */}
                <p className="text-gray-600">{organization.description}</p>

                {/* Contact Info */}
                <div className="flex items-center text-[#57321A]">
                  <Mail size={18} className="mr-2 text-yellow" />
                  <a href={`mailto:${organization.email || ''}`} className="hover:text-[#EFC815] text-gray-600">
                    {organization.email || 'No email available'}
                  </a>
                </div>

                {/* Additional details if available */}
                {organization.address && (
                  <div className="flex items-center text-[#57321A]">
                    <MapPin size={18} className="mr-2 text-yellow" />
                    <span className="text-gray-600">{organization.address}</span>
                  </div>
                )}

                {organization.phone && (
                  <div className="flex items-center text-[#57321A]">
                    <Phone size={18} className="mr-2 text-yellow" />
                    <span className="text-gray-600">{organization.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-10">
                <CommonButton onClick={handleJoinOrganization}>{joining ? "Joining..." : "Join"}</CommonButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Card Component with Modal Integration
export const Card = ({ id, name, description, image, email, phone, address }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const organization = {
    _id: id,
    name: name,
    description: description,
    logo: image,
    email: email,
    phone: phone,
    address: address,
  }

  return (
    <>
      <div className="bg-white rounded shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <div className="h-48 bg-[#57321A] overflow-hidden">
          {image ? (
            <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[#EFC815] flex items-center justify-center">
              <span className="text-4xl font-bold text-[#57321A]">{name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-[#57321A] mb-2">{name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{description}</p>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#EFC815] text-[#57321A] py-2 rounded-lg 
                     hover:bg-[#57321A] hover:text-white 
                     transition-colors duration-300 font-medium mt-auto"
          >
            Learn More
          </motion.button>
        </div>
      </div>

      <OrganizationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organization={organization}
      />
    </>
  )
}

export const CardGrid = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const { organizations, loading, error } = Org() // Use the hook
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOrgs, setFilteredOrgs] = useState([])
  const cardsPerPage = 6

  // Filter organizations when search query or organizations change
  useEffect(() => {
    if (organizations) {
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredOrgs(filtered)
      setCurrentPage(0) // Reset to first page when search changes
    }
  }, [searchQuery, organizations])

  const totalPages = Math.ceil(filteredOrgs.length / cardsPerPage)

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev))
  }

  const currentCards = filteredOrgs.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div
      className="min-h-screen bg-cream flex flex-col p-4 md:p-16 ml-10"
    >
      {/* Header Section with Search */}

      <HeadingWithEffect className="flex items-center justify-center gap-3">
        <School size={50} className="mr-2 text-yellow" />
        Organisations
      </HeadingWithEffect>
      <div className="relative mb-10 mt-10 flex justify-center">
  <div className="relative">
    <motion.input
      type="text"
      placeholder="Search organizations..."
      value={searchQuery}
      onChange={handleSearchChange}
      className="px-5 py-3 pl-12 rounded-md border-2 border-[#EFC815] focus:outline-none focus:ring-2 focus:ring-[#57321A] focus:border-transparent bg-white text-[#57321A] transition-all duration-300 shadow-lg w-full md:w-96"
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#57321A]" size={18} />
    {searchQuery && (
      <button
        onClick={() => setSearchQuery("")}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#57321A] hover:text-red-500 transition-all duration-200"
      >
        <X size={16} />
      </button>
    )}
  </div>
</div>

      {/* Results Count */}
      {searchQuery && (
        <motion.p  className="text-[#57321A] mb-4">
          Found {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? "s" : ""}
        </motion.p>
      )}

      {/* Cards Grid */}
      {filteredOrgs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {currentCards.map((org) => (
            <motion.div
              key={org._id}
              className="h-full"
            >
              <Card
                id={org._id.toString()}
                name={org.name}
                description={org.description}
                image={org.logo}
                email={org.contactDetails?.email || ''}
                phone={org.contactDetails?.phone || ''}
                address={org.contactDetails?.address || ''}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div className="text-center py-16">
          <p className="text-xl text-[#57321A]">No organizations found matching your search.</p>
        </motion.div>
      )}

      {/* Pagination Controls */}
      {filteredOrgs.length > cardsPerPage && (
        <div className="flex justify-center items-center mt-8 gap-4">
          <motion.button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="p-2 rounded-full bg-[#57321A] text-[#FFFFFF] hover:bg-[#EFC815] hover:text-[#57321A] transition-colors duration-300 disabled:opacity-50"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentPage === index ? "bg-[#EFC815] w-4 h-4" : "bg-[#57321A]"
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 rounded-full bg-[#57321A] text-[#FFFFFF] hover:bg-[#EFC815] hover:text-[#57321A] transition-colors duration-300 disabled:opacity-50"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default CardGrid

