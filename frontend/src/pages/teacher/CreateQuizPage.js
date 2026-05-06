import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeacherLayout from '../../components/shared/TeacherLayout';
import api from '../../utils/api';

const inputCls = "w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-blue-400 bg-white";
const selectCls = "w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-blue-400 bg-white";

const QUESTION_TYPES = [
  { type: 'MCQ', icon: '🔘', label: 'MCQ', desc: 'Multiple Choice' },
  { type: 'FILL_IN_BLANK', icon: '✏️', label: 'Fill in Blank', desc: 'Complete the sentence' },
  { type: 'DESCRIPTIVE', icon: '📝', label: 'Descriptive', desc: 'Written answer' },
  { type: 'MATCH_THE_FOLLOWING', icon: '🔗', label: 'Match Following', desc: 'Match pairs' },
];

const CreateQuizPage = () => {
  const [step, setStep] = useState('quiz');
  const [allSubjects, setAllSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [quizForm, setQuizForm] = useState({
  title: '', description: '', timerMinutes: '', chapterId: '', language: 'en'
});
const [isLangSubject, setIsLangSubject] = useState(false);
const [lockedLanguage, setLockedLanguage] = useState('en');

  const [qType, setQType] = useState('MCQ');
  const [qForm, setQForm] = useState({
    question: '', option1: '', option2: '', option3: '', option4: '',
    correctAnswer: '', matchPairs: '', marks: 1, order: 1
  });

  // My quizzes list
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [showAttempts, setShowAttempts] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [reviewingAttempt, setReviewingAttempt] = useState(null);
  const [deleteQuizConfirm, setDeleteQuizConfirm] = useState(null);
  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

  useEffect(() => {
    fetchSubjects();
    fetchMyQuizzes();
  }, []);

  const fetchSubjects = async () => {
    try {
      const r = await api.get('/teacher/subjects/all');
      setAllSubjects(r.data.data || []);
    } catch {}
  };

  const fetchMyQuizzes = async () => {
    try {
      const r = await api.get('/teacher/my-quizzes');
      setMyQuizzes(r.data.data || []);
    } catch {}
  };

  const handleDeleteQuiz = async (quizId) => {
  setLoading(true);
  try {
    await api.delete(`/teacher/quiz/${quizId}`);
    showSuccess('✅ Quiz deleted successfully! All student records removed.');
    setDeleteQuizConfirm(null);
    fetchMyQuizzes();
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to delete quiz');
  } finally {
    setLoading(false);
  }
};

  const fetchChapters = async (subjectId) => {
    try {
      const r = await api.get(`/teacher/chapters/${subjectId}`);
      setChapters(r.data.data || []);
    } catch {}
  };

  const subjectsByClass = (cls) => allSubjects.filter(s => s.class === parseInt(cls));

  const handleSubjectSelect = (subjectId) => {
  setSelectedSubject(subjectId);
  setQuizForm(f => ({ ...f, chapterId: '' }));
  fetchChapters(subjectId);

  // Check if language subject
  const subject = allSubjects.find(s => s.id.toString() === subjectId);
  if (subject?.isLang) {
    setIsLangSubject(true);
    const subjectName = subject.name.toLowerCase();
    let lang = 'en';
    if (subjectName === 'hindi') lang = 'hi';
    else if (subjectName === 'english') lang = 'en';
    else if (subjectName.includes('punjabi')) lang = 'pa';
    setLockedLanguage(lang);
    setQuizForm(f => ({ ...f, language: lang }));
  } else {
    setIsLangSubject(false);
    setLockedLanguage('en');
    setQuizForm(f => ({ ...f, language: 'en' }));
  }
};

  const createQuiz = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !quizForm.title) {
      showError('Please select a subject and enter quiz title'); return;
    }
    setLoading(true);
    try {
      const r = await api.post('/teacher/quiz/create', {
  subjectId: parseInt(selectedSubject),
  chapterId: quizForm.chapterId ? parseInt(quizForm.chapterId) : null,
  title: quizForm.title,
  description: quizForm.description,
  timerMinutes: quizForm.timerMinutes ? parseInt(quizForm.timerMinutes) : null,
  classLevel: parseInt(selectedClass) || 1,
  language: quizForm.language
});
      setCreatedQuiz(r.data.data);
      setStep('questions');
      showSuccess('Quiz created! Now add questions.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create quiz');
    } finally { setLoading(false); }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post('/teacher/questions/add', {
        quizId: createdQuiz.id,
        questionType: qType,
        question: qForm.question,
        option1: qForm.option1 || null,
        option2: qForm.option2 || null,
        option3: qForm.option3 || null,
        option4: qForm.option4 || null,
        correctAnswer: qForm.correctAnswer || null,
        matchPairs: qForm.matchPairs || null,
        marks: parseInt(qForm.marks) || 1,
        order: questions.length + 1
      });
      setQuestions(prev => [...prev, r.data.data]);
      setQForm({
        question: '', option1: '', option2: '', option3: '', option4: '',
        correctAnswer: '', matchPairs: '', marks: 1, order: 1
      });
      showSuccess(`✅ Question ${questions.length + 1} added!`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add question');
    } finally { setLoading(false); }
  };

  const publishQuiz = async () => {
    try {
      await api.post(`/teacher/quiz/publish/${createdQuiz.id}`);
      showSuccess('🎉 Quiz published! Students can now take it.');
      fetchMyQuizzes();
      setStep('quiz');
      setCreatedQuiz(null);
      setQuestions([]);
      setQuizForm({ title: '', description: '', timerMinutes: '', chapterId: '' });
      setSelectedClass('');
      setSelectedSubject('');
    } catch {
      showError('Failed to publish quiz');
    }
  };

  const viewAttempts = async (quizId) => {
    setShowAttempts(quizId);
    try {
      const r = await api.get(`/teacher/quiz/${quizId}/attempts`);
      setAttempts(r.data.data || []);
    } catch {}
  };

  const reviewAnswer = async (answerId, marksObtained, isCorrect, comment) => {
    try {
      await api.put('/teacher/answer/review', {
        answerId, marksObtained, isCorrect, teacherComment: comment
      });
      showSuccess('✅ Answer reviewed!');
      // Refresh attempts
      if (showAttempts) viewAttempts(showAttempts);
    } catch {
      showError('Failed to review answer');
    }
  };

  const finalizeAttempt = async (attemptId) => {
    try {
      const r = await api.put(`/teacher/attempt/finalize/${attemptId}`);
      showSuccess(r.data.message);
      viewAttempts(showAttempts);
      setReviewingAttempt(null);
    } catch {
      showError('Failed to finalize marks');
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl text-gray-800 mb-6">🎯 Quiz Manager</h1>

        {/* Notifications */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl p-3 mb-4 font-semibold text-sm">
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

        {/* Main Tabs */}
        <div className="flex gap-2 bg-blue-50 rounded-2xl p-1.5 mb-6">
          {[
            { key: 'quiz', icon: '📋', label: 'Create Quiz' },
            { key: 'myquizzes', icon: '📚', label: 'My Quizzes & Review' },
          ].map(t => (
            <button key={t.key} onClick={() => setStep(t.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                step === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-100'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
          {createdQuiz && (
            <button onClick={() => setStep('questions')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                step === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-100'
              }`}>
              ❓ Add Questions
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ═══ CREATE QUIZ ═══ */}
          {step === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-1">📋 New Quiz</h2>
                <p className="text-gray-400 text-sm mb-5">Select class, subject and chapter from buttons below.</p>

                <form onSubmit={createQuiz} className="space-y-5">

                  {/* Step 1 — Class */}
                  <div className="bg-blue-50 rounded-3xl p-4 space-y-4">
                    <p className="font-bold text-blue-700 text-sm">Step 1 — Select Class → Subject → Chapter</p>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2 text-sm">🎓 Class</label>
                      <div className="flex gap-2 flex-wrap">
                        {[1,2,3,4,5,6].map(c => (
                          <button type="button" key={c}
                            onClick={() => { setSelectedClass(c.toString()); setSelectedSubject(''); setChapters([]); }}
                            className={`w-12 h-12 rounded-2xl font-display text-xl font-bold transition-all border-2 ${
                              selectedClass === c.toString()
                                ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-md'
                                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                            }`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedClass && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="block text-gray-700 font-bold mb-2 text-sm">📚 Subject</label>
                        <div className="grid grid-cols-2 gap-2">
                          {subjectsByClass(selectedClass).map(s => (
                            <button type="button" key={s.id}
                              onClick={() => handleSubjectSelect(s.id.toString())}
                              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                selectedSubject === s.id.toString()
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-blue-200 hover:bg-blue-50'
                              }`}>
                              <span className="text-xl">{s.icon}</span>
                              {s.name}
                              {selectedSubject === s.id.toString() && <span className="ml-auto">✅</span>}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {selectedSubject && chapters.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="block text-gray-700 font-bold mb-1 text-sm">📖 Chapter (Optional)</label>
                        <select value={quizForm.chapterId}
                          onChange={e => setQuizForm(f => ({ ...f, chapterId: e.target.value }))}
                          className={selectCls}>
                          <option value="">All Chapters</option>
                          {chapters.map(ch => (
                            <option key={ch.id} value={ch.id}>{ch.title}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </div>

                  {/* Step 2 — Quiz Details */}
                  <div className="bg-purple-50 rounded-3xl p-4 space-y-3">
                    <p className="font-bold text-purple-700 text-sm">Step 2 — Quiz Details</p>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">📝 Quiz Title *</label>
                      <input value={quizForm.title}
                        onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Maths Quiz 1 - Addition" className={inputCls} required />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">📄 Description (Optional)</label>
                      <textarea value={quizForm.description}
                        onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Instructions for students..." rows={2}
                        className={`${inputCls} resize-none`} />
                    </div>
                    {/* Language Selector */}
<div>
  <label className="block text-gray-700 font-bold mb-1 text-sm">
    🌐 Quiz Language
  </label>
  {isLangSubject ? (
    // LOCKED for language subjects
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">
        {lockedLanguage === 'hi' ? '🇮🇳' :
         lockedLanguage === 'en' ? '🇬🇧' : '🟡'}
      </span>
      <div>
        <p className="font-bold text-gray-700 text-sm">
          {lockedLanguage === 'hi' ? 'Hindi (हिंदी)' :
           lockedLanguage === 'en' ? 'English' : 'Punjabi (ਪੰਜਾਬੀ)'}
        </p>
        <p className="text-xs text-orange-600 font-semibold mt-0.5">
          🔒 Language locked — this is a language subject
        </p>
      </div>
    </div>
  ) : (
    // FREE selection for non-language subjects
    <div>
      <p className="text-xs text-gray-500 mb-2 font-semibold">
        Select the language for this quiz. Students with matching language preference will see it.
      </p>
      <div className="flex gap-3">
        {[
          { code: 'en', label: '🇬🇧 English' },
          { code: 'hi', label: '🇮🇳 Hindi' },
          { code: 'pa', label: '🟡 Punjabi' },
        ].map(lang => (
          <button type="button" key={lang.code}
            onClick={() => setQuizForm(f => ({ ...f, language: lang.code }))}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
              quizForm.language === lang.code
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-blue-200 hover:bg-blue-50'
            }`}>
            {lang.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-blue-500 mt-2 font-semibold">
        ℹ️ Students who selected {quizForm.language === 'en' ? 'English' : quizForm.language === 'hi' ? 'Hindi' : 'Punjabi'} will see this quiz
      </p>
    </div>
  )}
</div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">⏱️ Timer (minutes) — Leave empty for no timer</label>
                      <input type="number" value={quizForm.timerMinutes} min="1" max="180"
                        onChange={e => setQuizForm(f => ({ ...f, timerMinutes: e.target.value }))}
                        placeholder="e.g. 30 (leave empty for no timer)" className={inputCls} />
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading || !selectedSubject}
                    className="w-full btn-kids bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg py-4 disabled:opacity-60">
                    {loading ? '⏳ Creating...' : '✅ Create Quiz & Add Questions →'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ═══ ADD QUESTIONS ═══ */}
          {step === 'questions' && createdQuiz && (
            <motion.div key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Quiz info bar */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-4 mb-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{createdQuiz.title}</div>
                  <div className="opacity-80 text-sm">
                    {questions.length} questions added
                    {createdQuiz.timerMinutes && ` • ⏱️ ${createdQuiz.timerMinutes} min timer`}
                  </div>
                </div>
                {questions.length > 0 && (
                  <button onClick={publishQuiz}
                    className="bg-white text-blue-600 font-bold px-4 py-2 rounded-2xl text-sm hover:bg-blue-50">
                    🚀 Publish Quiz
                  </button>
                )}
              </div>

              {/* Added questions summary */}
              {questions.length > 0 && (
                <div className="bg-white rounded-3xl p-4 shadow-card mb-5">
                  <h3 className="font-bold text-gray-700 mb-3">Added Questions ({questions.length}):</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {questions.map((q, i) => (
                      <div key={q.id} className="flex items-center gap-2 text-sm">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          q.questionType === 'MCQ' ? 'bg-green-100 text-green-700' :
                          q.questionType === 'FILL_IN_BLANK' ? 'bg-yellow-100 text-yellow-700' :
                          q.questionType === 'DESCRIPTIVE' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {QUESTION_TYPES.find(t => t.type === q.questionType)?.icon}
                          {' '}{QUESTION_TYPES.find(t => t.type === q.questionType)?.label}
                        </span>
                        <span className="text-gray-700 truncate">{q.question}</span>
                        <span className="text-gray-400 text-xs ml-auto flex-shrink-0">{q.marks} mk</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Type Selector */}
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-4">
                  ❓ Add Question {questions.length + 1}
                </h2>

                {/* Question Type Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {QUESTION_TYPES.map(t => (
                    <button type="button" key={t.type}
                      onClick={() => setQType(t.type)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all font-bold text-sm ${
                        qType === t.type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-blue-200 hover:bg-blue-50'
                      }`}>
                      <span className="text-2xl">{t.icon}</span>
                      <span>{t.label}</span>
                      <span className={`text-xs font-normal ${qType === t.type ? 'opacity-80' : 'text-gray-400'}`}>
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>

                <form onSubmit={addQuestion} className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Question *</label>
                    <textarea value={qForm.question}
                      onChange={e => setQForm(f => ({ ...f, question: e.target.value }))}
                      placeholder={
                        qType === 'MCQ' ? 'What is 5 + 3?' :
                        qType === 'FILL_IN_BLANK' ? 'The capital of India is ___.' :
                        qType === 'DESCRIPTIVE' ? 'Explain the water cycle in your own words.' :
                        'Match the following: (enter pairs in Match Pairs field below)'
                      }
                      rows={3} className={`${inputCls} resize-none`} required />
                  </div>

                  {/* MCQ Options */}
                  {qType === 'MCQ' && (
                    <div className="bg-green-50 rounded-2xl p-4 space-y-3">
                      <p className="font-bold text-green-700 text-sm">Answer Options</p>
                      <div className="grid grid-cols-2 gap-3">
                        {['option1', 'option2', 'option3', 'option4'].map((opt, i) => (
                          <div key={opt}>
                            <label className="block text-gray-700 font-bold mb-1 text-xs">
                              Option {['A', 'B', 'C', 'D'][i]} *
                            </label>
                            <input value={qForm[opt]}
                              onChange={e => setQForm(f => ({ ...f, [opt]: e.target.value }))}
                              placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`}
                              className={inputCls} required />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1 text-sm">✅ Correct Answer *</label>
                        <select value={qForm.correctAnswer}
                          onChange={e => setQForm(f => ({ ...f, correctAnswer: e.target.value }))}
                          className={`${selectCls} bg-green-50`} required>
                          <option value="">Select correct answer</option>
                          {['option1', 'option2', 'option3', 'option4'].map((opt, i) =>
                            qForm[opt] && (
                              <option key={opt} value={qForm[opt]}>
                                {['A', 'B', 'C', 'D'][i]}: {qForm[opt]}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Fill in Blank */}
                  {qType === 'FILL_IN_BLANK' && (
                    <div className="bg-yellow-50 rounded-2xl p-4">
                      <label className="block text-gray-700 font-bold mb-1 text-sm">✅ Correct Answer *</label>
                      <input value={qForm.correctAnswer}
                        onChange={e => setQForm(f => ({ ...f, correctAnswer: e.target.value }))}
                        placeholder="The exact answer students must type"
                        className={inputCls} required />
                      <p className="text-xs text-yellow-600 mt-1 font-semibold">
                        ⚠️ Comparison is case-insensitive. "Delhi" = "delhi" = "DELHI"
                      </p>
                    </div>
                  )}

                  {/* Descriptive */}
                  {qType === 'DESCRIPTIVE' && (
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-purple-700 font-semibold text-sm">
                        📝 Descriptive answers will need manual review by teacher.
                        Students write freely — you check and assign marks.
                      </p>
                    </div>
                  )}

                  {/* Match the Following */}
                  {qType === 'MATCH_THE_FOLLOWING' && (
                    <div className="bg-orange-50 rounded-2xl p-4">
                      <label className="block text-gray-700 font-bold mb-1 text-sm">
                        🔗 Match Pairs * (format: A-1, B-2, C-3, D-4)
                      </label>
                      <textarea value={qForm.matchPairs}
                        onChange={e => setQForm(f => ({ ...f, matchPairs: e.target.value }))}
                        placeholder={`Column A | Column B\nDog | Animal\nRose | Flower\nChess | Game\nDelhi | Capital`}
                        rows={5} className={`${inputCls} resize-none font-mono text-sm`} />
                      <p className="text-xs text-orange-600 mt-1 font-semibold">
                        ⚠️ Match answers need teacher review to assign marks.
                      </p>
                    </div>
                  )}

                  {/* Marks */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">🎯 Marks for this question</label>
                      <input type="number" value={qForm.marks} min="1" max="20"
                        onChange={e => setQForm(f => ({ ...f, marks: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div className="flex items-end">
                      <div className="bg-blue-50 rounded-2xl p-3 w-full text-sm text-blue-700 font-semibold">
                        Total marks so far: {questions.reduce((s, q) => s + q.marks, 0) + parseInt(qForm.marks || 1)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="flex-1 btn-kids bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg py-4 disabled:opacity-60">
                      {loading ? '⏳ Adding...' : '➕ Add Question'}
                    </motion.button>
                    {questions.length > 0 && (
                      <motion.button whileHover={{ scale: 1.02 }} type="button"
                        onClick={publishQuiz}
                        className="btn-kids bg-green-500 text-white px-6 py-4">
                        🚀 Publish
                      </motion.button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ═══ MY QUIZZES & REVIEW ═══ */}
          {step === 'myquizzes' && (
            <motion.div key="myquizzes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {!showAttempts ? (
                // Quiz list
                <div className="space-y-4">
                  <h2 className="font-display text-2xl text-gray-700">📚 My Quizzes</h2>
                  {myQuizzes.length === 0 ? (
                    <div className="bg-white rounded-4xl p-10 text-center shadow-card">
                      <div className="text-5xl mb-3">📭</div>
                      <p className="text-gray-400">No quizzes yet. Create one!</p>
                    </div>
                  ) : myQuizzes.map(quiz => (
                    <motion.div key={quiz.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 shadow-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-lg">{quiz.title}</div>
                          {quiz.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{quiz.description}</p>
                          )}
                          <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-2">
  <span>{quiz.subject?.icon} {quiz.subject?.name}</span>
  <span>• Class {quiz.classLevel}</span>
  <span>• {quiz._count?.questions} questions</span>
  <span>• {quiz._count?.attempts} attempts</span>
  {quiz.timerMinutes && <span>• ⏱️ {quiz.timerMinutes} min</span>}
  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
    quiz.language === 'hi' ? 'bg-orange-100 text-orange-700' :
    quiz.language === 'pa' ? 'bg-yellow-100 text-yellow-700' :
    'bg-blue-100 text-blue-700'
  }`}>
    {quiz.language === 'hi' ? '🇮🇳 Hindi' :
     quiz.language === 'pa' ? '🟡 Punjabi' : '🇬🇧 English'}
  </span>
</div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ml-3 ${
                          quiz.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {quiz.isPublished ? '✅ Published' : '📝 Draft'}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button onClick={() => viewAttempts(quiz.id)}
                          className="btn-kids bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm px-4 py-2">
                          👁️ View Attempts ({quiz._count?.attempts})
                        </button>

                        {!quiz.isPublished && (
                          <button onClick={() => {
                            setCreatedQuiz(quiz);
                            setStep('questions');
                            setQuestions(quiz.questions || []);
                          }}
                            className="btn-kids bg-purple-50 text-purple-600 hover:bg-purple-100 text-sm px-4 py-2">
                            ✏️ Continue Editing
                          </button>
                        )}

                        {!quiz.isPublished && (
                          <button onClick={async () => {
                            if (quiz._count?.questions === 0) {
                              showError('Add at least one question before publishing!');
                              return;
                            }
                            await api.post(`/teacher/quiz/publish/${quiz.id}`);
                            showSuccess('🎉 Quiz published!');
                            fetchMyQuizzes();
                          }}
                            className="btn-kids bg-green-50 text-green-600 hover:bg-green-100 text-sm px-4 py-2">
                            🚀 Publish
                          </button>
                        )}

                        <button onClick={() => setDeleteQuizConfirm(quiz.id)}
                          className="btn-kids bg-red-50 text-red-500 hover:bg-red-100 text-sm px-4 py-2 ml-auto">
                          🗑️ Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Delete Confirmation Modal */}
                  <AnimatePresence>
                    {deleteQuizConfirm && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteQuizConfirm(null)}>
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                          className="bg-white rounded-4xl p-6 max-w-sm w-full shadow-xl text-center"
                          onClick={e => e.stopPropagation()}>
                          <div className="text-5xl mb-3">⚠️</div>
                          <h3 className="font-display text-2xl text-gray-800 mb-2">Delete Quiz?</h3>
                          <p className="text-gray-500 text-sm mb-2">This will permanently delete:</p>
                          <ul className="text-sm text-red-500 font-semibold mb-5 space-y-1 text-left bg-red-50 rounded-2xl p-4">
                            <li>❌ All questions in this quiz</li>
                            <li>❌ All student attempts</li>
                            <li>❌ All marks awarded to students</li>
                            <li>❌ All teacher comments</li>
                          </ul>
                          <p className="text-xs text-gray-400 mb-5">This cannot be undone!</p>
                          <div className="flex gap-3">
                            <button onClick={() => setDeleteQuizConfirm(null)}
                              className="flex-1 btn-kids bg-gray-100 text-gray-600">
                              Cancel
                            </button>
                            <button onClick={() => handleDeleteQuiz(deleteQuizConfirm)}
                              disabled={loading}
                              className="flex-1 btn-kids bg-red-500 text-white disabled:opacity-60">
                              {loading ? '⏳' : '🗑️ Yes, Delete'}
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Attempts view
                <div>
                  <button onClick={() => { setShowAttempts(null); setAttempts([]); setReviewingAttempt(null); }}
                    className="text-blue-600 font-bold mb-4 inline-block hover:underline">
                    ← Back to Quizzes
                  </button>

                  <h2 className="font-display text-2xl text-gray-700 mb-4">
                    📊 Student Attempts
                  </h2>

                  {attempts.length === 0 ? (
                    <div className="bg-white rounded-4xl p-10 text-center shadow-card">
                      <div className="text-5xl mb-3">📭</div>
                      <p className="text-gray-400">No students have attempted this quiz yet.</p>
                    </div>
                  ) : attempts.map(attempt => (
                    <motion.div key={attempt.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-white rounded-3xl p-5 shadow-card mb-4">

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-800 text-lg">
                            👦 {attempt.student?.user?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Score: {attempt.earnedMarks}/{attempt.totalMarks} ({attempt.percentage}%) •
                            ⭐ {attempt.stars} stars •
                            {attempt.isReviewed ? ' ✅ Reviewed' : ' ⏳ Needs Review'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setReviewingAttempt(reviewingAttempt === attempt.id ? null : attempt.id)}
                            className="btn-kids bg-blue-50 text-blue-600 text-sm px-4 py-2">
                            {reviewingAttempt === attempt.id ? '▲ Hide' : '✏️ Review'}
                          </button>
                          <button onClick={() => finalizeAttempt(attempt.id)}
                            className="btn-kids bg-green-500 text-white text-sm px-4 py-2">
                            🏅 Award Marks
                          </button>
                        </div>
                      </div>

                      {/* Detailed review panel */}
                      <AnimatePresence>
                        {reviewingAttempt === attempt.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="border-t border-gray-100 pt-4 space-y-4">
                              {attempt.answers.map((ans, i) => (
                                <ReviewAnswerCard
                                  key={ans.id}
                                  answer={ans}
                                  index={i}
                                  onReview={reviewAnswer}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </TeacherLayout>
  );
};

// Review Answer Card Component
const ReviewAnswerCard = ({ answer, index, onReview }) => {
  const [marks, setMarks] = useState(answer.marksObtained);
  const [correct, setCorrect] = useState(answer.isCorrect);
  const [comment, setComment] = useState(answer.teacherComment || '');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await onReview(answer.id, marks, correct, comment);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const qType = answer.question?.questionType;
  const typeColor = qType === 'MCQ' ? 'bg-green-100 text-green-700' :
    qType === 'FILL_IN_BLANK' ? 'bg-yellow-100 text-yellow-700' :
    qType === 'DESCRIPTIVE' ? 'bg-purple-100 text-purple-700' :
    'bg-orange-100 text-orange-700';

  return (
    <div className={`rounded-2xl p-4 border-2 ${
      answer.teacherReviewed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor}`}>
            {qType}
          </span>
        </div>
        <span className="text-xs text-gray-400">Max: {answer.question?.marks} marks</span>
      </div>

      <p className="font-semibold text-gray-700 text-sm mb-1">{answer.question?.question}</p>

      {answer.question?.correctAnswer && (
        <p className="text-xs text-green-600 font-semibold mb-1">
          ✅ Correct: {answer.question.correctAnswer}
        </p>
      )}

      <div className="bg-white rounded-xl p-3 mb-3 border border-gray-200">
        <p className="text-xs text-gray-500 font-bold mb-1">Student's Answer:</p>
        <p className="text-gray-700 text-sm">{answer.answer || '(no answer)'}</p>
      </div>

      {/* Match pairs display */}
      {qType === 'MATCH_THE_FOLLOWING' && answer.question?.matchPairs && (
        <div className="bg-orange-50 rounded-xl p-3 mb-3 border border-orange-200">
          <p className="text-xs text-orange-600 font-bold mb-1">Correct Pairs:</p>
          <p className="text-gray-700 text-xs whitespace-pre-line">{answer.question.matchPairs}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Marks Given</label>
          <input type="number" value={marks} min="0" max={answer.question?.marks}
            onChange={e => setMarks(parseInt(e.target.value))}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-center" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Mark As</label>
          <select value={correct === null ? '' : correct ? 'correct' : 'wrong'}
            onChange={e => setCorrect(e.target.value === 'correct' ? true : e.target.value === 'wrong' ? false : null)}
            className="w-full border-2 border-gray-200 rounded-xl px-2 py-2 text-sm">
            <option value="">Pending</option>
            <option value="correct">✅ Correct</option>
            <option value="wrong">❌ Wrong</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 mb-1 block">Comment</label>
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Optional feedback"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm" />
        </div>
      </div>

      <button onClick={save}
        className={`mt-2 w-full py-2 rounded-xl font-bold text-sm transition-all ${
          saved ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        }`}>
        {saved ? '✅ Saved!' : '💾 Save Review'}
      </button>
    </div>
  );
};

export default CreateQuizPage;