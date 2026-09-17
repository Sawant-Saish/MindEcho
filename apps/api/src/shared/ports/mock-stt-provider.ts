import type { STTProvider } from './stt-provider.js'

export class MockSTTProvider implements STTProvider {
  async transcribe(audioBuffer: Buffer, _mimeType: string): Promise<string> {
    const durationEstimate = Math.max(1, Math.round(audioBuffer.length / 16_000))
    return `Voice explanation transcript mock (${durationEstimate}s). The concept keeps smaller values on the left and larger values on the right in a binary search tree.`
  }
}
