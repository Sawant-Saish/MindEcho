import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AnimatedCharacter } from './AnimatedCharacter'
import { ShinyButton } from './ui/shiny-button'

const avatars = ['A', 'R', 'S', 'K', 'M']

export function Hero() {
  const navigate = useNavigate()

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden pt-28 pb-16 sm:pt-32"
    >
      {/* Dark mocha background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1917] via-[#2a2421] to-[#14100e]" />
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(232,200,155,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 70%, rgba(212,184,150,0.12) 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-left"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8c89b]/30 bg-[#e8c89b]/10 px-3.5 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#e8c89b]" />
            <span className="text-xs font-semibold tracking-wider text-[#e8c89b] uppercase">
              Learn · Explain · Remember · Grow
            </span>
          </div>

          <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Understand Today.
            <br />
            <span className="font-script text-[#e8c89b] font-normal text-4xl sm:text-5xl lg:text-6xl">
              Remember Tomorrow.
            </span>
          </h1>

          <p className="mb-8 max-w-lg text-base leading-relaxed text-[#f5efe8]/80 sm:text-lg">
            MemoRoute helps you truly understand, retain and perform better using
            the power of LECTOR AI evaluation and personalized spaced repetition.
          </p>

          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <ShinyButton
              label="Start Learning →"
              onClick={() => navigate('/login')}
              accentColor="#e8c89b"
              accentSoftColor="#f5efe8"
              fillColor="#2b2421"
              cornerRadius={9999}
              className="px-7 py-3.5 text-sm font-semibold"
            />
            <button
              onClick={() =>
                document
                  .querySelector('#how-it-works')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              <Play className="h-4 w-4 fill-white text-white" />
              Watch How It Works
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {avatars.map((letter, i) => (
                <div
                  key={letter}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xs font-semibold text-[#f5efe8] backdrop-blur-sm"
                  style={{ zIndex: avatars.length - i }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-[#f5efe8]/70">
              Join 10,000+ curious learners mastering technical concepts.
            </p>
          </div>

          {/* Relatable Connection Story Box */}
          <div className="glass rounded-2xl border border-white/15 p-4 text-xs leading-relaxed text-[#f5efe8]/80 backdrop-blur-md max-w-lg">
            <p className="font-semibold text-[#e8c89b] mb-1">
              &ldquo;I used to re-read notes 10 times and still forget core topics on exam day. MemoRoute&apos;s active Feynman voice feedback helped me retain 94% of my syllabus.&rdquo;
            </p>
            <p className="text-[11px] text-white/50 text-right">— Alex M., CS &amp; Pre-Med Student</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <AnimatedCharacter />
        </motion.div>
      </div>
    </section>
  )
}

