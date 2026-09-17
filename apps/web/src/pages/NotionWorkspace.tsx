import {
  ArrowLeft,
  BookOpen,
  Brain,
  Mic,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Navbar } from '../components/Navbar'
import { ReadingProgress } from '../components/ui/reading-progress'
import { ShinyButton } from '../components/ui/shiny-button'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'

export function NotionWorkspace() {
  const { isAuthenticated } = useAuth()
  const { notes, activeNoteId, setActiveNoteId, addNote, updateNote, deleteNote } = useNotes()
  const navigate = useNavigate()
  const scrollerRef = useRef<HTMLTextAreaElement>(null)

  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('All')

  if (!isAuthenticated) {
    navigate('/login', { replace: true })
    return null
  }

  // Find active note object
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null

  // Filtered notes list
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  // Create new note
  const handleCreateNewNote = async () => {
    const created = await addNote({
      title: 'Untitled Notion Note',
      subject: 'Computer Science',
      content: '# New Concept Notes\n\nStart typing your study notes here...',
      icon: 'note',
    })
    setActiveNoteId(created.id)
  }

  // Handle Feynman practice launch with selected note
  const handlePracticeNote = () => {
    if (!activeNote) return
    navigate(`/concept/new?noteId=${activeNote.id}&topic=${encodeURIComponent(activeNote.title)}`)
  }

  const wordCount = activeNote ? activeNote.content.split(/\s+/).filter(Boolean).length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1917] via-[#2a2421] to-[#14100e] text-[#f5efe8]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6">
        {/* Top Header Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-[#e8c89b] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Subjects &amp; Stored Notes</span>
              <span className="rounded-full bg-[#e8c89b]/15 border border-[#e8c89b]/30 px-3 py-1 text-xs font-bold text-[#e8c89b]">
                {notes.length} Notes Stored
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNewNote}
              className="glass inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4 text-[#e8c89b]" />
              <span>+ Add Note</span>
            </button>

            {activeNote && (
              <ShinyButton
                label="Take Feynman Test"
                onClick={handlePracticeNote}
                accentColor="#e8c89b"
                accentSoftColor="#f5efe8"
                fillColor="#2b2421"
                cornerRadius={9999}
                className="px-5 py-2.5 text-xs font-bold"
              />
            )}
          </div>
        </div>

        {/* Workspace Layout: Left Notion Sidebar + Right Editor Canvas */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* ================= LEFT NOTION SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard dark className="p-5 border border-white/15 shadow-2xl">
              {/* Search Bar */}
              <div className="mb-4 glass flex items-center gap-2 rounded-xl px-3.5 py-2.5 border border-white/10">
                <Search className="h-4 w-4 text-white/50" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes across subjects..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
                />
              </div>

              {/* Subject Filter Pills */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {['All', 'Computer Science', 'Physics & Engineering', 'Biology & Medicine', 'Mathematics', 'General Studies'].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition border ${
                      selectedSubject === subj
                        ? 'border-[#e8c89b] bg-[#e8c89b]/20 text-[#e8c89b]'
                        : 'border-white/10 glass text-white/60 hover:text-white'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              {/* Stored Notes List */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredNotes.length === 0 ? (
                  <p className="py-8 text-center text-xs text-white/50">
                    No notes match your search. Click &ldquo;+ Add Note&rdquo; to add one!
                  </p>
                ) : (
                  filteredNotes.map((note) => {
                    const isActive = note.id === activeNote?.id
                    return (
                      <button
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`w-full text-left rounded-2xl p-3.5 transition border ${
                          isActive
                            ? 'border-[#e8c89b]/60 bg-[#e8c89b]/15 shadow-lg'
                            : 'border-white/10 glass hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 truncate">
                            <BookOpen className="h-4 w-4 text-[#e8c89b] shrink-0" />
                            <span className="text-xs font-bold text-white truncate">
                              {note.title}
                            </span>
                          </div>
                          {note.lectorScore && (
                            <span className="shrink-0 rounded-full bg-[#e8c89b]/20 border border-[#e8c89b]/40 px-2 py-0.5 text-[10px] font-bold text-[#e8c89b]">
                              {note.lectorScore} Score
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
                          <span className="truncate">{note.subject}</span>
                          <span>{note.practiceCount} Feynman Practices</span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </GlassCard>
          </div>

          {/* ================= RIGHT NOTION EDITOR CANVAS ================= */}
          <div className="lg:col-span-8">
            {activeNote ? (
              <GlassCard dark className="p-8 border border-white/15 shadow-2xl relative">
                {/* LECTOR Score & Practice Retention Banner */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8c89b]/20 border border-[#e8c89b]/40">
                      <Brain className="h-5 w-5 text-[#e8c89b]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8c89b]">
                        LECTOR Retention Health
                      </span>
                      <p className="text-sm font-bold text-white">
                        {activeNote.retentionHealth}% Retention &bull; {activeNote.practiceCount} Practice Sessions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePracticeNote}
                      className="btn-glow inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-md"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Practice Feynman Method</span>
                    </button>

                    <button
                      onClick={() => void deleteNote(activeNote.id)}
                      title="Delete Note"
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Subject Category */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                      <BookOpen className="h-5 w-5 text-[#e8c89b]" />
                    </div>
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                      placeholder="Note Title..."
                      className="w-full bg-transparent text-2xl font-bold text-white outline-none border-b border-white/10 pb-2 focus:border-[#e8c89b]"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-white/50 font-semibold">Subject Category:</span>
                    <select
                      value={activeNote.subject}
                      onChange={(e) => updateNote(activeNote.id, { subject: e.target.value })}
                      className="glass rounded-xl border border-white/15 px-3 py-1.5 text-xs text-[#e8c89b] font-semibold outline-none"
                    >
                      <option value="Computer Science" className="bg-[#1e1917]">Computer Science</option>
                      <option value="Physics & Engineering" className="bg-[#1e1917]">Physics &amp; Engineering</option>
                      <option value="Biology & Medicine" className="bg-[#1e1917]">Biology &amp; Medicine</option>
                      <option value="Mathematics" className="bg-[#1e1917]">Mathematics</option>
                    </select>
                  </div>
                </div>

                {/* Reading Progress Component Bar */}
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#e8c89b]">
                    Live Reading Progress Indicator
                  </span>
                  <ReadingProgress scroller={scrollerRef} words={wordCount} />
                </div>

                {/* Main Notion Content Textarea */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-white/50">
                    <span className="font-semibold uppercase tracking-wider text-[#e8c89b]">
                      Notion Markdown Content
                    </span>
                    <span>
                      {wordCount} Words &bull; {activeNote.content.length} Chars
                    </span>
                  </div>

                  <textarea
                    ref={scrollerRef}
                    rows={16}
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    className="glass w-full rounded-2xl border border-white/15 p-5 text-sm leading-relaxed text-white font-mono placeholder:text-white/30 outline-none focus:border-[#e8c89b]"
                  />
                </div>

                {/* Footer Bar */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-white/50">
                  <div className="flex items-center gap-4">
                    <span>Created: {activeNote.createdAt}</span>
                    <span>Updated: {activeNote.updatedAt}</span>
                  </div>

                  <ShinyButton
                    label="Practice Feynman Method with this Note"
                    onClick={handlePracticeNote}
                    accentColor="#e8c89b"
                    accentSoftColor="#f5efe8"
                    fillColor="#2b2421"
                    cornerRadius={9999}
                    className="px-6 py-3 text-xs font-bold"
                  />
                </div>
              </GlassCard>
            ) : (
              <GlassCard dark className="p-12 text-center border border-white/15">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#e8c89b]/50" />
                <h3 className="text-lg font-bold text-white">No Note Selected</h3>
                <p className="mt-2 text-xs text-white/50">
                  Select a note from the Notion sidebar or create a new note to start writing and practicing.
                </p>
                <button
                  onClick={handleCreateNewNote}
                  className="btn-glow mt-6 rounded-full px-6 py-2.5 text-xs font-bold"
                >
                  + Create New Note
                </button>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
