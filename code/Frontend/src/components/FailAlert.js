import { motion } from "framer-motion";
import { XCircleIcon } from "lucide-react";
import { useState } from "react";

export default function FailAlert({ message = "An error occurred" }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-5 right-5 bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3"
    >
      <XCircleIcon className="w-6 h-6" />
      <span>{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 px-2 py-1 text-sm bg-red-700 rounded-lg hover:bg-red-800 transition"
      >
        OK
      </button>
    </motion.div>
  );
}