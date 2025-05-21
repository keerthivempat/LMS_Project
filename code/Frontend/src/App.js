import './App.css';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CardGrid from './views/Oraganisations.js';
import Home3 from './views/Home3.js';
import AuthPage from './views/AuthPage.js';
import MyCourses from './views/MyCourses.js';
import Navbar from './components/Navbar.js';
import TeacherNavbar from './components/TeacherNavbar.js';
import AdminNavbar from './components/AdminNavbar.js';
import SuperAdminNavbar from './components/SuperAdminNavbar.js';
import Organ_det from './views/Organ_det.js';
import CourseDet from './views/CourseDet.js';
import Dashboard from './views/Dashboard.js';
import Profile from './views/Profile.js';
import EmailVerification from './views/EmailVerification';
import MyOrganizations from './views/MyOrganizations';
import OrganizationDetails from './views/OrganizationDetails';
import JoinedOrganizationDetails from './views/JoinedOrganizationDetails';
import TeacherOrganisation from './views/TeacherOrganisation.js';
import JoinedTeacherOrganizations from './views/JoinedTeacherOrganizations.js';
import LoadingSpinner from './components/LoadingSpinner';
import TeacherCourses from './views/TeacherCourses';
import TeacherCourseDetail from './views/TeacherCourseDetail';
import TeacherSubmissions from './views/TeacherSubmissions';
import CourseJoin from './views/CourseJoin';
import AdminDashboard from './views/AdminDashboard';
import AdminOrganization from './views/AdminOrganization';
import AdminCourses from './views/AdminCourses';
import AdminEnrollmentRequests from './views/AdminEnrollmentRequests';
import AdminTeachers from './views/AdminTeachers';
import CourseTeachers from './views/CourseTeachers';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import SuperAdminOrganizations from './views/SuperAdminOrganizations';
import SuperAdminAdmins from './views/SuperAdminAdmins';
import SuperAdminProfile from './views/SuperAdminProfile';
import TeacherEnrollmentRequests from './views/TeacherEnrollmentRequests';
import AddOrganization from './views/AddOrganization';

function RouteGuard({ isLoggedIn, allowedRoles, userRole, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if user's role is not allowed for this section
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    setIsLoggedIn(token !== null);
    setUserRole(role);
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      {/* Render different Navbars based on role */}
      {isLoggedIn && (
        userRole === 'student' || userRole === 'user' ? <Navbar /> :
        userRole === 'teacher' ? <TeacherNavbar /> :
        userRole === 'admin' ? <AdminNavbar /> :
        userRole === 'superadmin' ? <SuperAdminNavbar /> : null
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home3 />} />
        <Route path="/home" element={<Home3 />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/me" element={<Profile/>} />


        {/* Student Routes */}
        <Route
          path="/organisations"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student', 'user']} userRole={userRole}>
              <CardGrid />
            </RouteGuard>
          }
        />
        <Route
          path="/MyCourses"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student', 'user']} userRole={userRole}>
              <MyCourses />
            </RouteGuard>
          }
        />
        <Route
          path="/MyCourses/:id"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student']} userRole={userRole}>
              <CourseDet />
            </RouteGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student']} userRole={userRole}>
              <Dashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/me"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student']} userRole={userRole}>
              <Profile />
            </RouteGuard>
          }
        />
        <Route
          path="/my-organizations"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student']} userRole={userRole}>
              <MyOrganizations />
            </RouteGuard>
          }
        />
        <Route
          path="/organization/:orgId"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student']} userRole={userRole}>
              <OrganizationDetails />
            </RouteGuard>
          }
        />
        <Route
          path="/joined-organization/:orgId"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['student']} userRole={userRole}>
              <JoinedOrganizationDetails />
            </RouteGuard>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/organisations_teacher"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['teacher']} userRole={userRole}>
              <TeacherOrganisation />
            </RouteGuard>
          }
        />
        <Route
          path="/me_teacher"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['teacher']} userRole={userRole}>
              <Profile />
            </RouteGuard>
          }
        />
        <Route
          path="/teacher-joined-organization/:orgId"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['teacher']} userRole={userRole}>
              <JoinedTeacherOrganizations />
            </RouteGuard>
          }
        />
        <Route
          path="/TeacherCourses"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['teacher']} userRole={userRole}>
              <TeacherCourses />
            </RouteGuard>
          }
        />
        <Route
          path="/TeacherCourses/:id"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['teacher']} userRole={userRole}>
              <TeacherCourseDetail />
            </RouteGuard>
          }
        />
        // Add this to your routes
        <Route path="/teacher/course-requests/:courseId" element={
           <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['teacher']} userRole={userRole}>
          <TeacherEnrollmentRequests />
          </RouteGuard>
           }/>
        <Route
          path="/assignment/:assignmentId/submissions"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['teacher']} userRole={userRole}>
              <TeacherSubmissions />
            </RouteGuard>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['admin']} userRole={userRole}>
              <AdminDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/organization"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['admin']} userRole={userRole}>
              <AdminOrganization />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['admin']} userRole={userRole}>
              <AdminCourses />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['admin']} userRole={userRole}>
              <AdminEnrollmentRequests />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['admin']} userRole={userRole}>
              <AdminTeachers/>
            </RouteGuard>
          }
        />
        <Route
          path="/admin/courses/:courseId/teachers"
          element={<CourseTeachers />}
        />

        {/* Super Admin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['superadmin']} userRole={userRole}>
              <SuperAdminDashboard />
            </RouteGuard>
          }
        />
  <Route path="/superadmin/organizations/add" element={
    <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['superadmin']} userRole={userRole}>
      <AddOrganization />
      </RouteGuard>
    } />
    
        <Route
          path="/superadmin/organizations"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['superadmin']} userRole={userRole}>
              <SuperAdminOrganizations />
            </RouteGuard>
          }
        />
        <Route
          path="/superadmin/admins"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['superadmin']} userRole={userRole}>
              <SuperAdminAdmins />
            </RouteGuard>
          }
        />
        <Route
          path="/superadmin/profile"
          element={
            <RouteGuard isLoggedIn={isLoggedIn} allowedRoles={['superadmin']} userRole={userRole}>
              <SuperAdminProfile />
            </RouteGuard>
          }
        />

        {/* Course Join Route */}
        <Route
          path="/courses/:courseId/join"
          element={<CourseJoin />}
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="flex justify-center items-center h-screen">
              <p className="text-xl font-semibold">404 - Not Found</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
