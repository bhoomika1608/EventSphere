import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { FiMenu, FiX, FiCalendar, FiUser, FiLogOut, FiGrid, FiSun, FiMoon } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'organizer') return '/organizer';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group decoration-transparent">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-pink-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
            <HiSparkles className="text-white text-lg" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900 dark:text-white tracking-tight">
            Event<span className="text-gradient">Sphere</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <FiCalendar className="text-base" /> Events
          </Link>

          {isAuthenticated && (
            <Link to={getDashboardPath()} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(getDashboardPath()) ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <FiGrid className="text-base" /> Dashboard
            </Link>
          )}
        </div>

        {/* Auth & Theme buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {isDarkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[100px] leading-tight">
                    {user?.name}
                  </span>
                  <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${user?.role === 'admin' ? 'text-rose-500' : user?.role === 'organizer' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                <FiLogOut className="text-base" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
              <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 dark:text-slate-400">
            {isDarkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
            {menuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0f19] px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium">
            <FiCalendar /> All Events
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                <FiGrid /> Dashboard
              </Link>
              <div className="px-3 py-2 flex justify-between items-center bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center font-medium text-slate-700 dark:text-slate-300">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 rounded-lg bg-brand-600 text-white text-center font-medium shadow-md shadow-brand-500/20">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
