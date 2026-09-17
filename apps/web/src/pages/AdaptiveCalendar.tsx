import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Brain,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Plus,
  Settings,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Navbar } from '../components/Navbar'
import { ShinyButton } from '../components/ui/shiny-button'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'

export function AdaptiveCalendar() {
  const { isAuthenticated } = useAuth()
  const {
    notes,
    importantDates,
    studyMode,
    examTargetDate,
    examTitle,
    setStudyMode,
    addImportantDate,
    deleteImportantDate,
  } = useNotes()
  const navigate = useNavigate()

  // Selected date state (defaults to today '2026-09-18')
  const todayStr = '2026-09-18'
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)

  // Exam settings state for modal/inline editing
  const [showExamModal, setShowExamModal] = useState(false)
  const [tempExamDate, setTempExamDate] = useState(examTargetDate)
  const [tempExamTitle, setTempExamTitle] = useState(examTitle)

  // Current view month/year
  const [currentMonth, setCurrentMonth] = useState(8) // 0-indexed: 8 = September
  const [currentYear, setCurrentYear] = useState(2026)

  // Mark Important Date Form Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState(todayStr)
  const [newSubject, setNewSubject] = useState('Computer Science')
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high')
  const [newDescription, setNewDescription] = useState('')

  if (!isAuthenticated) {
    navigate('/login', { replace: true })
    return null
  }

  // Calculate days remaining until exam
  const daysUntilExam = (() => {
    const tMs = new Date(todayStr).getTime()
    const eMs = new Date(examTargetDate).getTime()
    return Math.max(0, Math.ceil((eMs - tMs) / (1000 * 60 * 60 * 24)))
  })()

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay() // 0 = Sun

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Filter notes due on selected date
  const dueNotesOnSelectedDate = notes.filter((n) => {
    if (!n.nextReviewDate) return false
    return n.nextReviewDate === selectedDate
  })

  // All notes due today or past due
  const totalDueToday = notes.filter((n) => {
    if (!n.nextReviewDate) return false
    return n.nextReviewDate <= todayStr
  })

  // Important dates on selected date
  const importantOnSelectedDate = importantDates.filter((d) => d.date === selectedDate)

  // Handle Add Important Date
  const handleAddImportantDate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newDate) return

    await addImportantDate({
      title: newTitle,
      date: newDate,
      subject: newSubject,
      priority: newPriority,
      description: newDescription,
    })

    setNewTitle('')
    setNewDescription('')
    setShowAddModal(false)
  }

  const handleSaveExamSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await setStudyMode('exam', tempExamDate, tempExamTitle)
    setShowExamModal(false)
  }

  // Helper for date string formatting YYYY-MM-DD
  const formatDateStr = (dayNum: number) => {
    const m = String(currentMonth + 1).padStart(2, '0')
    const d = String(dayNum).padStart(2, '0')
    return `${currentYear}-${m}-${d}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1917] via-[#2a2421] to-[#14100e] text-[#f5efe8]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6">
        {/* Navigation Back */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-[#e8c89b] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Adaptive Calendar &amp; Mode Hub</span>
              <span className="rounded-full bg-[#e8c89b]/15 border border-[#e8c89b]/30 px-3 py-1 text-xs font-bold text-[#e8c89b]">
                {totalDueToday.length} Due Today
              </span>
            </h1>
            <p className="mt-1 text-xs text-[#f5efe8]/70">
              Switch between Exam Mode (accelerated deadline revisions) and Skill Mode (lifelong learning with no time limit).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="glass inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-[#e8c89b] transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4 text-[#e8c89b]" />
              <span>Mark Important Date ⭐</span>
            </button>
          </div>
        </div>

        {/* ================= STUDY MODE SELECTOR CARD ================= */}
        <GlassCard dark className="mb-8 p-6 border border-[#e8c89b]/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e8c89b] flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4" /> Active Spaced Learning Strategy:
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {studyMode === 'exam' ? (
                  <>
                    <span className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-[#e8c89b]" /> Exam Mode (Accelerated Revisions)</span>
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-xs text-amber-300 font-bold">
                      {daysUntilExam} Days Left Until Exam
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-2"><Brain className="h-5 w-5 text-[#e8c89b]" /> Skill Mastery Mode (No Time Limit)</span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs text-emerald-300 font-bold">
                      Lifelong Spaced Repetition
                    </span>
                  </>
                )}
              </h2>
              <p className="mt-1 text-xs text-white/70 max-w-2xl">
                {studyMode === 'exam'
                  ? `Your revision frequency is automatically compressed to review all topics before your exam target (${examTitle} on ${examTargetDate}).`
                  : 'No strict exam deadlines. Revisions expand gradually over time to maximize long-term retention.'}
              </p>
            </div>

            {/* Mode Switcher Toggle Buttons */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-1.5 backdrop-blur-md">
              <button
                onClick={() => void setStudyMode('exam', examTargetDate, examTitle)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
                  studyMode === 'exam'
                    ? 'bg-[#e8c89b] text-[#1e1917] shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Exam Mode</span>
              </button>

              <button
                onClick={() => void setStudyMode('skill')}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
                  studyMode === 'skill'
                    ? 'bg-[#e8c89b] text-[#1e1917] shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Skill Mode</span>
              </button>
            </div>
          </div>

          {/* Exam Target Date Configuration Sub-bar when in Exam Mode */}
          {studyMode === 'exam' && (
            <div className="mt-5 border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#e8c89b] font-bold">Target Exam:</span>
                <span className="text-white font-semibold">{examTitle}</span>
                <span className="text-white/60">({examTargetDate})</span>
              </div>

              <button
                onClick={() => setShowExamModal(true)}
                className="glass rounded-full px-4 py-1.5 text-xs font-bold text-[#e8c89b] hover:bg-white/10 flex items-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" /> Change Exam Date / Target
              </button>
            </div>
          )}
        </GlassCard>

        {/* Top Summary Widgets Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <GlassCard dark className="p-5 border border-white/15 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Due For Revision Today
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                {totalDueToday.length} Topics
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {totalDueToday.length > 0 ? `${totalDueToday.length} Topics Ready` : 'All Topics Up To Date'}
            </p>
            <p className="mt-1 text-[11px] text-white/60">
              {studyMode === 'exam' ? 'Compressed for exam readiness' : 'Scheduled by retention decay curve'}
            </p>
          </GlassCard>

          <GlassCard dark className="p-5 border border-white/15 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e8c89b] flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#e8c89b]" /> Exam Target Date
              </span>
              <span className="rounded-full bg-[#e8c89b]/20 px-2.5 py-0.5 text-xs font-bold text-[#e8c89b]">
                {daysUntilExam} Days Left
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {examTargetDate}
            </p>
            <p className="mt-1 text-[11px] text-white/60 truncate">
              {examTitle}
            </p>
          </GlassCard>

          <GlassCard dark className="p-5 border border-white/15 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Brain className="h-4 w-4" /> Revision Frequency Ratio
              </span>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">
                {studyMode === 'exam' ? '2.5x Speed' : 'Standard'}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {studyMode === 'exam' ? 'Accelerated (1-2 Days)' : 'Expanding (3-14 Days)'}
            </p>
            <p className="mt-1 text-[11px] text-white/60">
              {studyMode === 'exam' ? 'Ensures completion before exam date' : 'Optimized for long-term memory'}
            </p>
          </GlassCard>
        </div>

        {/* Main Grid: Calendar Grid (Left 8 Cols) + Selected Date Review Inspector (Right 4 Cols) */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* ================= CALENDAR GRID ================= */}
          <div className="lg:col-span-8">
            <GlassCard dark className="p-6 border border-white/15 shadow-2xl">
              {/* Calendar Controls Bar */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8c89b]/20 border border-[#e8c89b]/40">
                    <CalendarIcon className="h-5 w-5 text-[#e8c89b]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {monthNames[currentMonth]} {currentYear}
                    </h2>
                    <span className="text-xs text-white/50">
                      Click any date to inspect scheduled reviews
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11)
                        setCurrentYear((y) => y - 1)
                      } else {
                        setCurrentMonth((m) => m - 1)
                      }
                    }}
                    className="glass rounded-xl p-2 text-white/70 hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDate(todayStr)
                      setCurrentMonth(8)
                      setCurrentYear(2026)
                    }}
                    className="glass rounded-xl px-3 py-1.5 text-xs font-bold text-[#e8c89b] hover:bg-white/10"
                  >
                    Today
                  </button>

                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0)
                        setCurrentYear((y) => y + 1)
                      } else {
                        setCurrentMonth((m) => m + 1)
                      }
                    }}
                    className="glass rounded-xl p-2 text-white/70 hover:text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Day Name Headers */}
              <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-white/50">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Blank lead-in padding cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] rounded-2xl bg-white/[0.02]" />
                ))}

                {/* Day Cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const dateStr = formatDateStr(dayNum)
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedDate

                  // Notes due on this date
                  const notesOnDay = notes.filter((n) => n.nextReviewDate === dateStr)
                  // Important dates on this date
                  const importantOnDay = importantDates.filter((d) => d.date === dateStr)

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-[95px] flex flex-col justify-between p-2 rounded-2xl text-left transition border ${
                        isSelected
                          ? 'border-[#e8c89b] bg-[#e8c89b]/20 shadow-lg ring-2 ring-[#e8c89b]/40'
                          : isToday
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-white/10 glass hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'rounded-full bg-emerald-500 px-2 py-0.5 text-[#1e1917]'
                              : isSelected
                              ? 'text-[#e8c89b]'
                              : 'text-white'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {importantOnDay.length > 0 && (
                          <Star className="h-3.5 w-3.5 fill-[#e8c89b] text-[#e8c89b]" />
                        )}
                      </div>

                      {/* Day Badges */}
                      <div className="space-y-1 mt-1">
                        {notesOnDay.slice(0, 2).map((n) => (
                          <div
                            key={n.id}
                            className="truncate rounded-md bg-[#e8c89b]/15 border border-[#e8c89b]/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#e8c89b]"
                          >
                            {n.icon} {n.title}
                          </div>
                        ))}

                        {importantOnDay.slice(0, 1).map((d) => (
                          <div
                            key={d.id}
                            className="truncate rounded-md bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-300"
                          >
                            ⭐ {d.title}
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </GlassCard>
          </div>

          {/* ================= RIGHT INSPECTOR PANEL: REVISION DUE ON SELECTED DATE ================= */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard dark className="p-6 border border-white/15 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8c89b]">
                    Selected Date Inspection
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedDate}</h3>
                </div>

                <span className="rounded-full bg-[#e8c89b]/20 px-3 py-1 text-xs font-bold text-[#e8c89b]">
                  {dueNotesOnSelectedDate.length} Topics Scheduled
                </span>
              </div>

              {/* Marked Important Events on Selected Date */}
              {importantOnSelectedDate.length > 0 && (
                <div className="mb-4 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> Marked Important Date
                  </span>
                  {importantOnSelectedDate.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-amber-500/40 bg-amber-500/15 p-3 text-xs text-white"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{item.title}</span>
                        <button
                          onClick={() => void deleteImportantDate(item.id)}
                          className="text-white/50 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-white/70">{item.description}</p>
                      <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        {item.subject} &bull; {item.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* List of Due Topics on Selected Date */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider block">
                  Topics Scheduled to Revise:
                </span>

                {dueNotesOnSelectedDate.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400/80" />
                    <p className="text-xs text-white/70">
                      No spaced repetition topics scheduled for <strong>{selectedDate}</strong>.
                    </p>
                    <p className="mt-1 text-[11px] text-white/40">
                      Select another day on the calendar or click &ldquo;Start New Concept&rdquo; to add more notes!
                    </p>
                  </div>
                ) : (
                  dueNotesOnSelectedDate.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-[#e8c89b]/40 bg-[#e8c89b]/10 p-4 transition hover:border-[#e8c89b]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{note.icon}</span>
                          <span className="text-xs font-bold text-white">{note.title}</span>
                        </div>
                        <span className="rounded-full bg-[#e8c89b]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#e8c89b]">
                          {note.retentionHealth}% Retention
                        </span>
                      </div>

                      <div className="mb-3 text-[11px] text-white/60 flex items-center justify-between">
                        <span>{note.subject}</span>
                        <span>{note.practiceCount} Practices Completed</span>
                      </div>

                      <ShinyButton
                        label="Start Feynman Practice Test"
                        onClick={() =>
                          navigate(
                            `/concept/new?noteId=${note.id}&topic=${encodeURIComponent(note.title)}`,
                          )
                        }
                        accentColor="#e8c89b"
                        accentSoftColor="#f5efe8"
                        fillColor="#2b2421"
                        cornerRadius={9999}
                        className="w-full py-2 text-xs font-bold"
                      />
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Spaced Repetition Info Box */}
            <GlassCard dark className="p-5 border border-white/15">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#e8c89b]" /> How LECTOR Schedules Reviews:
              </h4>
              <p className="text-[11px] leading-relaxed text-white/70">
                When you practice a concept with your voice or text, LECTOR measures your explanation accuracy. High scores extend the review interval (+3 to +7 days), while low scores prompt earlier reviews.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* ================= MARK IMPORTANT DATE MODAL ================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-3xl border border-white/20 bg-[#1e1917] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#e8c89b] fill-[#e8c89b]" />
                  Mark Important Date / Exam
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-white/60 hover:text-white flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Close
                </button>
              </div>

              <form onSubmit={handleAddImportantDate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#e8c89b]">
                    Event / Exam Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Midterm Physics Exam"
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-2.5 text-xs text-white outline-none focus:border-[#e8c89b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#e8c89b]">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-2.5 text-xs text-white outline-none focus:border-[#e8c89b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#e8c89b]">
                    Subject Category
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="Computer Science" className="bg-[#1e1917]">Computer Science</option>
                    <option value="Physics & Engineering" className="bg-[#1e1917]">Physics &amp; Engineering</option>
                    <option value="Biology & Medicine" className="bg-[#1e1917]">Biology &amp; Medicine</option>
                    <option value="Mathematics" className="bg-[#1e1917]">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#e8c89b]">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="high" className="bg-[#1e1917]">High Priority</option>
                    <option value="medium" className="bg-[#1e1917]">Medium Priority</option>
                    <option value="low" className="bg-[#1e1917]">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#e8c89b]">
                    Notes / Topics Covered
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="List chapters or key notes to revise before this exam..."
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-2.5 text-xs text-white outline-none focus:border-[#e8c89b]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>

                  <ShinyButton
                    label="Save Event Date"
                    onClick={() => {}}
                    accentColor="#e8c89b"
                    accentSoftColor="#f5efe8"
                    fillColor="#2b2421"
                    cornerRadius={9999}
                    className="px-5 py-2 text-xs font-bold"
                  />
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ================= EDIT EXAM TARGET MODAL ================= */}
        {showExamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-3xl border border-white/20 bg-[#1e1917] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#e8c89b]" />
                  <span>Set Target Exam &amp; Date</span>
                </h3>
                <button
                  onClick={() => setShowExamModal(false)}
                  className="text-xs text-white/60 hover:text-white flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Close
                </button>
              </div>

              <form onSubmit={handleSaveExamSettings} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#e8c89b]">
                    Exam Name / Course Title
                  </label>
                  <input
                    type="text"
                    required
                    value={tempExamTitle}
                    onChange={(e) => setTempExamTitle(e.target.value)}
                    placeholder="e.g. Final CS Midterm Exam"
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-2.5 text-xs text-white outline-none focus:border-[#e8c89b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#e8c89b]">
                    Exam Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tempExamDate}
                    onChange={(e) => setTempExamDate(e.target.value)}
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-2.5 text-xs text-white outline-none focus:border-[#e8c89b]"
                  />
                  <p className="mt-1 text-[11px] text-white/50">
                    Entering your exam date accelerates revision frequencies to ensure all topics are completed before this date.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExamModal(false)}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>

                  <ShinyButton
                    label="Activate Accelerated Exam Mode"
                    onClick={() => {}}
                    accentColor="#e8c89b"
                    accentSoftColor="#f5efe8"
                    fillColor="#2b2421"
                    cornerRadius={9999}
                    className="px-5 py-2 text-xs font-bold"
                  />
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
