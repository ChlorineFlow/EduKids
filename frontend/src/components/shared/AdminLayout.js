import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Manage Users' },
    { path: '/admin/content', icon: '📝', label: 'Manage Content' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 font-kids flex">
      <aside className="w-20 md:w-60 bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col py-6 px-3 gap-2 fixed h-full z-20">
        <div className="flex items-center gap-2 px-2 mb-6">
          <span className="text-3xl">⚙️</span>
          <span className="font-display text-xl text-white hidden md:block">Admin Panel</span>
        </div>
        {navItems.map(item => (
          <Link key={item.path} to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all font-semibold text-sm ${
              location.pathname === item.path
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block">{item.label}</span>
          </Link>
        ))}
        <div className="mt-auto">
          <div className="px-3 py-2 text-gray-400 text-xs hidden md:block">{user?.email}</div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-400 hover:bg-red-900 hover:text-red-300 font-semibold text-sm">
            <span className="text-xl">🚪</span>
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>
      <main className="ml-20 md:ml-60 flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
