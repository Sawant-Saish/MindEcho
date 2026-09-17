import type { NotificationPayload, NotificationProvider } from './notification-provider.js'

export class MockNotificationProvider implements NotificationProvider {
  readonly sent: NotificationPayload[] = []

  async send(payload: NotificationPayload): Promise<void> {
    this.sent.push(payload)
  }
}
