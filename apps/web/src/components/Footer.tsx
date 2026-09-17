import { Brain, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#14100e] px-4 py-12 sm:px-6 text-[#f5efe8]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 sm:flex-row">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <div className="flex items-center gap-2 text-white">
            <Brain className="h-6 w-6 text-[#e8c89b]" />
            <span className="font-bold text-lg">MemoRoute</span>
          </div>
          <p className="text-xs text-[#f5efe8]/60 max-w-xs text-center sm:text-left">
            Adaptive Spaced Retention &amp; LECTOR AI Evaluation System &bull; SIH 2026
          </p>
        </div>

        {/* Phone & Email Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-[#e8c89b]">
          <div className="flex items-center gap-1.5 rounded-full border border-[#e8c89b]/30 bg-[#e8c89b]/10 px-4 py-2">
            <Phone className="h-3.5 w-3.5" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#e8c89b]/30 bg-[#e8c89b]/10 px-4 py-2">
            <Mail className="h-3.5 w-3.5" />
            <span>support@memoroute.ai</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-5 text-xs font-medium text-[#f5efe8]/70">
          <a href="#home" className="hover:text-[#e8c89b]">Home</a>
          <a href="#services" className="hover:text-[#e8c89b]">Services</a>
          <a href="#about-us" className="hover:text-[#e8c89b]">About Us</a>
          <a href="#blog" className="hover:text-[#e8c89b]">Blog</a>
          <a href="#contact" className="hover:text-[#e8c89b]">Contact</a>
          <Link to="/login" className="hover:text-[#e8c89b]">Login</Link>
          <Link to="/dashboard" className="hover:text-[#e8c89b]">Dashboard</Link>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/5 pt-6 text-center text-[11px] text-white/40">
        &copy; 2026 MemoRoute AI. All research papers &amp; cognitive retention models reserved.
      </div>
    </footer>
  )
}

