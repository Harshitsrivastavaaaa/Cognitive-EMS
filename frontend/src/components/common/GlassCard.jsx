import React from 'react'

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false,
}) {
  const paddingMap = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }

  const variantMap = {
    default: '',
    soft: 'bg-white/[0.02]',
    outlined: 'border border-violet-500/20',
  }

  return (
    <div
      onClick={onClick}
      className={`
        glass-card
        ${paddingMap[padding]}
        ${variantMap[variant]}
        ${hoverable ? 'hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(139,92,246,0.15)] hover:border-violet-500/30 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md flex items-center justify-center text-white">
            <Icon size={18} />
          </div>
        )}

        <div>
          <h3 className="text-base font-bold text-slate-900">
            {title}
          </h3>

          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && <div>{action}</div>}
    </div>
  )
}
