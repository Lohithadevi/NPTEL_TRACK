import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import socket from '../socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    return token && u ? JSON.parse(u) : null;
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    socket.emit('register', user.id);
    api.get('/matches/unread').then(res => setUnreadCount(res.data.count)).catch(() => {});
    socket.on('unreadCount', (count) => setUnreadCount(count));
    return () => socket.off('unreadCount');
  }, [user]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, unreadCount, setUnreadCount, darkMode, setDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
