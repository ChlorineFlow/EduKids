import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t } from '../../utils/i18n';

const ChaptersPage = () => {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const [chapters, setChapters] = useState([]);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
    api.get(`/student/chapters/${subjectId}`).then(r => setChapters(r.data.data));
  }, [subjectId]);

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        <Link to="/student/subjects" className="text-orange-500 font-bold mb-4 inline-block hover:underline">
          ← {t(lang, 'back')}
        </Link>
        <h1 className="font-display text-4xl text-gray-800 mb-6">📖 {t(lang, 'chapters')}</h1>
        <div className="space-y-3">
          {chapters.map((ch, i) => (
            <motion.div key={ch.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <Link to={`/student/chapters/${ch.id}/content`}
                className="flex items-center gap-4 bg-white rounded-3xl p-5 shadow-card hover:shadow-kids transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center text-white font-display text-xl">
                  {ch.order}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{lang === 'hi' && ch.titleHi ? ch.titleHi : lang === 'pa' && ch.titlePa ? ch.titlePa : ch.title}</div>
                </div>
                <span className="text-2xl">📖</span>
              </Link>
            </motion.div>
          ))}
          {chapters.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📭</div>
              <p>No chapters available yet!</p>
            </div>
          )}
        </div>

        {/* Quiz Link */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Link to={`/student/subjects/${subjectId}/quizzes`}
            className="block w-full btn-kids bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center text-xl py-4 hover:scale-102 transition-transform">
            🎯 {t(lang, 'startQuiz')}
          </Link>
        </motion.div>
      </div>
    </StudentLayout>
  );
};

export default ChaptersPage;
