import { motion } from 'framer-motion'
import { ChevronRight, Quote, Users } from 'lucide-react'
import { GlassCard } from './GlassCard'

const teamMembers = [
  {
    id: 1,
    name: 'Dr. Kapil Jain',
    role: 'AI Research Lead & Co-Founder',
    quote: 'Empowering human cognition through adaptive AI tutors that understand how we think.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    initials: 'KJ',
    badge: 'Cognitive AI',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Chief Cognitive Neuroscientist',
    quote: 'True learning happens when you actively explain concepts, not when you highlight notes.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    initials: 'SC',
    badge: 'Neuroscience',
  },
  {
    id: 3,
    name: 'Marcus Vance',
    role: 'Head of LECTOR AI Engineering',
    quote: 'We built LECTOR to measure conceptual nuance, clarity, and completeness in seconds.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    initials: 'MV',
    badge: 'LLM Systems',
  },
  {
    id: 4,
    name: 'Ananya Sharma',
    role: 'Lead UX & Product Designer',
    quote: 'Designing frictionless, calm learning spaces for deep focus, retention, and clarity.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    initials: 'AS',
    badge: 'Product UX',
  },
  {
    id: 5,
    name: 'David Miller',
    role: 'Memory Algorithm Lead',
    quote: 'Turning classic Ebbinghaus memory science into personalized dynamic daily schedules.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    initials: 'DM',
    badge: 'Retention Math',
  },
  {
    id: 6,
    name: 'Elena Rostova',
    role: 'Student Advocacy & Growth Lead',
    quote: 'Ensuring every curious learner retains knowledge for life, not just for exam day.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    initials: 'ER',
    badge: 'Growth & Care',
  },
]

export function AboutUsSection() {
  return (
    <section id="about-us" className="relative px-4 py-20 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#251e1b] via-[#1e1917] to-[#14100e]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8c89b]/30 bg-[#e8c89b]/10 px-4 py-1.5 backdrop-blur-md">
            <Users className="h-4 w-4 text-[#e8c89b]" />
            <span className="text-xs font-bold tracking-wider text-[#e8c89b] uppercase">
              Meet Our Team
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            About Us & The Minds Behind MemoRoute
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#f5efe8]/75">
            We are a team of AI researchers, neuroscientists, and product designers dedicated to solving the human forgetting curve.
          </p>
        </motion.div>

        {/* Scroll Indicator Tip */}
        <div className="mb-4 flex items-center justify-between text-xs text-[#e8c89b]">
          <span className="font-semibold uppercase tracking-wider">
            Scroll horizontally to view all 6 team members &rarr;
          </span>
          <span className="hidden sm:inline-block text-white/40">
            Swipe or shift-scroll &rarr;
          </span>
        </div>

        {/* Scrollable Team Container */}
        <div className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#e8c89b]/30">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="w-[290px] sm:w-[330px] shrink-0 snap-start"
            >
              <GlassCard dark className="flex h-full flex-col justify-between p-6 border border-white/15 shadow-2xl relative group hover:border-[#e8c89b]/40">
                <div>
                  {/* Avatar & Badge */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-[#e8c89b]/40 shadow-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#e8c89b] text-[10px] font-bold text-[#1e1917]">
                        {member.initials}
                      </div>
                    </div>
                    <span className="rounded-full bg-[#e8c89b]/15 border border-[#e8c89b]/30 px-3 py-1 text-[11px] font-bold text-[#e8c89b]">
                      {member.badge}
                    </span>
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-lg font-bold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#e8c89b] mb-4">
                    {member.role}
                  </p>

                  {/* Single Line Quote */}
                  <div className="relative rounded-2xl bg-white/5 border border-white/10 p-4">
                    <Quote className="absolute top-2 left-2 h-4 w-4 text-[#e8c89b]/30" />
                    <p className="pl-4 text-xs italic leading-relaxed text-[#f5efe8]/85">
                      &ldquo;{member.quote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end text-xs text-[#e8c89b] font-medium group-hover:translate-x-1 transition-transform">
                  <span>Connect</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
