"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Trash2, Search } from "lucide-react"
import HeadingWithEffect from "../components/HeadingWithEffects"
import LoadingSpinner from "../components/LoadingSpinner"
import ConfirmDialog from '../components/ConfirmDialog'
import SuccessAlert from '../components/SuccessAlert'
import ErrorMessage from '../components/ErrorMessage'

const CourseTeachers = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [errorTeachers, setErrorTeachers] = useState(null)
  const [errorStudents, setErrorStudents] = useState(null)
  const [activeTab, setActiveTab] = useState("teachers") // 'teachers' or 'students'
  const [teacherSearch, setTeacherSearch] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const confirmDialog = new ConfirmDialog()

  useEffect(() => {
    fetchTeachers()
    fetchStudents()
  }, [courseId])

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/teacher?courseId=${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch teachers")
      const data = await response.json()
      setTeachers(data.data)
    } catch (err) {
      setErrorTeachers(err.message)
    } finally {
      setLoadingTeachers(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/course/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch students")
      const data = await response.json()
      setStudents(data.data)
    } catch (err) {
      setErrorStudents(err.message)
    } finally {
      setLoadingStudents(false)
    }
  }

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message })
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' })
    }, 5000)
  }

  const handleRemoveTeacher = (teacherId) => {
    confirmDialog.show({
      title: "Confirm Deletion",
      message: "Are you sure you want to remove this teacher?",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("accessToken")
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND}/api/v1/admin/course/${courseId}/teacher/${teacherId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          if (response.ok) {
            showAlert('success', 'Teacher removed successfully')
            fetchTeachers()
          } else {
            showAlert('error', 'Failed to remove teacher')
          }
        } catch (err) {
          console.error('Error removing teacher:', err)
          showAlert('error', 'Error removing teacher')
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    })
  }

  const handleRemoveStudent = (studentId) => {
    confirmDialog.show({
      title: "Confirm Deletion",
      message: "Are you sure you want to remove this student?",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("accessToken")
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND}/api/v1/admin/course/${courseId}/student/${studentId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          if (response.ok) {
            showAlert('success', 'Student removed successfully')
            fetchStudents()
          } else {
            showAlert('error', 'Failed to remove student')
          }
        } catch (err) {
          console.error('Error removing student:', err)
          showAlert('error', 'Error removing student')
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    })
  }

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.email.toLowerCase().includes(teacherSearch.toLowerCase()),
  )

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase()),
  )

  if (loadingTeachers || loadingStudents) return <LoadingSpinner />
  if (errorTeachers || errorStudents) return <div>Error: {errorTeachers || errorStudents}</div>

  return (
    <div className="min-h-screen bg-cream">
      <main className="ml-0 md:ml-[200px] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-brown/10">
              <ArrowLeft size={24} className="text-brown" />
            </button>
          </div>
          <HeadingWithEffect>Course Members</HeadingWithEffect>

          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b border-brown/20">
            {["teachers", "students"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold ${
                  activeTab === tab ? "text-brown border-b-2 border-yellow" : "text-brown/60"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-brown/60" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={activeTab === "teachers" ? teacherSearch : studentSearch}
              onChange={(e) =>
                activeTab === "teachers" ? setTeacherSearch(e.target.value) : setStudentSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2 border border-brown/20 rounded focus:outline-none focus:ring-2 focus:ring-yellow/50 focus:border-yellow text-brown"
              style={{ backgroundColor: "#FFFFFF" }}
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-brown/20">
            {activeTab === "teachers" ? (
              filteredTeachers.length === 0 ? (
                <div className="p-6 text-center text-brown">
                  {teacherSearch
                    ? `No teachers found matching "${teacherSearch}"`
                    : "No teachers assigned to this course yet."}
                </div>
              ) : (
                <div className="divide-y divide-brown/10">
                  {filteredTeachers.map((teacher) => (
                    <div key={teacher._id} className="p-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-brown">{teacher.name}</h3>
                        <p className="text-brown/70">{teacher.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveTeacher(teacher._id)}
                        className="p-2 rounded-md hover:bg-red-50"
                        style={{ color: "#EF4444" }}
                        title="Remove teacher from course"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-brown">
                {studentSearch
                  ? `No students found matching "${studentSearch}"`
                  : "No students enrolled in this course yet."}
              </div>
            ) : (
              <div className="divide-y divide-brown/10">
                {filteredStudents.map((student) => (
                  <div key={student._id} className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-brown">{student.name}</h3>
                      <p className="text-brown/70">{student.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student._id)}
                      className="p-2 rounded-md hover:bg-red-50"
                      style={{ color: "#EF4444" }}
                      title="Remove student from course"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {alert.show && alert.type === 'success' && <SuccessAlert message={alert.message} />}
          {alert.show && alert.type === 'error' && <ErrorMessage message={alert.message} />}
        </div>
      </main>
    </div>
  )
}

export default CourseTeachers
