import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  Building2,
  PlusCircle,
  UserPlus,
  ChevronDown,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import HeadingWithEffect from '../components/HeadingWithEffects';
import api from '../utility/api';
import StatCard from '../components/StatCard';
import QuickAction from '../components/QuickAction';
import TeacherActivityTracker from '../components/TeacherActivityTracker';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    organization: {
      contactDetails: {
        email: '',
        phone: '',
        address: ''
      },
      name: '',
      description: '',
      logo: '',
      about: []
    },
    stats: {
      coursesCount: 0,
      teachersCount: 0,
      studentsCount: 0
    },
    recentCourses: []
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colorScheme = {
    cream: "#FFFCF4",
    brown: "#57321A",
    yellow: "#EFC815",
    white: "#FFFFFF",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const orgId = localStorage.getItem('organizationid');
        
        const response = await api.get(`/api/v1/admin/dashboard/${orgId}`);
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
        
        // If it's an authentication or permission error, the api interceptor will handle redirection
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <main className="ml-0 md:ml-[200px] p-6">
          <div className="max-w-7xl mx-auto">
          <HeadingWithEffect>Admin Dashboard</HeadingWithEffect>
            
            {/* Organization Info */}
            <div className="mt-8">
              <div className="bg-white p-6 rounded shadow-sm border border-brown/20">
                <div className="flex items-start gap-6">
                  {dashboardData.organization.logo && (
                    <img 
                      src={dashboardData.organization.logo} 
                      alt="Organization Logo"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-brown">
                          {dashboardData.organization.name}
                        </h2>
                        <p className="text-brown/60 mt-1">
                          {dashboardData.organization.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="flex items-center gap-2 text-brown hover:text-yellow transition-colors"
                      >
                        <span>Contact Details</span>
                        <ChevronDown className={`transform transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Contact Details Dropdown */}
                    {isDetailsOpen && (
                      <div className="mt-4 space-y-2 p-4 bg-cream rounded">
                        <div className="flex items-center gap-2 text-brown/80">
                          <Mail size={16} />
                          <span>{dashboardData.organization.contactDetails.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-brown/80">
                          <Phone size={16} />
                          <span>{dashboardData.organization.contactDetails.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-brown/80">
                          <MapPin size={16} />
                          <span>{dashboardData.organization.contactDetails.address}</span>
                        </div>
                      </div>
                    )}

                    {/* About Section */}
                    {dashboardData.organization.about && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-brown mb-2">About Us</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {dashboardData.organization.about.map((item, index) => (
                            <li key={index} className="text-brown/70">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              <StatCard 
                icon={Users} 
                title="Total Students" 
                value={dashboardData?.stats?.studentsCount || 0} 
                color="bg-blue-500"
              />
              <StatCard 
                icon={UserPlus} 
                title="Total Teachers" 
                value={dashboardData?.stats?.teachersCount || 0} 
                color="bg-green-500"
              />
              <StatCard 
                icon={BookOpen} 
                title="Total Courses" 
                value={dashboardData?.stats?.coursesCount || 0} 
                color="bg-purple-500"
              />
            </div>
            
            {/* Quick Actions */}
            <h2 className="text-2xl font-semibold text-brown mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickAction
                icon={PlusCircle}
                title="Add New Course"
                description="Create and manage new courses"
                to="/admin/courses"
                color="bg-purple-500"
              />
              <QuickAction
                icon={PlusCircle}
                title="Add New Teacher"
                description="Add teacher to organisation"
                to="/admin/teachers"
                color="bg-purple-500"
              />
            </div>

            {/* Recent Courses Section - Table Format */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-brown mb-6">Recent Courses</h2>
              <div className="bg-white rounded-lg shadow-sm border border-brown/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brown/10">
                    <thead className="bg-cream">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Teachers</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-brown/10">
                      {dashboardData.recentCourses.map(course => (
                        <tr key={course._id} className="hover:bg-cream transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-cream flex items-center justify-center mr-3">
                                <BookOpen size={20} className="text-brown" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-brown">{course.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-brown/70 truncate max-w-xs">
                              {course.description || "No description"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-brown/70">
                              {course.students?.length || 0} Students
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-brown/70">
                              {course.teachers?.length || 0} Teachers
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Teacher Activity Tracker */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-brown mb-6">Teacher Activity</h2>
              <div className="bg-white overflow-hidden rounded-lg shadow-sm">
                <TeacherActivityTracker />
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
};

export default AdminDashboard;