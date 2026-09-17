import { motion } from 'framer-motion'
import { Clock, FileText, Shield, Trophy, Users } from 'lucide-react'
import { GlassCard } from './GlassCard'

const features = [
  {
    icon: Users,
    title: 'Explain Concepts',
    desc: 'Using your own words for deeper conceptual understanding.',
  },
  {
    icon: FileText,
    title: 'LECTOR LLM Scores',
    desc: 'Checks correctness, clarity and completeness in real-time.',
  },
  {
    icon: Shield,
    title: 'Smart Scheduling',
    desc: 'Reviews at the exact right time for long-term retention.',
  },
  {
    icon: Trophy,
    title: 'Perform Better',
    desc: 'Be completely ready for exams, vivas and competitive tests.',
  },
]

export function FeatureBar() {
  return (
    <section id="features" className="relative z-10 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-[2.5rem] border border-white/15 p-6 sm:p-8 shadow-2xl"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex h-full flex-col"
              >
                <GlassCard
                  hover
                  className="flex h-full flex-col justify-between items-start gap-4 p-6 text-left border border-white/10"
                >
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                      <f.icon className="h-6 w-6 text-[#e8c89b]" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-[#f5efe8]/65">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function WhyUsSection() {
  const points = [
    {
      icon: Clock,
      title: 'Adaptive Scheduling',
      desc: 'Review intervals adapt continuously to your actual comprehension score, not fixed static timers.',
    },
    {
      icon: Shield,
      title: 'LECTOR Evaluation',
      desc: 'Open-ended explanations evaluated objectively for correctness, clarity, and concept completeness.',
    },
    {
      icon: Trophy,
      title: 'Exam Mode',
      desc: 'Dynamically prioritize weak topics based on retention strength and time remaining before your exam.',
    },
  ]

  return (
    <section id="why-us" className="relative px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why MemoRoute?
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#f5efe8]/70">
            Not just recall — real understanding powered by the Feynman Technique
            and personalized forgetting models.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3 items-stretch">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex h-full flex-col"
            >
              <GlassCard className="flex h-full flex-col justify-between p-7 text-left border border-white/12">
                <div>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                    <p.icon className="h-6 w-6 text-[#e8c89b]" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-white">{p.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-[#f5efe8]/65">{p.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ExamModeSection() {
  return (
    <section id="exam-mode" className="relative px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <GlassCard dark className="p-8 text-center sm:p-12 border border-white/15 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Exam Mode
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[#f5efe8]/75">
            Dynamically reprioritize topics based on your retention strength and
            the time remaining before your exam. Focus on what matters most.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Weak Topics First', 'Retention Tracking', 'Smart Deadlines'].map(
              (tag) => (
                <span
                  key={tag}
                  className="glass rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-[#f5efe8] shadow-md"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  )
}

