import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/shared/AdminLayout';
import api from '../../utils/api';

const Tab = ({ active, onClick, icon, label }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
      active ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-orange-50'
    }`}>
    <span>{icon}</span> {label}
  </button>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="block text-gray-700 font-bold mb-1 text-sm">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400";
const selectCls = "w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 bg-white";

const ManageContentPage = () => {
  const [tab, setTab] = useState('subject');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [subjectForm, setSubjectForm] = useState({ name: '', nameHi: '', namePa: '', class: '', isLang: false, icon: '📚' });
  const [chapterForm, setChapterForm] = useState({ subjectId: '', title: '', titleHi: '', titlePa: '', order: '1' });
  const [contentForm, setContentForm] = useState({ chapterId: '', text: '', videoUrl: '', language: 'en' });

  const showSuccess = (msg) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setSuccess(''); setTimeout(() => setError(''), 4000); };

  const submitSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.class) { showError('Subject name and class are required'); return; }
    setLoading(true);
    try {
      await api.post('/admin/subjects/add', { ...subjectForm, class: parseInt(subjectForm.class) });
      showSuccess(`✅ Subject "${subjectForm.name}" (Class ${subjectForm.class}) added!`);
      setSubjectForm({ name: '', nameHi: '', namePa: '', class: '', isLang: false, icon: '📚' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add subject');
    } finally { setLoading(false); }
  };

  const submitChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.subjectId || !chapterForm.title) { showError('Subject ID and title are required'); return; }
    setLoading(true);
    try {
      await api.post('/admin/chapters/add', { ...chapterForm, subjectId: parseInt(chapterForm.subjectId), order: parseInt(chapterForm.order) });
      showSuccess(`✅ Chapter "${chapterForm.title}" added!`);
      setChapterForm({ subjectId: '', title: '', titleHi: '', titlePa: '', order: '1' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add chapter');
    } finally { setLoading(false); }
  };

  const submitContent = async (e) => {
    e.preventDefault();
    if (!contentForm.chapterId || !contentForm.text) { showError('Chapter ID and content text are required'); return; }
    setLoading(true);
    try {
      await api.post('/admin/content/add', { ...contentForm, chapterId: parseInt(contentForm.chapterId) });
      showSuccess(`✅ Content added in ${contentForm.language === 'en' ? 'English' : contentForm.language === 'hi' ? 'Hindi' : 'Punjabi'}!`);
      setContentForm({ chapterId: '', text: '', videoUrl: '', language: 'en' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add content');
    } finally { setLoading(false); }
  };

  const iconOptions = ['📚', '🔢', '🌿', '📝', '📖', '🔬', '🌍', '🎨', '🏃', '🎵'];

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl text-gray-800 mb-6">📝 Manage Content</h1>

        {/* Tabs */}
        <div className="flex gap-2 bg-orange-50 rounded-2xl p-1.5 mb-6">
          <Tab active={tab === 'subject'} onClick={() => setTab('subject')} icon="📚" label="Add Subject" />
          <Tab active={tab === 'chapter'} onClick={() => setTab('chapter')} icon="📖" label="Add Chapter" />
          <Tab active={tab === 'content'} onClick={() => setTab('content')} icon="📝" label="Add Content" />
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-green-50 border-2 border-green-200 text-green-600 rounded-2xl p-3 mb-4 font-semibold text-sm">
              {success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-3 mb-4 font-semibold text-sm">
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Subject Form */}
          {tab === 'subject' && (
            <motion.div key="subject" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-5">📚 Add New Subject</h2>
                <form onSubmit={submitSubject} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Subject Name (English) *">
                      <input value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Maths" className={inputCls} required />
                    </FormField>
                    <FormField label="Class (1-6) *">
                      <select value={subjectForm.class} onChange={e => setSubjectForm(f => ({ ...f, class: e.target.value }))}
                        className={selectCls} required>
                        <option value="">Select Class</option>
                        {[1,2,3,4,5,6].map(c => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Hindi Name (nameHi)">
                      <input value={subjectForm.nameHi} onChange={e => setSubjectForm(f => ({ ...f, nameHi: e.target.value }))}
                        placeholder="गणित" className={inputCls} />
                    </FormField>
                    <FormField label="Punjabi Name (namePa)">
                      <input value={subjectForm.namePa} onChange={e => setSubjectForm(f => ({ ...f, namePa: e.target.value }))}
                        placeholder="ਗਣਿਤ" className={inputCls} />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Icon">
                      <select value={subjectForm.icon} onChange={e => setSubjectForm(f => ({ ...f, icon: e.target.value }))}
                        className={selectCls}>
                        {iconOptions.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Is Language Subject?">
                      <div className="flex items-center gap-3 mt-3">
                        <input type="checkbox" id="isLang" checked={subjectForm.isLang}
                          onChange={e => setSubjectForm(f => ({ ...f, isLang: e.target.checked }))}
                          className="w-5 h-5 accent-orange-500" />
                        <label htmlFor="isLang" className="text-gray-600 font-semibold text-sm">
                          Yes (Hindi/English subject — never translated)
                        </label>
                      </div>
                    </FormField>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 disabled:opacity-60">
                    {loading ? '⏳ Adding...' : '✅ Add Subject'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Chapter Form */}
          {tab === 'chapter' && (
            <motion.div key="chapter" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-5">📖 Add New Chapter</h2>
                <div className="bg-blue-50 rounded-2xl p-3 mb-4 text-sm text-blue-600 font-semibold">
                  💡 Tip: You need the Subject ID. Find it from the database or API (<code>/admin/overview</code>).
                </div>
                <form onSubmit={submitChapter} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Subject ID *">
                      <input type="number" value={chapterForm.subjectId}
                        onChange={e => setChapterForm(f => ({ ...f, subjectId: e.target.value }))}
                        placeholder="e.g. 1" className={inputCls} required />
                    </FormField>
                    <FormField label="Chapter Order">
                      <input type="number" value={chapterForm.order}
                        onChange={e => setChapterForm(f => ({ ...f, order: e.target.value }))}
                        min="1" className={inputCls} />
                    </FormField>
                  </div>
                  <FormField label="Chapter Title (English) *">
                    <input value={chapterForm.title} onChange={e => setChapterForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Addition and Subtraction" className={inputCls} required />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Hindi Title">
                      <input value={chapterForm.titleHi} onChange={e => setChapterForm(f => ({ ...f, titleHi: e.target.value }))}
                        placeholder="जोड़ और घटाव" className={inputCls} />
                    </FormField>
                    <FormField label="Punjabi Title">
                      <input value={chapterForm.titlePa} onChange={e => setChapterForm(f => ({ ...f, titlePa: e.target.value }))}
                        placeholder="ਜੋੜ ਅਤੇ ਘਟਾਓ" className={inputCls} />
                    </FormField>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 disabled:opacity-60">
                    {loading ? '⏳ Adding...' : '✅ Add Chapter'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Content Form */}
          {tab === 'content' && (
            <motion.div key="content" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-5">📝 Add Content</h2>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-4 text-sm text-amber-700 font-semibold">
                  🌐 Language Rule: For non-language subjects (Maths, EVS, Science), add content in all 3 languages. Language subjects (Hindi, English) — add only in their own language.
                </div>
                <form onSubmit={submitContent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Chapter ID *">
                      <input type="number" value={contentForm.chapterId}
                        onChange={e => setContentForm(f => ({ ...f, chapterId: e.target.value }))}
                        placeholder="e.g. 1" className={inputCls} required />
                    </FormField>
                    <FormField label="Language *">
                      <select value={contentForm.language} onChange={e => setContentForm(f => ({ ...f, language: e.target.value }))}
                        className={selectCls}>
                        <option value="en">🇬🇧 English</option>
                        <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                        <option value="pa">🟡 Punjabi (ਪੰਜਾਬੀ)</option>
                      </select>
                    </FormField>
                  </div>
                  <FormField label="Content Text *">
                    <textarea value={contentForm.text} onChange={e => setContentForm(f => ({ ...f, text: e.target.value }))}
                      placeholder="Enter the lesson content here..."
                      rows={6} className={`${inputCls} resize-none`} required />
                  </FormField>
                  <FormField label="Video URL (Optional)">
                    <input value={contentForm.videoUrl} onChange={e => setContentForm(f => ({ ...f, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/..." className={inputCls} />
                  </FormField>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 disabled:opacity-60">
                    {loading ? '⏳ Adding...' : '✅ Add Content'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default ManageContentPage;
