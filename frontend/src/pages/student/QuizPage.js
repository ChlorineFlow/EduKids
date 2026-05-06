import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t } from '../../utils/i18n';

// Timer Component
const Timer = ({ minutes, onTimeUp }) => {
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    if (seconds <= 0) { onTimeUp(); return; }
    const interval = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds <= 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-lg ${
      isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-600'
    }`}>
      ⏱️ {mins}:{secs.toString().padStart(2, '0')}
    </div>
  );
};

// Quiz Results
const QuizResults = ({ summary, onRetry, lang }) => (
  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-6">
    <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.6 }} className="text-8xl mb-4">
      {summary.percentage >= 80 ? '🏆' : summary.percentage >= 50 ? '😊' : '💪'}
    </motion.div>
    <h2 className="font-display text-4xl text-gray-800 mb-2">{t(lang, 'quizComplete')}</h2>

    {summary.needsReview ? (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-5 mb-6 max-w-sm mx-auto">
        <div className="text-3xl mb-2">📝</div>
        <p className="font-bold text-yellow-700">Some answers need teacher review!</p>
        <p className="text-sm text-yellow-600 mt-1">Your final marks will be updated once your teacher reviews the answers.</p>
        <p className="text-sm font-bold text-yellow-700 mt-2">Auto-graded: {summary.earnedMarks}/{summary.totalMarks}</p>
      </div>
    ) : (
      <>
        <p className="text-gray-500 text-lg mb-2">You scored {summary.earnedMarks}/{summary.totalMarks}</p>
        <div className="flex justify-center gap-2 text-5xl mb-4">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.span key={i}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: i * 0.3, type: 'spring', bounce: 0.6 }}
              className={i < summary.stars ? 'star-pop' : 'opacity-30'}>
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-card mb-5 max-w-xs mx-auto">
          <div className="text-4xl font-display text-orange-500">{summary.percentage}%</div>
        </div>
      </>
    )}

    <div className="flex gap-3 justify-center">
      <button onClick={onRetry} className="btn-kids bg-orange-500 text-white">🔄 Try Again</button>
      <Link to="/student/subjects" className="btn-kids bg-white border-2 border-orange-300 text-orange-500">
        📚 Back to Subjects
      </Link>
    </div>
  </motion.div>
);

const QuizPage = () => {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const quizRef = useRef(null);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
    api.get(`/student/quizzes/${subjectId}`).then(r => setQuizzes(r.data.data));
  }, [subjectId]);

  const enterFullscreen = useCallback(() => {
    const el = quizRef.current || document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    setIsFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    setIsFullscreen(false);
  }, []);

  // Prevent going back during quiz
  useEffect(() => {
    if (!quizData || results) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [quizData, results]);

  const startQuiz = async (quizId) => {
    setLoading(true);
    try {
      const r = await api.get(`/student/quiz/${quizId}`);
      setQuizData(r.data.data);
      setSelectedQuiz(quizId);
      setCurrentQ(0);
      setAnswers({});
      setSelected('');
      setTextAnswer('');
      setResults(null);
      setTimeout(() => enterFullscreen(), 300);
    } finally { setLoading(false); }
  };

  const saveCurrentAnswer = () => {
    const q = quizData.questions[currentQ];
    const qType = q.questionType;
    let answer = '';

    if (qType === 'MCQ') answer = selected;
    else answer = textAnswer;

    return { ...answers, [q.id]: answer };
  };

  const nextQuestion = () => {
    const updatedAnswers = saveCurrentAnswer();
    setAnswers(updatedAnswers);
    setSelected('');
    setTextAnswer('');
    setHint('');

    if (currentQ < quizData.questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    exitFullscreen();
    try {
      const answersArr = Object.entries(finalAnswers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId), answer: answer || ''
      }));
      const r = await api.post('/student/quiz/attempt', {
        quizId: selectedQuiz, answers: answersArr
      });
      setResults(r.data.data);
    } finally { setLoading(false); }
  };

  const getHint = async () => {
    const q = quizData.questions[currentQ];
    if (q.questionType !== 'MCQ') return;
    setHintLoading(true);
    try {
      const r = await api.post('/ai/hint', {
        question: q.question,
        options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean)
      });
      setHint(r.data.data.hint);
    } catch { setHint("Think carefully! You've got this! 💪"); }
    finally { setHintLoading(false); }
  };

  // Quiz list
  if (!selectedQuiz) return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => window.history.back()} className="text-orange-500 font-bold mb-4 inline-block">← Back</button>
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
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{q.title}</h3>
                    {q.description && <p className="text-gray-500 text-sm mt-1">{q.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                        {q._count?.questions || 0} questions
                      </span>
                      {q.timerMinutes && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                          ⏱️ {q.timerMinutes} min
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
  q.language === 'hi' ? 'bg-orange-100 text-orange-700' :
  q.language === 'pa' ? 'bg-yellow-100 text-yellow-700' :
  'bg-blue-100 text-blue-700'
}`}>
  {q.language === 'hi' ? '🇮🇳 Hindi Quiz' :
   q.language === 'pa' ? '🟡 Punjabi Quiz' : '🇬🇧 English Quiz'}
