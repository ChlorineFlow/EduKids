import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { t, LANGUAGES } from '../../utils/i18n';
import api from '../../utils/api';

const AIChatWidget = ({ lang, classLevel }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'buddy', text: `Hi! 👋 I'm Buddy, your AI teacher! Ask me anything about your studies! 🌟` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages(m => [...m, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { question });
      setMessages(m => [...m, { role: 'buddy', text: res.data.data.answer }]);
    } catch {
      setMessages(m => [...m, { role: 'buddy', text: "Oops! I couldn't connect right now. Please try again! 🙏" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: open ? 0 : [-3, 3, -3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-3xl"
      >
        {open ? '✖️' : '🤖'}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-28 right-6 z-50 bg-white rounded-3xl shadow-lg-colored w-80 h-96 flex flex-col overflow-hidden border-2 border-purple-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              <div>
                <div className="text-white font-bold font-display text-lg">Buddy AI</div>
                <div className="text-purple-100 text-xs">Your smart study helper!</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 font-kids">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'buddy' && <span className="text-xl mr-1 self-end">🤖</span>}
                  <div className={`max-w-[80%] p-2 rounded-2xl text-sm ${
                    m.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-purple-50 text-gray-700 rounded-bl-sm border border-purple-100'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <span className="text-xl mr-1">🤖</span>
                  <div className="bg-purple-50 rounded-2xl p-3 flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-purple-400 rounded-full loading-dot" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-purple-100 flex gap-2">
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={t(lang, 'typeQuestion')}
                className="flex-1 border-2 border-purple-200 rounded-2xl px-3 py-2 text-sm font-kids focus:outline-none focus:border-purple-400"
              />
              <button onClick={send}
                className="bg-purple-500 text-white rounded-2xl px-3 py-2 text-lg hover:bg-purple-600 transition-colors">
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = user?.student?.language || 'en';
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { path: '/student/dashboard', icon: '🏠', label: t(lang, 'dashboard') },
    { path: '/student/subjects', icon: '📚', label: t(lang, 'subjects') },
    { path: '/student/leaderboard', icon: '🏆', label: t(lang, 'leaderboard') },
    { path: '/student/remarks', icon: '💬', label: t(lang, 'remarks') },
  ];

  const handleLangChange = async (code) => {
    try {
      await api.put('/student/settings', { language: code });
      window.location.reload();
    } catch {}
    setLangOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 font-kids flex">
      {/* Sidebar */}
      <aside className="w-20 md:w-56 bg-white shadow-card flex flex-col py-6 px-3 gap-2 fixed h-full z-20">
        <Link to="/student/dashboard" className="flex items-center gap-2 px-2 mb-4">
          <span className="text-3xl">🎓</span>
          <span className="font-display text-xl text-orange-500 hidden md:block">EduKids</span>
        </Link>

        {navItems.map(item => (
          <Link key={item.path} to={item.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all font-semibold text-sm ${
              location.pathname === item.path
                ? 'bg-orange-500 text-white shadow-kids'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block">{item.label}</span>
          </Link>
        ))}

        <div className="mt-auto space-y-2">
          {/* Language switcher */}
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-semibold text-sm">
              <span className="text-xl">🌐</span>
              <span className="hidden md:block">{LANGUAGES.find(l => l.code === lang)?.nativeName}</span>
            </button>
            {langOpen && (
              <div className="absolute bottom-12 left-0 w-40 bg-white rounded-2xl shadow-lg border border-gray-100 z-30">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => handleLangChange(l.code)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 first:rounded-t-2xl last:rounded-b-2xl ${lang === l.code ? 'text-orange-500 font-bold' : 'text-gray-600'}`}>
                    {l.flag} {l.nativeName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-500 font-semibold text-sm">
            <span className="text-xl">🚪</span>
            <span className="hidden md:block">{t(lang, 'logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-20 md:ml-56 flex-1 p-6 overflow-auto">
        {children}
      </main>

      <AIChatWidget lang={lang} classLevel={user?.student?.class} />
    </div>
  );
};

export default StudentLayout;
