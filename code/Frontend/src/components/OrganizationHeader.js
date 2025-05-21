"use client"
import { motion } from "framer-motion"

const OrganizationHeader = ({ organization }) => {
  if (!organization) {
    return null;
  }

  return (
    <div className="card bg-white shadow-xl mb-8">
      <div className="card-body">
        <div className="flex items-center justify-center mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mr-4"
          >
            <img
              src={organization.logo || "/placeholder.svg"}
              alt={organization.name || "Organization"}
              className="w-24 h-24 rounded-full object-cover"
            />
          </motion.div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-brown mb-2">
              {organization.name || "Organization Name"}
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              {organization.description || "No description available"}
            </p>
            {organization.contactDetails && (
              <div className="text-sm text-gray-500">
                {organization.contactDetails.email && (
                  <p>{organization.contactDetails.email}</p>
                )}
                {organization.contactDetails.address && (
                  <p>{organization.contactDetails.address}</p>
                )}
                {organization.contactDetails.phone && (
                  <p>{organization.contactDetails.phone}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationHeader

