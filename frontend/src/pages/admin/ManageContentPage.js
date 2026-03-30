import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/shared/AdminLayout";
import api from "../../utils/api";

const inputCls =
  "w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 bg-white";
const selectCls =
  "w-full border-2 border-orange-200 rounded-2xl px-4 py-3 font-kids text-gray-700 focus:outline-none focus:border-orange-400 bg-white";

const Tab = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
      active
        ? "bg-orange-500 text-white shadow-md"
        : "text-gray-600 hover:bg-orange-50"
    }`}
  >
    <span>{icon}</span> {label}
  </button>
);

const ManageContentPage = () => {
  const [tab, setTab] = useState("subject");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // All subjects loaded from backend
  const [allSubjects, setAllSubjects] = useState([]);

  // Subject form
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    nameHi: "",
    namePa: "",
    class: "",
    isLang: false,
    icon: "📚",
  });

  // Chapter form - dropdown based
  const [chapterSelectedClass, setChapterSelectedClass] = useState("");
  const [chapterSelectedSubject, setChapterSelectedSubject] = useState("");
  const [chapterOptions, setChapterOptions] = useState([]);
  const [chapterForm, setChapterForm] = useState({
    title: "",
    titleHi: "",
    titlePa: "",
    order: "1",
  });

  // Content form - dropdown based
  const [contentSelectedClass, setContentSelectedClass] = useState("");
  const [contentSelectedSubject, setContentSelectedSubject] = useState("");
  const [contentSelectedChapter, setContentSelectedChapter] = useState("");
  const [contentChapterOptions, setContentChapterOptions] = useState([]);
  const [contentForm, setContentForm] = useState({
    text: "",
    videoUrl: "",
    language: "en",
  });

  // Manage tab
  const [manageClass, setManageClass] = useState("");
  const [manageSubject, setManageSubject] = useState("");
  const [manageChapter, setManageChapter] = useState("");
  const [manageChapterOptions, setManageChapterOptions] = useState([]);
  const [manageContents, setManageContents] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    text: "",
    videoUrl: "",
    language: "en",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setSuccess("");
    setTimeout(() => setError(""), 4000);
  };
  const classes = [1, 2, 3, 4, 5, 6];
  const iconOptions = [
    "📚",
    "🔢",
    "🌿",
    "📝",
    "📖",
    "🔬",
    "🌍",
    "🎨",
    "🏃",
    "🎵",
  ];

  // Load all subjects on mount
  useEffect(() => {
    fetchAllSubjects();
  }, []);

  const fetchAllSubjects = async () => {
    try {
      const r = await api.get("/admin/subjects/all");
      setAllSubjects(r.data.data || []);
    } catch {
      setAllSubjects([]);
    }
  };

  const fetchChapters = async (subjectId) => {
    if (!subjectId) return [];
    try {
      const r = await api.get(`/admin/chapters/subject/${subjectId}`);
      return r.data.data || [];
    } catch {
      return [];
    }
  };

  // Filter subjects by class
  const subjectsByClass = (cls) =>
    allSubjects.filter((s) => s.class === parseInt(cls));

  // Chapter tab handlers
  const handleChapterClassChange = (cls) => {
    setChapterSelectedClass(cls);
    setChapterSelectedSubject("");
    setChapterOptions([]);
  };

  const handleChapterSubjectChange = async (subjectId) => {
    setChapterSelectedSubject(subjectId);
    if (subjectId) {
      const chapters = await fetchChapters(subjectId);
      setChapterOptions(chapters);
    } else {
      setChapterOptions([]);
    }
  };

  // Content tab handlers
  const handleContentClassChange = (cls) => {
    setContentSelectedClass(cls);
    setContentSelectedSubject("");
    setContentSelectedChapter("");
    setContentChapterOptions([]);
  };

  const handleContentSubjectChange = async (subjectId) => {
    setContentSelectedSubject(subjectId);
    setContentSelectedChapter("");

    // Auto-set language for language subjects
    const subject = allSubjects.find((s) => s.id.toString() === subjectId);
    if (subject?.isLang) {
      // Lock language based on subject name
      if (subject.name.toLowerCase() === "hindi") {
        setContentForm((f) => ({ ...f, language: "hi" }));
      } else if (subject.name.toLowerCase() === "english") {
        setContentForm((f) => ({ ...f, language: "en" }));
      } else if (subject.name.toLowerCase() === "punjabi") {
        setContentForm((f) => ({ ...f, language: "pa" }));
      }
    } else {
      // Reset to English for non-language subjects
      setContentForm((f) => ({ ...f, language: "en" }));
    }

    if (subjectId) {
      const chapters = await fetchChapters(subjectId);
      setContentChapterOptions(chapters);
    } else {
      setContentChapterOptions([]);
    }
  };

  // Manage tab handlers
  const handleManageClassChange = (cls) => {
    setManageClass(cls);
    setManageSubject("");
    setManageChapter("");
    setManageChapterOptions([]);
    setManageContents([]);
  };

  const handleManageSubjectChange = async (subjectId) => {
    setManageSubject(subjectId);
    setManageChapter("");
    setManageContents([]);
    if (subjectId) {
      const chapters = await fetchChapters(subjectId);
      setManageChapterOptions(chapters);
    } else {
      setManageChapterOptions([]);
    }
  };

  const handleManageChapterChange = async (chapterId) => {
    setManageChapter(chapterId);
    if (!chapterId) {
      setManageContents([]);
      return;
    }
    try {
      const r = await api.get(`/admin/content/chapter/${chapterId}`);
      setManageContents(r.data.data || []);
    } catch {
      setManageContents([]);
    }
  };

  // Submit Subject
  const submitSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.class) {
      showError("Subject name and class are required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/subjects/add", {
        ...subjectForm,
        class: parseInt(subjectForm.class),
      });
      showSuccess(
        `✅ Subject "${subjectForm.name}" for Class ${subjectForm.class} added!`,
      );
      setSubjectForm({
        name: "",
        nameHi: "",
        namePa: "",
        class: "",
        isLang: false,
        icon: "📚",
      });
      fetchAllSubjects();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  // Submit Chapter
  const submitChapter = async (e) => {
    e.preventDefault();
    if (!chapterSelectedSubject || !chapterForm.title) {
      showError("Please select a subject and enter chapter title");
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/chapters/add", {
        subjectId: parseInt(chapterSelectedSubject),
        title: chapterForm.title,
        titleHi: chapterForm.titleHi,
        titlePa: chapterForm.titlePa,
        order: parseInt(chapterForm.order) || 1,
      });
      showSuccess(`✅ Chapter "${chapterForm.title}" added!`);
      setChapterForm({ title: "", titleHi: "", titlePa: "", order: "1" });
      // Refresh chapter list
      const updated = await fetchChapters(chapterSelectedSubject);
      setChapterOptions(updated);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add chapter");
    } finally {
      setLoading(false);
    }
  };

  // Submit Content
  const submitContent = async (e) => {
    e.preventDefault();
    if (!contentSelectedChapter || !contentForm.text) {
      showError("Please select a chapter and enter content text");
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/content/add", {
        chapterId: parseInt(contentSelectedChapter),
        text: contentForm.text,
        videoUrl: contentForm.videoUrl || null,
        language: contentForm.language,
      });
      const langName =
        contentForm.language === "en"
          ? "English"
          : contentForm.language === "hi"
            ? "Hindi"
            : "Punjabi";
      showSuccess(`✅ Content added in ${langName}!`);
      setContentForm({ text: "", videoUrl: "", language: "en" });
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add content");
    } finally {
      setLoading(false);
    }
  };

  // Update content
  const updateContent = async () => {
    if (!editForm.text.trim()) {
      showError("Content text cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/admin/content/${editItem.id}`, editForm);
      showSuccess("✅ Content updated!");
      setEditItem(null);
      if (manageChapter) handleManageChapterChange(manageChapter);
    } catch {
      showError("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  // Delete content
  const deleteContent = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/admin/content/${id}`);
      showSuccess("✅ Deleted!");
      setDeleteConfirm(null);
      setManageContents((prev) => prev.filter((c) => c.id !== id));
    } catch {
      showError("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const langLabel = (l) =>
    l === "en" ? "🇬🇧 English" : l === "hi" ? "🇮🇳 Hindi" : "🟡 Punjabi";
  const langColor = (l) =>
    l === "en"
      ? "bg-blue-100 text-blue-700"
      : l === "hi"
        ? "bg-orange-100 text-orange-700"
        : "bg-yellow-100 text-yellow-700";

  // Reusable class selector buttons
  const ClassButtons = ({ selected, onChange, color = "orange" }) => (
    <div className="flex gap-2 flex-wrap">
      {classes.map((c) => (
        <button
          type="button"
          key={c}
          onClick={() => onChange(c.toString())}
          className={`w-12 h-12 rounded-2xl font-display text-xl font-bold transition-all border-2 ${
            selected === c.toString()
              ? `bg-${color}-500 text-white border-${color}-500 scale-110 shadow-md`
              : `bg-white text-${color}-500 border-${color}-200 hover:bg-${color}-50`
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );

  // Reusable subject selector buttons
  const SubjectButtons = ({
    subjects,
    selected,
    onChange,
    color = "orange",
  }) => (
    <div className="grid grid-cols-2 gap-2">
      {subjects.map((s) => (
        <button
          type="button"
          key={s.id}
          onClick={() => onChange(s.id.toString())}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
            selected === s.id.toString()
              ? `bg-${color}-500 text-white border-${color}-500`
              : `bg-white text-gray-700 border-${color}-200 hover:bg-${color}-50`
          }`}
        >
          <span className="text-xl">{s.icon}</span>
          <span>{s.name}</span>
          {selected === s.id.toString() && <span className="ml-auto">✅</span>}
        </button>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl text-gray-800 mb-6">
          📝 Manage Content
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-orange-50 rounded-2xl p-1.5 mb-6">
          <Tab
            active={tab === "subject"}
            onClick={() => setTab("subject")}
            icon="📚"
            label="Add Subject"
          />
          <Tab
            active={tab === "chapter"}
            onClick={() => setTab("chapter")}
            icon="📖"
            label="Add Chapter"
          />
          <Tab
            active={tab === "content"}
            onClick={() => setTab("content")}
            icon="📝"
            label="Add Content"
          />
          <Tab
            active={tab === "manage"}
            onClick={() => setTab("manage")}
            icon="✏️"
            label="Edit / Delete"
          />
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl p-3 mb-4 font-semibold text-sm"
            >
              {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-3 mb-4 font-semibold text-sm"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ══════════ ADD SUBJECT ══════════ */}
          {tab === "subject" && (
            <motion.div
              key="subject"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-1">
                  📚 Add New Subject
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Select class from dropdown — no ID needed!
                </p>
                <form onSubmit={submitSubject} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">
                        🎓 Select Class *
                      </label>
                      <select
                        value={subjectForm.class}
                        onChange={(e) =>
                          setSubjectForm((f) => ({
                            ...f,
                            class: e.target.value,
                          }))
                        }
                        className={selectCls}
                        required
                      >
                        <option value="">-- Select Class --</option>
                        {classes.map((c) => (
                          <option key={c} value={c}>
                            Class {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">
                        📚 Subject Name (English) *
                      </label>
                      <input
                        value={subjectForm.name}
                        onChange={(e) =>
                          setSubjectForm((f) => ({
                            ...f,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g. Maths"
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">
                        🇮🇳 Hindi Name
                      </label>
                      <input
                        value={subjectForm.nameHi}
                        onChange={(e) =>
                          setSubjectForm((f) => ({
                            ...f,
                            nameHi: e.target.value,
                          }))
                        }
                        placeholder="गणित"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">
                        🟡 Punjabi Name
                      </label>
                      <input
                        value={subjectForm.namePa}
                        onChange={(e) =>
                          setSubjectForm((f) => ({
                            ...f,
                            namePa: e.target.value,
                          }))
                        }
                        placeholder="ਗਣਿਤ"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 text-sm">
                        🎨 Icon
                      </label>
                      <select
                        value={subjectForm.icon}
                        onChange={(e) =>
                          setSubjectForm((f) => ({
                            ...f,
                            icon: e.target.value,
                          }))
                        }
                        className={selectCls}
                      >
                        {iconOptions.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic} {ic}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="isLang"
                        checked={subjectForm.isLang}
                        onChange={(e) =>
                          setSubjectForm((f) => ({
                            ...f,
                            isLang: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 accent-orange-500 cursor-pointer"
                      />
                      <label
                        htmlFor="isLang"
                        className="text-gray-600 font-semibold text-sm cursor-pointer"
                      >
                        Is Language Subject?
                        <span className="block text-xs text-gray-400 font-normal">
                          Check for Hindi / English subjects
                        </span>
                      </label>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 disabled:opacity-60"
                  >
                    {loading ? "⏳ Adding Subject..." : "✅ Add Subject"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ══════════ ADD CHAPTER ══════════ */}
          {tab === "chapter" && (
            <motion.div
              key="chapter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-1">
                  📖 Add New Chapter
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Select class and subject — no Subject ID needed!
                </p>

                <form onSubmit={submitChapter} className="space-y-4">
                  {/* Step 1 - Class & Subject */}
                  <div className="bg-blue-50 rounded-3xl p-4 space-y-4">
                    <p className="font-bold text-blue-700 text-sm">
                      Step 1 — Select Class & Subject
                    </p>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2 text-sm">
                        🎓 Class
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {classes.map((c) => (
                          <button
                            type="button"
                            key={c}
                            onClick={() =>
                              handleChapterClassChange(c.toString())
                            }
                            className={`w-12 h-12 rounded-2xl font-display text-xl font-bold transition-all border-2 ${
                              chapterSelectedClass === c.toString()
                                ? "bg-blue-500 text-white border-blue-500 scale-110 shadow-md"
                                : "bg-white text-blue-500 border-blue-200 hover:bg-blue-50"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {chapterSelectedClass && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-gray-700 font-bold mb-2 text-sm">
                          📚 Subject
                        </label>
                        {subjectsByClass(chapterSelectedClass).length === 0 ? (
                          <p className="text-gray-400 text-sm">
                            No subjects for Class {chapterSelectedClass} yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {subjectsByClass(chapterSelectedClass).map((s) => (
                              <button
                                type="button"
                                key={s.id}
                                onClick={() =>
                                  handleChapterSubjectChange(s.id.toString())
                                }
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                  chapterSelectedSubject === s.id.toString()
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-white text-gray-700 border-blue-200 hover:bg-blue-50"
                                }`}
                              >
                                <span className="text-xl">{s.icon}</span>
                                <span>{s.name}</span>
                                {chapterSelectedSubject === s.id.toString() && (
                                  <span className="ml-auto">✅</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Show existing chapters */}
                    {chapterSelectedSubject && chapterOptions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl p-3"
                      >
                        <p className="text-xs font-bold text-gray-500 mb-2">
                          Existing chapters in this subject:
                        </p>
                        {chapterOptions.map((ch) => (
                          <div
                            key={ch.id}
                            className="text-xs text-gray-600 py-1.5 border-b border-gray-50 last:border-0 flex items-center gap-2"
                          >
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {ch.order}
                            </span>
                            {ch.title}
                          </div>
                        ))}
                      </motion.div>
                    )}
                    {chapterSelectedSubject && chapterOptions.length === 0 && (
                      <div className="bg-white rounded-2xl p-3 text-xs text-gray-400 text-center">
                        No chapters yet — be the first to add one! 🎉
                      </div>
                    )}
                  </div>

                  {/* Step 2 - Chapter Details */}
                  <div className="bg-orange-50 rounded-3xl p-4 space-y-3">
                    <p className="font-bold text-orange-700 text-sm">
                      Step 2 — Enter Chapter Details
                    </p>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3">
                        <label className="block text-gray-700 font-bold mb-1 text-sm">
                          Chapter Title (English) *
                        </label>
                        <input
                          value={chapterForm.title}
                          onChange={(e) =>
                            setChapterForm((f) => ({
                              ...f,
                              title: e.target.value,
                            }))
                          }
                          placeholder="e.g. Numbers 1 to 10"
                          className={inputCls}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1 text-sm">
                          Order
                        </label>
                        <input
                          type="number"
                          value={chapterForm.order}
                          onChange={(e) =>
                            setChapterForm((f) => ({
                              ...f,
                              order: e.target.value,
                            }))
                          }
                          min="1"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1 text-sm">
                          🇮🇳 Hindi Title
                        </label>
                        <input
                          value={chapterForm.titleHi}
                          onChange={(e) =>
                            setChapterForm((f) => ({
                              ...f,
                              titleHi: e.target.value,
                            }))
                          }
                          placeholder="1 से 10 तक की संख्याएं"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1 text-sm">
                          🟡 Punjabi Title
                        </label>
                        <input
                          value={chapterForm.titlePa}
                          onChange={(e) =>
                            setChapterForm((f) => ({
                              ...f,
                              titlePa: e.target.value,
                            }))
                          }
                          placeholder="1 ਤੋਂ 10 ਤੱਕ"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !chapterSelectedSubject}
                    className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 disabled:opacity-60"
                  >
                    {loading ? "⏳ Adding Chapter..." : "✅ Add Chapter"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ══════════ ADD CONTENT ══════════ */}
          {tab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-1">
                  📝 Add Content
                </h2>
                <p className="text-gray-400 text-sm mb-3">
                  Select class → subject → chapter from buttons below!
                </p>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-5 text-sm text-amber-700 font-semibold">
                  🌐 Non-language subjects (Maths, EVS, Science) → add in all 3
                  languages. Language subjects (Hindi, English) → add in their
                  own language only.
                </div>

                <form onSubmit={submitContent} className="space-y-4">
                  {/* Step 1 */}
                  <div className="bg-blue-50 rounded-3xl p-4 space-y-4">
                    <p className="font-bold text-blue-700 text-sm">
                      Step 1 — Select Class → Subject → Chapter
                    </p>

                    {/* Class */}
                    <div>
                      <label className="block text-gray-700 font-bold mb-2 text-sm">
                        🎓 Class
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {classes.map((c) => (
                          <button
                            type="button"
                            key={c}
                            onClick={() =>
                              handleContentClassChange(c.toString())
                            }
                            className={`w-12 h-12 rounded-2xl font-display text-xl font-bold transition-all border-2 ${
                              contentSelectedClass === c.toString()
                                ? "bg-orange-500 text-white border-orange-500 scale-110 shadow-md"
                                : "bg-white text-orange-500 border-orange-200 hover:bg-orange-50"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    {contentSelectedClass && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-gray-700 font-bold mb-2 text-sm">
                          📚 Subject
                        </label>
                        {subjectsByClass(contentSelectedClass).length === 0 ? (
                          <p className="text-gray-400 text-sm">
                            No subjects for this class.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {subjectsByClass(contentSelectedClass).map((s) => (
                              <button
                                type="button"
                                key={s.id}
                                onClick={() =>
                                  handleContentSubjectChange(s.id.toString())
                                }
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                  contentSelectedSubject === s.id.toString()
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white text-gray-700 border-orange-200 hover:bg-orange-50"
                                }`}
                              >
                                <span className="text-xl">{s.icon}</span>
                                <span>{s.name}</span>
                                {contentSelectedSubject === s.id.toString() && (
                                  <span className="ml-auto">✅</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Chapter */}
                    {contentSelectedSubject && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-gray-700 font-bold mb-2 text-sm">
                          📖 Chapter
                        </label>
                        {contentChapterOptions.length === 0 ? (
                          <div className="bg-white rounded-2xl p-4 text-center text-gray-400 text-sm">
                            No chapters found. Add chapters first in "Add
                            Chapter" tab.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {contentChapterOptions.map((ch) => (
                              <button
                                type="button"
                                key={ch.id}
                                onClick={() =>
                                  setContentSelectedChapter(ch.id.toString())
                                }
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all border-2 text-left ${
                                  contentSelectedChapter === ch.id.toString()
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white text-gray-700 border-orange-200 hover:bg-orange-50"
                                }`}
                              >
                                <span
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-display text-sm font-bold flex-shrink-0 ${
                                    contentSelectedChapter === ch.id.toString()
                                      ? "bg-white/20 text-white"
                                      : "bg-orange-100 text-orange-600"
                                  }`}
                                >
                                  {ch.order}
                                </span>
                                <span>{ch.title}</span>
                                {contentSelectedChapter ===
                                  ch.id.toString() && (
                                  <span className="ml-auto">✅</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Step 2 - Language */}
                  {contentSelectedChapter && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 rounded-3xl p-4"
                    >
                      <p className="font-bold text-green-700 text-sm mb-3">
                        Step 2 — Select Language
                      </p>

                      {/* Check if selected subject is a language subject */}
                      {allSubjects.find(
                        (s) => s.id.toString() === contentSelectedSubject,
                      )?.isLang ? (
                        // LANGUAGE SUBJECT — show locked message
                        <div className="bg-white rounded-2xl p-4 text-center">
                          <div className="text-3xl mb-2">
                            {contentForm.language === "hi"
                              ? "🇮🇳"
                              : contentForm.language === "en"
                                ? "🇬🇧"
                                : "🟡"}
                          </div>
                          <p className="font-bold text-gray-700">
                            {contentForm.language === "hi"
                              ? "Hindi (हिंदी)"
                              : contentForm.language === "en"
                                ? "English"
                                : "Punjabi (ਪੰਜਾਬੀ)"}
                          </p>
                          <p className="text-xs text-orange-500 font-semibold mt-2 bg-orange-50 rounded-xl px-3 py-2">
                            🔒 Language locked — This is a language subject.
                            Content will always be shown in this language
                            regardless of student's language preference.
                          </p>
                        </div>
                      ) : (
                        // NON-LANGUAGE SUBJECT — show all 3 options
                        <>
                          <p className="text-xs text-gray-500 mb-3 font-semibold">
                            ⚠️ Add content in ALL 3 languages for this subject!
                          </p>
                          <div className="flex gap-3">
                            {[
                              { code: "en", label: "🇬🇧 English" },
                              { code: "hi", label: "🇮🇳 Hindi" },
                              { code: "pa", label: "🟡 Punjabi" },
                            ].map((lang) => (
                              <button
                                type="button"
                                key={lang.code}
                                onClick={() =>
                                  setContentForm((f) => ({
                                    ...f,
                                    language: lang.code,
                                  }))
                                }
                                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                  contentForm.language === lang.code
                                    ? "bg-green-500 text-white border-green-500"
                                    : "bg-white text-gray-700 border-green-200 hover:bg-green-50"
                                }`}
                              >
                                {lang.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3 - Content */}
                  {contentSelectedChapter && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-50 rounded-3xl p-4 space-y-3"
                    >
                      <p className="font-bold text-purple-700 text-sm">
                        Step 3 — Write Content
                      </p>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1 text-sm">
                          Content Text *
                        </label>
                        <textarea
                          value={contentForm.text}
                          onChange={(e) =>
                            setContentForm((f) => ({
                              ...f,
                              text: e.target.value,
                            }))
                          }
                          placeholder="Enter the lesson content here..."
                          rows={7}
                          className={`${inputCls} resize-none`}
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {contentForm.text.length} characters
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-1 text-sm">
                          🎥 Video URL (Optional)
                        </label>
                        <input
                          value={contentForm.videoUrl}
                          onChange={(e) =>
                            setContentForm((f) => ({
                              ...f,
                              videoUrl: e.target.value,
                            }))
                          }
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={inputCls}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Summary */}
                  {contentSelectedChapter && contentForm.text && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-50 rounded-2xl p-4 text-sm"
                    >
                      <p className="font-bold text-gray-700 mb-2">
                        📋 Ready to submit:
                      </p>
                      <div className="space-y-1 text-gray-600">
                        <p>
                          🎓 Class: <strong>{contentSelectedClass}</strong>
                        </p>
                        <p>
                          📚 Subject:{" "}
                          <strong>
                            {
                              allSubjects.find(
                                (s) =>
                                  s.id.toString() === contentSelectedSubject,
                              )?.name
                            }
                          </strong>
                        </p>
                        <p>
                          📖 Chapter:{" "}
                          <strong>
                            {
                              contentChapterOptions.find(
                                (c) =>
                                  c.id.toString() === contentSelectedChapter,
                              )?.title
                            }
                          </strong>
                        </p>
                        <p>
                          🌐 Language:{" "}
                          <strong>
                            {contentForm.language === "en"
                              ? "🇬🇧 English"
                              : contentForm.language === "hi"
                                ? "🇮🇳 Hindi"
                                : "🟡 Punjabi"}
                          </strong>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={
                      loading || !contentSelectedChapter || !contentForm.text
                    }
                    className="w-full btn-kids bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-lg py-4 disabled:opacity-60"
                  >
                    {loading ? "⏳ Adding Content..." : "✅ Add Content"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ══════════ MANAGE EDIT/DELETE ══════════ */}
          {tab === "manage" && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-4xl p-6 shadow-card">
                <h2 className="font-display text-2xl text-gray-700 mb-1">
                  ✏️ Edit / Delete Content
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Select class, subject and chapter to manage content.
                </p>

                {/* Class selector */}
                <div className="bg-blue-50 rounded-3xl p-4 space-y-4 mb-5">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 text-sm">
                      🎓 Class
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {classes.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => handleManageClassChange(c.toString())}
                          className={`w-12 h-12 rounded-2xl font-display text-xl font-bold transition-all border-2 ${
                            manageClass === c.toString()
                              ? "bg-blue-600 text-white border-blue-600 scale-110 shadow-md"
                              : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {manageClass && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-gray-700 font-bold mb-2 text-sm">
                        📚 Subject
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {subjectsByClass(manageClass).map((s) => (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() =>
                              handleManageSubjectChange(s.id.toString())
                            }
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                              manageSubject === s.id.toString()
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-blue-200 hover:bg-blue-50"
                            }`}
                          >
                            <span>{s.icon}</span> {s.name}
                            {manageSubject === s.id.toString() && (
                              <span className="ml-auto">✅</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {manageSubject && manageChapterOptions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-gray-700 font-bold mb-1 text-sm">
                        📖 Chapter
                      </label>
                      <select
                        value={manageChapter}
                        onChange={(e) =>
                          handleManageChapterChange(e.target.value)
                        }
                        className={selectCls}
                      >
                        <option value="">-- Select Chapter --</option>
                        {manageChapterOptions.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.title}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {manageSubject && manageChapterOptions.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">
                      No chapters in this subject yet.
                    </p>
                  )}
                </div>

                {/* Content list */}
                {!manageChapter && (
                  <div className="text-center py-10 text-gray-300">
                    <div className="text-5xl mb-3">👆</div>
                    <p>
                      Select class → subject → chapter above to manage content.
                    </p>
                  </div>
                )}

                {manageChapter && manageContents.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-5xl mb-3">📭</div>
                    <p>No content yet for this chapter.</p>
                    <p className="text-sm mt-1">
                      Go to "Add Content" tab to add.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {manageContents.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-2 border-gray-100 rounded-3xl p-5 hover:border-orange-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${langColor(item.language)}`}
                        >
                          {langLabel(item.language)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditItem(item);
                              setEditForm({
                                text: item.text,
                                videoUrl: item.videoUrl || "",
                                language: item.language,
                              });
                            }}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl font-bold text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-xl font-bold text-sm"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {item.text}
                      </p>
                      {item.videoUrl && (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-red-500 mt-2 inline-block hover:underline"
                        >
                          ▶️ Video attached
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════ EDIT MODAL ══════════ */}
        <AnimatePresence>
          {editItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setEditItem(null)}
            >
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.85 }}
                className="bg-white rounded-4xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-2xl text-gray-800 mb-4">
                  ✏️ Edit Content
                </h3>
                <div className="space-y-4">
                  <div>
  <label className="block text-gray-700 font-bold mb-1 text-sm">
    Language
  </label>
  {allSubjects.find(s => s.id.toString() === manageSubject)?.isLang ? (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">
        {editForm.language === 'hi' ? '🇮🇳' :
         editForm.language === 'en' ? '🇬🇧' : '🟡'}
      </span>
      <div>
        <p className="font-bold text-gray-700 text-sm">
          {editForm.language === 'hi' ? 'Hindi (हिंदी)' :
           editForm.language === 'en' ? 'English' :
           'Punjabi (ਪੰਜਾਬੀ)'}
        </p>
        <p className="text-xs text-orange-500 font-semibold mt-1">
          🔒 Language locked — this is a language subject
        </p>
      </div>
    </div>
  ) : (
    <select
      value={editForm.language}
      onChange={(e) =>
        setEditForm((f) => ({ ...f, language: e.target.value }))
      }
      className={selectCls}
    >
      <option value="en">🇬🇧 English</option>
      <option value="hi">🇮🇳 Hindi</option>
      <option value="pa">🟡 Punjabi</option>
    </select>
  )}
</div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">
                      Content Text *
                    </label>
                    <textarea
                      value={editForm.text}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, text: e.target.value }))
                      }
                      rows={8}
                      className={`${inputCls} resize-none`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {editForm.text.length} characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">
                      Video URL
                    </label>
                    <input
                      value={editForm.videoUrl}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, videoUrl: e.target.value }))
                      }
                      placeholder="https://youtube.com/..."
                      className={inputCls}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditItem(null)}
                      className="flex-1 btn-kids bg-gray-100 text-gray-600"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={updateContent}
                      disabled={loading}
                      className="flex-1 btn-kids bg-gradient-to-r from-blue-500 to-indigo-500 text-white disabled:opacity-60"
                    >
                      {loading ? "⏳ Saving..." : "💾 Save Changes"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════ DELETE MODAL ══════════ */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-4xl p-6 max-w-sm w-full shadow-xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-5xl mb-3">⚠️</div>
                <h3 className="font-display text-2xl text-gray-800 mb-2">
                  Delete Content?
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  This permanently deletes the content. Students will no longer
                  see it.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 btn-kids bg-gray-100 text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteContent(deleteConfirm)}
                    disabled={loading}
                    className="flex-1 btn-kids bg-red-500 text-white disabled:opacity-60"
                  >
                    {loading ? "⏳" : "🗑 Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default ManageContentPage;
