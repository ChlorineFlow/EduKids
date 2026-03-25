import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/shared/AdminLayout';
import api from '../../utils/api';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchUsers = () => {
    const url = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users';
    api.get(url).then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(u => u.filter(user => user.id !== id));
      setDeleteId(null);
      setSuccess('✅ User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      alert('Delete failed');
    }
  };

  const roleColors = {
    STUDENT: 'bg-blue-100 text-blue-700',
    TEACHER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-4xl text-gray-800">👥 Manage Users</h1>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-2xl px-4 py-2 font-kids text-gray-700 focus:outline-none bg-white">
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {success && (
          <motion.div initial={{ y: -10 }} animate={{ y: 0 }}
            className="bg-green-50 border-2 border-green-200 text-green-600 rounded-2xl p-3 mb-4 font-semibold text-center">
            {success}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              <span className="text-5xl">⚙️</span>
            </motion.div>
          </div>
        ) : (
          <div className="bg-white rounded-4xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 font-bold text-gray-600 text-sm">User</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-600 text-sm">Email</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-600 text-sm">Role</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-600 text-sm">Status</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-600 text-sm">Joined</th>
                    <th className="text-left px-6 py-4 font-bold text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.name?.[0]}
                          </div>
                          <span className="font-semibold text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {user.verified ? '✅ Active' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== 'ADMIN' && (
                          <button onClick={() => setDeleteId(user.id)}
                            className="text-red-400 hover:text-red-600 font-semibold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors">
                            🗑 Delete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">📭</div>
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        <AnimatePresence>
          {deleteId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteId(null)}
            >
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="bg-white rounded-4xl p-6 max-w-sm w-full shadow-xl text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-5xl mb-3">⚠️</div>
                <h3 className="font-display text-2xl text-gray-800 mb-2">Delete User?</h3>
                <p className="text-gray-500 text-sm mb-6">This action cannot be undone. All user data will be permanently deleted.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="flex-1 btn-kids bg-gray-100 text-gray-600">Cancel</button>
                  <button onClick={() => handleDelete(deleteId)}
                    className="flex-1 btn-kids bg-red-500 text-white">🗑 Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default ManageUsersPage;
