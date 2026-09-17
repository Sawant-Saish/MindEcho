import type { FeynmanEvaluationInput, FeynmanEvaluationResult, LLMProvider } from './llm-provider.js'

export class MockLLMProvider implements LLMProvider {
  async evaluateFeynman(input: FeynmanEvaluationInput): Promise<FeynmanEvaluationResult> {
    const wordCount = input.userExplanation.trim().split(/\s+/).filter(Boolean).length

    return {
      lectorScore: wordCount > 20 ? 8.8 : 7.2,
      correctness: wordCount > 20 ? 92 : 78,
      clarity: wordCount > 20 ? 90 : 75,
      completeness: wordCount > 20 ? 88 : 70,
      feedback: {
        strengths: ['Mock evaluation — replace with real LLM in Phase 4'],
        missingConcepts: wordCount < 20 ? ['Explanation was too short for full coverage'] : [],
        improvementTip: 'Add more detail about edge cases and real-world examples.',
      },
    }
  }
}
