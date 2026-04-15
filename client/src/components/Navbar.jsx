import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api';

export default function Navbar() {
  const { user, logout, unreadCount, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.get('/matches/incoming').then(res => {
      setPendingCount(res.data.filter(r => r.status === 'pending').length);
    }).catch(() => {});
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label, badge = null) => (
    <Link to={to}
      className={`relative text-sm font-medium transition-colors pb-0.5
        ${isActive(to)
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>
      {label}
      {badge}
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700 px-6 py-0 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
          Campus <span className="text-blue-600 dark:text-blue-400">LinkUp</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-7">
          {user ? (
            <>
              {navLink('/', 'Home')}
              {navLink('/dashboard', 'Dashboard')}
              {navLink('/feed', 'Explore')}
              {navLink('/create', 'Post Trip')}
              {navLink('/chats', 'Messages',
                (unreadCount > 0 || pendingCount > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : pendingCount}
                  </span>
                )
              )}
            </>
          ) : (
            <>
              {navLink('/login', 'Login')}
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Dark/Light toggle */}
          <button onClick={() => setDarkMode(d => !d)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout}
                className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
