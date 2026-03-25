import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingEmoji = ({ emoji, delay, x, y }) => (
  <motion.div
    className="absolute text-4xl select-none pointer-events-none"
    style={{ left: x, top: y }}
    animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
    transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    {emoji}
  </motion.div>
);

const LandingPage = () => {
  const { user } = useAuth();

  const floatingEmojis = [
    { emoji: '⭐', x: '8%', y: '15%', delay: 0 },
    { emoji: '🚀', x: '88%', y: '10%', delay: 0.5 },
    { emoji: '🎨', x: '5%', y: '55%', delay: 1 },
    { emoji: '📚', x: '90%', y: '50%', delay: 1.5 },
    { emoji: '🎮', x: '15%', y: '80%', delay: 0.8 },
    { emoji: '🏅', x: '82%', y: '75%', delay: 1.2 },
    { emoji: '🌈', x: '45%', y: '5%', delay: 0.3 },
    { emoji: '🦁', x: '50%', y: '88%', delay: 0.7 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 overflow-hidden relative font-kids">
      {floatingEmojis.map((e, i) => <FloatingEmoji key={i} {...e} />)}

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <span className="text-4xl">🎓</span>
          <span className="font-display text-3xl text-orange-500">EduKids</span>
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-3"
        >
          {user ? (
            <Link to="/dashboard"
              className="btn-kids bg-orange-500 text-white hover:bg-orange-600">
              Go to Dashboard 🚀
            </Link>
          ) : (
            <>
              <Link to="/login"
                className="btn-kids bg-white text-orange-500 border-2 border-orange-400 hover:bg-orange-50">
                Login
              </Link>
              <Link to="/signup"
                className="btn-kids bg-orange-500 text-white hover:bg-orange-600">
                Sign Up Free! 🎉
              </Link>
            </>
          )}
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        >
          <div className="text-8xl mb-4">🎓</div>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-6xl md:text-7xl text-orange-500 mb-4"
        >
          EduKids
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-gray-700 mb-2"
        >
          Learn. Play. Grow! 🌱
        </motion.p>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-gray-500 mb-10 max-w-2xl"
        >
          A multilingual fun learning platform for Classes 1–6 with quizzes, AI buddy, and rewards! 
          <br />Available in <strong>English</strong>, <strong>हिंदी</strong>, and <strong>ਪੰਜਾਬੀ</strong> 🌐
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link to="/signup"
            className="btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-xl px-10 py-4 hover:scale-105 transition-transform shadow-kids">
            Start Learning! 🚀
          </Link>
          <Link to="/login"
            className="btn-kids bg-white text-orange-500 border-3 border-orange-400 text-xl px-10 py-4 hover:scale-105 transition-transform">
            I have an account →
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl"
        >
          {[
            { icon: '🤖', title: 'AI Buddy', desc: 'Ask anything anytime!' },
            { icon: '🏅', title: 'Earn Badges', desc: 'Win rewards & stars!' },
            { icon: '📊', title: 'Track Progress', desc: 'See how you grow!' },
            { icon: '🌐', title: '3 Languages', desc: 'Hindi, English, Punjabi' },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-3xl p-5 shadow-card text-center card-hover"
            >
              <div className="text-4xl mb-2">{f.icon}</div>
              <div className="font-bold text-gray-800 text-sm">{f.title}</div>
              <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
