"use client";

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Bot, Brain, Cpu, Sparkles, Zap } from 'lucide-react'
import React, { useState } from 'react'

const robotMessages = [
  "Hi! I'm your 3D LECTOR AI Robot. Move your mouse to interact with me!",
  "I analyze your explanations for clarity, completeness & long-term retention.",
  "Ready to supercharge your memory schedule? Let's get started!",
  "AI Neural Engine active: 99.4% retention tracking accuracy.",
]

export function AnimatedCharacter() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  // Mouse tilt tracking values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth 3D tilt springs
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), {
    stiffness: 160,
    damping: 22,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), {
    stiffness: 160,
    damping: 22,
  })

  // Head tilt parallax offset (tilts and looks toward cursor)
  const headX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 220,
    damping: 18,
  })
  const headY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), {
    stiffness: 220,
    damping: 18,
  })

  // Spotlight dynamic movement based on mouse
  const spotlightX = useTransform(mouseX, [-0.5, 0.5], ['15%', '35%'])
  const spotlightY = useTransform(mouseY, [-0.5, 0.5], ['10%', '30%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const handleRobotClick = () => {
    setIsClicked(true)
    setMsgIndex((prev) => (prev + 1) % robotMessages.length)
    setTimeout(() => setIsClicked(false), 400)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex w-full max-w-lg flex-col items-center justify-center py-4 lg:max-w-xl cursor-pointer select-none"
      style={{ perspective: 1200 }}
    >
      {/* Speech Bubble — Interactive LECTOR Robot Message */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        onClick={handleRobotClick}
        className="glass-strong relative z-30 mb-4 flex items-start gap-3 rounded-2xl border border-[#e8c89b]/40 px-5 py-3.5 shadow-2xl backdrop-blur-xl transition hover:border-[#e8c89b] hover:bg-[#2b2421]/90"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8c89b]/20 border border-[#e8c89b]/50">
          <Bot className="h-5 w-5 text-[#e8c89b]" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8c89b]">
              LECTOR 3D Humanoid Robot
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/40">(Click me)</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-[#f5efe8]">
            &ldquo;{robotMessages[msgIndex]}&rdquo;
          </p>
        </div>
        {/* Pointer Tail */}
        <div className="absolute -bottom-2 left-12 h-4 w-4 rotate-45 border-b border-r border-[#e8c89b]/30 bg-[#2b2421]" />
      </motion.div>

      {/* Main 3D Stage Container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative flex w-full items-center justify-center py-2"
      >
        {/* Dynamic Studio Spotlight Glow matching user image */}
        <motion.div
          className="absolute inset-0 mx-auto h-[360px] w-[360px] rounded-full opacity-60 blur-3xl pointer-events-none transition-all duration-300"
          style={{
            left: spotlightX,
            top: spotlightY,
            background: isHovered
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(232, 200, 155, 0.25) 35%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(212, 184, 150, 0.15) 35%, transparent 65%)',
          }}
        />

        {/* Outer 3D Floating Feature Pills */}
        <div
          className="absolute -left-4 top-4 z-20 hidden sm:block pointer-events-none"
          style={{ transform: 'translateZ(70px)' }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="glass flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-[#f5efe8] shadow-xl backdrop-blur-md"
          >
            <Cpu className="h-4 w-4 text-[#e8c89b]" />
            3D Neural Engine
          </motion.div>
        </div>

        <div
          className="absolute -right-4 top-8 z-20 hidden sm:block pointer-events-none"
          style={{ transform: 'translateZ(80px)' }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="glass flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-[#f5efe8] shadow-xl backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-[#e8c89b]" />
            Real-time LECTOR
          </motion.div>
        </div>

        <div
          className="absolute -left-6 bottom-12 z-20 hidden sm:block pointer-events-none"
          style={{ transform: 'translateZ(60px)' }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="glass flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-[#f5efe8] shadow-xl backdrop-blur-md"
          >
            <Brain className="h-4 w-4 text-[#e8c89b]" />
            Spaced Retention
          </motion.div>
        </div>

        <div
          className="absolute -right-6 bottom-14 z-20 hidden sm:block pointer-events-none"
          style={{ transform: 'translateZ(90px)' }}
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="glass flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-[#f5efe8] shadow-xl backdrop-blur-md"
          >
            <Zap className="h-4 w-4 text-emerald-400" />
            Adaptive AI Mode
          </motion.div>
        </div>

        {/* HIGH-FIDELITY 3D HUMANOID ROBOT SVG (MATCHING USER IMAGE) */}
        <motion.div
          onClick={handleRobotClick}
          animate={isClicked ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] } : {}}
          transition={{ duration: 0.35 }}
          className="relative z-10 drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)]"
        >
          <svg
            viewBox="0 0 380 440"
            className="mx-auto h-auto w-[300px] sm:w-[370px]"
            aria-label="3D Black Humanoid Robot"
          >
            <defs>
              {/* Carbon Fiber Black Body Gradient */}
              <linearGradient id="carbonBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2c2725" />
                <stop offset="40%" stopColor="#181413" />
                <stop offset="85%" stopColor="#0d0a09" />
                <stop offset="100%" stopColor="#050404" />
              </linearGradient>

              {/* Glossy Visor Reflection Gradient */}
              <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="30%" stopColor="#d4d4d4" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#18181b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.98" />
              </linearGradient>

              {/* Metallic Joint Ring */}
              <linearGradient id="jointRing" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a423e" />
                <stop offset="50%" stopColor="#a39387" />
                <stop offset="100%" stopColor="#2c2725" />
              </linearGradient>

              {/* Warm Amber Core Accent */}
              <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5e4c6" />
                <stop offset="50%" stopColor="#e8c89b" />
                <stop offset="100%" stopColor="#b88c58" />
              </linearGradient>

              <filter id="spotlightSoft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Drop Shadow */}
            <ellipse cx="190" cy="420" rx="140" ry="14" fill="#000000" opacity="0.8" />

            {/* LOWER BODY & LEGS */}
            <g id="robot-legs">
              {/* Left Thigh Joint & Leg Plate */}
              <rect x="135" y="325" width="40" height="75" rx="14" fill="url(#carbonBody)" stroke="#3a3330" strokeWidth="2" />
              <circle cx="155" cy="335" r="14" fill="url(#jointRing)" />

              {/* Right Thigh Joint & Leg Plate */}
              <rect x="205" y="325" width="40" height="75" rx="14" fill="url(#carbonBody)" stroke="#3a3330" strokeWidth="2" />
              <circle cx="225" cy="335" r="14" fill="url(#jointRing)" />

              {/* Lower Shins */}
              <path d="M138 395 L172 395 L168 435 L142 435 Z" fill="#120e0d" stroke="#2a2421" strokeWidth="2" />
              <path d="M208 395 L242 395 L238 435 L212 435 Z" fill="#120e0d" stroke="#2a2421" strokeWidth="2" />
            </g>

            {/* PELVIS / HIP CONNECTOR */}
            <path
              d="M130 300 L250 300 L235 330 L145 330 Z"
              fill="url(#carbonBody)"
              stroke="#4a423e"
              strokeWidth="2"
            />
            <rect x="175" y="305" width="30" height="18" rx="4" fill="#090707" stroke="#e8c89b" strokeWidth="1" opacity="0.8" />

            {/* MAIN TORSO ARMOR (HUMANOID V-SHAPE) */}
            <g id="robot-torso">
              {/* Core Spine Joint */}
              <rect x="178" y="270" width="24" height="35" rx="6" fill="url(#jointRing)" />

              {/* Smooth Carbon Fiber Chest Shield */}
              <path
                d="M115 155 C150 145 230 145 265 155 C280 200 270 260 235 285 C190 295 190 295 145 285 C110 260 100 200 115 155 Z"
                fill="url(#carbonBody)"
                stroke="#4a423e"
                strokeWidth="2.5"
              />

              {/* Left Chest Specular Highlight */}
              <path
                d="M125 165 C150 158 190 158 200 162 C185 210 170 250 145 270 C130 250 120 205 125 165 Z"
                fill="#ffffff"
                opacity="0.08"
              />

              {/* Subtle Gold Center Spine Accent */}
              <line x1="190" y1="165" x2="190" y2="280" stroke="url(#goldAccent)" strokeWidth="1.5" opacity="0.6" />
            </g>

            {/* ARMS & ARTICULATED HANDS */}
            <g id="robot-arms">
              {/* Left Shoulder Spherical Joint */}
              <circle cx="105" cy="175" r="22" fill="url(#carbonBody)" stroke="#524640" strokeWidth="3" />
              <circle cx="105" cy="175" r="14" fill="url(#jointRing)" />

              {/* Left Bicep & Forearm */}
              <path
                d="M90 190 L115 190 L108 260 L85 255 Z"
                fill="url(#carbonBody)"
                stroke="#3a3330"
                strokeWidth="2"
              />
              <circle cx="96" cy="260" r="12" fill="url(#jointRing)" />
              {/* Left Hand Articulate Fingers */}
              <path d="M82 270 Q65 290 85 305 Q105 310 105 285 Z" fill="#181413" stroke="#4a423e" strokeWidth="2" />
              <path d="M72 285 Q62 295 78 300" stroke="#a39387" strokeWidth="2" strokeLinecap="round" />
              <path d="M76 292 Q68 302 84 305" stroke="#a39387" strokeWidth="2" strokeLinecap="round" />

              {/* Right Shoulder Spherical Joint */}
              <circle cx="275" cy="175" r="22" fill="url(#carbonBody)" stroke="#524640" strokeWidth="3" />
              <circle cx="275" cy="175" r="14" fill="url(#jointRing)" />

              {/* Right Bicep & Forearm */}
              <path
                d="M265 190 L290 190 L295 255 L272 260 Z"
                fill="url(#carbonBody)"
                stroke="#3a3330"
                strokeWidth="2"
              />
              <circle cx="284" cy="260" r="12" fill="url(#jointRing)" />
              {/* Right Hand Articulate Fingers */}
              <path d="M275 285 Q275 310 295 305 Q315 290 298 270 Z" fill="#181413" stroke="#4a423e" strokeWidth="2" />
              <path d="M302 285 Q318 295 302 300" stroke="#a39387" strokeWidth="2" strokeLinecap="round" />
              <path d="M296 292 Q312 302 296 305" stroke="#a39387" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* ROBOT HEAD (MATCHING GLOSSY GLASS VISOR & DOT MATRIX EYES) */}
            <motion.g
              id="robot-head"
              style={{ x: headX, y: headY }}
            >
              {/* Articulated Neck Hydraulics */}
              <rect x="175" y="130" width="30" height="30" rx="8" fill="url(#carbonBody)" stroke="#e8c89b" strokeWidth="1.5" />
              <circle cx="190" cy="142" r="7" fill="url(#jointRing)" />
              <line x1="180" y1="136" x2="180" y2="152" stroke="#e8c89b" strokeWidth="2" />
              <line x1="200" y1="136" x2="200" y2="152" stroke="#e8c89b" strokeWidth="2" />

              {/* Glossy Dome Helmet Shell */}
              <path
                d="M130 85 C130 35 250 35 250 85 C250 135 235 145 190 145 C145 145 130 135 130 85 Z"
                fill="url(#carbonBody)"
                stroke="#4a423e"
                strokeWidth="3"
              />

              {/* Curved Metallic Chin Frame */}
              <path d="M142 120 C165 142 215 142 238 120 L230 138 C200 148 180 148 150 138 Z" fill="url(#jointRing)" />

              {/* Glossy Curved Glass Visor (Entire Face Screen) */}
              <path
                d="M138 80 C138 48 242 48 242 80 C242 118 228 126 190 126 C152 126 138 118 138 80 Z"
                fill="url(#glassReflection)"
                stroke="#60a5fa"
                strokeWidth="1.5"
              />

              {/* Glossy Specular Curved Highlight (White Light Reflection) */}
              <path
                d="M148 65 C165 52 215 52 232 65 C215 58 165 58 148 65 Z"
                fill="#ffffff"
                opacity="0.75"
              />

              {/* DOT MATRIX LED DIGITAL EYES (MATCHING USER IMAGE MATRIX) */}
              <g id="dot-matrix-eyes" opacity="0.95">
                {/* Left Eye LED Dot Grid */}
                <g fill="#e8c89b">
                  <circle cx="162" cy="85" r="2" />
                  <circle cx="168" cy="85" r="2" />
                  <circle cx="174" cy="85" r="2" />
                  <circle cx="162" cy="91" r="2" />
                  <circle cx="168" cy="91" r="2" />
                  <circle cx="174" cy="91" r="2" />
                  <circle cx="165" cy="97" r="2" />
                  <circle cx="171" cy="97" r="2" />
                </g>

                {/* Right Eye LED Dot Grid */}
                <g fill="#e8c89b">
                  <circle cx="206" cy="85" r="2" />
                  <circle cx="212" cy="85" r="2" />
                  <circle cx="218" cy="85" r="2" />
                  <circle cx="206" cy="91" r="2" />
                  <circle cx="212" cy="91" r="2" />
                  <circle cx="218" cy="91" r="2" />
                  <circle cx="209" cy="97" r="2" />
                  <circle cx="215" cy="97" r="2" />
                </g>
              </g>
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating Control Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-2 text-[11px] font-semibold text-[#e8c89b]/75 tracking-wider uppercase"
      >
        Move mouse to tilt 3D Robot &bull; Click to chat
      </motion.p>
    </div>
  )
}

export default AnimatedCharacter;
