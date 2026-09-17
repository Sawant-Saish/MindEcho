import type { STTProvider } from './stt-provider.js'

export class MockSTTProvider implements STTProvider {
  async transcribe(_audioBuffer: Buffer, _mimeType: string): Promise<string> {
    return 'Mock transcript — connect Whisper or Deepgram in Phase 4.'
  }
}
