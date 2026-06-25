import React from 'react'
import clsx from 'clsx'
import { Spinner } from './index'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  className?: string
}

const variantStyles = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white border border-brand-600 hover:border-brand-500 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30',
  secondary: 'bg-surface-card hover:bg-surface-hover text-slate-300 hover:text-slate-100 border border-surface-border hover:border-brand-500/40',
  ghost: 'bg-transparent hover:bg-surface-hover text-slate-400 hover:text-slate-200 border border-transparent',
  danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  )
}
