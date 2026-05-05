import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const OtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const refs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const name = location.state?.name || 'Friend';
  useEffect(() => {
  if (!email) {
    navigate('/signup');
  }
}, [email, navigate]);
  const handleInput = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp: code });
      setSuccess('🎉 Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      setSuccess('📧 New OTP sent! Check your email.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center p-4 font-kids">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-white rounded-4xl shadow-kids p-8 w-full max-w-md text-center"
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          📧
        </motion.div>
        <h1 className="font-display text-4xl text-orange-500 mb-2">Check Your Email!</h1>
        <p className="text-gray-500 mb-1">Hi <strong>{name}</strong>! We sent a 6-digit code to:</p>
        <p className="text-orange-500 font-bold mb-6 text-sm">{email}</p>

        {error && (
          <motion.div initial={{ x: -10 }} animate={{ x: 0 }}
            className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-3 mb-4 text-sm font-semibold">
            ⚠️ {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-green-50 border-2 border-green-200 text-green-600 rounded-2xl p-3 mb-4 text-sm font-semibold">
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <motion.input
                key={i}
                ref={el => refs.current[i] = el}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                maxLength={1}
                whileFocus={{ scale: 1.1 }}
                className="w-12 h-14 text-center text-2xl font-bold border-3 border-orange-200 rounded-2xl focus:outline-none focus:border-orange-500 bg-orange-50 transition-colors"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 disabled:opacity-60"
          >
            {loading ? '🔄 Verifying...' : '✅ Verify OTP'}
          </motion.button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Didn't receive code?{' '}
          <button onClick={resendOtp} disabled={resending}
            className="text-orange-500 font-bold hover:underline disabled:opacity-50">
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">⏰ OTP expires in 5 minutes</p>
      </motion.div>
    </div>
  );
};

export default OtpPage;
