import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'primary',
  subtitle,
}) {
  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp size={14} />
    if (changeType === 'negative') return <TrendingDown size={14} />
    return <Minus size={14} />
  }

  const changeColor = {
    positive: 'text-emerald-600 font-semibold',
    negative: 'text-rose-600 font-semibold',
    neutral: 'text-slate-500 font-medium',
  }

  const iconGradient = {
    primary: 'from-blue-600 to-indigo-600 text-white',
    amber: 'from-amber-500 to-orange-500 text-white',
    teal: 'from-teal-500 to-emerald-500 text-white',
    emerald: 'from-emerald-500 to-green-600 text-white',
  }

  return (
    <div
      className="
        relative glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/85
        transition-all duration-300
        hover:-translate-y-1
        hover:border-blue-500/40
        hover:shadow-md
        group
      "
    >
      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-r ${
              iconGradient[iconColor] || iconGradient.primary
            } flex items-center justify-center shadow-sm`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative text-3xl font-extrabold text-slate-900">
        {value}
      </div>

      {/* Footer */}
      {(change || subtitle) && (
        <div className="relative mt-2 flex items-center justify-between text-xs">

          {change && (
            <span className={`flex items-center gap-1 ${changeColor[changeType]}`}>
              {getChangeIcon()}
              {change}
            </span>
          )}

          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
