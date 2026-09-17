import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Mic,
  Network,
  Search,
} from 'lucide-react'
import { GlassCard } from './GlassCard'

const steps = [
  {
    num: '01',
    title: 'Learn',
    icon: BookOpen,
    desc: 'Study a concept at your own pace.',
  },
  {
    num: '02',
    title: 'Explain',
    icon: Mic,
    desc: 'Explain it using voice or text.',
  },
  {
    num: '03',
    title: 'LECTOR Evaluates',
    icon: Search,
    desc: 'Checks correctness, clarity and completeness.',
  },
  {
    num: '04',
    title: 'Memory Model',
    icon: Network,
    desc: 'Updates your personalized forgetting parameters.',
  },
  {
    num: '05',
    title: 'Review',
    icon: Calendar,
    desc: 'We bring the concept back when you need it.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-4 py-20 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#251e1b] via-[#1e1917] to-[#14100e]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A simpler, smarter way to learn.
          </h2>
          <p className="font-script text-2xl text-[#e8c89b] sm:text-3xl">
            Not just recall. Real understanding.
          </p>
        </motion.div>

        {/* 5-Step Grid with Uniform Card Dimensions */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex h-full flex-col"
            >
              <GlassCard className="flex h-full flex-col justify-between p-6 text-left border border-white/12 shadow-xl backdrop-blur-md">
                {/* Top Header: Step Badge & Icon */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-[#e8c89b]/15 px-3 py-1 text-xs font-bold text-[#e8c89b] border border-[#e8c89b]/25">
                      {step.num}
                    </span>
                  </div>

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                    <step.icon className="h-6 w-6 text-[#e8c89b]" />
                  </div>

                  {/* Uniform Height Title Container */}
                  <div className="mb-3 flex items-end h-10">
                    <h3 className="text-base font-semibold leading-snug text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>

                {/* Uniform Height Description Container */}
                <div className="mt-2 min-h-[3rem] flex items-start">
                  <p className="text-xs leading-relaxed text-[#f5efe8]/70">
                    {step.desc}
                  </p>
                </div>
              </GlassCard>

              {/* Connected Arrow Circle Indicator for Desktop */}
              {i < steps.length - 1 && (
                <div className="absolute top-1/2 -right-3.5 z-20 hidden -translate-y-1/2 lg:flex h-7 w-7 items-center justify-center rounded-full bg-[#1e1917] border border-white/20 shadow-lg">
                  <ArrowRight className="h-3.5 w-3.5 text-[#e8c89b]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex items-center justify-center gap-3"
        >
          <span className="h-px w-12 bg-white/15" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#e8c89b]/80 uppercase">
            Learn · Explain · Retain · Grow
          </span>
          <span className="h-px w-12 bg-white/15" />
        </motion.div>
      </div>
    </section>
  )
}


