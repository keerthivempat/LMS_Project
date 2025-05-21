import { motion } from "framer-motion";

export default function CommonButton({ onClick, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-[#EFC815] text-[#57321A] px-6 py-3 rounded font-medium hover:bg-[#57321A] hover:text-[#FFFFFF] transition-colors duration-300 flex items-center justify-center gap-2"
    >
      {children}
    </motion.button>
  );
}
