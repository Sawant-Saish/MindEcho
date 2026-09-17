import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LearningDashboardGrid } from '../components/dashboard/LearningDashboardGrid'
import { Navbar } from '../components/Navbar'
import { ShinyButton } from '../components/ui/shiny-button'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1917] via-[#2a2421] to-[#14100e]">
      <Navbar />
      <main className="mx-auto max-w-[1180px] px-4 pt-28 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-white/65">
            Welcome back, {user?.name}! Track your learning progress with
            LECTOR scores and spaced repetition.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <ShinyButton
              label="Start New Concept +"
              onClick={() => navigate('/concept/new')}
              accentColor="#e8c89b"
              accentSoftColor="#f5efe8"
              fillColor="#2b2421"
              cornerRadius={9999}
              className="px-5 py-2.5 text-xs font-semibold"
            />
            <button
              onClick={() => navigate('/calendar')}
              className="glass rounded-full px-5 py-2.5 text-sm font-semibold text-[#e8c89b] transition hover:bg-white/10 flex items-center gap-2 border border-[#e8c89b]/30 bg-[#e8c89b]/10"
            >
              <span>Review Due Items &amp; Adaptive Calendar</span>
            </button>
            <Link
              to="/subjects"
              className="glass rounded-full px-5 py-2.5 text-sm text-white/90 transition hover:bg-white/10 font-semibold"
            >
              Subjects &amp; Notes
            </Link>
          </div>
        </motion.div>

        <LearningDashboardGrid />
      </main>
    </div>
  )
}
