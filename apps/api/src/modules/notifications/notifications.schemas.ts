export interface NotificationResponse {
  id: string
  type: 'due_review' | 'retention_decay' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface NotificationSettingsResponse {
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
}
