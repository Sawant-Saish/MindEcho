import { motion } from 'framer-motion'
import {
  Brain,
  CheckCircle2,
  Cpu,
  Mic,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react'
import { GlassCard } from './GlassCard'

const detailedServices = [
  {
    icon: Sparkles,
    title: 'LECTOR AI Evaluation Engine',
    tagline: 'Semantic Explanation Analysis',
    desc: 'Our proprietary LECTOR model evaluates your open-ended explanations across 3 core pillars: Correctness (factual accuracy), Clarity (coherence of thought), and Completeness (coverage of essential sub-concepts).',
    highlights: [
      'Identifies subtle conceptual misconceptions',
      'Instant feedback with detailed sub-scores',
      'Supports voice and text inputs',
    ],
  },
  {
    icon: Brain,
    title: 'Personalized Retention Engine',
    tagline: 'Dynamic Forgetting Curve Modeling',
    desc: 'Unlike static flashcard apps with fixed timers, MemoRoute models your unique memory decay curve based on your LECTOR score history, spacing reviews at the exact moment before memory fades.',
    highlights: [
      'Calibrated to your individual learning pace',
      'Prevents unnecessary over-studying',
      'Guarantees 90%+ long-term retention',
    ],
  },
  {
    icon: Mic,
    title: 'Feynman Voice Active Recall',
    tagline: 'Teach to Master',
    desc: 'Speak your explanation out loud as if teaching a beginner. LECTOR converts your speech to structured concept graphs, detecting missing pieces and prompting targeted follow-ups.',
    highlights: [
      'Natural speech-to-text semantic parsing',
      'Active vocal retrieval strengthens neural pathways',
      'Interactive voice feedback prompts',
    ],
  },
  {
    icon: Zap,
    title: 'Dynamic Exam Mode',
    tagline: 'Prioritize What Matters Most',
    desc: 'Facing an upcoming test or viva? Exam Mode dynamically reorganizes your entire study schedule based on concept weakness, retention urgency, and remaining days before your deadline.',
    highlights: [
      'Automatic weak-topic prioritization',
      'Countdown-based retention boosting',
      'High-yield revision plans',
    ],
  },
]

const comparisonData = [
  {
    feature: 'Active Explanation (Feynman Method)',
    memoRoute: true,
    anki: false,
    passiveReading: false,
    chatbots: 'Partial',
  },
  {
    feature: 'Real-time AI Feedback on Clarity & Completeness',
    memoRoute: true,
    anki: false,
    passiveReading: false,
    chatbots: false,
  },
  {
    feature: 'Personalized Forgetting Curve Modeling',
    memoRoute: true,
    anki: 'Static SM-2',
    passiveReading: false,
    chatbots: false,
  },
  {
    feature: 'Voice Input & Speech-to-Graph Parsing',
    memoRoute: true,
    anki: false,
    passiveReading: false,
    chatbots: 'Basic',
  },
  {
    feature: 'Deadline-Driven Exam Mode Prioritization',
    memoRoute: true,
    anki: false,
    passiveReading: false,
    chatbots: false,
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="relative px-4 py-20 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#14100e] via-[#1e1917] to-[#251e1b]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8c89b]/30 bg-[#e8c89b]/10 px-4 py-1.5 backdrop-blur-md">
            <Cpu className="h-4 w-4 text-[#e8c89b]" />
            <span className="text-xs font-bold tracking-wider text-[#e8c89b] uppercase">
              Our Core Services & Tech
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Detailed Solutions Engineered for Deep Learning
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#f5efe8]/75">
            Discover how MemoRoute combines cognitive memory science with LECTOR AI to transform how you learn, retain, and perform.
          </p>
        </motion.div>

        {/* Detailed Services Grid */}
        <div className="mb-20 grid gap-8 sm:grid-cols-2 items-stretch">
          {detailedServices.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex h-full flex-col"
            >
              <GlassCard dark className="flex h-full flex-col justify-between p-8 border border-white/15 shadow-2xl">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30 shadow-md">
                      <service.icon className="h-7 w-7 text-[#e8c89b]" />
                    </div>
                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-semibold text-[#e8c89b]">
                      {service.tagline}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-white">
                    {service.title}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-[#f5efe8]/70">
                    {service.desc}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                    Key Advantages
                  </p>
                  <ul className="space-y-2">
                    {service.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-xs font-medium text-[#f5efe8]/85">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* How We Differ From Others - Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-[2.5rem] border border-white/15 p-6 sm:p-10 shadow-2xl"
        >
          <div className="mb-8 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
              Why We Stand Out
            </span>
            <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              How MemoRoute Differs From Traditional Learning Tools
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-xs uppercase tracking-wider text-[#e8c89b]">
                  <th className="py-4 px-4 font-bold">Feature / Capability</th>
                  <th className="py-4 px-4 font-bold text-[#e8c89b] bg-[#e8c89b]/10 rounded-t-xl text-center">
                    MemoRoute (LECTOR AI)
                  </th>
                  <th className="py-4 px-4 font-bold text-white/50 text-center">Anki / Quizlet</th>
                  <th className="py-4 px-4 font-bold text-white/50 text-center">Passive Re-reading</th>
                  <th className="py-4 px-4 font-bold text-white/50 text-center">Generic AI Chatbots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#f5efe8]">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-emerald-400 bg-[#e8c89b]/5">
                      {row.memoRoute === true ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> Yes
                        </span>
                      ) : (
                        row.memoRoute
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-white/60">
                      {row.anki === false ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400/70">
                          <XCircle className="h-4 w-4" /> No
                        </span>
                      ) : (
                        row.anki
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-white/60">
                      {row.passiveReading === false ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400/70">
                          <XCircle className="h-4 w-4" /> No
                        </span>
                      ) : (
                        row.passiveReading
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-white/60">
                      {row.chatbots === false ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400/70">
                          <XCircle className="h-4 w-4" /> No
                        </span>
                      ) : (
                        row.chatbots
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
