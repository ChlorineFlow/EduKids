import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.user.role === 'STUDENT') navigate('/student/dashboard');
      else if (data.user.role === 'TEACHER') navigate('/teacher/dashboard');
      else if (data.user.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.needsVerification) {
        navigate('/verify-otp', { state: { email: form.email } });
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center p-4 font-kids">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-white rounded-4xl shadow-kids p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-3"
          >
            🎓
          </motion.div>
          <h1 className="font-display text-4xl text-orange-500">Welcome Back!</h1>
          <p className="text-gray-500 mt-1">Let's continue learning! 📚</p>
        </div>

        {error && (
          <motion.div
            initial={{ x: -10 }} animate={{ x: 0 }}
            className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-3 mb-4 text-sm font-semibold text-center"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-1 text-sm">📧 Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="your@email.com"
              className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1 text-sm">🔒 Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="••••••••"
              className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 transition-colors"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 mt-2 disabled:opacity-60"
          >
            {loading ? '🔄 Logging in...' : '🚀 Let\'s Go!'}
          </motion.button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-500 font-bold hover:underline">Sign up free! 🎉</Link>
          </p>
          <div className="flex gap-2 justify-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            <span>Demo: student@edukids.com</span>
            <span>|</span>
            <span>Student@123</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
