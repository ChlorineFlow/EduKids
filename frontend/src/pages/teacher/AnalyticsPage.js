import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import TeacherLayout from '../../components/shared/TeacherLayout';
import api from '../../utils/api';

const COLORS = ['#FF6B35', '#FFD700', '#7C3AED', '#14B8A6', '#22C55E', '#3B82F6'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/analytics')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <TeacherLayout>
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-5xl">📊</span>
        </motion.div>
      </div>
    </TeacherLayout>
  );

  const classData = data?.classStats?.map(c => ({
    name: `Class ${c.class}`,
    students: c._count._all
  })) || [];

  const langData = data?.languageStats?.map(l => ({
    name: l.language === 'en' ? '🇬🇧 English' : l.language === 'hi' ? '🇮🇳 Hindi' : '🟡 Punjabi',
    value: l._count._all
  })) || [];

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl text-gray-800 mb-6">📊 Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Students by Class */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-4xl p-6 shadow-card">
            <h2 className="font-display text-xl text-gray-700 mb-4">Students per Class</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontFamily: 'Nunito', fontSize: 12 }} />
                <YAxis tick={{ fontFamily: 'Nunito', fontSize: 12 }} />
                <Tooltip contentStyle={{ fontFamily: 'Nunito', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="students" fill="#FF6B35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Language Distribution */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-4xl p-6 shadow-card">
            <h2 className="font-display text-xl text-gray-700 mb-4">Language Preferences</h2>
            {langData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={langData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {langData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: 'Nunito', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">No data yet</div>
            )}
          </motion.div>
        </div>

        {/* Top Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-4xl p-6 shadow-card">
            <h2 className="font-display text-xl text-gray-700 mb-4">🏆 Top 5 Students</h2>
            <div className="space-y-3">
              {data?.topStudents?.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-display text-sm ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-sm">{s.student?.user?.name}</div>
                    <div className="text-xs text-gray-500">Class {s.class} • ⭐ {s.stars}</div>
                  </div>
                  <div className="font-display text-lg text-orange-500">{s.score}</div>
                </div>
              ))}
              {!data?.topStudents?.length && <p className="text-gray-400 text-sm">No students yet</p>}
            </div>
          </motion.div>

          {/* Students Needing Help */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-4xl p-6 shadow-card">
            <h2 className="font-display text-xl text-gray-700 mb-4">⚠️ Needs Attention</h2>
            <div className="space-y-3">
              {data?.weakStudents?.length > 0 ? data.weakStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl">
                  <span className="text-2xl">🆘</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-sm">{s.student?.user?.name}</div>
                    <div className="text-xs text-gray-500">Class {s.class} • Score: {s.score}</div>
                  </div>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">Low Score</span>
                </div>
              )) : (
                <div className="text-center py-8">
                  <span className="text-4xl">🎉</span>
                  <p className="text-gray-500 text-sm mt-2">All students are doing great!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default AnalyticsPage;
