import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OrganizationDetails = () => {
  const [organization, setOrganization] = useState(null);
  const [courses, setCourses] = useState([]);
  const { orgId } = useParams();

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const [orgResponse, coursesResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/organizations/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/organizations/${orgId}/courses`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setOrganization(orgResponse.data);
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error('Error fetching organization details:', error);
      }
    };

    fetchOrganizationDetails();
  }, [orgId]);

  if (!organization) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{organization.name}</h1>
      <p className="text-gray-600 mb-8">{organization.description}</p>

      <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-blue-500 font-medium">
                Duration: {course.duration}
              </span>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No courses available at the moment.
        </p>
      )}
    </div>
  );
};

export default OrganizationDetails; 