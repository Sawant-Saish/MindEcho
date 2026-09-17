import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Mic,
  RotateCcw,
  Sparkles,
  Square,
  Upload,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Navbar } from '../components/Navbar'
import { ShinyButton } from '../components/ui/shiny-button'
import { useApi } from '../lib/api/client'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'

export function NewConcept() {
  const { isAuthenticated } = useAuth()
  const { notes, recordPracticeSession, submitFeynmanEvaluation } = useNotes()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Stepper state: 1 = Upload, 2 = Record/Explain, 3 = Evaluation
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Concept & Notes state
  const [selectedNoteId, setSelectedNoteId] = useState<string>('')
  const [topicName, setTopicName] = useState('')
  const [subject, setSubject] = useState('Computer Science')
  const [notesText, setNotesText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    size: string
  } | null>(null)

  // Evaluation result state
  const [evalResult, setEvalResult] = useState<{
    score: number
    correctness: number
    clarity: number
    completeness: number
    feedback?: {
      strengths: string[]
      missingConcepts: string[]
      improvementTip: string
    }
    nextReviewDate?: string
  }>({
    score: 9.2,
    correctness: 94,
    clarity: 90,
    completeness: 92,
  })
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evalError, setEvalError] = useState('')

  // Check URL query parameters for pre-selected note
  useEffect(() => {
    const paramNoteId = searchParams.get('noteId')
    const paramTopic = searchParams.get('topic')

    if (paramNoteId) {
      const found = notes.find((n) => n.id === paramNoteId)
      if (found) {
        setSelectedNoteId(found.id)
        setTopicName(found.title)
        setSubject(found.subject)
        setNotesText(found.content)
      }
    } else if (paramTopic) {
      setTopicName(paramTopic)
    }
  }, [searchParams, notes])

  // Handle dropdown selection of stored Notion note
  const handleSelectNotionNote = (noteId: string) => {
    setSelectedNoteId(noteId)
    if (!noteId) return

    const note = notes.find((n) => n.id === noteId)
    if (note) {
      setTopicName(note.title)
      setSubject(note.subject)
      setNotesText(note.content)
    }
  }

  // Step 2: Voice & Text Explanation state
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [textExplanation, setTextExplanation] = useState('')

  // MediaRecorder Voice Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!isAuthenticated) {
    // If demo unauthenticated, redirect to login
    navigate('/login', { replace: true })
    return null
  }

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const sizeKB = (file.size / 1024).toFixed(1)
      setUploadedFile({ name: file.name, size: `${sizeKB} KB` })
      if (!topicName) {
        setTopicName(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  // Step 1 Submit -> Proceed to Step 2
  const handleProceedToQuestion = () => {
    if (!topicName && !uploadedFile && !notesText) {
      alert('Please enter a topic name or upload notes to proceed.')
      return
    }
    setStep(2)
  }

  // Real Browser Microphone Recording Controls
  const startRecording = async () => {
    setMicError(null)
    setAudioUrl(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        // Stop track streams
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } catch (err) {
      console.error(err)
      setMicError(
        'Microphone access denied or unavailable. You can also type your explanation in the Text tab!',
      )
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Step 2 Submit -> Proceed to Evaluation & Record Session to Dashboard
  const handleSubmitExplanation = async () => {
    if (inputMode === 'voice' && !audioUrl && recordingTime === 0) {
      alert('Please record your voice explanation or switch to text mode.')
      return
    }
    if (inputMode === 'text' && !textExplanation.trim()) {
      alert('Please enter your written explanation.')
      return
    }
    if (!selectedNoteId) {
      alert('Please select a note to evaluate against.')
      return
    }

    setEvalError('')
    setIsEvaluating(true)

    try {
      if (useApi) {
        const audioBlob =
          inputMode === 'voice' && audioUrl
            ? await fetch(audioUrl).then((response) => response.blob())
            : undefined

        const result = await submitFeynmanEvaluation({
          noteId: selectedNoteId,
          mode: inputMode,
          explanationText: inputMode === 'text' ? textExplanation : undefined,
          audioBlob,
        })

        setEvalResult({
          score: result.lectorScore,
          correctness: result.correctness,
          clarity: result.clarity,
          completeness: result.completeness,
          feedback: result.feedback,
          nextReviewDate: result.updatedNoteState.nextReviewDate,
        })
      } else {
        const correctness = Math.floor(Math.random() * 8) + 90
        const clarity = Math.floor(Math.random() * 8) + 88
        const completeness = Math.floor(Math.random() * 8) + 89
        const score = Number((correctness * 0.05 + clarity * 0.03 + completeness * 0.02).toFixed(1))

        setEvalResult({ score, correctness, clarity, completeness })
        recordPracticeSession(
          selectedNoteId,
          score,
          correctness,
          clarity,
          completeness,
          inputMode,
        )
      }

      setStep(3)
    } catch {
      setEvalError('LECTOR evaluation failed. Please try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1917] via-[#2a2421] to-[#14100e] text-[#f5efe8]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-28 pb-20 sm:px-6">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#e8c89b] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center sm:text-left"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e8c89b]/30 bg-[#e8c89b]/10 px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#e8c89b]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
              LECTOR Active Learning
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start New Concept Studio
          </h1>
          <p className="mt-2 text-sm text-[#f5efe8]/70">
            Upload your study notes, answer LECTOR AI prompts out loud, and calibrate your retention curve.
          </p>
        </motion.div>

        {/* Stepper Progress Indicator */}
        <div className="mb-10 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              step === 1
                ? 'bg-[#e8c89b] text-[#1e1917] shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>1. Upload Notes</span>
          </button>

          <button
            onClick={() => step > 1 && setStep(2)}
            disabled={step < 2}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              step === 2
                ? 'bg-[#e8c89b] text-[#1e1917] shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>2. Voice/Text Explain</span>
          </button>

          <button
            onClick={() => step > 2 && setStep(3)}
            disabled={step < 3}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              step === 3
                ? 'bg-[#e8c89b] text-[#1e1917] shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>3. LECTOR Evaluation</span>
          </button>
        </div>

        {/* ================= STEP 1: UPLOAD NOTES & CONCEPT INFO ================= */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <GlassCard dark className="p-8 border border-white/15 shadow-2xl">
              <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#e8c89b]" />
                Step 1: Enter Topic &amp; Upload Study Material
              </h2>

              <div className="space-y-5">
                {/* Select Notion Note Dropdown */}
                {notes.length > 0 && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                      Select from Stored Notion Workspace Notes
                    </label>
                    <select
                      value={selectedNoteId}
                      onChange={(e) => handleSelectNotionNote(e.target.value)}
                      className="glass w-full rounded-2xl border border-white/15 px-4 py-3 text-sm text-[#e8c89b] font-semibold outline-none focus:border-[#e8c89b]"
                    >
                      <option value="" className="bg-[#1e1917] text-white">
                        -- Or enter a custom concept topic below --
                      </option>
                      {notes.map((n) => (
                        <option key={n.id} value={n.id} className="bg-[#1e1917] text-white">
                          {n.icon} {n.title} ({n.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                    Subject / Domain
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-3 text-sm text-white outline-none focus:border-[#e8c89b]"
                  >
                    <option value="Computer Science" className="bg-[#1e1917]">
                      Computer Science
                    </option>
                    <option value="Physics & Engineering" className="bg-[#1e1917]">
                      Physics &amp; Engineering
                    </option>
                    <option value="Biology & Medicine" className="bg-[#1e1917]">
                      Biology &amp; Medicine
                    </option>
                    <option value="Mathematics" className="bg-[#1e1917]">
                      Mathematics
                    </option>
                    <option value="General Studies" className="bg-[#1e1917]">
                      General Studies
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                    Concept / Topic Title
                  </label>
                  <input
                    type="text"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="e.g. Binary Search Trees & Traversal"
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8c89b]"
                  />
                </div>

                {/* File Dropzone */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                    Upload Study Notes / PDF / TXT
                  </label>
                  <div className="relative glass flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 p-8 text-center transition hover:border-[#e8c89b]/60">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.md"
                      onChange={handleFileUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                      <Upload className="h-6 w-6 text-[#e8c89b]" />
                    </div>
                    {uploadedFile ? (
                      <div className="flex items-center gap-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {uploadedFile.name} ({uploadedFile.size})</span>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="hover:underline text-white/60"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-white">
                          Click or Drag &amp; Drop notes file here
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          Supports PDF, TXT, DOCX, Markdown (Max 25MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Or Paste Notes */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                    Or Paste Concept Notes / Summary Directly
                  </label>
                  <textarea
                    rows={4}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Paste textbook summary or bullet points here..."
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8c89b]"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <ShinyButton
                    label="Generate LECTOR AI Questions →"
                    onClick={handleProceedToQuestion}
                    accentColor="#e8c89b"
                    accentSoftColor="#f5efe8"
                    fillColor="#2b2421"
                    cornerRadius={9999}
                    className="px-6 py-3.5 text-sm font-semibold"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ================= STEP 2: LECTOR AI QUESTION & VOICE/TEXT RECORDING ================= */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <GlassCard dark className="p-8 border border-white/15 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-[#e8c89b]/15 border border-[#e8c89b]/30 px-3 py-1 text-xs font-bold text-[#e8c89b]">
                  Topic: {topicName || 'Binary Search Trees'}
                </span>
                <span className="text-xs text-white/50">{subject}</span>
              </div>

              {/* LECTOR AI Generated Question */}
              <div className="mb-8 rounded-2xl border border-[#e8c89b]/30 bg-[#e8c89b]/10 p-6 backdrop-blur-md">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#e8c89b]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                    LECTOR Generated Question
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-relaxed">
                  &ldquo;Explain the core mechanism of {topicName || 'this concept'} in your own words. How does it handle edge cases and what is its primary efficiency benefit?&rdquo;
                </h3>
              </div>

              {/* Input Mode Selector Tabs */}
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => setInputMode('voice')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition border ${
                    inputMode === 'voice'
                      ? 'border-[#e8c89b] bg-[#e8c89b]/20 text-[#e8c89b]'
                      : 'border-white/10 glass text-white/60 hover:text-white'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                  <span>Voice Recording (Recommended)</span>
                </button>

                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition border ${
                    inputMode === 'text'
                      ? 'border-[#e8c89b] bg-[#e8c89b]/20 text-[#e8c89b]'
                      : 'border-white/10 glass text-white/60 hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Text Explanation</span>
                </button>
              </div>

              {/* Voice Recorder UI */}
              {inputMode === 'voice' && (
                <div className="space-y-6">
                  <div className="glass flex flex-col items-center justify-center rounded-2xl border border-white/15 p-8 text-center">
                    {micError && (
                      <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs font-medium text-rose-300">
                        {micError}
                      </div>
                    )}

                    {/* Recording Visualizer Wave */}
                    <div className="mb-6 flex items-center justify-center gap-1.5 h-16">
                      {isRecording ? (
                        [...Array(12)].map((_, i) => (
                          <motion.span
                            key={i}
                            animate={{ height: ['12px', '48px', '16px'] }}
                            transition={{
                              duration: 0.6 + (i % 3) * 0.2,
                              repeat: Infinity,
                              repeatType: 'reverse',
                            }}
                            className="w-1.5 rounded-full bg-[#e8c89b]"
                          />
                        ))
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                          <Mic className="h-8 w-8 text-[#e8c89b]" />
                        </div>
                      )}
                    </div>

                    {/* Timer Counter */}
                    <div className="mb-6 text-2xl font-mono font-bold text-white">
                      {formatTime(recordingTime)}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          className="btn-glow flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold shadow-lg"
                        >
                          <Mic className="h-4 w-4" />
                          <span>{audioUrl ? 'Re-record Voice' : 'Start Recording'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-rose-500"
                        >
                          <Square className="h-4 w-4 fill-white" />
                          <span>Stop Recording</span>
                        </button>
                      )}
                    </div>

                    {/* Audio Playback Element */}
                    {audioUrl && (
                      <div className="mt-6 w-full max-w-md">
                        <p className="mb-2 text-xs font-semibold text-[#e8c89b]">
                          Recording Playback Preview:
                        </p>
                        <audio src={audioUrl} controls className="w-full" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Text Input Mode */}
              {inputMode === 'text' && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                    Type Your Feynman Explanation
                  </label>
                  <textarea
                    rows={6}
                    value={textExplanation}
                    onChange={(e) => setTextExplanation(e.target.value)}
                    placeholder="Explain the topic as if teaching a classmate..."
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8c89b]"
                  />
                </div>
              )}

              {evalError && (
                <p className="mt-4 text-center text-sm text-red-300">{evalError}</p>
              )}

              <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-white/60 hover:text-white"
                >
                  ← Edit Topic Notes
                </button>

                <ShinyButton
                  label={isEvaluating ? 'LECTOR is evaluating…' : 'Submit for LECTOR AI Evaluation →'}
                  onClick={() => void handleSubmitExplanation()}
                  accentColor="#e8c89b"
                  accentSoftColor="#f5efe8"
                  fillColor="#2b2421"
                  cornerRadius={9999}
                  className="px-6 py-3.5 text-sm font-semibold"
                />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ================= STEP 3: LECTOR EVALUATION RESULT ================= */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <GlassCard dark className="p-8 border border-white/15 shadow-2xl">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8c89b]/20 border border-[#e8c89b]/40 shadow-xl">
                  <Brain className="h-8 w-8 text-[#e8c89b]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                  LECTOR Evaluation Complete
                </span>
                <h2 className="mt-1 text-3xl font-bold text-white">
                  Score: {evalResult.score} / 10 ({evalResult.score >= 9.0 ? 'Strong Understanding' : 'Good Progress'})
                </h2>
              </div>

              {/* Sub-scores Grid */}
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="glass rounded-2xl border border-white/15 p-5 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Correctness
                  </span>
                  <p className="mt-2 text-2xl font-bold text-white">{evalResult.correctness}%</p>
                  <p className="mt-1 text-[11px] text-white/60">Factual accuracy &amp; logic</p>
                </div>

                <div className="glass rounded-2xl border border-white/15 p-5 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                    Clarity
                  </span>
                  <p className="mt-2 text-2xl font-bold text-white">{evalResult.clarity}%</p>
                  <p className="mt-1 text-[11px] text-white/60">Explanation structure</p>
                </div>

                <div className="glass rounded-2xl border border-white/15 p-5 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Completeness
                  </span>
                  <p className="mt-2 text-2xl font-bold text-white">{evalResult.completeness}%</p>
                  <p className="mt-1 text-[11px] text-white/60">Key sub-concept coverage</p>
                </div>
              </div>

              {/* AI Feedback Box */}
              <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
                <h3 className="mb-3 text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#e8c89b]" />
                  LECTOR AI Feedback Summary:
                </h3>
                <ul className="space-y-2 text-xs leading-relaxed text-[#f5efe8]/80">
                  {(evalResult.feedback?.strengths ?? ['Strong explanation effort detected.']).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {(evalResult.feedback?.missingConcepts ?? []).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {evalResult.feedback?.improvementTip && (
                    <li className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-[#e8c89b] shrink-0" />
                      <span>{evalResult.feedback.improvementTip}</span>
                    </li>
                  )}
                  {evalResult.nextReviewDate && (
                    <li className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-[#e8c89b] shrink-0" />
                      <span>
                        Next review scheduled for <strong>{evalResult.nextReviewDate}</strong> based on your memory curve.
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-wrap gap-4 justify-between items-center border-t border-white/10 pt-6">
                <button
                  onClick={() => {
                    setStep(1)
                    setAudioUrl(null)
                    setRecordingTime(0)
                  }}
                  className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Practice Another Concept</span>
                </button>

                <ShinyButton
                  label="Go to Dashboard →"
                  onClick={() => navigate('/dashboard')}
                  accentColor="#e8c89b"
                  accentSoftColor="#f5efe8"
                  fillColor="#2b2421"
                  cornerRadius={9999}
                  className="px-6 py-3 text-xs font-bold"
                />
              </div>
            </GlassCard>
          </motion.div>
        )}
      </main>
    </div>
  )
}
