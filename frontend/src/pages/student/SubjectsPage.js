import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t } from '../../utils/i18n';

export const SubjectsPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
    api.get('/student/subjects').then(r => setSubjects(r.data.data));
  }, []);

  const subjectColors = [
    'from-orange-400 to-red-400', 'from-green-400 to-teal-400',
    'from-blue-400 to-indigo-400', 'from-purple-400 to-pink-400',
    'from-yellow-400 to-orange-400', 'from-pink-400 to-rose-400',
  ];

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl text-gray-800 mb-6">📚 {t(lang, 'subjects')}</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((s, i) => (
            <motion.div key={s.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', bounce: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link to={`/student/subjects/${s.id}/chapters`}
                className={`block bg-gradient-to-br ${subjectColors[i % subjectColors.length]} rounded-3xl p-6 text-white shadow-md text-center card-hover`}>
                <div className="text-5xl mb-3">{s.icon}</div>
                <div className="font-display text-xl">{lang === 'hi' && s.nameHi ? s.nameHi : lang === 'pa' && s.namePa ? s.namePa : s.name}</div>
                <div className="text-sm opacity-80 mt-1">{s._count?.chapters || 0} chapters</div>
                <div className="mt-3 bg-white/20 rounded-xl py-2 text-sm font-bold">Start Learning →</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default SubjectsPage;