</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold">
                        By {q.teacher?.user?.name}
                      </span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => startQuiz(q.id)}
                    className="btn-kids bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                    {t(lang, 'startQuiz')} 🎯
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );

  // Results
  if (results) return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto">
        <QuizResults summary={results.summary} onRetry={() => startQuiz(selectedQuiz)} lang={lang} />
      </div>
    </StudentLayout>
  );

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
  const qType = question.questionType;
  const progress = (currentQ / quizData.questions.length) * 100;
  const options = [question.option1, question.option2, question.option3, question.option4].filter(Boolean);

  const canProceed = qType === 'MCQ' ? !!selected : textAnswer.trim().length > 0;

  return (
    <div ref={quizRef}
      className={`font-kids ${isFullscreen ? 'fixed inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 z-50 overflow-auto p-6' : ''}`}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-gray-600 text-sm">
            Question {currentQ + 1} of {quizData.questions.length}
          </span>
          <div className="flex items-center gap-3">
            {quizData.timerMinutes && !results && (
              <Timer minutes={quizData.timerMinutes} onTimeUp={() => submitQuiz(saveCurrentAnswer())} />
            )}
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
              {qType === 'MCQ' ? '🔘 MCQ' :
               qType === 'FILL_IN_BLANK' ? '✏️ Fill Blank' :
               qType === 'DESCRIPTIVE' ? '📝 Descriptive' : '🔗 Match'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-100 rounded-full h-3 mb-5">
          <motion.div className="bg-gradient-to-r from-orange-400 to-yellow-400 h-3 rounded-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ}
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="bg-white rounded-4xl p-8 shadow-card mb-4">

            <div className="flex items-start justify-between mb-4">
              <h2 className="font-bold text-xl text-gray-800 flex-1">{question.question}</h2>
              <span className="ml-3 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-xl flex-shrink-0">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>

            {/* MCQ */}
            {qType === 'MCQ' && (
              <div className="space-y-3">
                {options.map((opt, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(opt)}
                    className={`w-full text-left rounded-2xl p-4 border-2 font-semibold transition-all ${
                      selected === opt
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
                    }`}>
                    <span className="font-display text-lg mr-3">{['A', 'B', 'C', 'D'][i]}.</span> {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Fill in Blank */}
            {qType === 'FILL_IN_BLANK' && (
              <input value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 text-lg" />
            )}

            {/* Descriptive */}
            {qType === 'DESCRIPTIVE' && (
              <div>
                <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                  placeholder="Write your detailed answer here..."
                  rows={6}
                  className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 resize-none" />
                <p className="text-xs text-purple-600 mt-2 font-semibold">
                  📝 This answer will be reviewed by your teacher.
                </p>
              </div>
            )}

            {/* Match the Following */}
            {qType === 'MATCH_THE_FOLLOWING' && (
              <div>
                {question.matchPairs && (
                  <div className="bg-orange-50 rounded-2xl p-4 mb-3">
                    <p className="font-bold text-orange-700 text-sm mb-2">Match these pairs:</p>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{question.matchPairs}</pre>
                  </div>
                )}
                <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                  placeholder="Write your matches here, e.g.: Dog-Animal, Rose-Flower..."
                  rows={4}
                  className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 resize-none" />
                <p className="text-xs text-orange-600 mt-2 font-semibold">
                  🔗 This answer will be reviewed by your teacher.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hint */}
        {hint && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-4 mb-4">
            <p className="text-purple-700 text-sm font-semibold">💡 Hint: {hint}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {qType === 'MCQ' && (
            <button onClick={getHint} disabled={hintLoading}
              className="btn-kids bg-purple-100 text-purple-600 text-sm flex-none px-4">
              {hintLoading ? '🤔' : '💡 Hint'}
            </button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={nextQuestion}
            disabled={!canProceed || loading}
            className="btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white flex-1 disabled:opacity-50 py-4 text-lg">
            {loading ? '⏳' :
             currentQ < quizData.questions.length - 1
               ? `${t(lang, 'next')} →`
               : `${t(lang, 'finish')} 🎉`}
          </motion.button>
        </div>

        {isFullscreen && (
          <p className="text-center text-xs text-gray-400 mt-3">
            🔒 Quiz is in fullscreen mode. Submit to exit.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizPage;