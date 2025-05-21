import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, UserIcon, LogOutIcon, 
  Building2, BookOpen, LayoutDashboard,
  GraduationCap, ChevronRight, ChevronLeft,
  ChevronFirst
} from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Ensure it starts as closed
  const [isCollapsed, setIsCollapsed] = useState(true); // Changed to true to start collapsed
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
        ${isActive(to) 
          ? 'bg-brown text-cream' 
          : 'text-brown hover:bg-brown/10 hover:text-brown-dark'
        }`}
      onClick={() => {
        if (window.innerWidth < 768) {
          setIsOpen(false); // Close the navbar on mobile after clicking a link
        }
      }}
    >
      <Icon size={20} className={`${isActive(to) ? 'text-yellow' : 'text-brown group-hover:text-brown-dark'} flex-shrink-0`} />
      <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:invisible' : ''}`}>
        {children}
      </span>
      {!isCollapsed && (
        <ChevronRight 
          size={16} 
          className={`ml-auto transform transition-transform duration-200
            ${isActive(to) ? 'opacity-100 text-yellow' : 'opacity-0 group-hover:opacity-100 group-hover:text-brown-dark'}
          `}
        />
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-brown text-cream text-sm rounded-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
          {children}
        </div>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`md:hidden fixed top-4 left-4 z-50 bg-cream p-2 rounded-lg shadow-lg text-brown hover:text-yellow transition-all duration-300`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`hidden md:flex fixed bottom-4 ${isCollapsed ? 'left-[50px]' : 'left-[175px]'} z-50 bg-cream p-2 rounded-full shadow-lg text-brown hover:text-yellow transition-all duration-300 items-center justify-center`}
      >
        {isCollapsed ? <ChevronFirst size={20} /> : <ChevronLeft size={20} />}
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-brown/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)} // Close the navbar when clicking outside
        />
      )}

      <aside 
        data-collapsed={isCollapsed}
        className={`
          fixed top-0 left-0 h-full bg-cream border-r border-brown/20 z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-[60px]' : 'md:w-[200px]'}  /* Reduced widths */
          w-[200px]  /* Default width for mobile */
        `}
      >
        <div className="p-4 border-b border-brown/20">
          <Link to="/home" className="flex items-center gap-2">
            <GraduationCap size={28} className="text-yellow flex-shrink-0" /> {/* Adjusted icon size */}
            <div className={`transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:invisible' : ''}`}>
              <h1 className="text-lg font-bold text-brown">Eklavya</h1> {/* Adjusted font size */}
              <p className="text-xs text-brown/60">Foundation</p> {/* Adjusted font size */}
            </div>
          </Link>
        </div>

        <nav className="p-1 space-y-2">
          <NavLink to="/organisations_teacher" icon={Building2}>Organisations</NavLink>
          <NavLink to="/TeacherCourses" icon={BookOpen}>My Courses</NavLink>
          {/* <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink> */}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-brown/20">
          <div className="flex items-center gap-2 px-3 py-2">
            <Link 
              to="/me_teacher" 
              className="w-8 h-8 rounded-full bg-yellow/20 flex items-center justify-center flex-shrink-0 hover:bg-yellow/30 transition-colors"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                }
              }}
            >
              <UserIcon size={18} className="text-yellow" /> {/* Adjusted icon size */}
            </Link>
            <div className={`flex-1 transition-opacity duration-200 ${isCollapsed ? 'md:opacity-0 md:invisible' : ''}`}>
              <Link 
                to="/me_teacher" 
                className="text-xs font-medium text-brown hover:text-yellow transition-colors duration-200 block"
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsOpen(false);
                  }
                }}
              >
                My Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-brown/60 hover:text-yellow transition-colors duration-200 mt-1"
              >
                <LogOutIcon size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;