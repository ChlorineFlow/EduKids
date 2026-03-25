import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t } from '../../utils/i18n';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
    api.get('/student/leaderboard').then(r => setBoard(r.data.data));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="text-7xl">🏆</span>
          </motion.div>
          <h1 className="font-display text-4xl text-gray-800 mt-3">{t(lang, 'leaderboard')}</h1>
          <p className="text-gray-500">Class {user?.student?.class} Top Students</p>
        </div>

        {board.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-4xl shadow-card">
            <p className="text-gray-400">No scores yet. Be the first! 🌟</p>
          </div>
        ) : (
          <div className="space-y-3">
            {board.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 rounded-3xl p-4 shadow-card ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                  i === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800' :
                  i === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                  'bg-white text-gray-700'
                }`}
              >
                <span className="text-3xl font-display w-8">{i < 3 ? medals[i] : i + 1}</span>
                <div className="flex-1">
                  <div className="font-bold">{entry.student?.user?.name}</div>
                  <div className="text-xs opacity-70 flex gap-3">
                    <span>⭐ {entry.stars}</span>
                    <span>🏅 {entry.badges}</span>
                  </div>
                </div>
                <div className="font-display text-2xl">{entry.score}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default LeaderboardPage;
