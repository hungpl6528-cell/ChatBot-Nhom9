import React from 'react'
import clsx from 'clsx'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
    <select
      className={clsx(
        'bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-sm text-slate-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50',
        'transition-colors duration-200',
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-surface-card">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-medium text-slate-400">{label}</label>}
    <input
      className={clsx(
        'bg-surface-card border rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50',
        'transition-colors duration-200',
        error ? 'border-red-500/50' : 'border-surface-border',
        className
      )}
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
)

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

const badgeVariants = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  default: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => (
  <span
    className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      badgeVariants[variant]
    )}
  >
    {children}
  </span>
)

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size]
  return (
    <svg className={clsx('animate-spin text-brand-400', s)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
