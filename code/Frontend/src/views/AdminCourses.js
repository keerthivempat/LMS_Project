import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  UserPlus,
  Search,
  Filter
} from 'lucide-react';
import HeadingWithEffect from '../components/HeadingWithEffects';
import CourseCard from '../components/CourseCard';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: ''
  });

  const colorScheme = {
    cream: "#FFFCF4",
    brown: "#57321A",
    yellow: "#EFC815",
    white: "#FFFFFF",
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${localStorage.getItem('organizationid')}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched courses:', data);
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // console.log('Fetching teachers...');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/teachers/${localStorage.getItem('organizationid')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // console.log('Fetched teachers:', data);
        setTeachers(data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return;
    // console.log("hello");
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/v1/admin/assign-course`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // courseId, teacherId, organizationId
        body: JSON.stringify({
          courseId: selectedCourse._id,
          teacherId: selectedTeacher,
          organizationId : localStorage.getItem('organizationid')
        })
      });
      // console.log("response");
      if (response.ok) {
        setShowAssignModal(false);
        fetchCourses(); // Refresh the courses list
      }
    } catch (error) {
      console.error('Error assigning teacher:', error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('accessToken');
      const orgId = localStorage.getItem('organizationid');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/org/${orgId}/course`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCourse)
      });

      if (response.ok) {
        setShowAddCourseModal(false);
        setNewCourse({ name: '', description: '' });
        fetchCourses(); // Refresh the courses list
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'assigned' && course.teacher) ||
      (filter === 'unassigned' && !course.teacher);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-cream">
      
      <main className="ml-0 md:ml-[200px] p-6">
        <div className="max-w-7xl mx-auto">
        <HeadingWithEffect>Manage Courses</HeadingWithEffect>
          <div className="flex justify-between items-center mt-6">
            {/* <h1 className="text-3xl font-bold text-brown">Manage Courses</h1> */}
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="flex p-4 items-center gap-2 px-4 rounded"
              style={{ 
                backgroundColor: colorScheme.brown,
                color: colorScheme.white
              }}
            >
              <PlusCircle size={20} />
              <span>Add New Course</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md mb-4"
                style={{ 
                  borderColor: colorScheme.brown,
                  backgroundColor: colorScheme.white
                }}
              />
              <Search 
                size={20} 
                className="absolute left-3 top-2.5"
                style={{ color: colorScheme.brown }}
              />
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                onAssignTeacher={() => {
                  setSelectedCourse(course);
                  setShowAssignModal(true);
                }}
              />
            ))}
          </div>

          {/* Assign Teacher Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-semibold text-brown mb-4">
                  Assign Teacher to {selectedCourse?.name}
                </h3>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full p-2 border rounded-md mb-4"
                  style={{ 
                    borderColor: colorScheme.brown,
                    backgroundColor: colorScheme.white
                  }}
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-md"
                    style={{ 
                      border: `1px solid ${colorScheme.brown}`,
                      color: colorScheme.brown
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignTeacher}
                    className="px-4 py-2 rounded-md text-white"
                    style={{ backgroundColor: colorScheme.brown }}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Course Modal */}
          {showAddCourseModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-semibold text-brown mb-4">
                  Create New Course
                </h3>
                <form onSubmit={handleCreateCourse}>
                  <div className="mb-4">
                    <label htmlFor="courseName" className="block text-sm font-medium text-brown mb-1">
                      Course Name*
                    </label>
                    <input
                      id="courseName"
                      type="text"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                      style={{ 
                        borderColor: colorScheme.brown,
                        backgroundColor: colorScheme.white
                      }}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="courseDescription" className="block text-sm font-medium text-brown mb-1">
                      Description*
                    </label>
                    <textarea
                      id="courseDescription"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                      style={{ 
                        borderColor: colorScheme.brown,
                        backgroundColor: colorScheme.white
                      }}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAddCourseModal(false)}
                      className="px-4 py-2 rounded-md"
                      style={{ 
                        border: `1px solid ${colorScheme.brown}`,
                        color: colorScheme.brown
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md text-white"
                      style={{ backgroundColor: colorScheme.brown }}
                    >
                      Create Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCourses;