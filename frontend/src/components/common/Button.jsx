import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button'
}) {

  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantMap = {
    primary: `
      relative overflow-hidden
      bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500
      text-white font-semibold
      shadow-[0_4px_15px_rgba(139,92,246,0.3)]
      hover:shadow-[0_6px_25px_rgba(139,92,246,0.5)]
      hover:-translate-y-[2px]
      transition-all duration-300
    `,

    secondary:
      'bg-white/5 text-white border border-white/10 hover:border-violet-500/40 hover:bg-white/10 transition-all duration-300',

    outline:
      'border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 transition-all duration-300',

    danger:
      'bg-red-600 text-white hover:bg-red-700 transition-all duration-300',

    ghost:
      'text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium cursor-pointer
        ${sizeMap[size]}
        ${variantMap[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${(disabled || loading) ? 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}
        ${className}
      `}
    >

      {loading && <Loader2 size={18} className="animate-spin" />}

      {!loading && Icon && iconPosition === 'left' && <Icon size={18} />}

      <span className="relative z-10">{children}</span>

      {!loading && Icon && iconPosition === 'right' && <Icon size={18} />}

    </button>
  )
}
