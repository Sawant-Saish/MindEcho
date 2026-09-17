import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  dark?: boolean
}

export function GlassCard({
  children,
  className = '',
  hover = true,
  dark = false,
}: GlassCardProps) {
  const base = dark ? 'glass-dark' : 'glass'
  const hoverClass = hover ? 'glass-hover cursor-default' : ''
  return (
    <div className={`${base} rounded-3xl ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}
