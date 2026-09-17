export interface RecentExplanationResponse {
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

export interface DashboardSummaryResponse {
  avgLectorScore: number
  retentionAverage: number
  totalSessionsToday: number
  dueTodayCount: number
  recentExplanations: RecentExplanationResponse[]
}

export interface RetentionHealthItem {
  noteId: string
  title: string
  subject: string
  retentionHealth: number
  nextReviewDate?: string
}

export interface RetentionHealthResponse {
  average: number
  notes: RetentionHealthItem[]
}
