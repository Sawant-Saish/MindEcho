import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as calendarApi from '../lib/api/calendar.api'
import { useApi } from '../lib/api/client'
import * as evaluationsApi from '../lib/api/evaluations.api'
import type { FeynmanEvaluationResponse } from '../lib/api/evaluations.api'
import * as notesApi from '../lib/api/notes.api'
import { useAuth } from './AuthContext'

export interface NoteItem {
  id: string
  title: string
  subject: string
  content: string
  icon: string
  createdAt: string
  updatedAt: string
  lectorScore?: number
  practiceCount: number
  lastPracticed?: string
  retentionHealth: number
  nextReviewDate?: string
}

export interface PracticeExplanation {
  id: string
  noteId: string
  topic: string
  subject: string
  score: number
  correctness: number
  clarity: number
  completeness: number
  mode: 'voice' | 'text'
  timestamp: string
}

export interface ImportantDateItem {
  id: string
  title: string
  date: string // YYYY-MM-DD
  subject: string
  priority: 'high' | 'medium' | 'low'
  description?: string
}

export type StudyModeType = 'exam' | 'skill'

interface NotesContextValue {
  notes: NoteItem[]
  explanations: PracticeExplanation[]
  importantDates: ImportantDateItem[]
  studyMode: StudyModeType
  examTargetDate: string
  examTitle: string
  calendarLoading: boolean
  setStudyMode: (mode: StudyModeType, date?: string, title?: string) => Promise<void>
  activeNoteId: string | null
  setActiveNoteId: (id: string | null) => void
  notesLoading: boolean
  addNote: (
    note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt' | 'practiceCount' | 'retentionHealth'>,
  ) => Promise<NoteItem>
  updateNote: (id: string, updates: Partial<NoteItem>) => void
  deleteNote: (id: string) => Promise<void>
  recordPracticeSession: (
    noteId: string,
    score: number,
    correctness: number,
    clarity: number,
    completeness: number,
    mode: 'voice' | 'text',
  ) => void
  submitFeynmanEvaluation: (input: {
    noteId: string
    mode: 'voice' | 'text'
    explanationText?: string
    audioBlob?: Blob
    selfRating?: number
  }) => Promise<FeynmanEvaluationResponse>
  addImportantDate: (item: Omit<ImportantDateItem, 'id'>) => Promise<void>
  deleteImportantDate: (id: string) => Promise<void>
  avgLectorScore: number
  totalSessionsToday: number
  retentionAverage: number
}

