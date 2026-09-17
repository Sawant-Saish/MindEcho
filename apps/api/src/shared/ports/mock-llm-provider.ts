import type { FeynmanEvaluationInput, FeynmanEvaluationResult, LLMProvider } from './llm-provider.js'

function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 4),
  )
}

export class MockLLMProvider implements LLMProvider {
  async evaluateFeynman(input: FeynmanEvaluationInput): Promise<FeynmanEvaluationResult> {
    const explanation = input.userExplanation.trim()
    const wordCount = explanation.split(/\s+/).filter(Boolean).length
    const sourceKeywords = extractKeywords(input.sourceContent)
    const explanationKeywords = extractKeywords(explanation)
    const overlap = [...sourceKeywords].filter((word) => explanationKeywords.has(word)).length
    const coverageRatio = sourceKeywords.size > 0 ? overlap / sourceKeywords.size : 0

    const correctness = Math.min(97, Math.round(70 + coverageRatio * 30))
    const clarity = Math.min(95, Math.round(65 + Math.min(wordCount, 40) * 0.75))
    const completeness = Math.min(96, Math.round(60 + coverageRatio * 40))
    const lectorScore = Number((correctness * 0.05 + clarity * 0.03 + completeness * 0.02).toFixed(1))

    return {
      lectorScore,
      correctness,
      clarity,
      completeness,
      feedback: {
        strengths: overlap > 0
          ? [`Covered ${overlap} key concepts from your notes`, 'Clear attempt at simplifying the topic']
          : ['Good effort starting the explanation'],
        missingConcepts:
          wordCount < 20
            ? ['Explanation was too short for full coverage']
            : coverageRatio < 0.3
              ? ['Several core concepts from the source note were not mentioned']
              : [],
        improvementTip:
          coverageRatio < 0.5
            ? 'Re-read your notes and try explaining the topic again in simpler words.'
            : 'Practice explaining edge cases and real-world examples out loud.',
      },
    }
  }
}
