import { motion } from 'framer-motion'
import { Clock, Mail, MapPin, MessageSquare, Phone, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { GlassCard } from './GlassCard'
import { ShinyButton } from './ui/shiny-button'

export function ContactSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return
    setSubmitted(true)
    setTimeout(() => {
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setSubmitted(false)
    }, 3000)
  }

  return (
    <section id="contact" className="relative px-4 py-20 sm:px-6">
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
            <MessageSquare className="h-4 w-4 text-[#e8c89b]" />
            <span className="text-xs font-bold tracking-wider text-[#e8c89b] uppercase">
              Get in Touch
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contact Us & Join the Learning Revolution
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#f5efe8]/75">
            Have questions about LECTOR AI, team integration, or cognitive research? We&apos;re here to help!
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Contact Info Card Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <GlassCard dark className="p-8 border border-white/15 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#e8c89b]" />
                Contact Information
              </h3>

              <div className="space-y-6 text-sm">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                    <Phone className="h-5 w-5 text-[#e8c89b]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                      Phone Number
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      +91 98765 43210
                    </p>
                    <p className="text-xs text-white/50">
                      Toll-Free: +1 (800) 636-6768
                    </p>
                  </div>
                </div>

                {/* Mock Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                    <Mail className="h-5 w-5 text-[#e8c89b]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                      Mock Email Addresses
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      support@memoroute.ai
                    </p>
                    <p className="text-xs text-white/50">
                      contact@memoroute.ai
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                    <MapPin className="h-5 w-5 text-[#e8c89b]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                      Location & Innovation Hub
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      SIH 2026 AI Cognitive Research Center
                    </p>
                    <p className="text-xs text-white/50">
                      Tech Park, New Delhi &amp; San Francisco, CA
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8c89b]/15 border border-[#e8c89b]/30">
                    <Clock className="h-5 w-5 text-[#e8c89b]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#e8c89b]">
                      Support Hours
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      24/7 Automated AI Tutor Active
                    </p>
                    <p className="text-xs text-white/50">
                      Human Team Response: &lt; 2 hours
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Interactive Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <GlassCard dark className="p-8 sm:p-10 border border-white/15 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Send Us a Message
              </h3>
              <p className="text-xs text-[#f5efe8]/65 mb-8">
                Fill out the form below and our LECTOR AI cognitive team will get back to you immediately.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Alex Morgan"
                      required
                      className="glass w-full rounded-2xl border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8c89b]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@university.edu"
                      required
                      className="glass w-full rounded-2xl border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8c89b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="LECTOR AI Research Partnership"
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8c89b]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your learning goals or questions..."
                    required
                    className="glass w-full rounded-2xl border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8c89b]"
                  />
                </div>

                {submitted && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-center text-xs font-semibold text-emerald-300">
                    Message sent successfully! We will contact you at {email}.
                  </div>
                )}

                <ShinyButton
                  type="submit"
                  label={submitted ? 'Message Sent' : 'Send Message'}
                  accentColor="#e8c89b"
                  accentSoftColor="#f5efe8"
                  fillColor="#2b2421"
                  cornerRadius={9999}
                  className="w-full py-4 text-sm font-semibold"
                />
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
