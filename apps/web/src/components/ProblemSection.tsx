import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Brain, RefreshCw } from 'lucide-react'
import { GlassCard } from './GlassCard'

const steps = [
  {
    day: 'Day 1',
    label: 'Study',
    icon: BookOpen,
    text: 'Concept is clear and fresh in your mind',
    bright: true,
  },
  {
    day: 'Day 5',
    label: 'Feel confident',
    icon: Brain,
    text: 'It still feels easy to recall',
    bright: true,
  },
  {
    day: 'Day 10',
    label: 'Memory fades',
    icon: Brain,
    text: 'Details start to fade silently',
    bright: false,
  },
  {
    day: 'Again',
    label: 'Revise everything',
    icon: RefreshCw,
    text: 'Re-studying the same topics repeatedly',
    bright: false,
  },
]

export function ProblemSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#14100e] via-[#1e1917] to-[#251e1b]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          You study. You forget. You repeat.
        </motion.h2>

        <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {steps.map((step, i) => (
            <motion.div
              key={step.day}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative flex h-full flex-col"
            >
              <GlassCard
                dark
                className="flex h-full flex-col items-center justify-between p-6 text-center border border-white/10"
              >
                <div className="w-full">
                  <span className="inline-block rounded-full bg-[#e8c89b]/15 px-3 py-1 text-xs font-bold text-[#e8c89b] mb-2">
                    {step.day}
                  </span>
                  <h3 className="mb-4 text-sm font-semibold text-white">
                    ({step.label})
                  </h3>
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border transition-all ${
                      step.bright
                        ? 'border-[#e8c89b]/40 bg-[#e8c89b]/15 shadow-md'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <step.icon
                      className={`h-6 w-6 ${
                        step.bright ? 'text-[#e8c89b]' : 'text-white/40'
                      }`}
                    />
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-[#f5efe8]/65">
                  {step.text}
                </p>
              </GlassCard>

              {/* Connected Arrow Indicator for Large Screens */}
              {i < steps.length - 1 && (
                <div className="absolute top-1/2 -right-4 z-20 hidden -translate-y-1/2 lg:flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1917] border border-white/15 shadow-md">
                  <ArrowRight className="h-4 w-4 text-[#e8c89b]/70" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-dark flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/15 p-6 sm:flex-row sm:p-8"
        >
          <p className="max-w-xl text-lg font-medium text-[#f5efe8] sm:text-xl">
            What if your revision schedule could adapt to your actual
            understanding?
          </p>
          <div className="glass flex shrink-0 items-center gap-2.5 rounded-2xl border border-[#e8c89b]/30 px-6 py-3.5 shadow-lg">
            <Brain className="h-5 w-5 text-[#e8c89b]" />
            <span className="font-semibold text-white">MemoRoute</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

