import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t } from '../../utils/i18n';

const ContentPage = () => {
  const { chapterId } = useParams();
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
    api.get(`/student/content/${chapterId}`)
      .then(r => setContents(r.data.data))
      .finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) return (
    <StudentLayout>
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-5xl">📖</span>
        </motion.div>
      </div>
    </StudentLayout>
  );

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => window.history.back()} className="text-orange-500 font-bold mb-4 inline-block hover:underline">
          ← {t(lang, 'back')}
        </button>

        {contents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-4xl">
            <div className="text-7xl mb-4">📭</div>
            <h2 className="font-display text-2xl text-gray-600">No content available yet!</h2>
            <p className="text-gray-400 mt-2">Check back later or change your language settings.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {contents.map((c, i) => (
              <motion.div key={c.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-4xl p-8 shadow-card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {c.language === 'en' ? '🇬🇧 English' : c.language === 'hi' ? '🇮🇳 हिंदी' : '🟡 ਪੰਜਾਬੀ'}
                  </span>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{c.text}</p>
                {c.videoUrl && (
                  <div className="mt-4">
                    <a href={c.videoUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-red-50 text-red-500 rounded-2xl px-4 py-2 font-bold hover:bg-red-100 transition-colors">
                      ▶️ Watch Video
                    </a>
                  </div>
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-green-400 to-teal-400 rounded-4xl p-6 text-white text-center"
            >
              <div className="text-4xl mb-2">🌟</div>
              <h3 className="font-display text-2xl">Great job reading!</h3>
              <p className="opacity-90 mt-1">You earned progress points! Keep going!</p>
            </motion.div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default ContentPage;
