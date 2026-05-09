import { useState, useEffect, useMemo } from "react";
import {
  StickyNote, Bookmark, Plus, Search, Pin, Trash2,
  Edit3, Copy, ExternalLink, Check, X, Code, FileText,
  Tag, Star, RefreshCw, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { trackModuleVisit } from "../utils/progressTracker";

// ── Constants ──────────────────────────────────────────────
const TAGS = ["DSA", "React", "JavaScript", "SQL", "OS", "Python", "System Design", "Other"];

const CODE_LANGUAGES = ["javascript", "python", "java", "cpp", "sql", "bash", "html", "css", "other"];

const TAG_COLORS = {
  DSA:           "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  React:         "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  JavaScript:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  SQL:           "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  OS:            "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  Python:        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "System Design":"bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  Other:         "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

const LS_NOTES_KEY     = "cs_notes";
const LS_BOOKMARKS_KEY = "cs_bookmarks";

// ── Helpers ────────────────────────────────────────────────
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const now  = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const readLS  = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const writeLS = (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── Empty form states ──────────────────────────────────────
const emptyNote = () => ({
  id: uid(), title: "", content: "", type: "text",
  language: "javascript", tags: [], pinned: false, date: now(),
});

const emptyBookmark = () => ({
  id: uid(), title: "", url: "", description: "",
  tags: [], pinned: false, date: now(),
});

// ══════════════════════════════════════════════════════════
export default function NotesBookmarks() {
  const { user }      = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab]     = useState("notes");      // "notes" | "bookmarks"
  const [notes, setNotes]             = useState([]);
  const [bookmarks, setBookmarks]     = useState([]);
  const [search, setSearch]           = useState("");
  const [filterTag, setFilterTag]     = useState("All");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(emptyNote());
  const [bmForm, setBmForm]           = useState(emptyBookmark());
  const [copiedId, setCopiedId]       = useState(null);
  const [syncing, setSyncing]         = useState(false);
  const [expandedId, setExpandedId]   = useState(null);

  // ── Load from localStorage + Firestore on mount ──────────
  useEffect(() => {
    trackModuleVisit("Notes & Bookmarks");
    setNotes(readLS(LS_NOTES_KEY, []));
    setBookmarks(readLS(LS_BOOKMARKS_KEY, []));

    if (!user) return;
    const restore = async () => {
      try {
        const ref  = doc(db, "users", user.uid, "notesData", "snapshot");
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const data = snap.data();

        // Merge: combine Firestore + local, deduplicate by id
        if (data.notes) {
          setNotes(prev => {
            const merged = [...prev];
            data.notes.forEach(n => { if (!merged.find(x => x.id === n.id)) merged.push(n); });
            writeLS(LS_NOTES_KEY, merged);
            return merged;
          });
        }
        if (data.bookmarks) {
          setBookmarks(prev => {
            const merged = [...prev];
            data.bookmarks.forEach(b => { if (!merged.find(x => x.id === b.id)) merged.push(b); });
            writeLS(LS_BOOKMARKS_KEY, merged);
            return merged;
          });
        }
      } catch (e) { console.warn("Firestore restore failed", e); }
    };
    restore();
  }, [user]);

  // ── Sync to Firestore ────────────────────────────────────
  const syncToFirestore = async (notesData, bookmarksData) => {
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid, "notesData", "snapshot");
      await setDoc(ref, { notes: notesData, bookmarks: bookmarksData, lastSynced: new Date().toISOString() }, { merge: true });
    } catch (e) { console.warn("Firestore sync failed", e); }
  };

  const manualSync = async () => {
    if (!user) { showToast("Sign in to sync to cloud", "warning"); return; }
    setSyncing(true);
    await syncToFirestore(notes, bookmarks);
    setSyncing(false);
    showToast("✅ Synced to cloud!", "success");
  };

  // ── Save helpers ─────────────────────────────────────────
  const saveNotes = (updated) => {
    setNotes(updated);
    writeLS(LS_NOTES_KEY, updated);
    syncToFirestore(updated, bookmarks);
  };

  const saveBookmarks = (updated) => {
    setBookmarks(updated);
    writeLS(LS_BOOKMARKS_KEY, updated);
    syncToFirestore(notes, updated);
  };

  // ── Note CRUD ────────────────────────────────────────────
  const submitNote = () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.content.trim()) { showToast("Content is required", "error"); return; }

    let updated;
    if (editingId) {
      updated = notes.map(n => n.id === editingId ? { ...form, id: editingId } : n);
      showToast("✅ Note updated!", "success");
    } else {
      updated = [{ ...form, id: uid(), date: now() }, ...notes];
      showToast("✅ Note saved!", "success");
    }
    saveNotes(updated);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyNote());
  };

  const deleteNote = (id) => {
    saveNotes(notes.filter(n => n.id !== id));
    showToast("Note deleted", "info");
  };

  const togglePinNote = (id) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const editNote = (note) => {
    setForm({ ...note });
    setEditingId(note.id);
    setShowForm(true);
    setActiveTab("notes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyCode = (id, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast("Code copied!", "success");
    });
  };

  // ── Bookmark CRUD ────────────────────────────────────────
  const submitBookmark = () => {
    if (!bmForm.title.trim()) { showToast("Title is required", "error"); return; }
    if (!bmForm.url.trim())   { showToast("URL is required", "error"); return; }
    const url = bmForm.url.startsWith("http") ? bmForm.url : "https://" + bmForm.url;

    let updated;
    if (editingId) {
      updated = bookmarks.map(b => b.id === editingId ? { ...bmForm, url, id: editingId } : b);
      showToast("✅ Bookmark updated!", "success");
    } else {
      updated = [{ ...bmForm, url, id: uid(), date: now() }, ...bookmarks];
      showToast("✅ Bookmark saved!", "success");
    }
    saveBookmarks(updated);
    setShowForm(false);
    setEditingId(null);
    setBmForm(emptyBookmark());
  };

  const deleteBookmark = (id) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
    showToast("Bookmark deleted", "info");
  };

  const togglePinBookmark = (id) => {
    saveBookmarks(bookmarks.map(b => b.id === id ? { ...b, pinned: !b.pinned } : b));
  };

  const editBookmark = (bm) => {
    setBmForm({ ...bm });
    setEditingId(bm.id);
    setShowForm(true);
    setActiveTab("bookmarks");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Tag toggle helper (shared for note + bookmark forms) ─
  const toggleTag = (tag, current, setter, key) => {
    const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    setter(prev => ({ ...prev, [key]: updated }));
  };

  // ── Cancel form ──────────────────────────────────────────
  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyNote());
    setBmForm(emptyBookmark());
  };

  // ── Filtered + sorted lists ──────────────────────────────
  const filteredNotes = useMemo(() => {
    let list = [...notes];
    if (filterTag !== "All") list = list.filter(n => n.tags.includes(filterTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    // Pinned first
    return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [notes, search, filterTag]);

  const filteredBookmarks = useMemo(() => {
    let list = [...bookmarks];
    if (filterTag !== "All") list = list.filter(b => b.tags.includes(filterTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [bookmarks, search, filterTag]);

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <StickyNote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes & Bookmarks</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {notes.length} notes · {bookmarks.length} bookmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={manualSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sync
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyNote()); setBmForm(emptyBookmark()); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-all shadow-md shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            {activeTab === "notes" ? "New Note" : "New Bookmark"}
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: "notes",     label: "Notes",     icon: StickyNote, count: notes.length },
          { id: "bookmarks", label: "Bookmarks", icon: Bookmark,   count: bookmarks.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setShowForm(false); setEditingId(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === id ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" : "bg-gray-200 dark:bg-gray-600 text-gray-500"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Form Panel ──────────────────────────────────── */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {editingId ? "Edit" : "New"} {activeTab === "notes" ? "Note" : "Bookmark"}
            </h2>
            <button onClick={cancelForm} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* ── NOTE FORM ── */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              {/* Type toggle */}
              <div className="flex gap-2">
                {[
                  { value: "text", label: "Text Note", icon: FileText },
                  { value: "code", label: "Code Snippet", icon: Code },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setForm(f => ({ ...f, type: value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                      form.type === value
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              {/* Language (only for code) */}
              {form.type === "code" && (
                <select
                  value={form.language}
                  onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {CODE_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              )}

              {/* Title */}
              <input
                type="text"
                placeholder="Note title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-violet-400"
              />

              {/* Content */}
              <textarea
                rows={form.type === "code" ? 8 : 5}
                placeholder={form.type === "code" ? "Paste your code here..." : "Write your note..."}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white text-sm focus:outline-none focus:border-violet-400 resize-none ${
                  form.type === "code"
                    ? "font-mono text-xs dark:bg-gray-900 dark:text-green-400"
                    : "dark:bg-gray-700 dark:text-white"
                }`}
              />

              {/* Tags */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, form.tags, setForm, "tags")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        form.tags.includes(tag)
                          ? "border-violet-400 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                          : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={submitNote}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-all"
                >
                  {editingId ? "Update Note" : "Save Note"}
                </button>
                <button onClick={cancelForm} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── BOOKMARK FORM ── */}
          {activeTab === "bookmarks" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Bookmark title..."
                value={bmForm.title}
                onChange={e => setBmForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-violet-400"
              />
              <input
                type="url"
                placeholder="https://..."
                value={bmForm.url}
                onChange={e => setBmForm(f => ({ ...f, url: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-violet-400"
              />
              <textarea
                rows={3}
                placeholder="Short description (optional)..."
                value={bmForm.description}
                onChange={e => setBmForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-violet-400 resize-none"
              />
              {/* Tags */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, bmForm.tags, setBmForm, "tags")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        bmForm.tags.includes(tag)
                          ? "border-violet-400 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                          : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={submitBookmark}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-all"
                >
                  {editingId ? "Update Bookmark" : "Save Bookmark"}
                </button>
                <button onClick={cancelForm} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Search + Filter ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-violet-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...TAGS].map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterTag === tag
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── NOTES LIST ──────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <StickyNote className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No notes yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {search || filterTag !== "All" ? "Try clearing filters" : "Click \"New Note\" to get started"}
              </p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all ${
                  note.pinned
                    ? "border-violet-300 dark:border-violet-700 shadow-md shadow-violet-500/10"
                    : "border-gray-100 dark:border-gray-700"
                }`}
              >
                {/* Card header */}
                <div className="flex items-start gap-3 p-4">
                  {/* Type icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    note.type === "code"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-violet-100 dark:bg-violet-900/30"
                  }`}>
                    {note.type === "code"
                      ? <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
                      : <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {note.pinned && <Pin className="w-3 h-3 text-violet-500 flex-shrink-0" />}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {note.title}
                      </h3>
                      {note.type === "code" && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-mono">
                          {note.language}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{note.date}</p>
                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tag => (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || TAG_COLORS.Other}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {note.type === "code" && (
                      <button
                        onClick={() => copyCode(note.id, note.content)}
                        title="Copy code"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        {copiedId === note.id
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <Copy className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    )}
                    <button
                      onClick={() => togglePinNote(note.id)}
                      title={note.pinned ? "Unpin" : "Pin"}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <Pin className={`w-4 h-4 ${note.pinned ? "text-violet-500" : "text-gray-400"}`} />
                    </button>
                    <button
                      onClick={() => editNote(note)}
                      title="Edit"
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      {expandedId === note.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>

                {/* Expandable content */}
                {expandedId === note.id && (
                  <div className="px-4 pb-4">
                    <div className={`rounded-xl p-4 text-sm ${
                      note.type === "code"
                        ? "bg-gray-900 dark:bg-black font-mono text-green-400 text-xs overflow-x-auto whitespace-pre"
                        : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                    }`}>
                      {note.content}
                    </div>
                  </div>
                )}

                {/* Preview (when collapsed) */}
                {expandedId !== note.id && (
                  <div className="px-4 pb-4">
                    <p className={`text-xs line-clamp-2 ${
                      note.type === "code"
                        ? "font-mono text-gray-500 dark:text-gray-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {note.content}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── BOOKMARKS LIST ───────────────────────────────── */}
      {activeTab === "bookmarks" && (
        <div className="space-y-3">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No bookmarks yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {search || filterTag !== "All" ? "Try clearing filters" : "Click \"New Bookmark\" to save a link"}
              </p>
            </div>
          ) : (
            filteredBookmarks.map(bm => (
              <div
                key={bm.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all ${
                  bm.pinned
                    ? "border-violet-300 dark:border-violet-700 shadow-md shadow-violet-500/10"
                    : "border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {bm.pinned && <Pin className="w-3 h-3 text-violet-500 flex-shrink-0" />}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {bm.title}
                      </h3>
                    </div>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline truncate block mt-0.5 max-w-xs"
                    >
                      {bm.url}
                    </a>
                    {bm.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bm.description}</p>
                    )}
                    {bm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bm.tags.map(tag => (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || TAG_COLORS.Other}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{bm.date}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open link"
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </a>
                    <button
                      onClick={() => togglePinBookmark(bm.id)}
                      title={bm.pinned ? "Unpin" : "Pin"}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <Pin className={`w-4 h-4 ${bm.pinned ? "text-violet-500" : "text-gray-400"}`} />
                    </button>
                    <button
                      onClick={() => editBookmark(bm)}
                      title="Edit"
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteBookmark(bm.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}