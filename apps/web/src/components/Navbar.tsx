import { Brain, Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShinyButton } from './ui/shiny-button'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about-us' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  const handleNavClick = (href: string) => {
    setOpen(false)
    if (!isHome) {
      navigate('/' + href)
      return
    }
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="glass mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 px-5 py-3 shadow-2xl backdrop-blur-xl">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-white group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8c89b]/15 border border-[#e8c89b]/30 transition group-hover:scale-105">
            <Brain className="h-5 w-5 text-[#e8c89b]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">MemoRoute</span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#f5efe8]/80 transition-colors hover:text-white hover:bg-white/10"
            >
              {link.label}
              {link.label === 'Home' && isHome && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#e8c89b]" />
              )}
            </button>
          ))}
        </div>

        {/* Right User Controls */}
        <div className="hidden items-center gap-2 lg:gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#f5efe8]/85 transition hover:text-white hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                to="/subjects"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#f5efe8]/85 transition hover:text-white hover:bg-white/10"
              >
                Subjects &amp; Notes
              </Link>
              <Link
                to="/calendar"
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#e8c89b] transition hover:text-white hover:bg-white/10"
              >
                Calendar
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#f5efe8]">
                <User className="h-3.5 w-3.5 text-[#e8c89b]" />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-white/60 transition hover:text-white hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <ShinyButton
              label="Get Started →"
              onClick={() => navigate('/login')}
              accentColor="#e8c89b"
              accentSoftColor="#f5efe8"
              fillColor="#2b2421"
              cornerRadius={9999}
              className="px-4 py-2 text-xs font-bold"
            />
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="rounded-full p-2 text-white md:hidden hover:bg-white/10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="glass mx-auto mt-3 max-w-7xl rounded-3xl border border-white/15 p-4 md:hidden shadow-2xl backdrop-blur-2xl">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-[#f5efe8] hover:bg-white/10"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-2 border-t border-white/10 pt-3">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-[#e8c89b]">
                  <User className="h-4 w-4" />
                  <span>Logged in as {user?.name}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-[#f5efe8] hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/subjects"
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-[#e8c89b] hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  Subjects &amp; Notes
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-white/60 hover:text-white hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-glow mt-2 block rounded-full px-4 py-3 text-center text-sm font-bold shadow-md"
                onClick={() => setOpen(false)}
              >
                Get Started →
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

