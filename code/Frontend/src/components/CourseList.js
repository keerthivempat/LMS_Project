import { motion } from "framer-motion";
import { useState } from "react";
import CommonButton from "./CommonButton";
import { useNavigate } from "react-router-dom";

const CourseList = ({ courses, onJoinCourse, join }) => {
  const [joiningCourseId, setJoiningCourseId] = useState(null);
  const navigate = useNavigate();

  const handleJoinClick = async (courseId) => {
    setJoiningCourseId(courseId);
    try {
      await onJoinCourse(courseId);
    } finally {
      setJoiningCourseId(null);
    }
  };

  const handleCourseClick = (courseId) => {
    // if (!join) {
    //   // For teacher view, navigate to teacher course page
    //   navigate(`/teachercourses/${courseId}`);
    // }
  };

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses && courses.length > 0 ? (
        courses.map((course) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className={`bg-white rounded shadow-md p-6 border border-brown/20 h-full flex flex-col ${!join ? 'cursor-pointer hover:shadow-lg transition-shadow duration-300' : ''}`}
              onClick={() => !join && handleCourseClick(course._id)}
            >
              <h3 className="text-xl font-semibold text-brown mb-2 line-clamp-1">
                {truncateText(course.name, 30)}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                {truncateText(course.description, 150)}
              </p>
              {join &&
              <div className="mt-auto">
                <CommonButton onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  handleJoinClick(course._id);
                }}>
                  Join Course
                </CommonButton>
              </div>
              }
            </div>
          </motion.div>
        ))
      ) : (
        <p className="text-center text-brown/70 col-span-3">
          No available courses to join at the moment.
        </p>
      )}
    </div>
  );
};

export default CourseList;
