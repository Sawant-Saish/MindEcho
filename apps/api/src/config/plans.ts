export type PlanId = 'starter' | 'pro' | 'team'

export interface PlanDefinition {
  id: PlanId
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  dailyEvaluationLimit: number | null
  voiceEnabled: boolean
  examMode: 'basic' | 'full'
}

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual learners and light practice.',
    monthlyPrice: 0,
    annualPrice: 0,
    dailyEvaluationLimit: 10,
    voiceEnabled: false,
    examMode: 'basic',
  },
  pro: {
    id: 'pro',
    name: 'Pro Mastery',
    description: 'Ideal for students preparing for major exams.',
    monthlyPrice: 299,
    annualPrice: 239,
    dailyEvaluationLimit: null,
    voiceEnabled: true,
    examMode: 'full',
  },
  team: {
    id: 'team',
    name: 'Team Edu',
    description: 'For institutions, study groups, and organizations.',
    monthlyPrice: 999,
    annualPrice: 799,
    dailyEvaluationLimit: null,
    voiceEnabled: true,
    examMode: 'full',
  },
}

export function getPlanDefinition(planId: string): PlanDefinition | undefined {
  return PLAN_DEFINITIONS[planId as PlanId]
}
