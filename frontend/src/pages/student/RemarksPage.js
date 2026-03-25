import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../components/shared/StudentLayout';
import api from '../../utils/api';
import { t } from '../../utils/i18n';

const RemarksPage = () => {
  const { user } = useAuth();
  const [remarks, setRemarks] = useState([]);
  const lang = user?.student?.language || 'en';

  useEffect(() => {
    api.get('/student/remarks').then(r => setRemarks(r.data.data));
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl text-gray-800 mb-6">💬 {t(lang, 'remarks')}</h1>
        {remarks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-4xl shadow-card">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">No remarks yet from your teachers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {remarks.map((r, i) => (
              <motion.div key={r.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-card border-l-4 border-orange-400"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-gray-800">{r.subject?.icon} {r.subject?.name}</span>
                    <span className="text-gray-400 text-sm ml-2">by {r.teacher?.user?.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{r.remarkText}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default RemarksPage;
