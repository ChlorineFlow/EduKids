import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t, LANGUAGES } from '../../utils/i18n';

const StatCard = ({ icon, value, label, color, delay }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: 'spring', bounce: 0.4 }}
    className={`bg-gradient-to-br ${color} text-white rounded-3xl p-5 shadow-md card-hover`}
  >
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-3xl font-display">{value}</div>
    <div className="text-sm opacity-80 mt-1 font-semibold">{label}</div>
  </motion.div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
  Promise.all([
    api.get('/student/dashboard'),
    api.get('/student/quiz-results')
  ])
    .then(([dashRes, quizRes]) => {
      setData({
        ...dashRes.data.data,
        quizResults: quizRes.data.data || []
      });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);

  const handleClassChange = async (newClass) => {
    try {
      await api.put('/student/settings', { class: parseInt(newClass) });
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <StudentLayout>
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-6xl">⭐</span>
        </motion.div>
      </div>
    </StudentLayout>
  );

  const lb = data?.leaderboard;
  const student = data?.student;

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto">
        {/* Welcome Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-4xl p-6 mb-6 text-white relative overflow-hidden"
        >
          <div className="absolute right-4 top-4 text-5xl opacity-20 select-none">🌟</div>
          <div className="absolute right-16 bottom-4 text-4xl opacity-20 select-none">📚</div>
          <h1 className="font-display text-4xl mb-1">
            {t(lang, 'hi')}, {user?.name}! 👋
          </h1>
          <p className="opacity-90 text-lg">Ready to learn something amazing today? 🚀</p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="bg-white/20 rounded-2xl px-4 py-2 text-sm font-bold">
              🎓 {t(lang, 'class')} {student?.class}
            </div>
            <div className="bg-white/20 rounded-2xl px-4 py-2 text-sm font-bold">
              🌐 {LANGUAGES.find(l => l.code === lang)?.nativeName}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon="⭐" value={lb?.stars || 0} label={t(lang, 'stars')} color="from-yellow-400 to-orange-400" delay={0.1} />
          <StatCard icon="🏅" value={lb?.badges || 0} label={t(lang, 'badges')} color="from-purple-400 to-pink-400" delay={0.2} />
          <StatCard icon="🎯" value={`${data?.stats?.accuracy || 0}%`} label={t(lang, 'accuracy')} color="from-teal-400 to-green-400" delay={0.3} />
          <StatCard icon="🏆" value={lb?.score || 0} label={t(lang, 'myScore')} color="from-blue-400 to-indigo-400" delay={0.4} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div whileHover={{ scale: 1.03 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link to="/student/subjects" className="block bg-white rounded-3xl p-6 shadow-card text-center card-hover">
              <div className="text-5xl mb-3">📚</div>
              <div className="font-display text-xl text-gray-800">{t(lang, 'subjects')}</div>
              <div className="text-sm text-gray-500 mt-1">Continue learning →</div>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <Link to="/student/leaderboard" className="block bg-white rounded-3xl p-6 shadow-card text-center card-hover">
              <div className="text-5xl mb-3">🏆</div>
              <div className="font-display text-xl text-gray-800">{t(lang, 'leaderboard')}</div>
              <div className="text-sm text-gray-500 mt-1">See top students →</div>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <Link to="/student/remarks" className="block bg-white rounded-3xl p-6 shadow-card text-center card-hover">
              <div className="text-5xl mb-3">💬</div>
              <div className="font-display text-xl text-gray-800">{t(lang, 'remarks')}</div>
              <div className="text-sm text-gray-500 mt-1">From your teachers →</div>
            </Link>
          </motion.div>
        </div>

        {/* Progress */}
        {data?.progress?.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            className="bg-white rounded-3xl p-6 shadow-card mb-6"
          >
            <h2 className="font-display text-2xl text-gray-800 mb-4">📊 {t(lang, 'progress')}</h2>
            <div className="space-y-3">
              {data.progress.map(p => (
                <div key={p.id}>
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-1">
                    <span>{p.subject?.icon} {p.subject?.name}</span>
                    <span>{Math.min(p.completionPercentage, 100)}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(p.completionPercentage, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-orange-400 to-yellow-400 h-3 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

{/* Quiz Results */}
{data?.quizResults?.length > 0 && (
  <motion.div
    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.85 }}
    className="bg-white rounded-3xl p-6 shadow-card mb-6"
  >
    <h2 className="font-display text-2xl text-gray-800 mb-4">🎯 My Quiz Results</h2>
    <div className="space-y-4">
      {data.quizResults.map((attempt, i) => (
        <div key={attempt.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-bold text-gray-800">{attempt.quiz?.title}</div>
              <div className="text-sm text-gray-500">
                {attempt.quiz?.subject?.icon} {attempt.quiz?.subject?.name}
                {attempt.quiz?.chapter && ` • ${attempt.quiz.chapter.title}`}
              </div>
            </div>
            <div className="text-right">
              {attempt.isReviewed ? (
                <div>
                  <div className="font-display text-2xl text-orange-500">
                    {attempt.earnedMarks}/{attempt.totalMarks}
                  </div>
                  <div className="text-xs text-gray-500">{attempt.percentage}%</div>
                </div>
              ) : (
                <div className="bg-yellow-50 text-yellow-600 text-xs font-bold px-3 py-1 rounded-full">
                  ⏳ Pending Review
                </div>
              )}
            </div>
          </div>

          {/* Stars */}
          <div className="flex gap-1 mb-2">
            {[1,2,3].map(s => (
              <span key={s} className={s <= attempt.stars ? 'text-yellow-400' : 'text-gray-200'}>⭐</span>
            ))}
          </div>

          {/* Teacher comments on individual answers */}
          {attempt.answers?.some(a => a.teacherComment) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-2">👩‍🏫 Teacher Feedback:</p>
              {attempt.answers.filter(a => a.teacherComment).map(ans => (
                <div key={ans.id} className="bg-blue-50 rounded-xl p-3 mb-2">
                  <p className="text-xs text-gray-600 font-semibold mb-1">
                    Q: {ans.question?.question?.substring(0, 60)}...
                  </p>
                  <p className="text-xs text-blue-700 font-semibold">
                    💬 {ans.teacherComment}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      ans.isCorrect ? 'bg-green-100 text-green-700' :
                      ans.isCorrect === false ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {ans.isCorrect ? '✅ Correct' : ans.isCorrect === false ? '❌ Wrong' : '⏳ Pending'}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">
                      Marks: {ans.marksObtained}/{ans.question?.marks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </motion.div>
)}

        {/* Change Class */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
          className="bg-white rounded-3xl p-6 shadow-card"
        >
          <h2 className="font-display text-2xl text-gray-800 mb-4">⚙️ {t(lang, 'selectClass')}</h2>
          <div className="flex flex-wrap gap-3">
            {[1,2,3,4,5,6].map(c => (
              <button key={c}
                onClick={() => handleClassChange(c)}
                className={`w-14 h-14 rounded-2xl font-display text-xl transition-all ${
                  student?.class === c
                    ? 'bg-orange-500 text-white shadow-kids scale-110'
                    : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
