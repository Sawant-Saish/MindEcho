import { EventEmitter } from 'node:events'

export interface EvaluationCompletedEvent {
  userId: string
  noteId: string
  evaluationId: string
  mode: 'voice' | 'text'
}

type DomainEventMap = {
  EvaluationCompleted: EvaluationCompletedEvent
}

class DomainEventBus {
  private readonly emitter = new EventEmitter()

  emit<T extends keyof DomainEventMap>(event: T, payload: DomainEventMap[T]): void {
    this.emitter.emit(event, payload)
  }

  on<T extends keyof DomainEventMap>(
    event: T,
    listener: (payload: DomainEventMap[T]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, (payload) => {
      void listener(payload)
    })
  }
}

export const domainEvents = new DomainEventBus()
