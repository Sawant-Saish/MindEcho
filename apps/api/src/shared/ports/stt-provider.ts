export interface STTProvider {
  transcribe(audioBuffer: Buffer, mimeType: string): Promise<string>
}
