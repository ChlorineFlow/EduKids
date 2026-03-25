import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t } from '../../utils/i18n';

const QuizResults = ({ summary, onRetry, lang }) => {
  const starsArr = Array.from({ length: 3 }, (_, i) => i < summary.stars);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center"
    >
      <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.6 }} className="text-8xl mb-4">
        {summary.percentage >= 80 ? '🏆' : summary.percentage >= 50 ? '😊' : '💪'}
      </motion.div>
      <h2 className="font-display text-4xl text-gray-800 mb-2">{t(lang, 'quizComplete')}</h2>
      <p className="text-gray-500 text-lg mb-6">You scored {summary.earnedMarks}/{summary.totalMarks}</p>

      <div className="flex justify-center gap-2 text-5xl mb-6">
        {starsArr.map((filled, i) => (
          <motion.span key={i}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: i * 0.3, type: 'spring', bounce: 0.6 }}
            className={filled ? 'star-pop' : 'opacity-30'}
          >
            ⭐
          </motion.span>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-card mb-6 max-w-xs mx-auto">
        <div className="text-4xl font-display text-orange-500">{summary.percentage}%</div>
        <div className="text-gray-500 text-sm">Accuracy</div>
        {summary.badges > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}
            className="mt-3 bg-yellow-50 rounded-2xl p-2"
          >
            <span className="text-2xl">🏅</span>
            <div className="text-xs font-bold text-yellow-600">Perfect Score Badge!</div>
          </motion.div>
        )}
      </div>

      <button onClick={onRetry}
        className="btn-kids bg-orange-500 text-white mr-3">
        🔄 Try Again
      </button>
      <Link to="/student/subjects" className="btn-kids bg-white border-2 border-orange-300 text-orange-500">
        📚 Back to Subjects
      </Link>
    </motion.div>
  );
};

const QuizPage = () => {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
    api.get(`/student/quizzes/${subjectId}`).then(r => setQuizzes(r.data.data));
  }, [subjectId]);

  const startQuiz = async (quizId) => {
    setLoading(true);
    try {
      const r = await api.get(`/student/quiz/${quizId}`);
      setQuizData(r.data.data);
      setSelectedQuiz(quizId);
      setCurrentQ(0);
      setAnswers({});
      setSelected(null);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (opt) => setSelected(opt);

  const nextQuestion = () => {
    if (!selected) return;
    const q = quizData.questions[currentQ];
    setAnswers(a => ({ ...a, [q.id]: selected }));
    setSelected(null);
    setHint('');
    if (currentQ < quizData.questions.length - 1) setCurrentQ(q => q + 1);
    else submitQuiz({ ...answers, [q.id]: selected });
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const answersArr = Object.entries(finalAnswers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId), answer
      }));
      const r = await api.post('/student/quiz/attempt', { quizId: selectedQuiz, answers: answersArr });
      setResults(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  const getHint = async () => {
    const q = quizData.questions[currentQ];
    setHintLoading(true);
    try {
      const r = await api.post('/ai/hint', {
        question: q.question,
        options: [q.option1, q.option2, q.option3, q.option4]
      });
      setHint(r.data.data.hint);
    } catch {
      setHint("Think carefully and read the question again! You've got this! 💪");
    } finally {
      setHintLoading(false);
    }
  };

  // Quiz list view
  if (!selectedQuiz) return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => window.history.back()} className="text-orange-500 font-bold mb-4 inline-block hover:underline">
          ← {t(lang, 'back')}
        </button>
        <h1 className="font-display text-4xl text-gray-800 mb-6">🎯 {t(lang, 'quiz')}</h1>
        {quizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-4xl shadow-card">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">No quizzes available yet!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((q, i) => (
              <motion.div key={q.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-card flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{q.title}</h3>
                  <p className="text-sm text-gray-500">{q._count?.questions || 0} questions • By {q.teacher?.user?.name}</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => startQuiz(q.id)}
                  className="btn-kids bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                  {t(lang, 'startQuiz')} 🎯
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );

  // Results view
  if (results) return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto">
        <QuizResults summary={results.summary} onRetry={() => startQuiz(selectedQuiz)} lang={lang} />
      </div>
    </StudentLayout>
  );

  // Loading
  if (loading || !quizData) return (
    <StudentLayout>
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-5xl">🎯</span>
        </motion.div>
      </div>
    </StudentLayout>
  );

  const question = quizData.questions[currentQ];
  const progress = ((currentQ) / quizData.questions.length) * 100;
  const options = [question.option1, question.option2, question.option3, question.option4];

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-gray-600 text-sm">Question {currentQ + 1} of {quizData.questions.length}</span>
          <span className="font-bold text-orange-500 text-sm">{quizData.title}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3 mb-6">
          <motion.div
            className="bg-gradient-to-r from-orange-400 to-yellow-400 h-3 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-white rounded-4xl p-8 shadow-card mb-4"
          >
            <h2 className="font-bold text-xl text-gray-800 mb-6">{question.question}</h2>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <motion.button key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectAnswer(opt)}
                  className={`w-full text-left rounded-2xl p-4 border-2 font-semibold transition-all ${
                    selected === opt
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <span className="font-display text-lg mr-3">{['A', 'B', 'C', 'D'][i]}.</span> {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hint */}
        {hint && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-4 mb-4">
            <p className="text-purple-700 text-sm font-semibold">💡 Hint: {hint}</p>
          </motion.div>
        )}

        <div className="flex gap-3">
          <button onClick={getHint} disabled={hintLoading}
            className="btn-kids bg-purple-100 text-purple-600 text-sm flex-1">
            {hintLoading ? '🤔 Thinking...' : '💡 Get Hint (AI)'}
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={nextQuestion} disabled={!selected}
            className="btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white flex-1 disabled:opacity-50">
            {currentQ < quizData.questions.length - 1 ? `${t(lang, 'next')} →` : `${t(lang, 'finish')} 🎉`}
          </motion.button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default QuizPage;
