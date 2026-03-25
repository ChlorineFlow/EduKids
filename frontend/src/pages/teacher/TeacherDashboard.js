import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import TeacherLayout from '../../components/shared/TeacherLayout';
import api from '../../utils/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/teacher/dashboard').then(r => setData(r.data.data));
  }, []);

  const stats = [
    { icon: '👦', label: 'Students', value: data?.stats?.studentCount || 0, color: 'from-blue-400 to-indigo-500' },
    { icon: '🎯', label: 'Quizzes', value: data?.stats?.quizCount || 0, color: 'from-purple-400 to-pink-500' },
    { icon: '💬', label: 'Remarks', value: data?.stats?.remarkCount || 0, color: 'from-green-400 to-teal-500' },
  ];

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-4xl p-6 mb-6 text-white">
          <h1 className="font-display text-4xl">Welcome, {user?.name}! 👩‍🏫</h1>
          <p className="opacity-80 mt-1">Manage your students and track their progress.</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${s.color} text-white rounded-3xl p-5 text-center shadow-md`}
            >
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className="font-display text-3xl">{s.value}</div>
              <div className="text-sm opacity-80 font-semibold">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { to: '/teacher/students', icon: '👦', title: 'View Students', desc: 'See all students & add remarks' },
            { to: '/teacher/create-quiz', icon: '🎯', title: 'Create Quiz', desc: 'Build new quizzes & MCQs' },
            { to: '/teacher/analytics', icon: '📊', title: 'Analytics', desc: 'Charts & student performance' },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <Link to={item.to} className="block bg-white rounded-3xl p-5 shadow-card card-hover">
                <div className="text-4xl mb-2">{item.icon}</div>
                <div className="font-bold text-gray-800 text-lg">{item.title}</div>
                <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {data?.students?.length > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl p-6 shadow-card">
            <h2 className="font-display text-2xl text-gray-800 mb-4">Recent Students</h2>
            <div className="space-y-3">
              {data.students.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                    {s.user?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{s.user?.name}</div>
                    <div className="text-xs text-gray-500">Class {s.class} • Score: {s.leaderboard?.score || 0}</div>
                  </div>
                  <span>⭐ {s.leaderboard?.stars || 0}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
