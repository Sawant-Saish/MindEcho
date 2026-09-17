export interface NotificationPayload {
  userId: string
  email: string
  title: string
  message: string
  type: 'due_review' | 'retention_decay' | 'system'
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<void>
}