const NOTES_STORAGE_KEY = 'memoroute_notion_notes'
const EXPLANATIONS_STORAGE_KEY = 'memoroute_practice_explanations'

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Binary Search Trees & Traversal',
    subject: 'Computer Science',
    icon: 'code',
    content: `# Binary Search Trees (BST)

A Binary Search Tree is a node-based binary tree data structure which has the following properties:
- The left subtree of a node contains only nodes with keys lesser than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- The left and right subtree each must also be a binary search tree.

## In-Order Traversal
In-Order traversal (Left, Root, Right) yields node values in strictly sorted ascending order.

## Deletion Edge Cases
1. **Node to be deleted is a leaf**: Simply remove from the tree.
2. **Node has one child**: Copy the child to the node and delete the child.
3. **Node has two children**: Find in-order successor (smallest in the right subtree), replace node's key with successor, and delete successor.`,
    createdAt: '2026-09-10',
    updatedAt: '2026-09-17',
    lectorScore: 9.2,
    practiceCount: 4,
    lastPracticed: '2026-09-17',
    retentionHealth: 94,
    nextReviewDate: '2026-09-20',
  },
  {
    id: 'note-2',
    title: 'Thermodynamics & Entropy Laws',
    subject: 'Physics & Engineering',
    icon: 'zap',
    content: `# Second Law of Thermodynamics

The total entropy of an isolated system can never decrease over time. Microscopic disorder naturally increases in irreversible processes.

## Key Formulas & Concepts
- $dS \\ge \\frac{dQ}{T}$
- Carnot Cycle Efficiency: $\\eta = 1 - \\frac{T_C}{T_H}$
- Entropy is a state function depending only on current system equilibrium, not the pathway taken.`,
    createdAt: '2026-09-12',
    updatedAt: '2026-09-16',
    lectorScore: 8.7,
    practiceCount: 3,
    lastPracticed: '2026-09-16',
    retentionHealth: 88,
    nextReviewDate: '2026-09-19',
  },
  {
    id: 'note-3',
    title: 'Neural Networks & Backpropagation',
    subject: 'Computer Science',
    icon: 'brain',
    content: `# Neural Network Backpropagation

Backpropagation calculates the gradient of the loss function with respect to each weight using the Chain Rule of calculus.

## Algorithm Steps
1. **Forward Pass**: Compute activation vectors $a^{(l)} = \\sigma(z^{(l)})$ layer by layer.
2. **Compute Error**: $\\delta^{(L)} = \\nabla_a L \\odot \\sigma'(z^{(L)})$
3. **Backward Pass**: Propagate error $\\delta^{(l)} = ((W^{(l+1)})^T \\delta^{(l+1)}) \\odot \\sigma'(z^{(l)})$.
4. **Update Weights**: $W^{(l)} \\leftarrow W^{(l)} - \\eta \\delta^{(l)} (a^{(l-1)})^T$`,
    createdAt: '2026-09-14',
    updatedAt: '2026-09-17',
    lectorScore: 9.5,
    practiceCount: 5,
    lastPracticed: '2026-09-17',
    retentionHealth: 96,
    nextReviewDate: '2026-09-22',
  },
  {
    id: 'note-4',
    title: 'Photosynthesis & Light Reactions',
    subject: 'Biology & Medicine',
    icon: 'leaf',
    content: `# Photosynthesis Light-Dependent Reactions

Occurs inside the thylakoid membranes of chloroplasts. Converts solar light energy into chemical energy (ATP and NADPH).

## Key Components
- **Photosystem II (P680)**: Absorbs photons, excites electrons, and splits water ($2H_2O \\rightarrow O_2 + 4H^+ + 4e^-$).
- **Electron Transport Chain (ETC)**: Pumps protons into thylakoid lumen creating a proton gradient.
- **Photosystem I (P700)**: Re-excites electrons to reduce $NADP^+$ to $NADPH$.
- **ATP Synthase**: Uses proton motive force to synthesize ATP via chemiosmosis.`,
    createdAt: '2026-09-15',
    updatedAt: '2026-09-16',
    lectorScore: 8.0,
    practiceCount: 2,
    lastPracticed: '2026-09-16',
    retentionHealth: 82,
    nextReviewDate: '2026-09-18',
  },
]

const DEFAULT_EXPLANATIONS: PracticeExplanation[] = [
  {
    id: 'exp-101',
    noteId: 'note-3',
    topic: 'Neural Networks & Backpropagation',
    subject: 'Computer Science',
    score: 9.5,
    correctness: 96,
    clarity: 94,
    completeness: 95,
    mode: 'voice',
    timestamp: '2026-09-17 18:00',
  },
  {
    id: 'exp-102',
    noteId: 'note-1',
    topic: 'Binary Search Trees & Traversal',
    subject: 'Computer Science',
    score: 9.2,
    correctness: 94,
    clarity: 90,
    completeness: 92,
    mode: 'voice',
    timestamp: '2026-09-17 16:30',
  },
  {
    id: 'exp-103',
    noteId: 'note-2',
    topic: 'Thermodynamics & Entropy Laws',
    subject: 'Physics & Engineering',
    score: 8.7,
    correctness: 88,
    clarity: 86,
    completeness: 87,
    mode: 'text',
    timestamp: '2026-09-16 14:15',
  },
]

const DATES_STORAGE_KEY = 'memoroute_important_dates'

