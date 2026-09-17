export interface FeynmanEvaluationResult {
  lectorScore: number
  correctness: number
  clarity: number
  completeness: number
  feedback: {
    strengths: string[]
    missingConcepts: string[]
    improvementTip: string
  }
}

export interface FeynmanEvaluationInput {
  sourceContent: string
  userExplanation: string
  topic: string
}

export interface LLMProvider {
  evaluateFeynman(input: FeynmanEvaluationInput): Promise<FeynmanEvaluationResult>
}
