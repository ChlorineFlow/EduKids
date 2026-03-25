import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeacherLayout from '../../components/shared/TeacherLayout';
import api from '../../utils/api';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [remarkForm, setRemarkForm] = useState({ studentId: null, subjectId: '', text: '' });
  const [showRemark, setShowRemark] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const url = classFilter ? `/teacher/students?classFilter=${classFilter}` : '/teacher/students';
    api.get(url).then(r => setStudents(r.data.data));
    // Get unique subjects across all classes for remark form
    api.get('/teacher/students').then(r => {
      const allSubjects = r.data.data.flatMap(s => s.progress?.map(p => p.subject) || []);
      const unique = [...new Map(allSubjects.map(s => [s?.id, s])).values()].filter(Boolean);
      setSubjects(unique);
    });
  }, [classFilter]);

  const openRemark = (studentId) => {
    setRemarkForm({ studentId, subjectId: '', text: '' });
    setShowRemark(true);
  };

  const submitRemark = async () => {
    if (!remarkForm.subjectId || !remarkForm.text.trim()) return;
    try {
      await api.post('/teacher/remarks/add', {
        studentId: remarkForm.studentId,
        subjectId: parseInt(remarkForm.subjectId),
        remarkText: remarkForm.text
      });
      setShowRemark(false);
      setSuccess('✅ Remark added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      alert('Failed to add remark');
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-4xl text-gray-800">👦 Students</h1>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="border-2 border-blue-200 rounded-2xl px-4 py-2 font-kids text-gray-700 focus:outline-none focus:border-blue-400">
            <option value="">All Classes</option>
            {[1,2,3,4,5,6].map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>

        {success && (
          <motion.div initial={{ y: -10 }} animate={{ y: 0 }}
            className="bg-green-50 border-2 border-green-200 text-green-600 rounded-2xl p-3 mb-4 font-semibold text-center">
            {success}
          </motion.div>
        )}

        <div className="grid gap-4">
          {students.map((s, i) => (
            <motion.div key={s.id}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-display text-xl">
                    {s.user?.name?.[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{s.user?.name}</div>
                    <div className="text-sm text-gray-500">{s.user?.email} • Class {s.class} • Age {s.age}</div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                        ⭐ {s.leaderboard?.stars || 0} Stars
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        🏆 {s.leaderboard?.score || 0} pts
                      </span>
                      {(s.leaderboard?.score || 0) < 20 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                          ⚠️ Needs Help
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => openRemark(s.id)}
                  className="btn-kids bg-blue-500 text-white text-sm">
                  💬 Add Remark
                </button>
              </div>

              {s.remarks?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-bold mb-1">Recent Remarks:</p>
                  {s.remarks.slice(0, 2).map(r => (
                    <div key={r.id} className="text-xs text-gray-600 bg-gray-50 rounded-xl p-2 mt-1">
                      "{r.remarkText}"
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {students.length === 0 && (
            <div className="text-center py-12 bg-white rounded-4xl shadow-card">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-400">No students found</p>
            </div>
          )}
        </div>

        {/* Remark Modal */}
        <AnimatePresence>
          {showRemark && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRemark(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="bg-white rounded-4xl p-6 w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="font-display text-2xl text-gray-800 mb-4">💬 Add Remark</h3>
                <select value={remarkForm.subjectId}
                  onChange={e => setRemarkForm(f => ({ ...f, subjectId: e.target.value }))}
                  className="w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none mb-3">
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Class {s.class})</option>)}
                </select>
                <textarea value={remarkForm.text}
                  onChange={e => setRemarkForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Write your remark here..."
                  rows={4}
                  className="w-full border-2 border-blue-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-blue-400 resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowRemark(false)}
                    className="flex-1 btn-kids bg-gray-100 text-gray-600">Cancel</button>
                  <button onClick={submitRemark}
                    className="flex-1 btn-kids bg-blue-500 text-white">✅ Submit</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TeacherLayout>
  );
};

export default StudentsPage;
