import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, UserIcon, LogOutIcon,
  Building2, BookOpen, LayoutDashboard,
  GraduationCap, ChevronRight, ChevronLeft,
  Users, User2Icon
} from "lucide-react";

const UnifiedNavbar = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("accessToken");
      window.location.href = "/auth";
    } catch (err) {
      console.error("Error logging out:", err.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative h-12
        ${isActive(to) ? 'bg-brown text-cream' : 'text-brown hover:bg-brown/10 hover:text-brown-dark'}`}
    >
      <Icon size={20} className={`${isActive(to) ? 'text-yellow' : 'text-brown group-hover:text-brown-dark'} flex-shrink-0`} />
      <span className={`font-medium whitespace-nowrap transition-all duration-200 
        ${isCollapsed ? 'md:opacity-0 md:invisible md:max-w-0' : 'md:opacity-100 md:visible md:max-w-[200px]'}`}>
        {children}
      </span>
    </Link>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-cream p-2 rounded-lg shadow-lg text-brown hover:text-yellow transition-all duration-300"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full bg-cream border-r border-brown/20 z-40 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-[80px]' : 'md:w-[280px]'}
          w-[280px]`}
      >
        <div className="p-6 border-b border-brown/20">
          <Link to="/home" className="flex items-center gap-2">
            <GraduationCap size={32} className="text-yellow flex-shrink-0" />
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap
              ${isCollapsed ? 'md:opacity-0 md:invisible md:max-w-0' : 'md:opacity-100 md:visible md:max-w-[200px]'}`}>
              <h1 className="text-xl font-bold text-brown">Eklavya</h1>
              <p className="text-sm text-brown/60">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Panel</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {userRole === 'superadmin' && (
            <>
              <NavLink to="/superadmin/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/superadmin/organizations" icon={Building2}>Organizations</NavLink>
              <NavLink to="/superadmin/admins" icon={Users}>Admins</NavLink>
            </>
          )}
          {userRole === 'teacher' && (
            <>
              <NavLink to="/organisations_teacher" icon={Building2}>Organizations</NavLink>
              <NavLink to="/TeacherCourses" icon={BookOpen}>My Courses</NavLink>
            </>
          )}
          {userRole === 'admin' && (
            <>
              <NavLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/admin/organization" icon={Building2}>Organization</NavLink>
              <NavLink to="/admin/courses" icon={BookOpen}>Courses</NavLink>
              <NavLink to="/admin/teachers" icon={Users}>Teachers</NavLink>
              <NavLink to="/admin/requests" icon={User2Icon}>Students</NavLink>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-brown/20">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link
              to="/me"
              className="w-10 h-10 rounded-full bg-yellow/20 flex items-center justify-center flex-shrink-0 hover:bg-yellow/30 transition-colors"
            >
              <UserIcon size={20} className="text-yellow" />
            </Link>
            <div className={`flex-1 transition-all duration-300 overflow-hidden whitespace-nowrap
              ${isCollapsed ? 'md:opacity-0 md:invisible md:max-w-0' : 'md:opacity-100 md:visible md:max-w-[200px]'}`}>
              <Link
                to="/me"
                className="text-sm font-medium text-brown hover:text-yellow transition-colors duration-200 block"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-brown/60 hover:text-yellow transition-colors duration-200 mt-1"
              >
                <LogOutIcon size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default UnifiedNavbar;