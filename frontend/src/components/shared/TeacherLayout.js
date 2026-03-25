import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TeacherLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/teacher/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/teacher/students', icon: '👦', label: 'Students' },
    { path: '/teacher/create-quiz', icon: '🎯', label: 'Create Quiz' },
    { path: '/teacher/analytics', icon: '📊', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-kids flex">
      <aside className="w-20 md:w-60 bg-white shadow-card flex flex-col py-6 px-3 gap-2 fixed h-full z-20">
        <div className="flex items-center gap-2 px-2 mb-4">
          <span className="text-3xl">👩‍🏫</span>
          <span className="font-display text-xl text-blue-600 hidden md:block">Teacher Panel</span>
        </div>
        {navItems.map(item => (
          <Link key={item.path} to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all font-semibold text-sm ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block">{item.label}</span>
          </Link>
        ))}
        <div className="mt-auto">
          <div className="px-3 py-2 text-sm text-gray-500 hidden md:block font-semibold truncate">{user?.name}</div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-500 font-semibold text-sm">
            <span className="text-xl">🚪</span>
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>
      <main className="ml-20 md:ml-60 flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default TeacherLayout;
