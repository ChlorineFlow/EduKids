import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/shared/AdminLayout';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: '👦', label: 'Students', value: data?.stats?.students || 0, color: 'from-blue-400 to-blue-600' },
    { icon: '👩‍🏫', label: 'Teachers', value: data?.stats?.teachers || 0, color: 'from-purple-400 to-purple-600' },
    { icon: '📚', label: 'Subjects', value: data?.stats?.subjects || 0, color: 'from-orange-400 to-orange-600' },
    { icon: '🎯', label: 'Quizzes', value: data?.stats?.quizzes || 0, color: 'from-green-400 to-green-600' },
    { icon: '📝', label: 'Content Items', value: data?.stats?.contents || 0, color: 'from-pink-400 to-pink-600' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-4xl p-6 mb-6 text-white">
          <h1 className="font-display text-4xl">⚙️ Admin Dashboard</h1>
          <p className="opacity-70 mt-1">Manage EduKids Platform</p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }}
              className={`bg-gradient-to-br ${s.color} text-white rounded-3xl p-4 text-center shadow-md`}
            >
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="font-display text-2xl">{s.value}</div>
              <div className="text-xs opacity-80 font-semibold">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div whileHover={{ scale: 1.02 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <Link to="/admin/users" className="block bg-white rounded-3xl p-5 shadow-card card-hover">
              <div className="text-4xl mb-2">👥</div>
              <div className="font-display text-xl text-gray-800">Manage Users</div>
              <div className="text-sm text-gray-500 mt-1">View, manage & delete users</div>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link to="/admin/content" className="block bg-white rounded-3xl p-5 shadow-card card-hover">
              <div className="text-4xl mb-2">📝</div>
              <div className="font-display text-xl text-gray-800">Manage Content</div>
              <div className="text-sm text-gray-500 mt-1">Add subjects, chapters & content</div>
            </Link>
          </motion.div>
        </div>

        {/* Recent students */}
        {data?.recentStudents?.length > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="bg-white rounded-4xl p-6 shadow-card">
            <h2 className="font-display text-2xl text-gray-800 mb-4">🆕 Recent Sign-ups</h2>
            <div className="space-y-3">
              {data.recentStudents.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    {u.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email} • Class {u.student?.class}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${u.verified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {u.verified ? '✅ Verified' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
