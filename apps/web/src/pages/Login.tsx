import { motion } from 'framer-motion'
import { Brain, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShinyButton } from '../components/ui/shiny-button'

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const ok =
      mode === 'register'
        ? await register(name, email, password)
        : await login(email, password)
    setIsSubmitting(false)

    if (ok) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(
        mode === 'register'
          ? 'Could not create your account. Check your details and try again.'
          : 'Invalid email or password. Please try again.',
      )
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1917] via-[#2a2421] to-[#14100e]" />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 40%, rgba(232,200,155,0.2) 0%, transparent 50%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative z-10 w-full max-w-md rounded-[2rem] p-8 sm:p-10"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-white">
          <Brain className="h-7 w-7 text-gold-soft" />
          <span className="text-xl font-semibold">MemoRoute</span>
        </Link>

        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mb-8 text-center text-sm text-white/60">
          {mode === 'login'
            ? 'Sign in to continue your learning journey'
            : 'Register to start practicing with LECTOR AI'}
        </p>

        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              mode === 'login'
                ? 'bg-[#e8c89b] text-[#1e1917]'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              mode === 'register'
                ? 'bg-[#e8c89b] text-[#1e1917]'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Name
              </label>
              <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Email
            </label>
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
              <Mail className="h-4 w-4 text-white/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Password
            </label>
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
              <Lock className="h-4 w-4 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/50 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-300">{error}</p>
          )}

          <ShinyButton
            type="submit"
            label={
              isSubmitting
                ? mode === 'register'
                  ? 'Creating account…'
                  : 'Signing in…'
                : mode === 'register'
                  ? 'Create Account →'
                  : 'Sign In →'
            }
            accentColor="#e8c89b"
            accentSoftColor="#f5efe8"
            fillColor="#2b2421"
            cornerRadius={9999}
            className="w-full py-3.5 text-sm font-semibold"
          />
        </form>

        <p className="mt-6 text-center text-xs text-white/45">
          {import.meta.env.VITE_USE_API === 'true'
            ? 'Sign in with your LECTOR account.'
            : 'Demo mode — any email and password will work.'}
        </p>

        <Link
          to="/"
          className="mt-4 block text-center text-sm text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