const DEFAULT_IMPORTANT_DATES: ImportantDateItem[] = [
  {
    id: 'date-1',
    title: 'Final CS Midterm Exam',
    date: '2026-09-25',
    subject: 'Computer Science',
    priority: 'high',
    description: 'Covers Binary Search Trees, Graph Algorithms, and Backpropagation complexity.',
  },
  {
    id: 'date-2',
    title: 'Thermodynamics Quiz',
    date: '2026-09-28',
    subject: 'Physics & Engineering',
    priority: 'medium',
    description: 'Carnot engine efficiency and Second Law entropy calculations.',
  },
  {
    id: 'date-3',
    title: 'Biology Lab Evaluation',
    date: '2026-10-02',
    subject: 'Biology & Medicine',
    priority: 'low',
    description: 'Photosynthesis light-dependent reactions test.',
  },
]

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pendingNoteUpdates = useRef<Map<string, Partial<NoteItem>>>(new Map())
  const noteUpdateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    if (useApi) return []
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as NoteItem[]) : DEFAULT_NOTES
    } catch {
      return DEFAULT_NOTES
    }
  })

  const [notesLoading, setNotesLoading] = useState(useApi)

  const [explanations, setExplanations] = useState<PracticeExplanation[]>(() => {
    try {
      const saved = localStorage.getItem(EXPLANATIONS_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as PracticeExplanation[]) : DEFAULT_EXPLANATIONS
    } catch {
      return DEFAULT_EXPLANATIONS
    }
  })

  const [importantDates, setImportantDates] = useState<ImportantDateItem[]>(() => {
    if (useApi) return []
    try {
      const saved = localStorage.getItem(DATES_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as ImportantDateItem[]) : DEFAULT_IMPORTANT_DATES
    } catch {
      return DEFAULT_IMPORTANT_DATES
    }
  })

  const [studyMode, setStudyModeState] = useState<StudyModeType>(() => {
    if (useApi) return 'exam'
    try {
      const saved = localStorage.getItem('memoroute_study_mode')
      return saved ? (saved as StudyModeType) : 'exam'
    } catch {
      return 'exam'
    }
  })

  const [examTargetDate, setExamTargetDate] = useState<string>(() => {
    if (useApi) return ''
    try {
      const saved = localStorage.getItem('memoroute_exam_target_date')
      return saved || '2026-09-25'
    } catch {
      return '2026-09-25'
    }
  })

  const [examTitle, setExamTitle] = useState<string>(() => {
    if (useApi) return ''
    try {
      const saved = localStorage.getItem('memoroute_exam_title')
      return saved || 'Final CS Midterm Exam ⭐'
    } catch {
      return 'Final CS Midterm Exam ⭐'
    }
  })

  const [calendarLoading, setCalendarLoading] = useState(useApi)

  const [activeNoteId, setActiveNoteId] = useState<string | null>(useApi ? null : 'note-1')

  useEffect(() => {
    if (!useApi || !isAuthenticated) {
      if (useApi) {
        setNotes([])
        setActiveNoteId(null)
      }
      setNotesLoading(false)
      return
    }

    setNotesLoading(true)
    notesApi
      .fetchNotes()
      .then((loaded) => {
        setNotes(loaded)
        setActiveNoteId((current) => {
          if (current && loaded.some((note) => note.id === current)) return current
          return loaded[0]?.id ?? null
        })
      })
      .catch(() => {
        setNotes([])
        setActiveNoteId(null)
      })
      .finally(() => setNotesLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (!useApi || !isAuthenticated) {
      if (useApi) {
        setImportantDates([])
        setStudyModeState('exam')
        setExamTargetDate('')
        setExamTitle('')
      }
      setCalendarLoading(false)
      return
    }

    setCalendarLoading(true)
    Promise.all([calendarApi.fetchCalendarSettings(), calendarApi.fetchImportantDates()])
      .then(([settings, dates]) => {
        setStudyModeState(settings.studyMode)
        setExamTargetDate(settings.examTargetDate ?? '')
        setExamTitle(settings.examTitle ?? '')
        setImportantDates(dates)
      })
      .catch(() => {
        setImportantDates([])
      })
      .finally(() => setCalendarLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (!useApi || !isAuthenticated || notesLoading) return

    evaluationsApi
      .listEvaluations()
      .then((items) => {
        setExplanations(
          items.map((item) => {
            const note = notes.find((n) => n.id === item.noteId)
            return {
              id: item.id,
              noteId: item.noteId,
              topic: note?.title ?? 'Practice Session',
              subject: note?.subject ?? 'General',
              score: item.lectorScore,
              correctness: item.correctness,
              clarity: item.clarity,
              completeness: item.completeness,
              mode: item.mode,
              timestamp: item.createdAt.replace('T', ' ').slice(0, 16),
            }
          }),
        )
      })
      .catch(() => undefined)
  }, [isAuthenticated, notesLoading, notes])

  // Save changes to localStorage (demo mode only)
  useEffect(() => {
    if (useApi) return
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    if (useApi) return
    localStorage.setItem(EXPLANATIONS_STORAGE_KEY, JSON.stringify(explanations))
  }, [explanations])

  useEffect(() => {
    if (useApi) return
    localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(importantDates))
  }, [importantDates])

  useEffect(() => {
    if (useApi) return
    localStorage.setItem('memoroute_study_mode', studyMode)
  }, [studyMode])

  useEffect(() => {
    if (useApi) return
    localStorage.setItem('memoroute_exam_target_date', examTargetDate)
  }, [examTargetDate])

  useEffect(() => {
    if (useApi) return
    localStorage.setItem('memoroute_exam_title', examTitle)
  }, [examTitle])

  const setStudyMode = useCallback(
    async (mode: StudyModeType, date?: string, title?: string) => {
      const nextDate = date ?? examTargetDate
      const nextTitle = title ?? examTitle

      setStudyModeState(mode)
      if (date) setExamTargetDate(date)
      if (title) setExamTitle(title)

      if (!useApi) return

      try {
        const settings = await calendarApi.updateCalendarSettings({
          studyMode: mode,
          ...(nextDate ? { examTargetDate: nextDate } : {}),
          ...(nextTitle ? { examTitle: nextTitle } : {}),
        })
        setStudyModeState(settings.studyMode)
        setExamTargetDate(settings.examTargetDate ?? '')
        setExamTitle(settings.examTitle ?? '')
      } catch {
        // Keep optimistic local state if sync fails
      }
    },
    [examTargetDate, examTitle],
  )

  // Add new note
  const addNote = useCallback(
    async (
      noteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt' | 'practiceCount' | 'retentionHealth'>,
    ) => {
      if (useApi) {
        const created = await notesApi.createNote(noteData)
        setNotes((prev) => [created, ...prev])
        setActiveNoteId(created.id)
        return created
      }

      const newId = `note-${Date.now()}`
      const todayStr = new Date().toISOString().split('T')[0]
      const newNote: NoteItem = {
        ...noteData,
        id: newId,
        createdAt: todayStr,
        updatedAt: todayStr,
        practiceCount: 0,
        retentionHealth: 70,
      }
      setNotes((prev) => [newNote, ...prev])
      setActiveNoteId(newId)
      return newNote
    },
    [],
  )

  const updateNote = useCallback((id: string, updates: Partial<NoteItem>) => {
    const todayStr = new Date().toISOString().split('T')[0]
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: todayStr } : n)),
    )

    if (!useApi) return

    const pending = { ...pendingNoteUpdates.current.get(id), ...updates }
    pendingNoteUpdates.current.set(id, pending)

    const existingTimer = noteUpdateTimers.current.get(id)
    if (existingTimer) clearTimeout(existingTimer)

    noteUpdateTimers.current.set(
      id,
      setTimeout(() => {
        const payload = pendingNoteUpdates.current.get(id)
        pendingNoteUpdates.current.delete(id)
        noteUpdateTimers.current.delete(id)
        if (!payload) return

        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...apiPayload } = payload
        notesApi.updateNote(id, apiPayload).catch(() => undefined)
      }, 600),
    )
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    if (useApi) {
      await notesApi.deleteNote(id)
    }

    setNotes((prev) => prev.filter((n) => n.id !== id))
    setActiveNoteId((curr) => (curr === id ? null : curr))
  }, [])

  // Add important date
  const addImportantDate = useCallback(async (item: Omit<ImportantDateItem, 'id'>) => {
    if (useApi) {
      const created = await calendarApi.createImportantDate(item)
      setImportantDates((prev) => [created, ...prev])
      return
    }

    const newItem: ImportantDateItem = {
      ...item,
      id: `date-${Date.now()}`,
    }
    setImportantDates((prev) => [newItem, ...prev])
  }, [])

  const deleteImportantDate = useCallback(async (id: string) => {
    if (useApi) {
      await calendarApi.deleteImportantDate(id)
    }

    setImportantDates((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const applyEvaluationToState = useCallback(
    (
      noteId: string,
      result: FeynmanEvaluationResponse,
      mode: 'voice' | 'text',
      scores: { correctness: number; clarity: number; completeness: number },
    ) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
      const targetNote = notes.find((n) => n.id === noteId)
      const topicName = targetNote ? targetNote.title : 'Custom Practice'
      const subjectName = targetNote ? targetNote.subject : 'General'

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                lectorScore: result.lectorScore,
                practiceCount: result.updatedNoteState.practiceCount,
                lastPracticed: result.updatedNoteState.lastPracticed,
                retentionHealth: result.updatedNoteState.retentionHealth,
                nextReviewDate: result.updatedNoteState.nextReviewDate,
                updatedAt: result.updatedNoteState.lastPracticed,
              }
            : n,
        ),
      )

      setExplanations((prev) => [
        {
          id: result.evaluationId,
          noteId,
          topic: topicName,
          subject: subjectName,
          score: result.lectorScore,
          correctness: scores.correctness,
          clarity: scores.clarity,
          completeness: scores.completeness,
          mode,
          timestamp: nowStr,
        },
        ...prev,
      ])
    },
    [notes],
  )

  const submitFeynmanEvaluation = useCallback(
    async (input: {
      noteId: string
      mode: 'voice' | 'text'
      explanationText?: string
      audioBlob?: Blob
      selfRating?: number
    }) => {
      const result =
        input.mode === 'voice' && input.audioBlob
          ? await evaluationsApi.submitVoiceEvaluation({
              noteId: input.noteId,
              audioBlob: input.audioBlob,
              selfRating: input.selfRating,
            })
          : await evaluationsApi.submitTextEvaluation({
              noteId: input.noteId,
              explanationText: input.explanationText ?? '',
              selfRating: input.selfRating,
            })

      applyEvaluationToState(input.noteId, result, input.mode, {
        correctness: result.correctness,
        clarity: result.clarity,
        completeness: result.completeness,
      })

      return result
    },
    [applyEvaluationToState],
  )

  const recordPracticeSession = useCallback(
    (
      noteId: string,
      score: number,
      correctness: number,
      clarity: number,
      completeness: number,
      mode: 'voice' | 'text',
    ) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)
      const todayStr = new Date().toISOString().split('T')[0]

      // Find note
      const targetNote = notes.find((n) => n.id === noteId)
      const topicName = targetNote ? targetNote.title : 'Custom Practice'
      const subjectName = targetNote ? targetNote.subject : 'General'

      // Calculate next review interval based on Exam Mode vs Skill Mode
      let daysAdd = 3
      if (studyMode === 'exam' && examTargetDate) {
        const todayMs = new Date().getTime()
        const examMs = new Date(examTargetDate).getTime()
        const daysLeft = Math.max(1, Math.ceil((examMs - todayMs) / (1000 * 60 * 60 * 24)))
        // In Exam Mode, compress revision interval into 1 to 2 days before exam!
        daysAdd = Math.max(1, Math.min(2, Math.floor(daysLeft / 3)))
      }

      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + daysAdd)
      const nextReviewStr = nextDate.toISOString().split('T')[0]

      // 1. Update Note Score & Retention
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === noteId || n.title.toLowerCase() === topicName.toLowerCase()) {
            const nextHealth = Math.min(100, Math.round(correctness * 0.5 + clarity * 0.3 + completeness * 0.2))
            return {
              ...n,
              lectorScore: score,
              practiceCount: n.practiceCount + 1,
              lastPracticed: todayStr,
              retentionHealth: nextHealth,
              nextReviewDate: nextReviewStr,
              updatedAt: todayStr,
            }
          }
          return n
        }),
      )

      // 2. Add to Recent Explanations Log
      const newExplanation: PracticeExplanation = {
        id: `exp-${Date.now()}`,
        noteId,
        topic: topicName,
        subject: subjectName,
        score,
        correctness,
        clarity,
        completeness,
        mode,
        timestamp: nowStr,
      }

      setExplanations((prev) => [newExplanation, ...prev])
    },
    [notes, studyMode, examTargetDate],
  )

  // Compute live averages for Dashboard
  const avgLectorScore = useMemo(() => {
    if (explanations.length === 0) return 9.0
    const sum = explanations.reduce((acc, e) => acc + e.score, 0)
    return Number((sum / explanations.length).toFixed(2))
  }, [explanations])

  const retentionAverage = useMemo(() => {
    if (notes.length === 0) return 85
    const sum = notes.reduce((acc, n) => acc + (n.retentionHealth || 85), 0)
    return Math.round(sum / notes.length)
  }, [notes])

  const totalSessionsToday = useMemo(() => {
    return explanations.length
  }, [explanations])

  const value = useMemo(
    () => ({
      notes,
      explanations,
      calendarLoading,
      importantDates,
      studyMode,
      examTargetDate,
      examTitle,
      setStudyMode,
      notesLoading,
      activeNoteId,
      setActiveNoteId,
      addNote,
      updateNote,
      deleteNote,
      recordPracticeSession,
      submitFeynmanEvaluation,
      addImportantDate,
      deleteImportantDate,
      avgLectorScore,
      totalSessionsToday,
      retentionAverage,
    }),
    [
      notes,
      explanations,
      calendarLoading,
      importantDates,
      studyMode,
      examTargetDate,
      examTitle,
      setStudyMode,
      notesLoading,
      activeNoteId,
      addNote,
      updateNote,
      deleteNote,
      recordPracticeSession,
      submitFeynmanEvaluation,
      addImportantDate,
      deleteImportantDate,
      avgLectorScore,
      totalSessionsToday,
      retentionAverage,
    ],
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used within NotesProvider')
  return ctx
}
