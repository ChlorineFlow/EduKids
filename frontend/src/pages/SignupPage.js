import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const validate = (form) => {
  const errors = {};
  if (!form.name.match(/^[A-Za-z\s]+$/) || form.name.trim().length < 3)
    errors.name = 'Name must be at least 3 letters (alphabets only)';
  const age = parseInt(form.age);
  if (isNaN(age) || age < 5 || age > 15)
    errors.age = 'Age must be between 5 and 15';
  if (!form.dob || new Date(form.dob) >= new Date())
    errors.dob = 'Please enter a valid past date';
  if (!form.parentName.trim())
    errors.parentName = 'Guardian name is required';
  if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = 'Enter a valid email address';
  if (!/^\d{10}$/.test(form.phone))
    errors.phone = 'Phone must be exactly 10 digits';
  if (form.password.length < 6)
    errors.password = 'Password must be at least 6 characters';
  if (!/\d/.test(form.password))
    errors.password = 'Password must contain at least one number';
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = 'Passwords do not match';
  return errors;
};

const SignupPage = () => {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '', age: '', dob: '', parentName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');

    if (role === 'student') {
      const validationErrors = validate(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = role === 'student' ? '/auth/signup/student' : '/auth/signup/teacher';
      await api.post(endpoint, form);
      navigate('/verify-otp', { state: { email: form.email, name: form.name } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }) => errors[field] ? (
    <p className="text-red-500 text-xs mt-1 font-semibold">⚠️ {errors[field]}</p>
  ) : null;

  const inputClass = (field) =>
    `w-full border-2 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-orange-200'} rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 transition-colors`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center p-4 font-kids">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-white rounded-4xl shadow-kids p-8 w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌟</div>
          <h1 className="font-display text-4xl text-orange-500">Join EduKids!</h1>
          <p className="text-gray-500 text-sm mt-1">Create your free account 🎉</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-6 bg-orange-50 rounded-2xl p-1">
          {[
            { val: 'student', icon: '👦', label: 'Student' },
            { val: 'teacher', icon: '👩‍🏫', label: 'Teacher' },
          ].map(r => (
            <button
              key={r.val}
              type="button"
              onClick={() => setRole(r.val)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                role === r.val
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-orange-100'
              }`}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {serverError && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-3 mb-4 text-sm font-semibold text-center">
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-xs">👤 Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name"
                className={inputClass('name')} required />
              <FieldError field="name" />
            </div>
            {role === 'student' && (
              <div>
                <label className="block text-gray-700 font-bold mb-1 text-xs">🎂 Age *</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="5-15"
                  className={inputClass('age')} min="5" max="15" required />
                <FieldError field="age" />
              </div>
            )}
          </div>

          {role === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-xs">📅 Date of Birth *</label>
                  <input name="dob" type="date" value={form.dob} onChange={handleChange}
                    className={inputClass('dob')} max={new Date().toISOString().split('T')[0]} required />
                  <FieldError field="dob" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-xs">📱 Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10 digits"
                    className={inputClass('phone')} maxLength={10} required />
                  <FieldError field="phone" />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1 text-xs">👨‍👩‍👦 Guardian Name *</label>
                <input name="parentName" value={form.parentName} onChange={handleChange} placeholder="Parent/Guardian name"
                  className={inputClass('parentName')} required />
                <FieldError field="parentName" />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-700 font-bold mb-1 text-xs">📧 Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com"
              className={inputClass('email')} required />
            <FieldError field="email" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-xs">🔒 Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars"
                className={inputClass('password')} required />
              <FieldError field="password" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1 text-xs">🔒 Confirm *</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat"
                className={inputClass('confirmPassword')} required />
              <FieldError field="confirmPassword" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 mt-2 disabled:opacity-60"
          >
            {loading ? '🔄 Creating account...' : '🎉 Create My Account!'}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-bold hover:underline">Login →</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
