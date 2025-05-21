"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // ✅ Added for prop validation

export default function SuccessAlert({
  message = "Action completed successfully",
  duration = 5000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer;
    if (duration > 0 && isVisible) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [duration, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50
                    flex items-center gap-3 min-w-[320px] max-w-md
                    bg-gradient-to-r from-green-500 to-green-600
                    text-white p-4 rounded-lg shadow-lg"
        >
          <div className="bg-white bg-opacity-20 rounded-full p-1.5">
            <CheckCircle className="w-5 h-5" />
          </div>

          <span className="flex-1 font-medium text-sm">{message}</span>

          {duration > 0 && (
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg"
            />
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ✅ Add PropTypes for validation
SuccessAlert.propTypes = {
  message: PropTypes.string,
  duration: PropTypes.number,
  onClose: PropTypes.func,
};
