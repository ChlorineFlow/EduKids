import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeacherLayout from '../../components/shared/TeacherLayout';
import api from '../../utils/api';

const CreateQuizPage = () => {
  const [step, setStep] = useState('quiz'); // 'quiz' | 'questions'
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [quizForm, setQuizForm] = useState({ subjectId: '', chapterId: '', title: '' });
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qForm, setQForm] = useState({ question: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', marks: 1 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all subjects across all classes
    const fetchSubjects = async () => {
      const allSubjects = [];
      for (let c = 1; c <= 6; c++) {
        try {
          const r = await api.get(`/student/subjects`);
          allSubjects.push(...(r.data.data || []));
          break; // student endpoint returns subjects for the current user's class
        } catch {}
      }
      // Fallback: use admin endpoint or get from different source
      try {
        const r = await api.get('/student/subjects');
        setSubjects(r.data.data || []);
      } catch {}
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (quizForm.subjectId) {
      api.get(`/student/chapters/${quizForm.subjectId}`).then(r => setChapters(r.data.data || []));
    }
  }, [quizForm.subjectId]);

  const createQuiz = async (e) => {
    e.preventDefault();
    setError('');
    if (!quizForm.subjectId || !quizForm.title.trim()) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const r = await api.post('/teacher/quiz/create', {
        subjectId: parseInt(quizForm.subjectId),
        chapterId: quizForm.chapterId ? parseInt(quizForm.chapterId) : undefined,
        title: quizForm.title
      });
      setCreatedQuiz(r.data.data);
      setStep('questions');
      setSuccess('Quiz created! Now add questions.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    setError('');
    if (!qForm.correctAnswer) {
      setError('Please select the correct answer');
      return;
    }
    setLoading(true);
    try {
      const r = await api.post('/teacher/questions/add', {
        quizId: createdQuiz.id,
        ...qForm,
        marks: parseInt(qForm.marks)
      });
      setQuestions(prev => [...prev, r.data.data]);
      setQForm({ question: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', marks: 1 });
      setSuccess(`✅ Question ${questions.length + 1} added!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionFields = ['option1', 'option2', 'option3', 'option4'];

  return (
    <TeacherLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl text-gray-800 mb-6">🎯 Create Quiz</h1>

        {/* Steps indicator */}
        <div className="flex gap-3 mb-6">
          {['Create Quiz', 'Add Questions'].map((s, i) => (
            <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm ${
              (i === 0 && step === 'quiz') || (i === 1 && step === 'questions')
                ? 'bg-blue-600 text-white'
                : i < (step === 'questions' ? 1 : 0)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              <span>{i === 0 ? '📝' : '❓'}</span> {s}
              {i < (step === 'questions' ? 1 : 0) && <span>✓</span>}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-3 mb-4 font-semibold text-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <motion.div initial={{ y: -10 }} animate={{ y: 0 }}
            className="bg-green-50 border-2 border-green-200 text-green-600 rounded-2xl p-3 mb-4 font-semibold text-sm">
            {success}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'quiz' ? (
            <motion.div key="quiz-form" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-5">📋 Quiz Details</h2>
                <form onSubmit={createQuiz} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">📚 Subject *</label>
                    <select value={quizForm.subjectId} onChange={e => setQuizForm(f => ({ ...f, subjectId: e.target.value, chapterId: '' }))}
                      className="w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids focus:outline-none focus:border-blue-400"
                      required>
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name} (Class {s.class})</option>)}
                    </select>
                  </div>

                  {chapters.length > 0 && (
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">📖 Chapter (Optional)</label>
                      <select value={quizForm.chapterId} onChange={e => setQuizForm(f => ({ ...f, chapterId: e.target.value }))}
                        className="w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids focus:outline-none focus:border-blue-400">
                        <option value="">All Chapters</option>
                        {chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">✏️ Quiz Title *</label>
                    <input value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Maths Quiz 1 - Addition"
                      className="w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids focus:outline-none focus:border-blue-400"
                      required />
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full btn-kids bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg py-4 disabled:opacity-60">
                    {loading ? '⏳ Creating...' : '✅ Create Quiz & Add Questions →'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div key="questions-form" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }}>
              {/* Quiz info */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-3xl p-4 mb-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{createdQuiz?.title}</div>
                  <div className="opacity-80 text-sm">{questions.length} questions added</div>
                </div>
                <span className="text-3xl">🎯</span>
              </div>

              {/* Added questions list */}
              {questions.length > 0 && (
                <div className="bg-white rounded-3xl p-5 shadow-card mb-5">
                  <h3 className="font-bold text-gray-700 mb-3">Added Questions ({questions.length}):</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {questions.map((q, i) => (
                      <div key={q.id} className="flex items-start gap-2 text-sm">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                        <span className="text-gray-700">{q.question}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add question form */}
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-5">❓ Add Question {questions.length + 1}</h2>
                <form onSubmit={addQuestion} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Question *</label>
                    <textarea value={qForm.question} onChange={e => setQForm(f => ({ ...f, question: e.target.value }))}
                      placeholder="What is 5 + 3?"
                      rows={2}
                      className="w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids focus:outline-none focus:border-blue-400 resize-none"
                      required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {optionFields.map((field, i) => (
                      <div key={field}>
                        <label className="block text-gray-700 font-bold mb-1 text-xs">Option {optionLabels[i]} *</label>
                        <input value={qForm[field]} onChange={e => setQForm(f => ({ ...f, [field]: e.target.value }))}
                          placeholder={`Option ${optionLabels[i]}`}
                          className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 text-sm font-kids focus:outline-none focus:border-blue-400"
                          required />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">✅ Correct Answer *</label>
                      <select value={qForm.correctAnswer} onChange={e => setQForm(f => ({ ...f, correctAnswer: e.target.value }))}
                        className="w-full border-2 border-green-200 rounded-2xl px-4 py-3 font-kids focus:outline-none focus:border-green-400 bg-green-50"
                        required>
                        <option value="">Select correct answer</option>
                        {optionFields.map((field, i) => qForm[field] && (
                          <option key={field} value={qForm[field]}>{optionLabels[i]}: {qForm[field]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">🎯 Marks</label>
                      <input type="number" value={qForm.marks} onChange={e => setQForm(f => ({ ...f, marks: e.target.value }))}
                        min="1" max="10"
                        className="w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="flex-1 btn-kids bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg py-4 disabled:opacity-60">
                      {loading ? '⏳ Adding...' : '➕ Add Question'}
                    </motion.button>
                    {questions.length > 0 && (
                      <motion.button whileHover={{ scale: 1.02 }} type="button"
                        onClick={() => { setStep('quiz'); setCreatedQuiz(null); setQuestions([]); setQuizForm({ subjectId: '', chapterId: '', title: '' }); }}
                        className="btn-kids bg-green-500 text-white px-6">
                        🏁 Finish Quiz
                      </motion.button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TeacherLayout>
  );
};

export default CreateQuizPage;
