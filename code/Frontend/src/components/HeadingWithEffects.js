"use client"
import { motion } from "framer-motion"

const HeadingWithEffect = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className={`flex items-center justify-center shadow-xl rounded p-10 bg-white border-b-4 border-[#EFC815] ${className}`}
    >
      <motion.h1
        className="text-4xl font-bold text-[#57321A] text-center flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.h1>
    </motion.div>
  )
}

export default HeadingWithEffect

