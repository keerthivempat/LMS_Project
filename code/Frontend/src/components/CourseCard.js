"use client"
import { UserPlus, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"

const CourseCard = ({ course, onAssignTeacher }) => {
  const navigate = useNavigate()
  const colorScheme = {
    cream: "#FFFCF4",
    brown: "#57321A",
    yellow: "#EFC815",
    white: "#FFFFFF",
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-brown/20">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 min-w-0">
          {" "}
          {/* min-w-0 prevents flex child from expanding beyond container */}
          <h3 className="text-xl font-semibold text-brown mb-2 line-clamp-1">{course.name}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3 overflow-hidden">{course.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-brown">Teachers: {course.teachers?.length || 0}</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:min-w-[180px]">
          {" "}
          {/* Fixed width for button column */}
          <button
            onClick={() => navigate(`/admin/courses/${course._id}/teachers`)}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded w-full"
            style={{
              backgroundColor: colorScheme.cream,
              color: colorScheme.brown,
              border: `1px solid ${colorScheme.brown}`,
            }}
          >
            <Users size={20} />
            <span className="whitespace-nowrap">View Members</span>
          </button>
          <button
            onClick={() => onAssignTeacher(course)}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded w-full"
            style={{
              backgroundColor: colorScheme.yellow,
              color: colorScheme.brown,
            }}
          >
            <UserPlus size={20} />
            <span className="whitespace-nowrap">Assign Teacher</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
