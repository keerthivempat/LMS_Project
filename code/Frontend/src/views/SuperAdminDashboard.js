import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Building2,
  PlusCircle,
  UserPlus,
  Shield,
  School,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  User2
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import HeadingWithEffect from '../components/HeadingWithEffects';
import { Link } from 'react-router-dom';
import axios from 'axios';
import QuickAction from '../components/QuickAction';
import StatCard from '../components/StatCard';

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      organizationsCount: 0,
      usersCount: 0,
      adminsCount: 0,
      teachersCount: 0,
      studentsCount: 0
    },
    recentOrganizations: [],
    recentUsers: []
  });

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
        const token = localStorage.getItem('accessToken');
        
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND}/api/v1/superadmin/dashboard`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setDashboardData(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
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
      ) : error ? (
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <main className="ml-0 md:ml-[100px] p-6">
          <div className="">
            <HeadingWithEffect>Super Admin Dashboard</HeadingWithEffect>
            
            {/* Admin Info Card */}
            <div className="mt-8">
              <div className="bg-white p-6 rounded shadow-sm border border-brown/20">
                <div className="flex items-start gap-6">
                  <div className="h-24 w-24 rounded-lg bg-brown flex items-center justify-center">
                    <Shield size={40} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-brown">
                          Super Admin Portal
                        </h2>
                        <p className="text-brown/60 mt-1">
                          Manage organizations, users, and system settings
                        </p>
                      </div>
                    </div>
                    
                    {/* Summary Section */}
                    <div className="mt-4">
                      <h3 className="font-semibold text-brown mb-2">System Overview</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li className="text-brown/70">Total Organizations: {dashboardData.stats.organizationsCount || 0}</li>
                        <li className="text-brown/70">Total Users: {dashboardData.stats.usersCount || 0}</li>
                        <li className="text-brown/70">Platform Administrators: {dashboardData.stats.adminsCount || 0}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <StatCard 
                icon={Shield} 
                title="Total Admins" 
                value={dashboardData.stats.adminsCount} 
                color="bg-violet-500"
              />
              <StatCard 
                icon={School} 
                title="Total Teachers" 
                value={dashboardData.stats.teachersCount} 
                color="bg-green-500"
              />
              <StatCard 
                icon={Users} 
                title="Total Students" 
                value={dashboardData.stats.studentsCount} 
                color="bg-blue-500"
              />
            </div>
            
            {/* Quick Actions */}
            <h2 className="text-2xl font-semibold text-brown mt-8 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickAction
                icon={Building2}
                title="Add Organization"
                description="Create a new organization"
                to="/superadmin/organizations/add"
                color="bg-blue-500"
              />
              <QuickAction
                icon={UserPlus}
                title="Assign Admin"
                description="Assign admin to an organization"
                to="/superadmin/admins"
                color="bg-blue-500"
              />
              <QuickAction
                icon={Building2}
                title="Manage Organizations"
                description="View and manage all organizations"
                to="/superadmin/organizations"
                color="bg-blue-500"
              />
            </div>

            {/* Recent Organizations Section */}
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-sm border border-brown/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brown/10">
                    <thead className="bg-cream">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-brown/10">
                      {dashboardData.recentOrganizations.map(org => (
                        <tr key={org._id} className="hover:bg-cream transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {org.logo ? (
                                <img src={org.logo} alt={org.name} className="h-10 w-10 rounded-full mr-3 border border-brown/20" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-cream flex items-center justify-center mr-3">
                                  <Building2 size={20} className="text-brown" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-brown">{org.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-brown/70 truncate max-w-xs">
                              {org.description || "No description"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-brown/70">
                              {new Date(org.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dashboardData.recentOrganizations.length === 0 && (
                  <div className="text-center py-12 text-brown/70 bg-cream">
                    <Building2 size={40} className="text-yellow-500 mx-auto mb-3" />
                    <p>No organizations found</p>
                    <Link 
                      to="/superadmin/organizations/create" 
                      className="mt-3 inline-flex items-center text-brown hover:text-brown/80"
                    >
                      <PlusCircle size={16} className="mr-1" /> Create your first organization
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users Section */}
            <div className="mt-8 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-brown/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brown/10">
                    <thead className="bg-cream">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-brown uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-brown/10">
                      {dashboardData.recentUsers.map(user => (
                        <tr key={user._id} className="hover:bg-cream transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-cream flex items-center justify-center mr-3 text-brown font-medium">
                                {(user.name || user.email)[0].toUpperCase()}
                              </div>
                              <div className="text-sm font-medium text-brown">
                                {user.name || user.email.split('@')[0]}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-brown/70">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${user.role === 'admin' ? 'bg-brown text-white' : 
                                user.role === 'teacher' ? 'bg-brown/80 text-white' : 
                                user.role === 'student' ? 'bg-yellow-500 text-brown' : 
                                user.role === 'superadmin' ? 'bg-brown text-white' : 
                                'bg-cream text-brown'}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-brown/70">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dashboardData.recentUsers.length === 0 && (
                  <div className="text-center py-12 text-brown/70 bg-cream">
                    <Users size={40} className="text-yellow-500 mx-auto mb-3" />
                    <p>No users found</p>
                    <Link 
                      to="/superadmin/users/invite" 
                      className="mt-3 inline-flex items-center text-brown hover:text-brown/80"
                    >
                      <UserPlus size={16} className="mr-1" /> Invite users
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default SuperAdminDashboard;