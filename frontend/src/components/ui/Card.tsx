import React from 'react'
import clsx from 'clsx'

// ── Card Container ────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => (
  <div
    className={clsx(
      'bg-surface-card border border-surface-border rounded-2xl overflow-hidden',
      hover && 'hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all',
      className
    )}
  >
    {children}
  </div>
)

// ── Card Header ───────────────────────────────────────────────
interface CardHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, icon, action }) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-lg">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
)

// ── Card Body ─────────────────────────────────────────────────
interface CardBodyProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className, noPadding = false }) => (
  <div className={clsx(!noPadding && 'p-6', className)}>
    {children}
  </div>
)

// ── Card Footer ───────────────────────────────────────────────
interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-t border-surface-border', className)}>
    {children}
  </div>
)
