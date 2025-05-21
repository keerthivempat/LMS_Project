import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import HeadingWithEffect from "../components/HeadingWithEffects";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/users/assignments`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const data = await response.json();
        setAssignments(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-cream flex flex-col p-4 md:p-16 ml-10">
      <div className="flex flex-col mb-6">
        <HeadingWithEffect as="h1" className="flex items-center gap-2 text-2xl md:text-3xl text-brown">
          <CalendarIcon className="w-6 h-6 text-yellow" size={25}/>
          <span>{format(currentMonth, "MMMM yyyy")}</span>
        </HeadingWithEffect>

        <div className="flex items-center justify-between mt-4">
          <button 
            className="p-2 rounded-full bg-cream-dark hover:bg-brown/10 transition text-brown"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-10 h-5 bg-yellow rounded-full" />
          </button>
          <button 
            className="p-2 rounded-full bg-cream-dark hover:bg-brown/10 transition text-brown"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="w-10 h-5 bg-yellow rounded-full" />
          </button>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-7 text-center font-semibold text-brown-dark mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-sm md:text-base">{day}</div>
        ))}
      </motion.div>

      {/* Calendar Grid */}
      <motion.div 
        className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-4 bg-white p-2 md:p-6 shadow rounded-lg mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`p-1 md:p-2 lg:p-4 border rounded-lg text-center relative ${
              isToday(day) ? "border-brown bg-cream-light" : "border-cream-dark"
            }`}
          >
            <p className="text-xs md:text-sm font-semibold text-brown-dark">{format(day, "d")}</p>

            {assignments.map((assignment) =>
              isSameDay(parseISO(assignment.dueDate), day) ? (
                <motion.div
                  key={assignment._id}
                  className={`text-xs mt-1 p-1 rounded-sm transition-all truncate ${
                    assignment.status === "graded"
                      ? "bg-green-100 border-l-2 border-green-500 text-green-800"
                      : assignment.status === "submitted"
                      ? "bg-blue-100 border-l-2 border-blue-500 text-blue-800"
                      : "bg-red-100 border-l-2 border-red-500 text-red-800"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  title={assignment.title}
                >
                  <span className="hidden md:inline">{assignment.title}</span>
                  <span className="md:hidden">{assignment.title.substring(0, 1)}</span>
                </motion.div>
              ) : null
            )}
          </div>
        ))}
      </motion.div>

      {/* Assignments List */}
      <motion.div 
        className="bg-white p-4 md:p-6 shadow rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <HeadingWithEffect as="h2" className="text-xl font-semibold mb-4 text-brown">
          Assignments for {format(currentMonth, "MMMM yyyy")}
        </HeadingWithEffect>
        
        <ul className="space-y-2">
          {assignments
            .filter(assignment => {
              const assignmentDate = new Date(assignment.dueDate);
              return assignmentDate.getMonth() === currentMonth.getMonth() && 
                     assignmentDate.getFullYear() === currentMonth.getFullYear();
            })
            .map((assignment) => (
            <motion.li
              key={assignment._id}
              className={`p-3 rounded-md flex items-center gap-3 ${
                assignment.status === "graded"
                  ? "bg-green-50 border-l-4 border-green-500"
                  : assignment.status === "submitted"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "bg-red-50 border-l-4 border-red-500"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex-1">
                <h3 className="font-medium text-brown-dark">{assignment.title}</h3>
                <p className="text-sm text-gray-600">{assignment.course.name} - {assignment.section.name}</p>
                <p className="text-xs text-gray-500">Due: {format(parseISO(assignment.dueDate), "MMM dd, yyyy")}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  assignment.status === "graded"
                    ? "bg-green-100 text-green-800"
                    : assignment.status === "submitted"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {assignment.status === "graded" 
                    ? `Graded: ${assignment.grade}%`
                    : assignment.status === "submitted"
                    ? "Submitted"
                    : "Pending"}
                </span>
                {assignment.submittedAt && (
                  <span className="text-xs text-gray-500 mt-1">
                    Submitted: {format(parseISO(assignment.submittedAt), "MMM dd, yyyy")}
                  </span>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default Dashboard;
